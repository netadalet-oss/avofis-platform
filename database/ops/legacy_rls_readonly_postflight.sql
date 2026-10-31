\set ON_ERROR_STOP on
-- AVOfis B01/B02: STAGING AFTER migration; no data modifications.
-- The whole script runs in a READ ONLY transaction and fails closed if ANY
-- expected RLS/grant/policy assertion is missing. This is *not* a production
-- rollout instruction, nor proof of real Auth/JWT/Storage/REST E2E.
begin read only;
do $CHECK$
declare
  t text;
  role_name text;
  action_name text;
  c_oid oid;
begin
  foreach t in array array['offices','office_members','topics','posts',
                            'jobs','applications','media_assets'] loop
    select c.oid into c_oid
      from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname=t and c.relkind in ('r','p');
    if c_oid is null then
      raise exception 'B01/B02 NO-GO: missing public.%',t;
    end if;
    if not exists(select 1 from pg_class c where c.oid=c_oid and c.relrowsecurity) then
      raise exception 'B01/B02 NO-GO: RLS disabled on public.%',t;
    end if;
    foreach role_name in array array['anon','authenticated'] loop
      foreach action_name in array array['INSERT','UPDATE','DELETE'] loop
        if has_table_privilege(role_name,c_oid,action_name) then
          raise exception 'B01/B02 NO-GO: %.% grant to %',t,action_name,role_name;
        end if;
      end loop;
    end loop;
    if has_table_privilege('anon',c_oid,'SELECT') then
      raise exception 'B01/B02 NO-GO: anon can SELECT public.%',t;
    end if;
  end loop;

  if has_table_privilege('authenticated','public.offices','SELECT')
   or has_table_privilege('authenticated','public.media_assets','SELECT')
   or has_table_privilege('authenticated','public.posts','SELECT')
   or not has_table_privilege('authenticated','public.applications','SELECT')
   or not has_table_privilege('authenticated','public.office_members','SELECT') then
    raise exception 'B01/B02 NO-GO: wrong authenticated legacy SELECT privileges';
  end if;

  if exists(
    select 1 from pg_policies p where p.schemaname='public'
    and ((p.tablename='pages' and p.policyname='Allow admin read')
      or (p.tablename='site_settings'
        and p.policyname='Allow admin read settings'))
  ) then
    raise exception 'B02 NO-GO: broad authenticated-read policy still installed';
  end if;

  if (select count(*) from pg_policies p where p.schemaname='public'
        and p.tablename='applications'
        and p.policyname='legacy applicant reads own application'
        and p.cmd='SELECT') <> 1
     or
     (select count(*) from pg_policies p where p.schemaname='public'
        and p.tablename='office_members'
        and p.policyname='legacy member reads own membership'
        and p.cmd='SELECT') <> 1 then
    raise exception 'B02 NO-GO: owner-scoped applicant/member policy missing';
  end if;
end
$CHECK$;
commit;
\echo 'PASS: read-only B01/B02 postflight, seven RLS tables, no anon CRUD, scoped authenticated SELECT, no permissive admin-read policies'
