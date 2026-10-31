\set ON_ERROR_STOP on
-- Disposable PostgreSQL17 shim: real Supabase auth.jwt is NOT simulated for
-- production, and this is NOT evidence of actual TOTP verification.
create or replace function auth.jwt() returns jsonb language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
\ir ../migrations/20261029_staff_mfa_sensitive_scope_staging_only.sql
begin;
-- Admin C with synthetic AAL2 grants necessary modules and creates a note.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','matters',auth.uid()),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','messages',auth.uid()),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','billing',auth.uid()),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','documents',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
insert into public.avofis_staff_work_items(staff_user_id,module,title,summary)
values(auth.uid(),'matters','Synthetic AAL2 staff draft','Not a real client matter');
do $allowed$
begin
 if (select count(*) from public.avofis_cases)<>1
  or (select count(*) from public.avofis_messages)<>1
  or (select count(*) from public.avofis_payments)<>1
  or (select count(*) from storage.objects where bucket_id='avofis-private')<>2
  or (select count(*) from public.avofis_staff_work_items)<>1
 then raise exception 'P09 AAL2 assigned worker lost legitimate scoped data'; end if;
end $allowed$;
reset role;
-- AAL1 employee must see zero records even if there are personal module grants.
select set_config('request.jwt.claims','{"aal":"aal1"}',false);
set role authenticated;
do $denied$
begin
 if (select count(*) from public.avofis_cases)<>0
  or (select count(*) from public.avofis_messages)<>0
  or (select count(*) from public.avofis_payments)<>0
  or (select count(*) from storage.objects where bucket_id='avofis-private')<>0
  or (select count(*) from public.avofis_staff_work_items)<>0
  or (select count(*) from public.avofis_staff_capability_grants)<>0
  or (select count(*) from public.avofis_staff_work_item_events)<>0
 then raise exception 'P09 AAL1 assigned employee bypassed MFA through direct PostgREST'; end if;
 begin
  insert into public.avofis_staff_work_items(staff_user_id,module,title)
  values(auth.uid(),'matters','Forged lower-MFA note');
  raise exception 'P09 AAL1 user wrote staff draft';
 exception when insufficient_privilege then null; end;
end $denied$;
reset role;
-- The same AAL1 protection must apply to admin reads/reviews; UI role alone
-- cannot unlock audit or person grants.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $adminDenied$
begin
 if (select count(*) from public.avofis_staff_capability_grants)<>0
   or (select count(*) from public.avofis_staff_capability_events)<>0
   or (select count(*) from public.avofis_staff_work_items)<>0 then
  raise exception 'P09 AAL1 administrator read high risk staff registry'; end if;
 begin
  insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
  values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','payables',auth.uid());
  raise exception 'P09 AAL1 administrator changed grants';
 exception when insufficient_privilege then null; end;
end $adminDenied$;
reset role;
-- Tenant A uploaded a second accepted synthetic PDF earlier in the fixture.
-- Clients retain their own rights even with AAL1; staff privileges are not
-- inferred from being the client and cross-client isolation remains.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $client$
begin
 raise notice 'P09 client A post-MFA RLS counts: case %, msg %, payment %, storage %, work %',
  (select count(*) from public.avofis_cases),
  (select count(*) from public.avofis_messages),
  (select count(*) from public.avofis_payments),
  (select count(*) from storage.objects where bucket_id='avofis-private'),
  (select count(*) from public.avofis_staff_work_items);
 if (select count(*) from public.avofis_cases)<>1
  or (select count(*) from public.avofis_messages)<>1
  or (select count(*) from public.avofis_payments)<>1
  or (select count(*) from storage.objects where bucket_id='avofis-private')<>2
  or (select count(*) from public.avofis_staff_work_items)<>0 then
  raise exception 'P09 normal client access broken or staff data leaked'; end if;
end $client$;
reset role;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $clientB$
begin
 if (select count(*) from public.avofis_cases)<>1
   or (select count(*) from public.avofis_messages)<>1
   or (select count(*) from public.avofis_payments)<>1 then
  raise exception 'P09 client B own records missing'; end if;
end $clientB$;
reset role;
rollback;
\echo 'PASS: P09 AAL2 sensitive staff SQL guard rejects AAL1 REST for cases/messages/payments/documents/grants/drafts/audit, preserves A/B clients (synthetic JWT)'
