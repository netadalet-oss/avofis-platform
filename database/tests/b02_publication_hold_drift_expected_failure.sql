\set ON_ERROR_STOP on
-- Synthetic PG17 negative test. A known CMS publication-hold policy must
-- remain RESTRICTIVE and false; preserve no permissive same-name substitute.
\ir ./legacy_rls_hardening.sql
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
drop policy "avofis unpublished update hold" on public.site_settings;
create policy "avofis unpublished update hold" on public.site_settings
 for update to authenticated using(true) with check(true);
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
\echo 'FAIL B02: unapproved CMS write policy bypassed the hold'
