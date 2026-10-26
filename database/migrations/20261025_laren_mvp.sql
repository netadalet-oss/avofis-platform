-- LAREN pilot: apply in the Supabase SQL editor using a database-owner account.
-- Do not run this against production before a backup and RLS review.
create extension if not exists pgcrypto;

create table if not exists public.laren_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('staff', 'manager')),
  created_at timestamptz not null default now()
);
alter table public.laren_staff enable row level security;
revoke all on public.laren_staff from anon, authenticated;
grant select on public.laren_staff to authenticated;
drop policy if exists laren_staff_read_self on public.laren_staff;
create policy laren_staff_read_self on public.laren_staff
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.laren_is_staff()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.laren_staff s
    where s.user_id = (select auth.uid())
  );
$$;
revoke all on function public.laren_is_staff() from public;
grant execute on function public.laren_is_staff() to authenticated;

create table if not exists public.laren_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  contact_name text not null check (char_length(contact_name) between 2 and 150),
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  category text not null check (category in ('administrative', 'commercial', 'legal_coordination')),
  jurisdiction text not null check (jurisdiction in ('NL', 'TR', 'NL_TR')),
  subject text not null check (char_length(subject) between 5 and 160),
  description text not null check (char_length(description) between 15 and 8000),
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'awaiting_documents', 'in_progress', 'completed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists laren_requests_owner_created_idx
  on public.laren_requests(owner_user_id, created_at desc);
create index if not exists laren_requests_status_created_idx
  on public.laren_requests(status, created_at desc);
alter table public.laren_requests enable row level security;
revoke all on public.laren_requests from anon, authenticated;
grant select, insert on public.laren_requests to authenticated;
drop policy if exists laren_requests_read on public.laren_requests;
create policy laren_requests_read on public.laren_requests
  for select to authenticated
  using (owner_user_id = (select auth.uid()) or (select public.laren_is_staff()));
drop policy if exists laren_requests_insert_own on public.laren_requests;
create policy laren_requests_insert_own on public.laren_requests
  for insert to authenticated
  with check (owner_user_id = (select auth.uid()) and status = 'new');

create table if not exists public.laren_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.laren_requests(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  status text not null,
  message text not null check (char_length(message) between 1 and 1000),
  visibility text not null default 'client'
    check (visibility in ('client', 'internal')),
  created_at timestamptz not null default now()
);
create index if not exists laren_events_request_created_idx
  on public.laren_request_events(request_id, created_at desc);
alter table public.laren_request_events enable row level security;
revoke all on public.laren_request_events from anon, authenticated;
grant select on public.laren_request_events to authenticated;
drop policy if exists laren_events_read on public.laren_request_events;
create policy laren_events_read on public.laren_request_events
  for select to authenticated
  using (
    (select public.laren_is_staff())
    or (
      visibility = 'client' and exists (
        select 1 from public.laren_requests r
        where r.id = request_id and r.owner_user_id = (select auth.uid())
      )
    )
  );

-- Only a verified LAREN staff member may change status.
-- A SECURITY DEFINER RPC guarantees the status change and event are atomic.
create or replace function public.laren_set_status(
  p_request_id uuid, p_status text, p_message text
) returns void language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.laren_is_staff() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_status not in ('new', 'reviewing', 'awaiting_documents', 'in_progress', 'completed', 'closed') then
    raise exception 'Invalid status';
  end if;
  if char_length(trim(coalesce(p_message, ''))) not between 1 and 1000 then
    raise exception 'Invalid message';
  end if;

  update public.laren_requests
  set status = p_status, updated_at = now()
  where id = p_request_id;
  if not found then
    raise exception 'Request not found';
  end if;

  insert into public.laren_request_events
    (request_id, actor_user_id, status, message, visibility)
  values (p_request_id, auth.uid(), p_status, trim(p_message), 'client');
end;
$$;
revoke all on function public.laren_set_status(uuid,text,text) from public;
grant execute on function public.laren_set_status(uuid,text,text) to authenticated;

-- Private attachments. Store only opaque object paths, not public URLs.
create table if not exists public.laren_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.laren_requests(id) on delete cascade,
  uploaded_by uuid not null default auth.uid() references auth.users(id),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now()
);
create index if not exists laren_documents_request_idx
  on public.laren_documents(request_id, created_at desc);
alter table public.laren_documents enable row level security;
revoke all on public.laren_documents from anon, authenticated;
grant select, insert on public.laren_documents to authenticated;
drop policy if exists laren_documents_read on public.laren_documents;
create policy laren_documents_read on public.laren_documents
  for select to authenticated
  using (
    (select public.laren_is_staff())
    or exists (
      select 1 from public.laren_requests r
      where r.id = request_id and r.owner_user_id = (select auth.uid())
    )
  );
drop policy if exists laren_documents_insert_own on public.laren_documents;
create policy laren_documents_insert_own on public.laren_documents
  for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and storage_path like ((select auth.uid())::text || '/' || request_id::text || '/%')
    and exists (
      select 1 from public.laren_requests r
      where r.id = request_id and r.owner_user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('laren-private', 'laren-private', false, 10485760,
        array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

drop policy if exists laren_storage_read on storage.objects;
create policy laren_storage_read on storage.objects
  for select to authenticated using (
    bucket_id = 'laren-private'
    and (
      (select public.laren_is_staff())
      or exists (
        select 1 from public.laren_requests r
        where r.id::text = (storage.foldername(name))[2]
          and r.owner_user_id = (select auth.uid())
          and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    )
  );

drop policy if exists laren_storage_insert on storage.objects;
create policy laren_storage_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'laren-private'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.laren_requests r
      where r.id::text = (storage.foldername(name))[2]
        and r.owner_user_id = (select auth.uid())
    )
  );

-- Staff provisioning (run manually as database owner after the person registers):
-- INSERT INTO public.laren_staff(user_id, role)
-- VALUES ('<verified-auth-users-uuid>', 'manager')
-- ON CONFLICT (user_id) DO UPDATE SET role = excluded.role;
