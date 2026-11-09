-- LarenLex W1: persistent workflow contract. Design migration only; NOT applied.
-- Runtime role is NOT migration owner and receives NO privileges or RLS policies in W1.
-- Never enable PSP or external agency activity through these workflow tables.

CREATE TABLE IF NOT EXISTS case_review (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  reviewer_id uuid NOT NULL REFERENCES app_user(id),
  scope_verified boolean NOT NULL DEFAULT false,
  conflicts_checked boolean NOT NULL DEFAULT false,
  professional_authority_checked boolean NOT NULL DEFAULT false,
  decision text NOT NULL CHECK (decision IN ('PENDING','APPROVED','REJECTED_FREE')),
  review_basis text NOT NULL DEFAULT '',
  decided_at timestamptz,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_review_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id),
  CONSTRAINT ck_review_approval CHECK (decision <> 'APPROVED' OR
    (scope_verified AND conflicts_checked AND professional_authority_checked AND length(trim(review_basis)) > 0 AND decided_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_case_review_case ON case_review (tenant_id,case_id);

CREATE TABLE IF NOT EXISTS case_offer (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  prepared_by uuid NOT NULL REFERENCES app_user(id),
  scope_text text NOT NULL CHECK(length(trim(scope_text))>0),
  amount_cents bigint NOT NULL CHECK(amount_cents>0 AND amount_cents<=10000000000),
  currency char(3) NOT NULL DEFAULT 'EUR' CHECK(currency IN ('EUR','TRY')),
  stage text NOT NULL DEFAULT 'DRAFT' CHECK(stage IN ('DRAFT','SENT','ACCEPTED','WITHDRAWN')),
  client_accepted_by uuid REFERENCES app_user(id),
  client_accepted_at timestamptz,
  terms_acknowledged_at timestamptz,
  revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_case_offer_owner UNIQUE(id,case_id,tenant_id),
  CONSTRAINT fk_offer_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id),
  CONSTRAINT ck_offer_acceptance CHECK ((client_accepted_at IS NULL)=(client_accepted_by IS NULL)),
  CONSTRAINT ck_offer_stage CHECK(stage <> 'ACCEPTED' OR client_accepted_by IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_case_offer_case ON case_offer(tenant_id,case_id);

CREATE TABLE IF NOT EXISTS case_milestone (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  offer_id uuid NOT NULL,
  title text NOT NULL CHECK(length(trim(title))>0),
  sequence_number int NOT NULL CHECK(sequence_number>0),
  due_at timestamptz,
  stage text NOT NULL DEFAULT 'PLANNED' CHECK(stage IN ('PLANNED','ACTIVE','SUBMITTED','ACCEPTED','REVISION_REQUESTED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id,sequence_number),
  CONSTRAINT uq_milestone_owner UNIQUE(id,case_id,tenant_id),
  CONSTRAINT fk_milestone_offer_owner FOREIGN KEY(offer_id,case_id,tenant_id) REFERENCES case_offer(id,case_id,tenant_id),
  CONSTRAINT fk_milestone_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id)
);

CREATE TABLE IF NOT EXISTS case_delivery (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  milestone_id uuid,
  delivered_by uuid NOT NULL REFERENCES app_user(id),
  delivery_summary text NOT NULL CHECK(length(trim(delivery_summary))>0),
  stage text NOT NULL DEFAULT 'PENDING_ACCEPTANCE' CHECK(stage IN ('PENDING_ACCEPTANCE','REVISION_REQUESTED','ACCEPTED')),
  client_decided_by uuid REFERENCES app_user(id),
  client_decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_delivery_owner UNIQUE(id,case_id,tenant_id),
  CONSTRAINT fk_delivery_milestone_owner FOREIGN KEY(milestone_id,case_id,tenant_id) REFERENCES case_milestone(id,case_id,tenant_id),
  CONSTRAINT fk_delivery_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id),
  CONSTRAINT ck_delivery_decision CHECK((client_decided_at IS NULL)=(client_decided_by IS NULL)),
  CONSTRAINT ck_delivery_accepted CHECK(stage <> 'ACCEPTED' OR client_decided_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_case_delivery_case ON case_delivery (tenant_id,case_id);

CREATE TABLE IF NOT EXISTS case_invoice_draft (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  offer_id uuid NOT NULL,
  delivery_id uuid NOT NULL,
  created_by uuid NOT NULL REFERENCES app_user(id),
  amount_cents bigint NOT NULL CHECK(amount_cents>0),
  currency char(3) NOT NULL DEFAULT 'EUR' CHECK(currency IN ('EUR','TRY')),
  stage text NOT NULL DEFAULT 'DRAFT' CHECK(stage='DRAFT'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_invoice_offer_owner FOREIGN KEY(offer_id,case_id,tenant_id) REFERENCES case_offer(id,case_id,tenant_id),
  CONSTRAINT fk_invoice_delivery_owner FOREIGN KEY(delivery_id,case_id,tenant_id) REFERENCES case_delivery(id,case_id,tenant_id),
  CONSTRAINT fk_invoice_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id)
);
-- No settlement, PSP authorization, payout, or payment token table in W1.

CREATE TABLE IF NOT EXISTS case_workflow_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id uuid NOT NULL,
  case_id uuid NOT NULL,
  actor_id uuid NOT NULL REFERENCES app_user(id),
  action text NOT NULL CHECK(length(trim(action))>0),
  from_stage text,
  to_stage text NOT NULL,
  expected_revision bigint NOT NULL CHECK(expected_revision>=0),
  resulting_revision bigint NOT NULL CHECK(resulting_revision=expected_revision+1),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_event_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_case_workflow_event_case ON case_workflow_event(tenant_id,case_id,id);

CREATE TABLE IF NOT EXISTS publication_entry (
  id uuid PRIMARY KEY,
  content_type text NOT NULL CHECK(content_type IN ('ARTICLE','NEWS','FORUM_TOPIC','COMMENT')),
  title text NOT NULL CHECK(length(trim(title))>0),
  body text NOT NULL CHECK(length(trim(body))>0),
  source_url text,
  created_by uuid NOT NULL REFERENCES app_user(id),
  reviewed_by uuid REFERENCES app_user(id),
  published_by uuid REFERENCES app_user(id),
  stage text NOT NULL DEFAULT 'REVIEW_PENDING'
    CHECK(stage IN ('REVIEW_PENDING','LEGAL_APPROVED','PUBLISHED','REJECTED','WITHDRAWN')),
  parent_id uuid REFERENCES publication_entry(id),
  revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  CONSTRAINT ck_news_source CHECK(content_type <> 'NEWS' OR (source_url ~ '^https://[^[:space:]]+')),
  CONSTRAINT ck_pub_reviewer_independent CHECK(reviewed_by IS NULL OR reviewed_by <> created_by),
  CONSTRAINT ck_pub_publisher_independent CHECK(published_by IS NULL OR published_by <> created_by),
  CONSTRAINT ck_pub_review CHECK(stage NOT IN ('LEGAL_APPROVED','PUBLISHED','WITHDRAWN') OR
    (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)),
  CONSTRAINT ck_pub_publish CHECK(stage NOT IN ('PUBLISHED','WITHDRAWN') OR
    (published_by IS NOT NULL AND published_at IS NOT NULL)),
  CONSTRAINT ck_pub_comment_parent CHECK(content_type <> 'COMMENT' OR parent_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_publication_entry_stage ON publication_entry(stage,content_type,created_at);

-- The only public-facing view is metadata; do not grant SELECT until reviewed.
CREATE OR REPLACE VIEW published_editorial_catalog AS
  SELECT id,content_type,title,body,source_url,created_at,published_at,parent_id
  FROM publication_entry WHERE stage='PUBLISHED';

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['case_review','case_offer','case_milestone','case_delivery',
    'case_invoice_draft','case_workflow_event','publication_entry'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t);
  END LOOP;
END $$;
-- No RLS policies by design. Actual policies require legal IAM review + PostgreSQL E2E.
