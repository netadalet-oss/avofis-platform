-- AVOfis Seviye 6 — read-only CMS schema and persistence preflight
-- This query does not read user content, insert, update or change permissions.
SELECT c.relname AS table_name,
       con.conname AS constraint_name,
       con.contype AS constraint_kind,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('pages','site_settings')
ORDER BY c.relname, con.conname;

SELECT 'pages' AS table_name, count(*) AS total_rows,
       count(*) FILTER (WHERE slug = 'home') AS target_rows
FROM public.pages
UNION ALL
SELECT 'site_settings', count(*),
       count(*) FILTER (WHERE key = 'navigation')
FROM public.site_settings;

-- Source read dated 2026-10-31:
-- public.pages PRIMARY KEY (id), UNIQUE (slug), total 1, home 1.
-- public.site_settings PRIMARY KEY (id), UNIQUE (key), total 3, navigation 1.
-- Re-run before deployment. Row counts are a snapshot, not future guarantees.
-- No production write is authorized by this file.
