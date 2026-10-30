-- AVOfis J07-J10: STAGING / REVIEW ONLY. NOT APPLIED TO LIVE SUPABASE.
-- Must follow case assignment and IND clearance migrations.
-- No direct court/IND access, official submission or actual receipt proof.
-- This schema stores INTERNAL metadata/events only. Real Auth/JWT/Storage E2E,
-- encrypted backups, privacy, DPO and professional signoff remain mandatory.
begin;
create table if not exists public.avofis_judicial_case_metadata (
 case_id uuid primary key references public.avofis_cases(id) on delete restrict,
 country text not null default 'NL' check (country='NL'),
 procedure_family text not null check (procedure_family in
  ('civil','commercial','family','tax','general_administrative')),
 court_code text not null check (length(trim(court_code)) between 2 and 100),
 official_case_reference text,
 ecli text check(ecli is null or
  ecli ~ '^ECLI:NL:[A-Z0-9]{2,12}:[0-9]{4}:[A-Z0-9.-]{1,40}$'),
 last_service_on date,
 deadline_human_reviewed boolean not null default false,
 deadline_review_basis text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(not deadline_human_reviewed or
  length(trim(coalesce(deadline_review_basis,''))) >= 12)
);
alter table public.avofis_judicial_case_metadata enable row level security;
revoke all on public.avofis_judicial_case_metadata from public,anon,authenticated;
grant select,insert,update on public.avofis_judicial_case_metadata to authenticated;
drop policy if exists "court metadata owner/assigned staff read" on public.avofis_judicial_case_metadata;
create policy "court metadata owner/assigned staff read"
 on public.avofis_judicial_case_metadata for select to authenticated
 using(public.avofis_can_access_case(case_id));
drop policy if exists "admins insert court metadata" on public.avofis_judicial_case_metadata;
create policy "admins insert court metadata"
 on public.avofis_judicial_case_metadata for insert to authenticated
 with check(public.avofis_is_admin() and
  public.avofis_can_access_case(case_id));
drop policy if exists "admins update court metadata" on public.avofis_judicial_case_metadata;
create policy "admins update court metadata"
 on public.avofis_judicial_case_metadata for update to authenticated
 using(public.avofis_is_admin() and public.avofis_can_access_case(case_id))
 with check(public.avofis_is_admin() and public.avofis_can_access_case(case_id));
-- The log contains NO "sent", "accepted", or "delivered" state; those
-- require authentic provider-backed receipts and a separate future gate.
create table if not exists public.avofis_judicial_local_events (
 id uuid primary key,
 case_id uuid not null references public.avofis_judicial_case_metadata(case_id) on delete restrict,
 event_kind text not null check(event_kind in
  ('draft_prepared','official_portal_opened','document_prepared','unverified_receipt_reported')),
 recorded_by uuid not null references auth.users(id) on delete restrict,
 recorded_at timestamptz not null default now(),
 reference_hint text check(reference_hint is null or length(reference_hint) <= 120)
);
create index if not exists avofis_judicial_local_events_case_idx
 on public.avofis_judicial_local_events(case_id,recorded_at);
alter table public.avofis_judicial_local_events enable row level security;
revoke all on public.avofis_judicial_local_events from public,anon,authenticated;
grant select,insert on public.avofis_judicial_local_events to authenticated;
drop policy if exists "judicial events owner/assigned staff read" on public.avofis_judicial_local_events;
create policy "judicial events owner/assigned staff read"
 on public.avofis_judicial_local_events for select to authenticated
 using(public.avofis_can_access_case(case_id));
drop policy if exists "verified admin records local judicial events" on public.avofis_judicial_local_events;
create policy "verified admin records local judicial events"
 on public.avofis_judicial_local_events for insert to authenticated
 with check(public.avofis_is_admin() and recorded_by=(select auth.uid())
  and public.avofis_can_access_case(case_id));
commit;
