\set ON_ERROR_STOP on
-- Negative postflight test. Synthetic fixture in an isolated PG17 database.
\ir ./legacy_rls_hardening.sql
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
-- Drift occurs AFTER the migration; it must not pass read-only postflight.
drop policy "Only admins can read pages" on public.pages;
create policy "Only admins can read pages" on public.pages
 for select to authenticated using(true);
\ir ../ops/b02_policy_readonly_postflight.sql
\echo 'FAIL: postflight accepted broad same-name CMS read policy'
