-- AVOfis P09: STAGING ONLY. Never run against LIVE without independent
-- signoff/backup/real Auth/JWT RLS testing. Depends on P01, P03, P04/P05.
-- Staff MFA AAL2 (Supabase-validated JWT) must be present for staff privileges.
-- Client owners keep their ordinary own-record access; this does NOT claim
-- clients or external professional portals are MFA-approved.
begin;
-- Only a verified AAL2 bearer session may inspect or change staff grants.
drop policy if exists "mfa2 required for personal staff grants" on public.avofis_staff_capability_grants;
create policy "mfa2 required for personal staff grants"
 on public.avofis_staff_capability_grants as restrictive
 for all to authenticated
 using((select auth.jwt()->>'aal')='aal2')
 with check((select auth.jwt()->>'aal')='aal2');
drop policy if exists "mfa2 required for staff work items" on public.avofis_staff_work_items;
create policy "mfa2 required for staff work items"
 on public.avofis_staff_work_items as restrictive
 for all to authenticated
 using((select auth.jwt()->>'aal')='aal2')
 with check((select auth.jwt()->>'aal')='aal2');
drop policy if exists "mfa2 required for private staff capability audit" on public.avofis_staff_capability_events;
create policy "mfa2 required for private staff capability audit"
 on public.avofis_staff_capability_events as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2');
drop policy if exists "mfa2 required for private staff work audit" on public.avofis_staff_work_item_events;
create policy "mfa2 required for private staff work audit"
 on public.avofis_staff_work_item_events as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2');
drop policy if exists "mfa2 required for independent internal signoffs" on public.avofis_staff_work_item_signoffs;
create policy "mfa2 required for independent internal signoffs"
 on public.avofis_staff_work_item_signoffs as restrictive
 for all to authenticated
 using((select auth.jwt()->>'aal')='aal2')
 with check((select auth.jwt()->>'aal')='aal2');

-- AAL1 personnel cannot bypass the Next.js API using direct Supabase REST:
-- keep a genuine client's own case access, require AAL2 for all staff cases.
drop policy if exists "staff mfa2 or direct case owner select" on public.avofis_cases;
create policy "staff mfa2 or direct case owner select"
 on public.avofis_cases as restrictive for select to authenticated
 using(client_user_id=(select auth.uid()) or (select auth.jwt()->>'aal')='aal2');
drop policy if exists "staff mfa2 case update" on public.avofis_cases;
create policy "staff mfa2 case update"
 on public.avofis_cases as restrictive for update to authenticated
 using((select auth.jwt()->>'aal')='aal2')
 with check((select auth.jwt()->>'aal')='aal2');
drop policy if exists "staff mfa2 or case owner messages read" on public.avofis_messages;
create policy "staff mfa2 or case owner messages read"
 on public.avofis_messages as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2' or exists(
  select 1 from public.avofis_cases c where c.id=case_id and
   c.client_user_id=(select auth.uid())));
drop policy if exists "staff mfa2 or case owner messages write" on public.avofis_messages;
create policy "staff mfa2 or case owner messages write"
 on public.avofis_messages as restrictive for insert to authenticated
 with check((select auth.jwt()->>'aal')='aal2' or exists(
  select 1 from public.avofis_cases c where c.id=case_id and
   c.client_user_id=(select auth.uid())));
drop policy if exists "staff mfa2 or case owner payment records" on public.avofis_payments;
create policy "staff mfa2 or case owner payment records"
 on public.avofis_payments as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2' or exists(
  select 1 from public.avofis_cases c where c.id=case_id and
   c.client_user_id=(select auth.uid())));
drop policy if exists "staff mfa2 or case owner document requests" on public.avofis_document_requests;
create policy "staff mfa2 or case owner document requests"
 on public.avofis_document_requests as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2' or exists(
  select 1 from public.avofis_cases c where c.id=case_id and
   c.client_user_id=(select auth.uid())));
drop policy if exists "staff mfa2 or case owner deliverables" on public.avofis_deliverables;
create policy "staff mfa2 or case owner deliverables"
 on public.avofis_deliverables as restrictive for select to authenticated
 using((select auth.jwt()->>'aal')='aal2' or exists(
  select 1 from public.avofis_cases c where c.id=case_id and
   c.client_user_id=(select auth.uid())));
drop policy if exists "staff mfa2 or case owner private file objects" on storage.objects;
create policy "staff mfa2 or case owner private file objects"
 on storage.objects as restrictive for select to authenticated
 using(bucket_id<>'avofis-private' or (select auth.jwt()->>'aal')='aal2' or
   exists(select 1 from public.avofis_cases c where
    c.id=(storage.foldername(name))[1]::uuid and c.client_user_id=(select auth.uid())));
commit;
