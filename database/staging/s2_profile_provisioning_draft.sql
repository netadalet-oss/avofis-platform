-- S2 profile access proposal. STAGING-ONLY. NO production use.
-- No SECURITY DEFINER, no public auth trigger, no direct signup-time grant.
-- A trusted backend must validate Auth identity and run explicitly with a
-- non-login provisioner role. Here only a synthetic trusted role exists.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_profile_test' THEN
   RAISE EXCEPTION 'S2 profile proposal confined to avofis_s2_profile_test';
 END IF;
END $$;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Prevent direct user-controlled privilege/role provisioning.
REVOKE ALL PRIVILEGES ON public.profiles FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.profiles TO authenticated;
-- Dedicated trusted non-login DB principal; no role membership to clients.
GRANT INSERT ON public.profiles TO avofis_s2_profile_provisioner;
-- The trusted principal needs only the ID column of Auth, not user metadata.
GRANT SELECT(id) ON auth.users TO avofis_s2_profile_provisioner;
CREATE POLICY s2_profile_owner_read ON public.profiles FOR SELECT TO authenticated
 USING ((SELECT auth.uid()) IS NOT NULL AND id=(SELECT auth.uid()));
CREATE POLICY s2_profile_trusted_basic_insert ON public.profiles
 FOR INSERT TO avofis_s2_profile_provisioner
 WITH CHECK (role='user' AND id IS NOT NULL);
COMMIT;
