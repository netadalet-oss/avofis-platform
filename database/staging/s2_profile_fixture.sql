-- AVOfis S2. ONLY isolated disposable PostgreSQL 17 database.
-- No live Auth or client data. Profile column names match read-only catalog.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_profile_test' THEN
   RAISE EXCEPTION 'S2 profile fixture is confined to avofis_s2_profile_test';
 END IF;
END $$;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE avofis_s2_profile_provisioner NOLOGIN;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO anon,authenticated,avofis_s2_profile_provisioner;
CREATE TABLE auth.users (
 id uuid PRIMARY KEY,
 raw_user_meta_data jsonb
);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated;
-- Source-backed public.profiles shape. This is not a live schema migration.
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text,
 avatar_url text,
 role text DEFAULT 'user',
 created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon,authenticated,avofis_s2_profile_provisioner;
-- Model existing excessive catalog GRANTs before a staging-only hardening proposal.
GRANT SELECT,INSERT,UPDATE,DELETE ON public.profiles TO anon,authenticated;

INSERT INTO auth.users(id,raw_user_meta_data) VALUES
 ('00000000-0000-0000-0000-0000000000a1',
  '{"full_name":"Synthetic A","requested_role":"lawyer","role":"super_admin"}'),
 ('00000000-0000-0000-0000-0000000000b1',
  '{"full_name":"Synthetic B","requested_role":"office","role":"admin"}'),
 ('00000000-0000-0000-0000-0000000000c1',
  '{"full_name":"Unprovisioned C","role":"super_admin"}');
COMMIT;
