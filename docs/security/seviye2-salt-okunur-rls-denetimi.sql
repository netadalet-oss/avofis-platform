-- AVOfis Seviye 2 / B01+B02 / READ ONLY. PostgreSQL catalog metadata only.
-- No personal records, row contents, DDL/DML, grants, or storage writes.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') AS authenticated_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') AS authenticated_delete
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
AND c.relname IN ('applications','jobs','media_assets','office_members','offices','posts','topics','pages','site_settings')
ORDER BY c.relname;

SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_catalog.pg_policies
WHERE schemaname = 'public'
AND tablename IN ('applications','jobs','media_assets','office_members','offices','posts','topics','pages','site_settings')
ORDER BY tablename, policyname;
