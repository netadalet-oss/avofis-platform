\set ON_ERROR_STOP on
-- Disposable PG17 only: run after customer_tenant_isolation + T10 synthetic.
-- No live database, real user, production payment or external mail.
\ir ../migrations/20261029_staff_personal_capability_scope_staging_only.sql
begin;

-- No silent module grants: assigned operator D cannot read its own case
-- without explicit 'matters'; cannot read payments/messages without caps.
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if public.avofis_has_staff_capability('matters')
   or (select count(*) from public.avofis_cases)<>0
   or (select count(*) from public.avofis_payments)<>0
   or (select count(*) from public.avofis_messages)<>0
   or (select count(*) from storage.objects where bucket_id='avofis-private')<>0
 then raise exception 'P01 ungranted operator obtained case/message/finance records'; end if;
 begin
  insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
   values(auth.uid(),'billing',auth.uid());
  raise exception 'P01 operator self granted finance capability';
 exception when check_violation then null; when insufficient_privilege then null; end;
end $$;
reset role;

-- Verified admin C grants D only matters; no other functionality is inherited.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','matters',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if not public.avofis_has_staff_capability('matters')
  or public.avofis_has_staff_capability('billing')
  or public.avofis_has_staff_capability('messages')
  or (select count(*) from public.avofis_cases)<>1
  or (select count(*) from public.avofis_payments)<>0
  or (select count(*) from public.avofis_messages)<>0
   or (select count(*) from storage.objects where bucket_id='avofis-private')<>0
 then raise exception 'P01 matters grant leaked finance or messages'; end if;
end $$;
reset role;

-- Admin adds two distinct per-person capabilities to same assigned case.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','messages',auth.uid()),
      ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','billing',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1
   or (select count(*) from public.avofis_payments)<>1
   or (select count(*) from public.avofis_messages)<1
 then raise exception 'P01 case-scoped messages and payment were not visible with matching grants'; end if;
end $$;
reset role;

-- A separate documents capability is necessary to read private objects.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','documents',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $proof$
begin
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>2
 then raise exception 'P01 explicit document grant did not restore A-only object access'; end if;
end $proof$;
reset role;


-- Revoke billing, recheck immediately under the SAME synthetic JWT subject.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
delete from public.avofis_staff_capability_grants
 where staff_user_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
   and capability='billing';
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_payments)<>0
  or public.avofis_has_staff_capability('billing') then
   raise exception 'P01 revoked billing scope retained finance access'; end if;
end $$;
reset role;

-- RLS clients retain their own files, even without staff role.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1
  or (select count(*) from public.avofis_payments)<>1 then
   raise exception 'P01 capability policies removed client A legal access'; end if;
end $$;
reset role;
rollback;
\echo 'PASS: P01 personal staff grants, no self-escalation, matters/messages/billing segregation, instant revoke and client preservation (synthetic)'
