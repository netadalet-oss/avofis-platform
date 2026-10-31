-- AVOfis v17 StaffWorkspace P01: STAGING ONLY, NEVER LIVE WITHOUT OWNER GO.
-- Dependencies: MVP, staff_role_hardening, case_assignment_scope.
-- Personal, individually revocable capabilities separate from case assignments.
-- A case assignment alone never grants finance, messages or other workflows.
begin;
create table if not exists public.avofis_staff_capability_grants (
 staff_user_id uuid not null references public.avofis_staff(user_id) on delete cascade,
 capability text not null check(capability in (
  'inbox','triage','matters','calendar','documents','pleadings',
  'research','judicial','ind','messages','billing','payables',
  'reporting','audit','people','settings')),
 granted_by uuid not null references auth.users(id) on delete restrict,
 granted_at timestamptz not null default now(),
 primary key (staff_user_id,capability)
);
alter table public.avofis_staff_capability_grants enable row level security;
revoke all on public.avofis_staff_capability_grants from public,anon,authenticated;
grant select,insert,delete on public.avofis_staff_capability_grants to authenticated;

create or replace function public.avofis_has_staff_capability(p_capability text)
returns boolean language sql stable security definer set search_path='' as $$
 select public.avofis_is_admin() or exists(
  select 1 from public.avofis_staff_capability_grants g
  join public.avofis_staff s on s.user_id=g.staff_user_id
  where g.staff_user_id=(select auth.uid()) and s.role='operator'
    and g.capability=p_capability);
$$;
revoke all on function public.avofis_has_staff_capability(text) from public,anon;
grant execute on function public.avofis_has_staff_capability(text) to authenticated;

drop policy if exists "staff sees own capabilities" on public.avofis_staff_capability_grants;
create policy "staff sees own capabilities"
on public.avofis_staff_capability_grants for select to authenticated
using(staff_user_id=(select auth.uid()) or public.avofis_is_admin());
drop policy if exists "admin individually grants capabilities" on public.avofis_staff_capability_grants;
create policy "admin individually grants capabilities"
on public.avofis_staff_capability_grants for insert to authenticated
with check(public.avofis_is_admin()
 and granted_by=(select auth.uid())
 and public.avofis_is_operator_account(staff_user_id));
drop policy if exists "admin individually revokes capabilities" on public.avofis_staff_capability_grants;
create policy "admin individually revokes capabilities"
on public.avofis_staff_capability_grants for delete to authenticated
using(public.avofis_is_admin());

-- Additional restrictive policies are ANDed with the existing permissive case
-- owner/assigned staff policies: clients keep their own rights; staff require
-- both assignment AND individual capabilities. No view rights from UI alone.
drop policy if exists "staff capability matters select" on public.avofis_cases;
create policy "staff capability matters select" on public.avofis_cases
 as restrictive for select to authenticated
 using(client_user_id=(select auth.uid()) or
   (public.avofis_staff_scope_access(id) and public.avofis_has_staff_capability('matters')));
drop policy if exists "staff capability matters update" on public.avofis_cases;
create policy "staff capability matters update" on public.avofis_cases
 as restrictive for update to authenticated
 using(public.avofis_staff_scope_access(id) and public.avofis_has_staff_capability('matters'))
 with check(public.avofis_staff_scope_access(id) and public.avofis_has_staff_capability('matters'));

drop policy if exists "staff capability messages select" on public.avofis_messages;
create policy "staff capability messages select" on public.avofis_messages
 as restrictive for select to authenticated
 using(exists(select 1 from public.avofis_cases c
    where c.id=case_id and (c.client_user_id=(select auth.uid()) or
      (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('messages')))));
drop policy if exists "staff capability messages insert" on public.avofis_messages;
create policy "staff capability messages insert" on public.avofis_messages
 as restrictive for insert to authenticated
 with check(sender_id=(select auth.uid()) and exists(
    select 1 from public.avofis_cases c where c.id=case_id and
     (c.client_user_id=(select auth.uid()) or
      (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('messages')))));

drop policy if exists "staff capability finance select" on public.avofis_payments;
create policy "staff capability finance select" on public.avofis_payments
 as restrictive for select to authenticated
 using(exists(select 1 from public.avofis_cases c
  where c.id=case_id and (c.client_user_id=(select auth.uid()) or
  (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('billing')))));
-- No assigned employee may read confidential private file objects without
-- a specific 'documents' grant. Other Storage buckets remain outside this
-- AVOfis product migration. Client owner read still follows its own case.
drop policy if exists "avofis private document capability" on storage.objects;
create policy "avofis private document capability" on storage.objects
 as restrictive for select to authenticated
 using(bucket_id <> 'avofis-private' or exists(
  select 1 from public.avofis_cases c
  where c.id=(storage.foldername(name))[1]::uuid
    and (c.client_user_id=(select auth.uid()) or
     (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('documents')))
 ));

drop policy if exists "staff capability document requests select" on public.avofis_document_requests;
create policy "staff capability document requests select" on public.avofis_document_requests
 as restrictive for select to authenticated
 using(exists(select 1 from public.avofis_cases c where c.id=case_id and
  (c.client_user_id=(select auth.uid()) or
   (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('documents')))));
drop policy if exists "staff capability deliverables select" on public.avofis_deliverables;
create policy "staff capability deliverables select" on public.avofis_deliverables
 as restrictive for select to authenticated
 using(exists(select 1 from public.avofis_cases c where c.id=case_id and
  (c.client_user_id=(select auth.uid()) or
   (public.avofis_staff_scope_access(c.id) and public.avofis_has_staff_capability('documents')))));

-- RESTRICTIVE SELECT policies do not block SECURITY DEFINER source roles and
-- cannot replace least-privilege policies for all related case-bearing tables.
-- New tables must have their own independent RLS policy and E2E review.
commit;
