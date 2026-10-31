-- AVOfis B01/B02: READ-ONLY inventory. Never writes or exposes row contents.
-- Intended for SQL editor or psql; safe to execute on the connected project
-- ONLY as a SELECT. This produces a status report, not permission to migrate.
-- Check Data API exposure, dependencies, backup and authorised change window
-- separately. A returned PASS for B01/B02 is not a production GO decision.
with targets(tab) as (values
 ('offices'),('office_members'),('topics'),('posts'),
 ('jobs'),('applications'),('media_assets')
), catalog as (
 select t.tab, c.oid, c.relrowsecurity
 from targets t
 left join pg_namespace n on n.nspname='public'
 left join pg_class c on c.relnamespace=n.oid
                    and c.relname=t.tab and c.relkind in ('r','p')
)
select 'B01_B02'::text as gate,tab as object,
 case when oid is null then 'BLOCKED_MISSING_TABLE'
      when not relrowsecurity then 'BLOCKED_RLS_OFF'
      when has_table_privilege('anon',oid,'SELECT')
        or has_table_privilege('anon',oid,'INSERT')
        or has_table_privilege('anon',oid,'UPDATE')
        or has_table_privilege('anon',oid,'DELETE') then 'BLOCKED_ANON_GRANTS'
      when has_table_privilege('authenticated',oid,'INSERT')
        or has_table_privilege('authenticated',oid,'UPDATE')
        or has_table_privilege('authenticated',oid,'DELETE') then 'BLOCKED_AUTH_WRITE_GRANTS'
      else 'PASS_LEGACY_ACCESS' end as status,
 coalesce(relrowsecurity,false) as rls,
 coalesce(has_table_privilege('anon',oid,'SELECT'),false) as anon_select,
 coalesce(has_table_privilege('anon',oid,'INSERT'),false) as anon_insert,
 coalesce(has_table_privilege('anon',oid,'UPDATE'),false) as anon_update,
 coalesce(has_table_privilege('anon',oid,'DELETE'),false) as anon_delete,
 coalesce(has_table_privilege('authenticated',oid,'INSERT'),false) as auth_insert,
 coalesce(has_table_privilege('authenticated',oid,'UPDATE'),false) as auth_update,
 coalesce(has_table_privilege('authenticated',oid,'DELETE'),false) as auth_delete
from catalog order by tab;

-- The pre-existing broad policies are PERMISSIVE and combine with admin
-- policies by OR; these are not a substitute for admin authorisation.
select 'B02_ADMIN_READ'::text as gate,
 c.relname as object,
 case when exists (
    select 1 from pg_policies p
    where p.schemaname='public' and p.tablename=c.relname
      and p.policyname=case when c.relname='pages'
        then 'Allow admin read' else 'Allow admin read settings' end
 ) then 'BLOCKED_BROAD_SELECT_POLICY' else 'PASS_NO_BROAD_POLICY' end as status
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('pages','site_settings')
order by c.relname;

-- Schema readiness alone is not legal/data protection readiness.
select 'B03_B04'::text as gate,
 case when to_regclass('public.avofis_cases') is null
           then 'BLOCKED_NO_CASE_SCHEMA' else 'CASE_SCHEMA_PRESENT' end
    as case_schema_status,
 case when to_regclass('public.avofis_case_clearances') is null
           then 'BLOCKED_NO_G1_G4_SCHEMA' else 'CLEARANCES_PRESENT' end
    as g1_g4_status,
 case when exists(select 1 from storage.buckets where id='avofis-private')
           then 'PRIVATE_BUCKET_EXISTS' else 'BLOCKED_NO_PRIVATE_BUCKET' end
    as storage_status;
