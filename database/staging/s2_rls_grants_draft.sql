-- DRAFT FOR DISPOSABLE TEST DB ONLY. NEVER APPLY TO LIVE SUPABASE.
-- Profile ID = auth.uid() is a synthetic assumption, not a production fact.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_test' THEN
 RAISE EXCEPTION 'Staging RLS proposal requires avofis_s2_test'; END IF;
END $$;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.applications, public.jobs, public.media_assets,
 public.office_members, public.offices, public.posts, public.topics,
 public.pages, public.site_settings FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Allow admin read" ON public.pages;
DROP POLICY IF EXISTS "Only admins can read pages" ON public.pages;
DROP POLICY IF EXISTS "Only admins can update pages" ON public.pages;
DROP POLICY IF EXISTS "Allow admin read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.site_settings;
-- No public read/write; no direct owner for offices/jobs/media; CMS publication held.
-- No INSERT/UPDATE/DELETE grants until actual owner, assignment, purpose verified.
GRANT SELECT ON public.applications, public.office_members, public.posts, public.topics TO authenticated;
CREATE POLICY s2_applications_owner_read ON public.applications FOR SELECT TO authenticated
 USING ((SELECT auth.uid()) IS NOT NULL AND user_id=(SELECT auth.uid()));
CREATE POLICY s2_members_owner_read ON public.office_members FOR SELECT TO authenticated
 USING ((SELECT auth.uid()) IS NOT NULL AND user_id=(SELECT auth.uid()));
CREATE POLICY s2_posts_owner_read ON public.posts FOR SELECT TO authenticated
 USING ((SELECT auth.uid()) IS NOT NULL AND author_id=(SELECT auth.uid()));
CREATE POLICY s2_topics_owner_read ON public.topics FOR SELECT TO authenticated
 USING ((SELECT auth.uid()) IS NOT NULL AND created_by=(SELECT auth.uid()));
COMMIT;
