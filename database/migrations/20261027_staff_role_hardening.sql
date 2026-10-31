-- Apply after 20261027_avofis_mvp.sql, BEFORE 20261027_lead_to_case.sql.
-- Operators can process cases and request/receive documents, but cannot
-- issue a new quote, create a case or author/change a service agreement.
create or replace function public.avofis_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
  select exists (
    select 1 from public.avofis_staff
    where user_id=auth.uid() and role='admin'
  );
$$;
revoke all on function public.avofis_is_admin() from public,anon;
grant execute on function public.avofis_is_admin() to authenticated;

drop policy if exists "staff create matters" on public.avofis_cases;
drop policy if exists "verified admins create cases" on public.avofis_cases;
create policy "verified admins create cases" on public.avofis_cases
 for insert to authenticated with check(public.avofis_is_admin());

-- The case RPC (a SECURITY DEFINER function) checks avofis_is_admin itself.
-- Disallow column editing by staff through the browser API except status;
-- prices, recipients, service categories and lead links are immutable.
revoke update on public.avofis_cases from authenticated;
grant update(status) on public.avofis_cases to authenticated;

drop policy if exists "staff insert agreements" on public.avofis_agreements;
drop policy if exists "verified admins insert agreements" on public.avofis_agreements;
create policy "verified admins insert agreements" on public.avofis_agreements
 for insert to authenticated with check(public.avofis_is_admin());
drop policy if exists "staff update agreements" on public.avofis_agreements;
drop policy if exists "verified admins update agreements" on public.avofis_agreements;
create policy "verified admins update agreements" on public.avofis_agreements
 for update to authenticated using(public.avofis_is_admin()) with check(public.avofis_is_admin());
-- Existing agreement immutability trigger still blocks changing signed text.
