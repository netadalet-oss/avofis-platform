-- AVOfis T03: REVIEW / DISPOSABLE STAGING ONLY.
-- Apply after MVP, staff_role_hardening, case_tracking, staff_deliverables,
-- case_transition_guard and IND case_activation_guard. Not applied to live DB.
-- Existing operator-wide access is replaced with explicit case assignment.
-- Cases without an assignment remain accessible to the owning client and
-- verified admins, not to every authenticated operator.
begin;

create table if not exists public.avofis_case_assignments (
  case_id uuid not null references public.avofis_cases(id) on delete restrict,
  staff_user_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (case_id,staff_user_id)
);
create index if not exists avofis_case_assignments_staff_idx
  on public.avofis_case_assignments(staff_user_id,case_id);

alter table public.avofis_case_assignments enable row level security;
revoke all on public.avofis_case_assignments from public,anon,authenticated;
grant select,insert,delete on public.avofis_case_assignments to authenticated;

create or replace function public.avofis_is_operator_account(p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists (select 1 from public.avofis_staff s
                where s.user_id=p_user and s.role='operator');
$$;
revoke all on function public.avofis_is_operator_account(uuid) from public,anon;
grant execute on function public.avofis_is_operator_account(uuid) to authenticated;

drop policy if exists "admins and assigned operators see assignments"
 on public.avofis_case_assignments;
create policy "admins and assigned operators see assignments"
 on public.avofis_case_assignments for select to authenticated
 using (public.avofis_is_admin() or
       (staff_user_id=(select auth.uid()) and public.avofis_is_operator_account(staff_user_id)));

drop policy if exists "admins assign verified operators"
 on public.avofis_case_assignments;
create policy "admins assign verified operators"
 on public.avofis_case_assignments for insert to authenticated
 with check (public.avofis_is_admin() and assigned_by=(select auth.uid())
             and public.avofis_is_operator_account(staff_user_id));

drop policy if exists "admins unassign operators"
 on public.avofis_case_assignments;
create policy "admins unassign operators"
 on public.avofis_case_assignments for delete to authenticated
 using (public.avofis_is_admin());

create or replace function public.avofis_staff_scope_access(p_case uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select public.avofis_is_admin() or exists (
  select 1 from public.avofis_case_assignments a
  join public.avofis_staff s on s.user_id=a.staff_user_id and s.role='operator'
  where a.case_id=p_case and a.staff_user_id=(select auth.uid())
 );
$$;
revoke all on function public.avofis_staff_scope_access(uuid) from public,anon;
grant execute on function public.avofis_staff_scope_access(uuid) to authenticated;

-- This helper is referenced by agreements, messages, events, payment metadata,
-- deliverables and private Storage object read policies.
create or replace function public.avofis_can_access_case(p_case uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists (
  select 1 from public.avofis_cases c
  where c.id=p_case and
        (c.client_user_id=(select auth.uid()) or public.avofis_staff_scope_access(c.id))
 );
$$;
revoke all on function public.avofis_can_access_case(uuid) from public,anon;
grant execute on function public.avofis_can_access_case(uuid) to authenticated;

drop policy if exists "client or staff view matters" on public.avofis_cases;
create policy "client or assigned staff view matters"
 on public.avofis_cases for select to authenticated
 using(client_user_id=(select auth.uid()) or public.avofis_staff_scope_access(id));

drop policy if exists "staff update matters" on public.avofis_cases;
create policy "assigned staff update matter status"
 on public.avofis_cases for update to authenticated
 using(public.avofis_staff_scope_access(id))
 with check(public.avofis_staff_scope_access(id));

drop policy if exists "verified staff create document requests"
 on public.avofis_document_requests;
create policy "assigned staff create document requests"
 on public.avofis_document_requests for insert to authenticated
 with check (
   requested_by=(select auth.uid()) and public.avofis_staff_scope_access(case_id)
   and exists(select 1 from public.avofis_cases c
              where c.id=case_id and c.status='open')
 );

drop policy if exists "verified staff update document requests"
 on public.avofis_document_requests;
create policy "assigned staff update document requests"
 on public.avofis_document_requests for update to authenticated
 using(public.avofis_staff_scope_access(case_id))
 with check(public.avofis_staff_scope_access(case_id));

drop policy if exists "verified staff register own deliverables"
 on public.avofis_deliverables;
create policy "assigned staff register own deliverables"
 on public.avofis_deliverables for insert to authenticated
 with check (
   public.avofis_staff_scope_access(case_id)
   and uploaded_by=(select auth.uid())
   and storage_path like (case_id::text || '/' || auth.uid()::text || '/%')
   and exists (
    select 1 from public.avofis_cases c
    join public.avofis_agreements a on a.case_id=c.id and a.signed_at is not null
    where c.id=case_id and c.status='open'
   )
 );

-- A signed contract is necessary but not sufficient for new private uploads.
-- Require an open G1-G4-cleared case and an assigned staff member or owner.
drop policy if exists "clients upload to their accepted cases" on storage.objects;
create policy "cleared case participants upload private objects"
 on storage.objects for insert to authenticated
 with check (
   bucket_id='avofis-private'
   and (storage.foldername(name))[2]=(select auth.uid())::text
   and exists (
    select 1 from public.avofis_cases c
    join public.avofis_agreements a on a.case_id=c.id and a.signed_at is not null
    where c.id=(storage.foldername(name))[1]::uuid and c.status='open'
      and public.avofis_can_access_case(c.id)
   )
 );
commit;

-- Scope limits:
-- 1. No automatic backfill or silent operator assignment.
-- 2. Admin must assign each operator case-by-case after identity/authority review.
-- 3. This does not validate professional licences or current Supabase JWT sessions.
-- 4. A full staging REST/Auth/Storage E2E + dependent UI regression is mandatory.
