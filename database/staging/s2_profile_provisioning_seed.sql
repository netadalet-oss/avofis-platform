-- Simulates a trusted backend event AFTER Auth identity has been verified.
-- No trigger, no request by a browser, no client-editable role inheritance.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_profile_test' THEN
  RAISE EXCEPTION 'S2 profile simulation requires avofis_s2_profile_test';
 END IF;
END $$;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members m
   JOIN pg_catalog.pg_roles a ON a.oid=m.roleid
   JOIN pg_catalog.pg_roles b ON b.oid=m.member
   WHERE a.rolname='avofis_s2_profile_provisioner' AND
     b.rolname IN ('anon','authenticated')) THEN
  RAISE EXCEPTION 'Client role unexpectedly inherits trusted provisioning role';
 END IF;
END $$;
SET LOCAL ROLE avofis_s2_profile_provisioner;
-- Only known synthetic IDs: provision minimum viable profile, never requested_role.
INSERT INTO public.profiles(id)
 SELECT id FROM auth.users
 WHERE id IN ('00000000-0000-0000-0000-0000000000a1',
              '00000000-0000-0000-0000-0000000000b1');
COMMIT;
