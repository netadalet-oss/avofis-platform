-- AVOfis P10: REVIEW / STAGING ONLY. NOT APPLIED TO LIVE SUPABASE.
-- Legacy CMS was able to upsert pages/site_settings directly. Publishing must
-- stop until independent legal/language/editor signoff and a reviewed release
-- service are implemented. Preserve existing content/admin read access.
begin;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
revoke insert,update,delete on table public.pages,public.site_settings
 from public,anon,authenticated;
-- Deny writes even if historical table grants are mistakenly restored. Leave
-- existing admin SELECT policies untouched; other policies may need B02 fix.
do $$
declare t text;
begin
 foreach t in array array['pages','site_settings'] loop
  execute format('drop policy if exists "avofis unpublished insert hold" on public.%I',t);
  execute format('create policy "avofis unpublished insert hold" on public.%I as restrictive for insert to authenticated with check(false)',t);
  execute format('drop policy if exists "avofis unpublished update hold" on public.%I',t);
  execute format('create policy "avofis unpublished update hold" on public.%I as restrictive for update to authenticated using(false) with check(false)',t);
  execute format('drop policy if exists "avofis unpublished delete hold" on public.%I',t);
  execute format('create policy "avofis unpublished delete hold" on public.%I as restrictive for delete to authenticated using(false)',t);
 end loop;
end $$;
commit;
