\set ON_ERROR_STOP on
-- T04 recovery assertion: run only against a new disposable database restored
-- from a synthetic pg_dump. This is NOT a live backup or production DR test.
do $$
declare v int;
begin
 if (select title from public.avofis_cases
     where id='11111111-1111-4111-8111-111111111111') <> 'Synthetic A only' then
  raise exception 'Source mutation leaked into the restored backup';
 end if;
 if (select count(*) from public.avofis_cases)<>2 or
    (select count(*) from public.avofis_case_assignments)<>1 then
  raise exception 'Restored cases/assignments missing';
 end if;
 if not (select relrowsecurity from pg_class where oid='public.avofis_cases'::regclass)
    or not (select relrowsecurity from pg_class where oid='public.avofis_case_assignments'::regclass)
    or not (select relrowsecurity from pg_class where oid='storage.objects'::regclass) then
  raise exception 'Restored RLS flags missing';
 end if;
 if not exists (select 1 from pg_trigger
    where tgrelid='public.avofis_cases'::regclass and tgname='avofis_case_clearance_activation_guard' and tgenabled='O') then
  raise exception 'G1-G4 activation trigger absent after recovery';
 end if;
 if not exists (select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='cleared case participants upload private objects') then
  raise exception 'Private Storage upload policy absent after recovery';
 end if;
end $$;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1
    or (select count(*) from public.avofis_messages)<>1
    or (select count(*) from storage.objects where bucket_id='avofis-private')<>2 then
  raise exception 'Restored operator access is not limited to assigned tenant A';
 end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.avofis_cases)<>1
    or (select count(*) from public.avofis_messages)<>1
    or (select count(*) from storage.objects where bucket_id='avofis-private')<>2 then
  raise exception 'Restored customer A access failed';
 end if;
end $$;
reset role;
\echo 'PASS: synthetic pg_dump/pg_restore preserved data, RLS, triggers and A/assigned operator isolation'
