-- AVOfis MVP migration. Apply in Supabase SQL editor after security review.
-- Private by default: only authenticated case owners and independently registered staff.
create extension if not exists pgcrypto;
create table if not exists public.avofis_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('admin','operator')),
  created_at timestamptz not null default now()
);
create table if not exists public.avofis_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check(char_length(full_name) between 2 and 100),
  email text not null,
  country text not null,
  service_key text not null,
  summary text not null default '' check(char_length(summary) <= 500),
  locale text not null default 'tr',
  privacy_notice_version text not null,
  privacy_accepted_at timestamptz not null,
  status text not null default 'new' check(status in ('new','reviewed','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.avofis_cases (
  id uuid primary key default gen_random_uuid(),
  client_user_id uuid not null references auth.users(id),
  title text not null check(char_length(title) between 3 and 160),
  service_key text not null,
  price_eur_cents integer not null default 0 check(price_eur_cents between 0 and 10000000),
  status text not null default 'review' check(status in ('review','awaiting_agreement','open','completed','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.avofis_agreements (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.avofis_cases(id) on delete restrict,
  agreement_version text not null,
  legal_text text not null check(char_length(legal_text) between 50 and 25000),
  client_signature text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint signature_pair check ((client_signature is null and signed_at is null) or (client_signature is not null and signed_at is not null))
);
create table if not exists public.avofis_payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.avofis_cases(id),
  mollie_id text unique not null,
  amount_eur_cents integer not null check(amount_eur_cents > 0),
  status text not null default 'open' check(status in ('open','pending','authorized','paid','failed','canceled','expired','refunded','charged_back')),
  checkout_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.avofis_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.avofis_cases(id),
  sender_id uuid not null references auth.users(id),
  body text not null check(char_length(body) between 1 and 1500),
  created_at timestamptz not null default now()
);
create index if not exists avofis_cases_owner_idx on public.avofis_cases(client_user_id);
create index if not exists avofis_messages_case_idx on public.avofis_messages(case_id,created_at);
create index if not exists avofis_payments_case_idx on public.avofis_payments(case_id,created_at desc);
create index if not exists avofis_leads_created_idx on public.avofis_leads(created_at desc);

create or replace function public.avofis_is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.avofis_staff where user_id = auth.uid());
$$;
revoke all on function public.avofis_is_staff() from public;
grant execute on function public.avofis_is_staff() to authenticated;

create or replace function public.avofis_can_access_case(p_case uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.avofis_cases where id=p_case and (client_user_id=auth.uid() or public.avofis_is_staff()));
$$;
revoke all on function public.avofis_can_access_case(uuid) from public;
grant execute on function public.avofis_can_access_case(uuid) to authenticated;

alter table public.avofis_staff enable row level security;
alter table public.avofis_leads enable row level security;
alter table public.avofis_cases enable row level security;
alter table public.avofis_agreements enable row level security;
alter table public.avofis_payments enable row level security;
alter table public.avofis_messages enable row level security;

-- Explicit privileges, even when existing database defaults have broad grants.
revoke all on public.avofis_staff,public.avofis_leads,public.avofis_cases,public.avofis_agreements,public.avofis_payments,public.avofis_messages from anon,authenticated;
grant select on public.avofis_staff to authenticated;
grant select on public.avofis_leads to authenticated;
grant update(status) on public.avofis_leads to authenticated;
grant select,insert,update on public.avofis_cases to authenticated;
grant select,insert on public.avofis_agreements to authenticated;
grant update(legal_text,agreement_version) on public.avofis_agreements to authenticated;
grant select on public.avofis_payments to authenticated;
grant select,insert on public.avofis_messages to authenticated;

create policy "staff can view own role" on public.avofis_staff
 for select to authenticated using (user_id = auth.uid());
create policy "staff view enquiries" on public.avofis_leads
 for select to authenticated using(public.avofis_is_staff());
create policy "staff update enquiries" on public.avofis_leads
 for update to authenticated using(public.avofis_is_staff()) with check(public.avofis_is_staff());
create policy "client or staff view matters" on public.avofis_cases
 for select to authenticated using(client_user_id=auth.uid() or public.avofis_is_staff());
create policy "staff create matters" on public.avofis_cases
 for insert to authenticated with check(public.avofis_is_staff());
create policy "staff update matters" on public.avofis_cases
 for update to authenticated using(public.avofis_is_staff()) with check(public.avofis_is_staff());
create policy "client or staff view agreements" on public.avofis_agreements
 for select to authenticated using(public.avofis_can_access_case(case_id));
create policy "staff insert agreements" on public.avofis_agreements
 for insert to authenticated with check(public.avofis_is_staff());
create policy "staff update agreements" on public.avofis_agreements
 for update to authenticated using(public.avofis_is_staff()) with check(public.avofis_is_staff());
create policy "client or staff view payments" on public.avofis_payments
 for select to authenticated using(public.avofis_can_access_case(case_id));
create policy "client or staff view messages" on public.avofis_messages
 for select to authenticated using(public.avofis_can_access_case(case_id));
create policy "participant sends message" on public.avofis_messages
 for insert to authenticated with check(sender_id=auth.uid() and public.avofis_can_access_case(case_id));

-- Signed agreement text and previously accepted price must not be changed.
create or replace function public.avofis_guard_signed_agreement()
returns trigger language plpgsql set search_path='' as $$
begin
  if old.signed_at is not null then
    if new.legal_text is distinct from old.legal_text
       or new.agreement_version is distinct from old.agreement_version
       or new.client_signature is distinct from old.client_signature
       or new.signed_at is distinct from old.signed_at
       or new.case_id is distinct from old.case_id then
      raise exception 'Signed agreement is immutable';
    end if;
  end if;
  return new;
end;$$;
create trigger avofis_signed_agreement_immutable before update on public.avofis_agreements
 for each row execute function public.avofis_guard_signed_agreement();

create or replace function public.avofis_guard_case_price()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.price_eur_cents is distinct from old.price_eur_cents
    and exists(select 1 from public.avofis_agreements where case_id=old.id and signed_at is not null) then
   raise exception 'Cannot change price after acceptance; create a reviewed amendment';
 end if;
 new.updated_at=now();
 return new;
end;$$;
create trigger avofis_case_price_guard before update on public.avofis_cases
 for each row execute function public.avofis_guard_case_price();

-- Typed-name electronic acceptance (not a qualified electronic signature).
create or replace function public.avofis_accept_agreement(p_case uuid,p_signature text)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare result_time timestamptz;
begin
 if auth.uid() is null or char_length(btrim(p_signature)) < 3 or char_length(p_signature)>120 then
   raise exception 'Invalid signature';
 end if;
 if not exists(select 1 from public.avofis_cases where id=p_case and client_user_id=auth.uid()) then
   raise exception 'Case access denied';
 end if;
 update public.avofis_agreements
 set client_signature=btrim(p_signature), signed_at=now()
 where case_id=p_case and signed_at is null returning signed_at into result_time;
 if result_time is null then raise exception 'Agreement unavailable or already accepted'; end if;
 return result_time;
end;$$;
revoke all on function public.avofis_accept_agreement(uuid,text) from public,anon;
grant execute on function public.avofis_accept_agreement(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avofis-private','avofis-private',false,10485760,array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=10485760,
allowed_mime_types=excluded.allowed_mime_types;

-- Object paths: <case_uuid>/<uploader_uuid>/<random_uuid>.<ext>
create policy "authorised users read case objects"
on storage.objects for select to authenticated
using(bucket_id='avofis-private' and public.avofis_can_access_case((storage.foldername(name))[1]::uuid));

create policy "clients upload to their accepted cases"
on storage.objects for insert to authenticated
with check(
  bucket_id='avofis-private'
  and (storage.foldername(name))[2]=auth.uid()::text
  and exists(
    select 1 from public.avofis_cases c
    join public.avofis_agreements a on a.case_id=c.id and a.signed_at is not null
    where c.id=(storage.foldername(name))[1]::uuid
      and (c.client_user_id=auth.uid() or public.avofis_is_staff())
  )
);

-- Bootstrap one verified staff account AFTER creating its Supabase Auth user:
-- insert into public.avofis_staff(user_id,role) values('<verified-auth-user-uuid>','admin');
-- Never assign staff roles via user_metadata or public registration.
-- Grant functions only after SQL editor review. Do not deploy real client data before privacy sign-off.
