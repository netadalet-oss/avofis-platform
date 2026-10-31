-- Synthetic PostgreSQL RLS/GRANT integration tests; NOT Supabase Storage HTTP.
\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_storage_test' THEN
  RAISE EXCEPTION 'Synthetic Storage tests require avofis_s2_storage_test';
 END IF;
 IF EXISTS(SELECT 1 FROM storage.buckets WHERE public=true) THEN
  RAISE EXCEPTION 'Synthetic fixture contains a public bucket';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n
    ON n.oid=c.relnamespace WHERE n.nspname='storage' AND c.relname='objects' AND c.relrowsecurity)
 THEN RAISE EXCEPTION 'Object RLS not enabled'; END IF;
 IF has_table_privilege('anon','storage.objects','SELECT') OR
    has_table_privilege('anon','storage.objects','INSERT') OR
    has_table_privilege('authenticated','storage.objects','INSERT') OR
    has_table_privilege('authenticated','storage.objects','UPDATE') OR
    has_table_privilege('authenticated','storage.objects','DELETE') OR
    has_table_privilege('authenticated','storage.buckets','SELECT') THEN
  RAISE EXCEPTION 'Storage table privileges too broad';
 END IF;
END $$;
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 BEGIN
  PERFORM count(*) FROM storage.objects;
  RAISE EXCEPTION 'Anonymous Storage object access unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  PERFORM count(*) FROM storage.buckets;
  RAISE EXCEPTION 'Anonymous Storage bucket list unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects)<>1 THEN
  RAISE EXCEPTION 'A must only see its own valid private object';
 END IF;
 IF (SELECT count(*) FROM storage.objects WHERE owner_id='00000000-0000-0000-0000-0000000000b1')<>0 THEN
  RAISE EXCEPTION 'A was able to read B object';
 END IF;
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='avofis-s2-other-private')<>0 THEN
  RAISE EXCEPTION 'A was able to read a different bucket';
 END IF;
END $$;
SELECT set_config('request.jwt.claim.user_metadata','{"role":"super_admin"}',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects)<>1 THEN
  RAISE EXCEPTION 'User-editable metadata unexpectedly changed Storage visibility';
 END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects)<>1 THEN
  RAISE EXCEPTION 'B must only see its own valid private object';
 END IF;
 IF (SELECT count(*) FROM storage.objects WHERE owner_id='00000000-0000-0000-0000-0000000000a1')<>0 THEN
  RAISE EXCEPTION 'B was able to read A object';
 END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects)<>0 THEN
  RAISE EXCEPTION 'Missing JWT subject unexpectedly read Storage objects';
 END IF;
 BEGIN
  INSERT INTO storage.objects(id,bucket_id,name,owner_id) VALUES
   ('90000000-0000-0000-0000-000000000001','avofis-s2-private-only','upload','00000000-0000-0000-0000-0000000000a1');
  RAISE EXCEPTION 'Unapproved object upload succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  UPDATE storage.objects SET owner_id='00000000-0000-0000-0000-0000000000b1';
  RAISE EXCEPTION 'Unapproved object ownership change succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  DELETE FROM storage.objects;
  RAISE EXCEPTION 'Unapproved object delete succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  PERFORM count(*) FROM storage.buckets;
  RAISE EXCEPTION 'Unapproved bucket listing succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
SELECT 'S2_SYNTHETIC_STORAGE_AB_GRANT_RLS_PASS' AS result;
