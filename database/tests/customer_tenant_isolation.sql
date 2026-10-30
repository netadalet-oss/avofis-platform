\set ON_ERROR_STOP on
-- AVOfis v17 T02/T03: disposable PostgreSQL 17 only.
-- Loads the actual committed migration chain with synthetic Auth/Storage shims.
-- No real Supabase JWT validation, Storage HTTP, URLs or customer data.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
grant usage on schema auth to authenticated;
grant usage on schema storage to authenticated,anon;
create table auth.users(
 id uuid primary key, email text, email_confirmed_at timestamptz,
 created_at timestamptz not null default now()
);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
create table storage.buckets(
 id text primary key,name text not null,public boolean not null,
 file_size_limit bigint,allowed_mime_types text[]
);
create table storage.objects(
 id uuid primary key default gen_random_uuid(),
 bucket_id text not null, name text not null
);
create function storage.foldername(n text) returns text[]
 language sql immutable as $$
 select (string_to_array(n,'/'))[1:(array_length(string_to_array(n,'/'),1)-1)];
$$;
alter table storage.objects enable row level security;
-- Mimic the pre-RLS SQL permissions often granted by the Storage API.
grant select,insert,update,delete on storage.objects to anon,authenticated;

\ir ../migrations/20261027_avofis_mvp.sql
\ir ../migrations/20261027_staff_role_hardening.sql
\ir ../migrations/20261027_customer_journeys.sql
\ir ../migrations/20261027_lead_to_case.sql
\ir ../migrations/20261027_case_tracking.sql
\ir ../migrations/20261027_staff_deliverables.sql
\ir ../migrations/20261027_case_transition_guard.sql
\ir ../migrations/20261029_ind_case_activation_guard.sql
\ir ../migrations/20261029_ind_mandate_asylum_regime_guard.sql
\ir ../migrations/20261029_case_assignment_scope.sql

insert into auth.users(id,email,email_confirmed_at) values
 ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','synthetic-a@example.invalid',now()),
 ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','synthetic-b@example.invalid',now()),
 ('cccccccc-cccc-4ccc-cccc-cccccccccccc','synthetic-admin@example.invalid',now()),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','synthetic-operator@example.invalid',now()),
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','synthetic-second-admin@example.invalid',now()),
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','synthetic-revoked-operator@example.invalid',now());
insert into public.avofis_staff(user_id,role) values
 ('cccccccc-cccc-4ccc-cccc-cccccccccccc','admin'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','operator'),
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','admin'),
 ('ffffffff-ffff-4fff-8fff-ffffffffffff','operator');
insert into public.avofis_leads(full_name,email,country,service_key,privacy_notice_version,privacy_accepted_at)
 values('Sensitive Synthetic Enquiry','synthetic-private@example.invalid','NL','housing','test-only',now());
insert into public.avofis_cases(id,client_user_id,title,service_key,status) values
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','Synthetic A only','housing','review'),
 ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','Synthetic B only','housing','review');
insert into public.avofis_agreements(id,case_id,agreement_version,legal_text,client_signature,signed_at) values
 ('31111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','synthetic','Synthetic agreement text for test only; not a real contract or signed document.','Synthetic A',now()),
 ('32222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','synthetic','Synthetic agreement text for test only; not a real contract or signed document.',null,null);
insert into public.avofis_messages(id,case_id,sender_id,body) values
 ('41111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','A only'),
 ('42222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','B only');
insert into public.avofis_payments(id,case_id,mollie_id,amount_eur_cents,status,checkout_url) values
 ('51111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','synthetic-pay-a',100,'open','https://example.invalid/a'),
 ('52222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','synthetic-pay-b',100,'open','https://example.invalid/b');
insert into public.avofis_document_requests(case_id,requested_by,title) values
 ('11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-cccc-cccccccccccc','Synthetic A request'),
 ('22222222-2222-4222-8222-222222222222','cccccccc-cccc-4ccc-cccc-cccccccccccc','Synthetic B request');
insert into storage.objects(id,bucket_id,name) values
 ('61111111-1111-4111-8111-111111111111','avofis-private','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/71111111-1111-4111-8111-111111111111.pdf'),
 ('62222222-2222-4222-8222-222222222222','avofis-private','22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb/72222222-2222-4222-8222-222222222222.pdf');
insert into public.avofis_deliverables(case_id,uploaded_by,storage_path,original_file_name) values
 ('11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-cccc-cccccccccccc','11111111-1111-4111-8111-111111111111/cccccccc-cccc-4ccc-cccc-cccccccccccc/71111111-1111-4111-8111-111111111111.pdf','a.pdf'),
 ('22222222-2222-4222-8222-222222222222','cccccccc-cccc-4ccc-cccc-cccccccccccc','22222222-2222-4222-8222-222222222222/cccccccc-cccc-4ccc-cccc-cccccccccccc/72222222-2222-4222-8222-222222222222.pdf','b.pdf');


-- C reviews; E independently approves G1-G4. Case A can then become open.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_case_clearances(
 case_id,jurisdiction,procedure_family,representative_name,representative_role,
 work_right_verified,professional_authority_verified,authority_evidence_reference,
 procedure_reviewed,notified_or_filed_on,deadline_reviewed,deadline_basis,
 stay_consequences_reviewed,privacy_legal_basis_reviewed,secure_document_channel_verified,
 disclosure_and_retention_reviewed
) values (
 '11111111-1111-4111-8111-111111111111','Netherlands','other',
 'Synthetic Approved Admin','administrative reviewer',true,true,'test-authority-ref',
 true,current_date,true,'Synthetic deadline and jurisdiction check',
 true,true,true,true
);
insert into public.avofis_case_assignments(case_id,staff_user_id,assigned_by)
values('11111111-1111-4111-8111-111111111111',
 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid()),
 ('11111111-1111-4111-8111-111111111111',
 'ffffffff-ffff-4fff-8fff-ffffffffffff',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',false);
set role authenticated;
update public.avofis_case_clearances set human_approved=true
where case_id='11111111-1111-4111-8111-111111111111';
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_cases set status='awaiting_agreement'
where id='11111111-1111-4111-8111-111111111111';
update public.avofis_cases set status='open'
where id='11111111-1111-4111-8111-111111111111';
reset role;

-- Assigned operator access does not extend to the other client's matter.
-- All customer-facing public tables, documents and private objects require RLS.
do $$
declare tab text;
begin
 foreach tab in array array[
  'avofis_cases','avofis_agreements','avofis_messages','avofis_payments',
  'avofis_case_events','avofis_document_requests','avofis_deliverables',
  'avofis_case_assignments','avofis_assignment_events'
 ] loop
  if not (select relrowsecurity from pg_class where oid=format('public.%I',tab)::regclass) then
   raise exception 'RLS missing on %',tab;
  end if;
 end loop;
 if not (select relrowsecurity from pg_class where oid='storage.objects'::regclass) then
  raise exception 'Storage object RLS is off';
 end if;
 if (select public from storage.buckets where id='avofis-private') then
  raise exception 'Private bucket unexpectedly public';
 end if;
end $$;

-- Anonymous can neither read customer records nor read private objects.
set role anon;
do $$
begin
 begin
  perform count(*) from public.avofis_cases;
  raise exception 'Anonymous case read succeeded';
 exception when insufficient_privilege then null; end;
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>0 then
  raise exception 'Anonymous private object visible';
 end if;
end $$;
reset role;

-- Tenant A has only A rows across seven tables and private object paths.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1 or
    (select client_user_id from public.avofis_cases limit 1)<>'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'::uuid or
    (select count(*) from public.avofis_agreements)<>1 or
    (select count(*) from public.avofis_messages)<>1 or
    (select count(*) from public.avofis_payments)<>1 or
    (select count(*) from public.avofis_case_events)<>3 or
    (select count(*) from public.avofis_document_requests)<>1 or
    (select count(*) from public.avofis_deliverables)<>1 or
    (select count(*) from storage.objects where bucket_id='avofis-private')<>1 then
  raise exception 'Tenant A isolation failed';
 end if;
 begin
  insert into public.avofis_messages(case_id,sender_id,body)
  values('22222222-2222-4222-8222-222222222222',auth.uid(),'foreign-case attempt');
  raise exception 'Tenant A posted into B case';
 exception when check_violation then null;
  when insufficient_privilege then null; end;
 begin
  update public.avofis_cases set price_eur_cents=500 where id='11111111-1111-4111-8111-111111111111';
  raise exception 'Tenant A edited price';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values(
   'avofis-private',
   '22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/73333333-3333-4333-8333-333333333333.pdf');
  raise exception 'Tenant A wrote into B storage path';
 exception when check_violation then null;
  when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values(
   'avofis-private',
   '11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb/74444444-4444-4444-8444-444444444444.pdf');
  raise exception 'Tenant A spoofed B uploader';
 exception when check_violation then null;
  when insufficient_privilege then null; end;
end $$;
-- A may upload to an agreed A case only.
insert into storage.objects(bucket_id,name) values(
 'avofis-private',
 '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/75555555-5555-4555-8555-555555555555.pdf');
reset role;

-- Tenant B sees only B records; cannot upload without an accepted agreement.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1 or
    (select client_user_id from public.avofis_cases limit 1)<>'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'::uuid or
    (select count(*) from public.avofis_agreements)<>1 or
    (select count(*) from public.avofis_messages)<>1 or
    (select count(*) from public.avofis_case_events)<>1 or
    (select count(*) from public.avofis_document_requests)<>1 or
    (select count(*) from public.avofis_deliverables)<>1 or
    (select count(*) from public.avofis_payments)<>1 or
    (select count(*) from storage.objects where bucket_id='avofis-private')<>1 then
  raise exception 'Tenant B isolation failed';
 end if;
 begin
  insert into storage.objects(bucket_id,name) values(
   'avofis-private',
   '22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb/76666666-6666-4666-8666-666666666666.pdf');
  raise exception 'Unsigned tenant B uploaded a file';
 exception when check_violation then null;
  when insufficient_privilege then null; end;
end $$;
reset role;

-- Operator sees only explicitly assigned case A (never unassigned B).
-- Creation of matters/agreements and quote updates remain admin-only.
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1 or
    (select count(*) from public.avofis_agreements)<>1 or
    (select count(*) from public.avofis_messages)<>1 or
    (select count(*) from public.avofis_payments)<>1 or
    (select count(*) from public.avofis_deliverables)<>1 or
    (select count(*) from public.avofis_document_requests)<>1 or
    (select count(*) from storage.objects where bucket_id='avofis-private')<>2 then
  raise exception 'Unassigned operator saw tenant B records or lost tenant A access';
 end if;
 if (select count(*) from public.avofis_case_assignments)<>1 then
  raise exception 'Operator assignment disclosure failed';
 end if;
 if (select count(*) from public.avofis_leads)<>0 then
  raise exception 'Operator read confidential unassigned lead PII';
 end if;
 update public.avofis_leads set status='reviewed';
 if found then
  raise exception 'Operator reviewed unassigned lead';
 end if;
 begin
  update public.avofis_cases set status='awaiting_agreement'
   where id='22222222-2222-4222-8222-222222222222';
  if found then raise exception 'Operator updated unassigned case B'; end if;
 end;
 begin
  insert into public.avofis_cases(client_user_id,title,service_key)
  values('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','Unauthorised operator case','housing');
  raise exception 'Operator created a case';
 exception when check_violation then null;
  when insufficient_privilege then null; end;
 begin
  update public.avofis_cases set price_eur_cents=250;
  raise exception 'Operator modified a quote';
 exception when insufficient_privilege then null; end;
end $$;
reset role;


-- Staff removal must automatically purge and audit all F assignments.
-- A rehire (same Auth UUID) must not resurrect the previous case assignment.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_leads)<>1 then
  raise exception 'Admin lost authorised lead review access';
 end if;
 if (select count(*) from public.avofis_staff)<>4 then
  raise exception 'Admin cannot inspect protected staff roster';
 end if;
end $$;
reset role;
delete from public.avofis_staff
where user_id='ffffffff-ffff-4fff-8fff-ffffffffffff';
insert into public.avofis_staff(user_id,role)
values('ffffffff-ffff-4fff-8fff-ffffffffffff','operator');
select set_config('request.jwt.claim.sub','ffffffff-ffff-4fff-8fff-ffffffffffff',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>0
    or (select count(*) from public.avofis_messages)<>0
    or (select count(*) from storage.objects where bucket_id='avofis-private')<>0 then
  raise exception 'Revoked and re-added operator retained stale case access';
 end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_assignment_events
     where staff_user_id='ffffffff-ffff-4fff-8fff-ffffffffffff')<>2 then
  raise exception 'Missing append-only revoke audit event';
 end if;
 if (select count(*) from public.avofis_case_assignments)<>1 then
  raise exception 'Revoked operator assignment was not purged';
 end if;
 begin
  insert into public.avofis_assignment_events(case_id,staff_user_id,action)
  values('11111111-1111-4111-8111-111111111111',
   'ffffffff-ffff-4fff-8fff-ffffffffffff','assigned');
  raise exception 'Direct audit injection unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Case B (no G1-G4 clearance) remains blocked for the verified admin.
-- Synthetic post-review agreement is inserted as the fixture owner.
update public.avofis_agreements set client_signature='Synthetic B',signed_at=now()
 where case_id='22222222-2222-4222-8222-222222222222';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_cases set status='awaiting_agreement'
   where id='22222222-2222-4222-8222-222222222222';
  update public.avofis_cases set status='open'
   where id='22222222-2222-4222-8222-222222222222';
  raise exception 'No-clearance matter activated';
 exception when others then
  if sqlerrm not like 'Case activation blocked:%' then raise; end if;
 end;
end $$;
reset role;
\echo 'PASS: scoped staff assignment, revoke/re-hire purging + audit, admin-only lead PII, two-person G1-G4, A/B RLS and activation (synthetic only)'
