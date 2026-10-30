\set ON_ERROR_STOP on
-- B04: disposable PostgreSQL 17 real RLS on the actual tenant fixture.
-- Must execute AFTER FORM-03 synthetic chain and before any future real E2E.
-- Not a live Supabase Auth/Storage HTTP, signed-URL or malware scan test.
\ir ../migrations/20261030_b04_private_storage_owner_hold_staging_only.sql

do $inventory$
begin
 if (select count(*) from pg_policies where schemaname='storage'
       and tablename='objects' and policyname like 'avofis b04 %')<>6 then
   raise exception 'B04 expected two permits and four restrictive boundaries';
 end if;
 if exists(select 1 from pg_policies where schemaname='storage'
       and tablename='objects' and policyname in
         ('authorised users read case objects',
          'clients upload to their accepted cases',
          'cleared case participants upload private objects',
          'avofis private document capability',
          'staff mfa2 or case owner private file objects')) then
   raise exception 'B04 legacy UUID casting or staff-wide private access policy survived';
 end if;
 if (select public from storage.buckets where id='avofis-private') is distinct from false then
   raise exception 'B04 private bucket became public';
 end if;
end $inventory$;

-- A malicious/malformed legacy object name must never raise UUID cast error
-- for any Storage listing; it is unreadable to both A and B.
insert into storage.objects(bucket_id,name) values
 ('avofis-private','not-a-uuid/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/bad.pdf'),
 ('avofis-private','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/..%2fsecret.pdf');
select set_config('request.jwt.claims','{"aal":"aal1"}',false);
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $owner$
declare owned int;
begin
 select count(*) into owned from storage.objects where bucket_id='avofis-private';
 if owned<>2 then raise exception 'B04 A expected two own verified case objects, saw %',owned; end if;
 -- Case A is open with a synthetic signed agreement.
 insert into storage.objects(bucket_id,name) values
  ('avofis-private','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/81234567-89ab-4cde-8abc-1234567890ab.pdf');
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>3 then
   raise exception 'B04 A approved own upload not queryable';
 end if;
end $owner$;
reset role;

-- B sees its own historic object, not A or its new upload. It cannot upload
-- while B is not in the open/signed/cleared status.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $tenant_b$
begin
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>1 then
   raise exception 'B04 B read another tenant or lost own object';
 end if;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb/81234567-89ab-4cde-8abc-1234567890ac.pdf');
  raise exception 'B04 B unsigned/not open case inserted object';
 exception when insufficient_privilege then null; end;
end $tenant_b$;
reset role;

-- Earlier P01/P09 smoke tests intentionally ROLLBACK their temporary grants.
-- Set up an independently authorized synthetic AAL2 admin capability grant
-- before proving that even a fully assigned/granted employee cannot read the
-- owner-only Storage bucket without document-specific customer consent.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','documents',auth.uid())
on conflict (staff_user_id,capability) do nothing;
reset role;

-- Even a correctly assigned operator with AAL2 and a personal documents
-- grant may not read client private objects without a separately approved
-- per-object consent mechanism. The staff draft review is a DIFFERENT table.
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
set role authenticated;
do $staff$
begin
 if not public.avofis_has_staff_capability('documents') then
   raise exception 'B04 fixture missing assigned staff documents capability';
 end if;
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>0 then
   raise exception 'B04 AAL2 staff bypassed client private-object disclosure hold';
 end if;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','11111111-1111-4111-8111-111111111111/dddddddd-dddd-4ddd-8ddd-dddddddddddd/81234567-89ab-4cde-8abc-1234567890ad.pdf');
  raise exception 'B04 staff uploaded to a private client bucket without client ownership';
 exception when insufficient_privilege then null; end;
end $staff$;
reset role;

-- Even a staff admin has no object-level client consent by being an admin.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $admin$
begin
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>0 then
  raise exception 'B04 administrator had blanket private file disclosure';
 end if;
end $admin$;
reset role;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
select set_config('request.jwt.claims','{"aal":"aal1"}',false);
set role authenticated;
do $malice$
declare changed int;
begin
 -- Name spoofing, folder traversal, forged foreign object, unsupported type.
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/81234567-89ab-4cde-8abc-1234567890ae.pdf');
  raise exception 'B04 A used own uploader ID in B case';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','11111111-1111-4111-8111-111111111111/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb/81234567-89ab-4cde-8abc-1234567890af.pdf');
  raise exception 'B04 A forged B uploader identity';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/81234567-89ab-4cde-8abc-1234567890b0.exe');
  raise exception 'B04 executable extension accepted';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/../secret.pdf');
  raise exception 'B04 traversal path accepted';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values
   ('avofis-private','not-a-uuid/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/81234567-89ab-4cde-8abc-1234567890b1.pdf');
  raise exception 'B04 malformed case ID accepted';
 exception when insufficient_privilege then null; end;
 -- Upsert/rename/delete held until human retention and consent decisions.
 update storage.objects set name=name||'.overwrite'
  where name like '11111111-1111-4111-8111-111111111111/%';
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'B04 private files update permitted'; end if;
 delete from storage.objects where bucket_id='avofis-private';
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'B04 private files deletion permitted'; end if;
end $malice$;
reset role;

-- A future accidental OR permissive USING(true) must still not expose B.
create policy "synthetic rogue broad select" on storage.objects
 for select to public using(true);
create policy "synthetic rogue broad writes" on storage.objects
 for update to authenticated using(true) with check(true);
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $rogue$
declare changed int;
begin
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>3 then
   raise exception 'B04 rogue permissive SELECT leaked other user rows';
 end if;
 update storage.objects set name='overwrite.pdf' where bucket_id='avofis-private';
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'B04 rogue UPDATE bypassed immutable private boundary'; end if;
end $rogue$;
reset role;
select set_config('request.jwt.claim.sub','',false);
set role anon;
do $anon$
begin
 if (select count(*) from storage.objects where bucket_id='avofis-private')<>0 then
   raise exception 'B04 rogue policy gave anonymous private object access';
 end if;
end $anon$;
reset role;
drop policy "synthetic rogue broad select" on storage.objects;
drop policy "synthetic rogue broad writes" on storage.objects;

-- Same migration can be applied twice to the reviewed staging schema.
\ir ../migrations/20261030_b04_private_storage_owner_hold_staging_only.sql
\echo 'PASS B04: private owner-only case Storage, A/B, staff consent hold, immutable data, malformed names, rogue OR policies, idempotence (synthetic PG17)'
