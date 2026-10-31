-- Disposable PostgreSQL 17 fixture. Never run in production.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_storage_test' THEN
  RAISE EXCEPTION 'Storage synthetic fixture requires avofis_s2_storage_test';
 END IF;
END $$;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
GRANT USAGE ON SCHEMA auth TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA storage TO anon,authenticated;
CREATE TABLE storage.buckets (id text PRIMARY KEY, public boolean NOT NULL DEFAULT false);
CREATE TABLE storage.objects (
 id uuid PRIMARY KEY,
 bucket_id text NOT NULL REFERENCES storage.buckets(id),
 name text NOT NULL,
 owner_id text,
 metadata jsonb
);
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Mirror the live catalog observation: GRANTs exist but no Storage RLS policies.
GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO anon,authenticated;
GRANT SELECT ON storage.buckets TO anon,authenticated;
INSERT INTO storage.buckets (id,public) VALUES
 ('avofis-s2-private-only',false),('avofis-s2-other-private',false);
INSERT INTO storage.objects (id,bucket_id,name,owner_id,metadata) VALUES
 ('10000000-0000-0000-0000-000000000001','avofis-s2-private-only','00000000-0000-0000-0000-0000000000a1/case-A.pdf','00000000-0000-0000-0000-0000000000a1','{}'),
 ('10000000-0000-0000-0000-000000000002','avofis-s2-private-only','00000000-0000-0000-0000-0000000000b1/case-B.pdf','00000000-0000-0000-0000-0000000000b1','{}'),
 ('10000000-0000-0000-0000-000000000003','avofis-s2-private-only','unassigned/case.pdf',NULL,'{}'),
 ('10000000-0000-0000-0000-000000000004','avofis-s2-other-private','00000000-0000-0000-0000-0000000000a1/other.pdf','00000000-0000-0000-0000-0000000000a1','{}'),
 ('10000000-0000-0000-0000-000000000005','avofis-s2-private-only','00000000-0000-0000-0000-0000000000b1/spoof.pdf','00000000-0000-0000-0000-0000000000a1','{}');
COMMIT;
