\set ON_ERROR_STOP on
-- Negative postflight test. Synthetic fixture in an isolated PG17 database.
\ir ./legacy_rls_hardening.sql
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
drop policy "avofis unpublished insert hold" on public.site_settings;
create policy "avofis unpublished insert hold" on public.site_settings
 for insert to authenticated with check(true);
\ir ../ops/b02_policy_readonly_postflight.sql
\echo 'FAIL: postflight accepted permissive CMS write policy'
