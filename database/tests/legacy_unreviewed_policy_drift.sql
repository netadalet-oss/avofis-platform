\set ON_ERROR_STOP on
-- Disposable PG17 *negative* migration test, not a production statement.
-- If any unreviewed permissive policy has appeared, the real hardening
-- migration MUST fail with its exact manual-review error before any ALTER.
create table public.offices(id integer primary key);
create policy "Unexpected public office visibility" on public.offices
 for select to public using (true);
\ir ../migrations/20261029_legacy_public_rls_hardening.sql
-- This line must be unreachable when the guard is effective.
\echo 'FAIL: migration accepted rogue policy'
