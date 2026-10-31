-- Real PostgreSQL 17 RLS & privileges, synthetic JWT claim only.
-- Does not validate Supabase JWT signatures or verify real professionals.
\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_profile_test' THEN
  RAISE EXCEPTION 'S2 A/B profile checks require avofis_s2_profile_test';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class
    WHERE oid='public.profiles'::regclass AND relrowsecurity) THEN
  RAISE EXCEPTION 'Profiles RLS disabled';
 END IF;
 IF (SELECT count(*) FROM public.profiles) <> 2 THEN
  RAISE EXCEPTION 'Exactly two synthetic profiles expected';
 END IF;
 IF (SELECT count(*) FROM public.profiles WHERE role <> 'user' OR role IS NULL) <> 0 THEN
  RAISE EXCEPTION 'Self-asserted professional/admin role entered trusted profiles';
 END IF;
 IF has_table_privilege('anon','public.profiles','SELECT') OR
    has_table_privilege('anon','public.profiles','INSERT') OR
    has_table_privilege('authenticated','public.profiles','INSERT') OR
    has_table_privilege('authenticated','public.profiles','UPDATE') OR
    has_table_privilege('authenticated','public.profiles','DELETE') THEN
  RAISE EXCEPTION 'Client profile privileges too broad';
 END IF;
END $$;

SET ROLE anon;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 BEGIN
  PERFORM count(*) FROM public.profiles;
  RAISE EXCEPTION 'Anonymous profile SELECT unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.profiles(id,role) VALUES
   ('00000000-0000-0000-0000-0000000000a1','lawyer');
  RAISE EXCEPTION 'Anonymous privilege escalation INSERT succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.profiles) <> 1 THEN
  RAISE EXCEPTION 'A did not see exactly its own profile';
 END IF;
 IF (SELECT count(*) FROM public.profiles WHERE id='00000000-0000-0000-0000-0000000000b1') <> 0 THEN
  RAISE EXCEPTION 'A read B profile';
 END IF;
END $$;
SELECT set_config('request.jwt.claim.user_metadata',
 '{"role":"super_admin","requested_role":"lawyer"}',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.profiles WHERE role <> 'user') <> 0 THEN
  RAISE EXCEPTION 'Mutable metadata caused role elevation';
 END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.profiles) <> 1 THEN
  RAISE EXCEPTION 'B did not see exactly its own profile';
 END IF;
 IF (SELECT count(*) FROM public.profiles WHERE id='00000000-0000-0000-0000-0000000000a1') <> 0 THEN
  RAISE EXCEPTION 'B read A profile';
 END IF;
END $$;

SELECT set_config('request.jwt.claim.sub','',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.profiles) <> 0 THEN
  RAISE EXCEPTION 'Missing identity allowed profile read';
 END IF;
 BEGIN
  INSERT INTO public.profiles(id,role) VALUES
   ('00000000-0000-0000-0000-0000000000a1','admin');
  RAISE EXCEPTION 'Authenticated user created an admin profile';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.profiles SET role='admin';
  RAISE EXCEPTION 'Authenticated user updated its role';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  DELETE FROM public.profiles;
  RAISE EXCEPTION 'Authenticated user deleted profiles';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

-- Privileged provisioner itself must never accept a non-basic role.
BEGIN;
SET LOCAL ROLE avofis_s2_profile_provisioner;
DO $$ BEGIN
 BEGIN
  INSERT INTO public.profiles(id,role)
    VALUES('00000000-0000-0000-0000-0000000000c1','super_admin');
  RAISE EXCEPTION 'Privileged provisioning permitted super_admin';
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL; END;
END $$;
ROLLBACK;
DO $ BEGIN
 IF EXISTS (SELECT 1 FROM public.profiles WHERE id='00000000-0000-0000-0000-0000000000c1') THEN
  RAISE EXCEPTION 'Unauthorized elevated profile C was persisted';
 END IF;
END $;
SELECT 'S2_PROFILE_PROVISIONING_A_B_PASS' AS result;
