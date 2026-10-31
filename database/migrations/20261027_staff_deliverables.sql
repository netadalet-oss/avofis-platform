-- Apply after 20261027_avofis_mvp.sql and 20261027_case_tracking.sql.
-- No public bucket: object access remains governed by private-storage RLS.
create table if not exists public.avofis_deliverables (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.avofis_cases(id) on delete restrict,
 uploaded_by uuid not null references auth.users(id),
 storage_path text not null unique check(char_length(storage_path) between 80 and 300 and position('..' in storage_path)=0),
 original_file_name text not null check(char_length(original_file_name) between 1 and 200),
 created_at timestamptz not null default now()
);
create index if not exists avofis_deliverables_case_idx on public.avofis_deliverables(case_id,created_at desc);
alter table public.avofis_deliverables enable row level security;
revoke all on public.avofis_deliverables from anon,authenticated;
grant select,insert on public.avofis_deliverables to authenticated;
drop policy if exists "case participants read deliverable metadata" on public.avofis_deliverables;
create policy "case participants read deliverable metadata"
 on public.avofis_deliverables for select to authenticated
 using(public.avofis_can_access_case(case_id));
drop policy if exists "verified staff register own deliverables" on public.avofis_deliverables;
create policy "verified staff register own deliverables"
 on public.avofis_deliverables for insert to authenticated
 with check (
   public.avofis_is_staff()
   and uploaded_by=auth.uid()
   and storage_path like (case_id::text || '/' || auth.uid()::text || '/%')
   and exists (
     select 1 from public.avofis_agreements a
     where a.case_id=avofis_deliverables.case_id and a.signed_at is not null
   )
 );
-- Authorisation for actual file bytes is independently enforced by the
-- 'avofis-private' storage bucket's select/insert RLS policies.
-- No anonymous select; no client insert/update/delete; no raw public storage URL.
