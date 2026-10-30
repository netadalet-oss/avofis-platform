-- AVOfis B02 read-only policy postflight. No production mutations.
-- Name-only permission checks are insufficient: policy drift can recreate
-- PERMISSIVE USING(true) even when table GRANTS look sensible.
begin transaction read only;
do $b02$
declare p record; expected_count int; invalid text;
begin
 select count(*) into expected_count from pg_policies
 where schemaname='public' and tablename in ('profiles','pages','site_settings');
 if expected_count<>9 then
  raise exception 'B02-POST policy inventory drift, expected nine reviewed policies, found %',expected_count;
 end if;
 -- Three canonical owner/admin SELECT policies.
 select string_agg(tablename||'.'||policyname,', ')
 into invalid from pg_policies
 where schemaname='public' and tablename in ('profiles','pages','site_settings')
   and (policyname,tablename) in (
     ('Users can read own profile','profiles'),
     ('Only admins can read pages','pages'),
     ('Only admins can read settings','site_settings'))
   and not (cmd='SELECT' and permissive='PERMISSIVE'
     and roles::text='{authenticated}' and with_check is null
     and qual is not null and position('auth.uid()' in qual)>0
     and (tablename<>'profiles' or
       (position('id' in qual)>0 and position(' = ' in qual)>0))
     and (tablename='profiles' or
       (position('EXISTS' in qual)>0 and position('role' in qual)>0
       and position('admin' in qual)>0 and position('super_admin' in qual)>0)));
 if invalid is not null then
  raise exception 'B02-POST canonical SELECT policy drift: %',invalid;
 end if;
 if (select count(*) from pg_policies
      where schemaname='public' and
      (tablename,policyname) in (
       ('profiles','Users can read own profile'),
       ('pages','Only admins can read pages'),
       ('site_settings','Only admins can read settings')))<>3 then
  raise exception 'B02-POST owner/admin SELECT policy missing';
 end if;
 -- Only six reviewed restrictive CMS publication holds remain.
 select string_agg(tablename||'.'||policyname,', ')
 into invalid from pg_policies
 where schemaname='public' and tablename in ('pages','site_settings')
  and policyname like 'avofis unpublished % hold'
  and not (permissive='RESTRICTIVE' and roles::text='{authenticated}'
    and ((policyname='avofis unpublished insert hold'
      and cmd='INSERT' and with_check='false')
      or (policyname='avofis unpublished update hold'
      and cmd='UPDATE' and qual='false' and with_check='false')
      or (policyname='avofis unpublished delete hold'
      and cmd='DELETE' and qual='false')));
 if invalid is not null then
  raise exception 'B02-POST CMS publication hold drift: %',invalid;
 end if;
 if (select count(*) from pg_policies where schemaname='public'
      and tablename in ('pages','site_settings')
      and policyname like 'avofis unpublished % hold')<>6 then
  raise exception 'B02-POST CMS restrictive publication hold incomplete';
 end if;
 -- Reject any extra policy that could OR itself around SELECT or HOLD.
 if exists(select 1 from pg_policies where schemaname='public'
    and tablename in ('profiles','pages','site_settings')
    and not ((tablename,policyname) in (
       ('profiles','Users can read own profile'),
       ('pages','Only admins can read pages'),
       ('site_settings','Only admins can read settings'))
     or (tablename in ('pages','site_settings') and policyname in (
       'avofis unpublished insert hold',
       'avofis unpublished update hold',
       'avofis unpublished delete hold')))) then
  raise exception 'B02-POST unexpected unreviewed profile/CMS policy';
 end if;
end $b02$;
commit;
\echo 'PASS B02-POST: read-only reviewed policy inventory, role, command, owner/admin predicate, and six publication holds'
