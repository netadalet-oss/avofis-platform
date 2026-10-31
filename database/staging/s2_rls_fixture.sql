-- Disposable PostgreSQL 17 fixture; all identities and records are synthetic.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
 IF current_database() <> 'avofis_s2_test' THEN
 RAISE EXCEPTION 'Fixture requires avofis_s2_test'; END IF;
END $$;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.role',true),'')
$$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
CREATE TABLE public.profiles (id uuid PRIMARY KEY);
CREATE TABLE public.offices (id uuid PRIMARY KEY,name text,city text,description text,website text,created_at timestamptz);
CREATE TABLE public.jobs (id uuid PRIMARY KEY,office_id uuid REFERENCES public.offices(id),title text,description text,created_at timestamptz);
CREATE TABLE public.topics (id uuid PRIMARY KEY,title text,created_by uuid REFERENCES public.profiles(id),created_at timestamptz);
CREATE TABLE public.posts (id uuid PRIMARY KEY,topic_id uuid REFERENCES public.topics(id),author_id uuid REFERENCES public.profiles(id),content text,created_at timestamptz);
CREATE TABLE public.office_members (id uuid PRIMARY KEY,office_id uuid REFERENCES public.offices(id),user_id uuid REFERENCES public.profiles(id),position text,created_at timestamptz);
CREATE TABLE public.applications (id uuid PRIMARY KEY,job_id uuid REFERENCES public.jobs(id),user_id uuid REFERENCES public.profiles(id),cv_url text,created_at timestamptz);
CREATE TABLE public.media_assets (id uuid PRIMARY KEY,url text,name text,type text,created_at timestamptz);
CREATE TABLE public.pages (id uuid PRIMARY KEY,slug text,content jsonb);
CREATE TABLE public.site_settings (id uuid PRIMARY KEY,key text,value jsonb);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin read" ON public.pages FOR SELECT TO PUBLIC USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can read pages" ON public.pages FOR SELECT TO PUBLIC USING (false);
CREATE POLICY "Only admins can update pages" ON public.pages FOR UPDATE TO PUBLIC USING (false);
CREATE POLICY "Allow admin read settings" ON public.site_settings FOR SELECT TO PUBLIC USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can read settings" ON public.site_settings FOR SELECT TO PUBLIC USING (false);
CREATE POLICY "Only admins can update settings" ON public.site_settings FOR UPDATE TO PUBLIC USING (false);
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.applications, public.jobs, public.media_assets,
 public.office_members, public.offices, public.posts, public.topics,
 public.pages, public.site_settings TO anon,authenticated;
INSERT INTO public.profiles(id) VALUES
 ('00000000-0000-0000-0000-0000000000a1'),('00000000-0000-0000-0000-0000000000b1');
INSERT INTO public.offices(id,name) VALUES ('10000000-0000-0000-0000-000000000001','Synthetic office');
INSERT INTO public.jobs(id,office_id,title) VALUES
 ('10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Synthetic job');
INSERT INTO public.topics(id,title,created_by) VALUES
 ('20000000-0000-0000-0000-000000000001','A topic','00000000-0000-0000-0000-0000000000a1'),
 ('20000000-0000-0000-0000-000000000002','B topic','00000000-0000-0000-0000-0000000000b1'),
 ('20000000-0000-0000-0000-000000000003','Unassigned',NULL);
INSERT INTO public.posts(id,topic_id,author_id,content) VALUES
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1','Synthetic A'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000b1','Synthetic B'),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001',NULL,'Unassigned');
INSERT INTO public.office_members(id,office_id,user_id,position) VALUES
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000a1','none'),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','none'),
 ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',NULL,'none');
INSERT INTO public.applications(id,job_id,user_id,cv_url) VALUES
 ('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000a1','private/A'),
 ('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000b1','private/B'),
 ('50000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',NULL,'private/unassigned');
INSERT INTO public.media_assets(id,url,name) VALUES ('60000000-0000-0000-0000-000000000001','private/staging','Synthetic');
INSERT INTO public.pages(id,slug,content) VALUES ('70000000-0000-0000-0000-000000000001','home','{"draft":true}');
INSERT INTO public.site_settings(id,key,value) VALUES ('80000000-0000-0000-0000-000000000001','private','{"draft":true}');
COMMIT;
