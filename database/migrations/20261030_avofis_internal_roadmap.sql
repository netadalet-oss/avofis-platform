-- Separate administrator-only phase assignment. Requires existing 20261028 internal task table.
-- No private project information is exposed to customers or anonymous visitors.
-- Must be reviewed and applied in the staging Supabase database before enabling internal operations.
alter table public.avofis_internal_tasks
  add column if not exists phase_key text;
alter table public.avofis_internal_tasks
  drop constraint if exists avofis_internal_tasks_phase_key_check;
alter table public.avofis_internal_tasks
  add constraint avofis_internal_tasks_phase_key_check
  check (phase_key is null or phase_key in ('foundation','launch','digital','expansion','coordination'));
create index if not exists avofis_internal_tasks_phase_idx
  on public.avofis_internal_tasks(phase_key,status);
-- Existing records remain unclassified (NULL); no fictional completion is inferred.
