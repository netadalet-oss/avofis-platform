-- Real PostgreSQL17 RLS/GRANT SQL test. Synthetic Auth claims, NOT verified Supabase JWT.
\set ON_ERROR_STOP on
DO $$
DECLARE t text;
BEGIN
 IF current_database() <> 'avofis_s2_test' THEN
 RAISE EXCEPTION 'RLS A/B tests require disposable test database'; END IF;
 FOR t IN SELECT unnest(ARRAY['applications','jobs','media_assets','office_members','offices','posts','topics','pages','site_settings']) LOOP
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN RAISE EXCEPTION 'RLS disabled: %', t; END IF;
  IF has_table_privilege('anon', 'public.'||t, 'SELECT') OR
     has_table_privilege('anon', 'public.'||t, 'INSERT') OR
     has_table_privilege('anon', 'public.'||t, 'UPDATE') OR
     has_table_privilege('anon', 'public.'||t, 'DELETE') OR
     has_table_privilege('authenticated', 'public.'||t, 'INSERT') OR
     has_table_privilege('authenticated', 'public.'||t, 'UPDATE') OR
     has_table_privilege('authenticated', 'public.'||t, 'DELETE') THEN
   RAISE EXCEPTION 'Excessive GRANT on %', t;
  END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM pg_catalog.pg_policies
   WHERE schemaname='public' AND tablename IN ('pages','site_settings')) THEN
  RAISE EXCEPTION 'Unapproved CMS policy survived';
 END IF;
END $$;

SET ROLE anon;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 BEGIN PERFORM count(*) FROM public.applications;
 RAISE EXCEPTION 'Anonymous applications SELECT succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.pages;
 RAISE EXCEPTION 'Anonymous CMS SELECT succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.role','authenticated',false);
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.applications)<>1 OR
    (SELECT count(*) FROM public.office_members)<>1 OR
    (SELECT count(*) FROM public.posts)<>1 OR
    (SELECT count(*) FROM public.topics)<>1 THEN
    RAISE EXCEPTION 'Synthetic A own-row read failed'; END IF;
 IF (SELECT count(*) FROM public.applications WHERE user_id='00000000-0000-0000-0000-0000000000b1')<>0 THEN
    RAISE EXCEPTION 'Synthetic A read B'; END IF;
END $$;
SELECT set_config('request.jwt.claim.user_metadata','{"role":"super_admin"}',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.applications)<>1 THEN
 RAISE EXCEPTION 'Mutable user metadata bypass'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.applications)<>1 OR
    (SELECT count(*) FROM public.office_members)<>1 OR
    (SELECT count(*) FROM public.posts)<>1 OR
    (SELECT count(*) FROM public.topics)<>1 THEN
    RAISE EXCEPTION 'Synthetic B own-row read failed'; END IF;
 IF (SELECT count(*) FROM public.posts WHERE author_id='00000000-0000-0000-0000-0000000000a1')<>0 THEN
    RAISE EXCEPTION 'Synthetic B read A'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.applications)<>0 OR
    (SELECT count(*) FROM public.office_members)<>0 OR
    (SELECT count(*) FROM public.posts)<>0 OR
    (SELECT count(*) FROM public.topics)<>0 THEN
    RAISE EXCEPTION 'Missing session read data'; END IF;
END $$;
DO $$ BEGIN
 BEGIN INSERT INTO public.applications(id,user_id) VALUES
  ('90000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1');
  RAISE EXCEPTION 'Unauthorized INSERT succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.applications SET user_id='00000000-0000-0000-0000-0000000000b1';
  RAISE EXCEPTION 'Unauthorized UPDATE succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN DELETE FROM public.applications;
  RAISE EXCEPTION 'Unauthorized DELETE succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.offices;
  RAISE EXCEPTION 'Ownerless offices are readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.jobs;
  RAISE EXCEPTION 'Ownerless jobs are readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.media_assets;
  RAISE EXCEPTION 'Ownerless media are readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.pages;
  RAISE EXCEPTION 'CMS pages are readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM count(*) FROM public.site_settings;
  RAISE EXCEPTION 'CMS settings are readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'S2_RLS_AB_GRANTS_PASS' AS result;
