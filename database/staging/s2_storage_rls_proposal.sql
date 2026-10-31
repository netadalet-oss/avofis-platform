-- DRAFT / ISOLATED POSTGRES ONLY. Not a production Supabase migration.
-- This proposes owner+folder+private-bucket read policies for synthetic cases.
-- Policy is NOT validated with real Supabase Storage/Auth/JWT/signed URLs.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_storage_test' THEN
  RAISE EXCEPTION 'Storage RLS proposal requires avofis_s2_storage_test';
 END IF;
END $$;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON storage.objects,storage.buckets FROM PUBLIC,anon,authenticated;
GRANT SELECT ON storage.objects TO authenticated;
CREATE POLICY s2_private_owner_read ON storage.objects FOR SELECT TO authenticated
 USING (
  (SELECT auth.uid()) IS NOT NULL
  AND bucket_id='avofis-s2-private-only'
  AND owner_id=(SELECT auth.uid())::text
  AND split_part(name,'/',1)=(SELECT auth.uid())::text
 );
-- No INSERT/UPDATE/DELETE, bucket listing, public retrieval, or signed-URL creation grants.
COMMIT;
