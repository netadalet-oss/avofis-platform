-- Staging only. Apply AFTER the original AVOfis MVP migration with a backup.
-- No invented backfill: only future case status transitions receive event records.
create extension if not exists pgcrypto;
create table if not exists public.avofis_case_events (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.avofis_cases(id) on delete restrict,
 actor_user_id uuid references auth.users(id),
 previous_status text,
 new_status text not null,
 created_at timestamptz not null default now()
);
create index if not exists avofis_case_events_case_idx on public.avofis_case_events(case_id,created_at,id);
alter table public.avofis_case_events enable row level security;
revoke all on public.avofis_case_events from anon,authenticated;
grant select on public.avofis_case_events to authenticated;
drop policy if exists "case participant reads recorded events" on public.avofis_case_events;
create policy "case participant reads recorded events" on public.avofis_case_events
 for select to authenticated using(public.avofis_can_access_case(case_id));
create or replace function public.avofis_record_case_event()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  insert into public.avofis_case_events(case_id,actor_user_id,previous_status,new_status)
  values(new.id,auth.uid(),null,new.status);
 elsif new.status is distinct from old.status then
  insert into public.avofis_case_events(case_id,actor_user_id,previous_status,new_status)
  values(new.id,auth.uid(),old.status,new.status);
 end if;
 return new;
end;
$$;
revoke all on function public.avofis_record_case_event() from public,anon,authenticated;
drop trigger if exists avofis_case_event_log on public.avofis_cases;
create trigger avofis_case_event_log after insert or update of status on public.avofis_cases
 for each row execute function public.avofis_record_case_event();

create table if not exists public.avofis_document_requests (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.avofis_cases(id) on delete restrict,
 requested_by uuid not null references auth.users(id),
 title text not null check(char_length(btrim(title)) between 3 and 160),
 status text not null default 'requested' check(status in ('requested','received','waived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists avofis_document_requests_case_idx on public.avofis_document_requests(case_id,created_at);
alter table public.avofis_document_requests enable row level security;
revoke all on public.avofis_document_requests from anon,authenticated;
grant select,insert on public.avofis_document_requests to authenticated;
grant update(status) on public.avofis_document_requests to authenticated;
drop policy if exists "case participant reads document requests" on public.avofis_document_requests;
create policy "case participant reads document requests" on public.avofis_document_requests
 for select to authenticated using(public.avofis_can_access_case(case_id));
drop policy if exists "verified staff create document requests" on public.avofis_document_requests;
create policy "verified staff create document requests" on public.avofis_document_requests
 for insert to authenticated with check(public.avofis_is_staff() and requested_by=auth.uid());
drop policy if exists "verified staff update document requests" on public.avofis_document_requests;
create policy "verified staff update document requests" on public.avofis_document_requests
 for update to authenticated using(public.avofis_is_staff()) with check(public.avofis_is_staff());
-- Staff must verify any uploaded document; an upload does not auto-mark it received.
