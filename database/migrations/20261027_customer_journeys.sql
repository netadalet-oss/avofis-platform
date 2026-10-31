-- Run after 20261027_avofis_mvp.sql on a backed-up staging database.
-- Adds structured, minimally scoped enquiry context without touching existing leads.
alter table public.avofis_leads
 add column if not exists journey_key text,
 add column if not exists intake_details jsonb;

do $$
begin
 if not exists(select 1 from pg_constraint where conname='avofis_leads_journey_check') then
  alter table public.avofis_leads add constraint avofis_leads_journey_check
  check (journey_key is null or journey_key in (
    'tr-to-nl','nl-to-tr','apostille','translation','municipality','diploma',
    'company','crossborder','specialist'
  ));
 end if;
 if not exists(select 1 from pg_constraint where conname='avofis_leads_details_check') then
  alter table public.avofis_leads add constraint avofis_leads_details_check
  check (
    (journey_key is null and intake_details is null) or
    (journey_key is not null and intake_details is not null and jsonb_typeof(intake_details)='object')
  );
 end if;
end $$;
-- Existing avofis_leads RLS remains in force: only verified staff read enquiries.
-- API validates exact per-journey option lists; do not permit unrestricted free text in jsonb.
