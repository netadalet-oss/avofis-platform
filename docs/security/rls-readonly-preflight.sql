-- AVOfis / Seviye 4 — READ-ONLY current RLS exposure gate
-- Only PostgreSQL catalog reads; no user table row data is returned.
-- Usage: run against the intended Supabase project in an authorized SQL read session.
-- This script cannot fix security issues; compare output to rls-live-baseline-2026-10-31.json.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') AS authenticated_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') AS authenticated_delete
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'applications', 'jobs', 'media_assets', 'office_members',
    'offices', 'posts', 'topics'
  )
ORDER BY c.relname;

-- RLS policy metadata for the seven tables (not a data read).
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'applications', 'jobs', 'media_assets', 'office_members',
    'offices', 'posts', 'topics'
  )
ORDER BY tablename, policyname;

-- Do not execute fixes based on these results without approved ownership
-- semantics, negative and positive access tests, and rollback plans.
