-- Apply AFTER 20261027_avofis_mvp.sql, 20261027_staff_role_hardening.sql and 20261027_customer_journeys.sql.
-- Links public enquiries to verified customer accounts without exposing auth.users.
alter table public.avofis_cases add column if not exists lead_id uuid references public.avofis_leads(id) on delete restrict;
create unique index if not exists avofis_cases_unique_lead on public.avofis_cases(lead_id) where lead_id is not null;

create or replace function public.avofis_open_case_from_lead(
 p_lead uuid, p_title text, p_price_eur_cents integer
) returns uuid
language plpgsql security definer set search_path='' as $$
declare
 v_lead public.avofis_leads%rowtype;
 v_client uuid;
 v_case uuid;
begin
 if auth.uid() is null or not public.avofis_is_admin() then
   raise exception 'Access denied' using errcode='42501';
 end if;
 if p_title is null or char_length(btrim(p_title)) < 3 or char_length(btrim(p_title))>160
    or p_price_eur_cents is null or p_price_eur_cents<0 or p_price_eur_cents>10000000 then
   raise exception 'Invalid case details';
 end if;
 select * into v_lead from public.avofis_leads where id=p_lead and status <> 'closed' for update;
 if not found then raise exception 'Enquiry is not available'; end if;
 select id into v_client from auth.users
 where lower(email)=lower(v_lead.email) and email_confirmed_at is not null
 order by created_at asc limit 1;
 if v_client is null then
   raise exception 'A verified client account with the same email is required';
 end if;
 insert into public.avofis_cases(client_user_id,lead_id,title,service_key,price_eur_cents,status)
 values(v_client,p_lead,btrim(p_title),v_lead.service_key,p_price_eur_cents,'review')
 returning id into v_case;
 update public.avofis_leads set status='reviewed' where id=p_lead;
 return v_case;
end;
$$;
revoke all on function public.avofis_open_case_from_lead(uuid,text,integer) from public,anon;
grant execute on function public.avofis_open_case_from_lead(uuid,text,integer) to authenticated;
-- UNIQUE lead_id enforces idempotency at the database boundary.
-- The RPC is atomic: if insert fails, lead status is not changed.
-- No user_metadata or user-provided UUID may grant staff privileges.
