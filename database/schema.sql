-- AvOfis PostgreSQL schema scaffold

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role_id UUID REFERENCES roles(id),
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  profile_type TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  city TEXT,
  avatar_url TEXT,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE offices (
  id UUID PRIMARY KEY,
  owner_user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT,
  description TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE office_members (
  id UUID PRIMARY KEY,
  office_id UUID REFERENCES offices(id),
  user_id UUID REFERENCES users(id),
  role_key TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE internship_posts (
  id UUID PRIMARY KEY,
  office_id UUID REFERENCES offices(id),
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_posts (
  id UUID PRIMARY KEY,
  office_id UUID REFERENCES offices(id),
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  internship_post_id UUID REFERENCES internship_posts(id),
  job_post_id UUID REFERENCES job_posts(id),
  status TEXT DEFAULT 'submitted',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE case_law_records (
  id UUID PRIMARY KEY,
  court_name TEXT,
  chamber TEXT,
  file_no TEXT,
  decision_no TEXT,
  decision_date DATE,
  subject_tags TEXT[],
  summary TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE statutes (
  id UUID PRIMARY KEY,
  type TEXT,
  name TEXT NOT NULL,
  number TEXT,
  status TEXT,
  published_at DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE statute_articles (
  id UUID PRIMARY KEY,
  statute_id UUID REFERENCES statutes(id),
  article_no TEXT,
  title TEXT,
  body TEXT,
  version_label TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workspace_id UUID,
  status TEXT DEFAULT 'queued',
  input_file_url TEXT,
  result_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE draft_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workspace_id UUID,
  type TEXT,
  title TEXT,
  content TEXT,
  version_no INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  owner_user_id UUID REFERENCES users(id),
  office_id UUID REFERENCES offices(id),
  name TEXT NOT NULL,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_files (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  file_name TEXT,
  file_url TEXT,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_tasks (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  assigned_user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMP,
  status TEXT DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_notes (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE forum_topics (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES forum_categories(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES forum_topics(id),
  user_id UUID REFERENCES users(id),
  body TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_votes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id),
  user_id UUID REFERENCES users(id),
  vote_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_reports (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id),
  user_id UUID REFERENCES users(id),
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_threads (
  id UUID PRIMARY KEY,
  subject TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_participants (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES message_threads(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES message_threads(id),
  sender_user_id UUID REFERENCES users(id),
  body TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT,
  title TEXT,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE connect_wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  balance INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE connect_transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES connect_wallets(id),
  transaction_type TEXT,
  amount INT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  office_id UUID REFERENCES offices(id),
  plan_key TEXT,
  status TEXT,
  renews_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  provider TEXT,
  provider_ref TEXT,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'TRY',
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_name TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  entity_type TEXT,
  entity_id UUID,
  action TEXT,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_page_versions (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES cms_pages(id),
  version_no INT NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_blocks (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES cms_pages(id),
  block_key TEXT NOT NULL,
  block_type TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_menus (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_menu_items (
  id UUID PRIMARY KEY,
  menu_id UUID REFERENCES cms_menus(id),
  parent_id UUID REFERENCES cms_menu_items(id),
  label TEXT NOT NULL,
  href TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY,
  uploaded_by UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  alt_text TEXT,
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cms_settings (
  id UUID PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);
