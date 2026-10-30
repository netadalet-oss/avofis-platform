-- AVOfis B04: private case Storage object access, STAGING ONLY.
-- Not applied to live project. Requires MVP, case_assignment_scope,
-- personal_capability_scope and staff_mfa_sensitive_scope migrations.
-- The older permissive case-scope Storage policies allowed assigned operators
-- to read every private object without an individual client document-sharing
-- decision. Until an approved per-object staff consent flow exists, only the
-- authenticated CASE OWNER may list/download a private object.
-- RLS is not sufficient to revoke previously minted signed URLs. Do not issue
-- signed URLs in the sensitive-document flow before separate TTL/incident QA.
begin;
do $guard$
begin
 if to_regclass('storage.objects') is null
    or to_regclass('storage.buckets') is null
    or to_regclass('public.avofis_cases') is null
    or to_regclass('public.avofis_agreements') is null then
   raise exception 'B04 missing Storage or case schema: staging migration refused';
 end if;
 if not (select relrowsecurity from pg_class
      where oid='storage.objects'::regclass) then
   raise exception 'B04 storage.objects RLS disabled: staging migration refused';
 end if;
 -- A public bucket bypasses private object reads, including restrictive RLS.
 if not exists(
    select 1 from storage.buckets b where b.id='avofis-private'
      and b.public=false
      and b.file_size_limit between 1 and 10485760
      and b.allowed_mime_types is not null
      and array['application/pdf','image/png','image/jpeg','image/webp']::text[]
          @> b.allowed_mime_types
      and 'application/pdf'=any(b.allowed_mime_types)
 ) then
   raise exception 'B04 private bucket public or upload bounds missing: fail closed';
 end if;
end $guard$;

-- Remove only known AVOfis legacy policies; in particular the older
-- SELECT policies cast an untrusted path component to UUID, causing a 500
-- for malformed or externally imported object names. Never rely on SQL AND
-- evaluation order to make that cast safe.
drop policy if exists "authorised users read case objects" on storage.objects;
drop policy if exists "clients upload to their accepted cases" on storage.objects;
drop policy if exists "cleared case participants upload private objects" on storage.objects;
drop policy if exists "avofis private document capability" on storage.objects;
drop policy if exists "staff mfa2 or case owner private file objects" on storage.objects;

-- The explicitly permitted SELECT and INSERT actions remain bucket-scoped,
-- with string-only case/path comparisons. No staff SELECT or INSERT grant.
drop policy if exists "avofis b04 private owner read permit" on storage.objects;
create policy "avofis b04 private owner read permit" on storage.objects
 for select to authenticated using(
   bucket_id='avofis-private' and auth.uid() is not null
   and exists(select 1 from public.avofis_cases c
     where c.id::text=split_part(name,'/',1)
       and c.client_user_id=(select auth.uid()))
);
drop policy if exists "avofis b04 private owner upload permit" on storage.objects;
create policy "avofis b04 private owner upload permit" on storage.objects
 for insert to authenticated with check(
   bucket_id='avofis-private' and auth.uid() is not null
   and split_part(name,'/',2)=(select auth.uid())::text
   and exists(select 1 from public.avofis_cases c
      join public.avofis_agreements a
       on a.case_id=c.id and a.signed_at is not null
     where c.id::text=split_part(name,'/',1)
      and c.client_user_id=(select auth.uid()) and c.status='open')
);

-- Other buckets are unchanged; AND these RESTRICTIVE policies with any
-- existing permissible policy so even a new USING(true) does not open
-- the AVOfis private bucket.
-- The strict canonical 3-component path is:
--   <case-uuid>/<uploader-uuid>/<random-uuid>.(pdf|png|jpg|jpeg|webp)
-- Comparison uses plain strings, NOT ::uuid casts of untrusted object names,
-- so malformed paths never cause query-time invalid-UUID errors.
drop policy if exists "avofis b04 private owner read boundary" on storage.objects;
create policy "avofis b04 private owner read boundary" on storage.objects
 as restrictive for select to public
 using(
   bucket_id<>'avofis-private' or
   (auth.uid() is not null
    and name ~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(pdf|png|jpg|jpeg|webp)$'
    and exists(select 1 from public.avofis_cases c
      where c.id::text=split_part(name,'/',1)
        and c.client_user_id=(select auth.uid())))
 );

drop policy if exists "avofis b04 private owner upload boundary" on storage.objects;
create policy "avofis b04 private owner upload boundary" on storage.objects
 as restrictive for insert to public
 with check(
   bucket_id<>'avofis-private' or
   (auth.uid() is not null
    and name ~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(pdf|png|jpg|jpeg|webp)$'
    and split_part(name,'/',2)=(select auth.uid())::text
    and exists(select 1 from public.avofis_cases c
      join public.avofis_agreements a on a.case_id=c.id
        and a.signed_at is not null
      where c.id::text=split_part(name,'/',1)
        and c.client_user_id=(select auth.uid())
        and c.status='open'))
 );

-- Upsert, rename, replacement and deletion must not bypass review/retention.
-- Even a future permissive UPDATE/DELETE policy cannot unlock this bucket.
drop policy if exists "avofis b04 immutable private object update" on storage.objects;
create policy "avofis b04 immutable private object update" on storage.objects
 as restrictive for update to public
 using(bucket_id<>'avofis-private')
 with check(bucket_id<>'avofis-private');

drop policy if exists "avofis b04 immutable private object delete" on storage.objects;
create policy "avofis b04 immutable private object delete" on storage.objects
 as restrictive for delete to public
 using(bucket_id<>'avofis-private');

commit;
