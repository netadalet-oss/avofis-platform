\set ON_ERROR_STOP on
-- Synthetic PG17 negative test. A familiar name with a dangerous FOR ALL
-- must NOT be accepted by the B02 identity/CMS migration.
\ir ./legacy_rls_hardening.sql
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
drop policy "Only admins can read pages" on public.pages;
create policy "Only admins can read pages" on public.pages
 for all to authenticated using(true) with check(true);
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
\echo 'FAIL B02: named policy with FOR ALL was silently accepted'
