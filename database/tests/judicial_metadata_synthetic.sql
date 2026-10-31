\set ON_ERROR_STOP on
-- J07-J10 disposable PostgreSQL 17 regression. Runs only AFTER synthetic
-- customer_tenant_isolation.sql. It MUST NOT touch production.
\ir ../migrations/20261029_judicial_metadata_staging_only.sql
begin;
-- Admin C creates synthetic internal metadata for client A and client B.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_judicial_case_metadata(case_id,country,procedure_family,court_code,
 deadline_human_reviewed,official_case_reference)
values
 ('11111111-1111-4111-8111-111111111111','NL','general_administrative','RBAMS',false,null),
 ('22222222-2222-4222-8222-222222222222','NL','civil','RBROT',false,null);
insert into public.avofis_judicial_local_events(id,case_id,event_kind,recorded_by)
values('a1010101-1111-4111-8111-111111111111',
 '11111111-1111-4111-8111-111111111111','draft_prepared',(select auth.uid()));
reset role;

-- Customer A can see own metadata only, but cannot write official events.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_judicial_case_metadata)<>1
   or (select count(*) from public.avofis_judicial_local_events)<>1
 then raise exception 'J07 customer A row isolation failed'; end if;
 begin
  insert into public.avofis_judicial_local_events(id,case_id,event_kind,recorded_by)
  values('a2020202-2222-4222-8222-222222222222',
   '11111111-1111-4111-8111-111111111111','official_portal_opened',(select auth.uid()));
  raise exception 'J10 client forged admin local event';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Customer B cannot see A's metadata, events or A's pending references.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_judicial_case_metadata)<>1
  or (select count(*) from public.avofis_judicial_local_events)<>0
 then raise exception 'J07 customer B cross-tenant access'; end if;
 begin
  update public.avofis_judicial_case_metadata set court_code='RBAMS'
   where case_id='11111111-1111-4111-8111-111111111111';
  if found then raise exception 'J07 customer B changed A court metadata'; end if;
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Admin can't fake submitted or add asylum via the general court schema.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 begin
  insert into public.avofis_judicial_local_events(id,case_id,event_kind,recorded_by)
  values('a3030303-3333-4333-8333-333333333333',
   '11111111-1111-4111-8111-111111111111','submitted',(select auth.uid()));
  raise exception 'J10 unsupported submitted event accepted';
 exception when check_violation then null; end;
 begin
  update public.avofis_judicial_case_metadata set procedure_family='asylum'
  where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'J07 asylum entered general court metadata';
 exception when check_violation then null; end;
 begin
  update public.avofis_judicial_case_metadata set deadline_human_reviewed=true
  where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'J09 deadline approval without basis';
 exception when check_violation then null; end;
end $$;
reset role;
rollback;
\echo 'PASS: J07-J10 internal court metadata RLS A/B, restricted IND, no submitted event, no unreviewed deadline or client event forging (synthetic)'
