-- S16 read-only acceptance; no test users are created.
select
 (select count(*) from pg_tables where schemaname='public' and tablename like 'll_%')=12 as tables_are_12,
 (select count(*) from pg_tables where schemaname='public' and tablename like 'll_%' and rowsecurity)=12 as all_rls_enabled,
 (select count(*) from public.ll_services)=554 as source_services_554,
 (select count(distinct group_id) from public.ll_services)=17 as public_groups_17,
 (select count(distinct legacy_category) from public.ll_services)=18 as legacy_categories_preserved,
 (select count(*) from public.ll_services where publication_status='internal' and legally_approved=false and source_sha256 ~ '^[0-9a-f]{64}$')=554 as sources_unpublished_sha,
 (select count(*) from public.ll_jobs)=0 as no_fabricated_jobs,
 (select count(*) from public.ll_cases)=0 as no_fabricated_cases,
 (select count(*) from public.ll_operator_roles)=0 as no_fake_admins,
 (select count(*) from auth.users)=0 as auth_migration_not_claimed,
 (select count(*) from larenlex_private.legacy_import)=4 as legacy_content_archived,
 (select count(*) from larenlex_private.legacy_user_transfer where transfer_state='pending_reenrollment')=2 as legacy_identities_pending,
 (not has_schema_privilege('anon','larenlex_private','USAGE')) as anon_no_private_schema,
 (not has_schema_privilege('authenticated','larenlex_private','USAGE')) as auth_no_private_schema,
 (select count(*) from storage.buckets where id='larenlex-case-documents' and public=false and file_size_limit=26214400)=1 as private_bucket_closed,
 (select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'larenlex%')=0 as no_unreviewed_upload_policy;
