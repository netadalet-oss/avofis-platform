-- Apply after 20261027_avofis_mvp.sql. Future transitions only: existing rows unchanged.
-- RLS already prevents clients from editing case status. This trigger additionally
-- guards against accidental false "completed" or "processing" states by staff.
create or replace function public.avofis_guard_case_status()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
   if new.status <> 'review' then raise exception 'New case must enter review'; end if;
   return new;
 end if;
 if new.status is not distinct from old.status then return new; end if;
 if not (
   (old.status='review' and new.status in ('awaiting_agreement','closed')) or
   (old.status='awaiting_agreement' and new.status in ('review','open','closed')) or
   (old.status='open' and new.status in ('completed','closed')) or
   (old.status='completed' and new.status='closed')
 ) then raise exception 'Invalid case status transition'; end if;
 if new.status in ('open','completed') and not exists(
   select 1 from public.avofis_agreements a where a.case_id=old.id and a.signed_at is not null
 ) then raise exception 'Accepted agreement required'; end if;
 if new.status='completed' and new.price_eur_cents>0 and not exists(
   select 1 from public.avofis_payments p where p.case_id=old.id and p.status='paid'
 ) then raise exception 'Verified payment required before completion'; end if;
 return new;
end;
$$;
revoke all on function public.avofis_guard_case_status() from public,anon,authenticated;
drop trigger if exists avofis_case_status_guard on public.avofis_cases;
create trigger avofis_case_status_guard
 before insert or update of status on public.avofis_cases
 for each row execute function public.avofis_guard_case_status();
-- The independent case-event trigger records the successful transitions.
