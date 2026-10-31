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

-- No lead-to-case assignment exists yet. Operators must not see all unassigned
-- enquiry PII or update any lead status by inheriting staff-wide RLS.
drop policy if exists "staff view enquiries" on public.avofis_leads;
drop policy if exists "staff update enquiries" on public.avofis_leads;
create policy "admin-only enquiry review" on public.avofis_leads
 for select to authenticated using(public.avofis_is_admin());
create policy "admin-only enquiry status" on public.avofis_leads
 for update to authenticated using(public.avofis_is_admin())
 with check(public.avofis_is_admin());

-- Permit verified admins to resolve operator IDs from the protected roster,
-- without exposing it to customers or unrelated operators.
drop policy if exists "admin reads staff roster" on public.avofis_staff;
create policy "admin reads staff roster" on public.avofis_staff
 for select to authenticated using(public.avofis_is_admin());

-- Append-only audit: no API role has UPDATE/DELETE/INSERT permission.
-- These records do not replace access logs (R-533), signature evidence or
-- a tamper-evident external audit trail.
create table if not exists public.avofis_assignment_events (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.avofis_cases(id) on delete restrict,
 staff_user_id uuid not null references auth.users(id) on delete restrict,
 actor_user_id uuid references auth.users(id),
 action text not null check(action in ('assigned','unassigned')),
 created_at timestamptz not null default now()
);
create index if not exists avofis_assignment_events_case_idx
 on public.avofis_assignment_events(case_id,created_at,id);
alter table public.avofis_assignment_events enable row level security;
revoke all on public.avofis_assignment_events from public,anon,authenticated;
grant select on public.avofis_assignment_events to authenticated;
create policy "admin reads assignment audit" on public.avofis_assignment_events
 for select to authenticated using(public.avofis_is_admin());

create or replace function public.avofis_log_assignment_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.avofis_assignment_events(case_id,staff_user_id,actor_user_id,action)
 values(
  case when tg_op='INSERT' then new.case_id else old.case_id end,
  case when tg_op='INSERT' then new.staff_user_id else old.staff_user_id end,
  auth.uid(),
  case when tg_op='INSERT' then 'assigned' else 'unassigned' end
 );
 return null;
end;$$;
revoke all on function public.avofis_log_assignment_change()
 from public,anon,authenticated;
drop trigger if exists avofis_assignment_audit on public.avofis_case_assignments;
create trigger avofis_assignment_audit
 after insert or delete on public.avofis_case_assignments
 for each row execute function public.avofis_log_assignment_change();

-- A deleted or demoted operator must lose their case assignments permanently.
-- Re-granting staff membership cannot resurrect stale case access.
create or replace function public.avofis_purge_demoted_operator_assignments()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.role='operator' and (tg_op='DELETE' or new.role is distinct from 'operator') then
  delete from public.avofis_case_assignments where staff_user_id=old.user_id;
 end if;
 return null;
end;$$;
revoke all on function public.avofis_purge_demoted_operator_assignments()
 from public,anon,authenticated;
drop trigger if exists avofis_purge_staff_assignments on public.avofis_staff;
create trigger avofis_purge_staff_assignments
 after update of role or delete on public.avofis_staff
 for each row execute function public.avofis_purge_demoted_operator_assignments();

commit;

-- Scope limits:
-- 1. No automatic backfill or silent operator assignment.
-- 2. Admin must assign each operator case-by-case after identity/authority review.
-- 3. This does not validate professional licences or current Supabase JWT sessions.
-- 4. A full staging REST/Auth/Storage E2E + dependent UI regression is mandatory.
