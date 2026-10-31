\set ON_ERROR_STOP on
-- Run AFTER legacy_rls_hardening.sql in disposable PG17; no live changes.
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $cms$
begin
 if (select count(*) from public.pages)<>1
    or (select count(*) from public.site_settings)<>1 then
  raise exception 'P10 genuine admin lost read access to existing content'; end if;
 begin
  update public.pages set title='Unapproved published heading';
  if found then raise exception 'P10 unapproved page update succeeded'; end if;
 exception when insufficient_privilege then null; end;
 begin
  insert into public.site_settings(id,key,value)
    values('10000000-0000-4000-8000-000000000001','unapproved','{}');
  raise exception 'P10 unapproved new site setting written';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.pages;
  if found then raise exception 'P10 unapproved page delete succeeded'; end if;
 exception when insufficient_privilege then null; end;
end $cms$;
reset role;
-- Owner-level SQL grants and row grants are both disabled for publishes.
do $rights$
begin
 if has_table_privilege('authenticated','public.pages','UPDATE')
  or has_table_privilege('authenticated','public.site_settings','INSERT')
  or has_table_privilege('authenticated','public.site_settings','DELETE')
 then raise exception 'P10 CMS write privileges still open'; end if;
end $rights$;
-- Publishing hold migration must be repeatable.
\ir ../migrations/20261029_legacy_cms_publication_hold_staging_only.sql
\echo 'PASS: P10 CMS publication closed at database RLS/privilege layer, pre-existing admin content reads retained (synthetic)'
