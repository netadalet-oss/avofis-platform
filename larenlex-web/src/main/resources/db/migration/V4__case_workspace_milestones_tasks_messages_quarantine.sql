-- LarenLex W1 private workroom migration. Draft only. Never applied in production.
-- Tenant-safe relations are composite. Runtime owner != migration owner; no RLS policies
-- are added for private operational tables until authenticated integration tests pass.

CREATE TABLE IF NOT EXISTS case_work_task (
    id uuid PRIMARY KEY,
    case_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    assigned_to uuid NOT NULL REFERENCES app_user(id),
    created_by uuid NOT NULL REFERENCES app_user(id),
    title varchar(160) NOT NULL CHECK(length(trim(title))>0),
    visibility varchar(20) NOT NULL DEFAULT 'INTERNAL' CHECK(visibility IN ('INTERNAL','CUSTOMER')),
    stage varchar(12) NOT NULL DEFAULT 'OPEN' CHECK(stage IN ('OPEN','DONE','VERIFIED')),
    due_at timestamptz,
    revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    verified_by uuid REFERENCES app_user(id),
    verified_at timestamptz,
    CONSTRAINT fk_task_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id),
    CONSTRAINT ck_task_verified CHECK(stage<>'VERIFIED' OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)),
    CONSTRAINT ck_task_done CHECK(stage='OPEN' OR completed_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_case_work_task_case ON case_work_task(tenant_id,case_id,due_at);

CREATE TABLE IF NOT EXISTS case_message (
    id uuid PRIMARY KEY,
    case_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    sender_id uuid NOT NULL REFERENCES app_user(id),
    body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 2000),
    visibility varchar(20) NOT NULL DEFAULT 'CUSTOMER' CHECK(visibility IN ('CUSTOMER','INTERNAL')),
    sent_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_message_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_case_message_case ON case_message(tenant_id,case_id,sent_at);

-- NOTE: This table records attachment METADATA only, not bytes, scan results or blob keys.
-- Never set a 'CLEAN' / 'READY' state without a separate, approved upload pipeline.
CREATE TABLE IF NOT EXISTS case_attachment_intent (
    id uuid PRIMARY KEY,
    case_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    proposed_by uuid NOT NULL REFERENCES app_user(id),
    original_filename varchar(180) NOT NULL,
    reported_media_type varchar(80) NOT NULL CHECK(reported_media_type IN
       ('application/pdf','image/jpeg','image/png','text/plain')),
    reported_size_bytes bigint NOT NULL CHECK(reported_size_bytes BETWEEN 1 AND 15728640),
    reported_sha256 char(64) NOT NULL CHECK(reported_sha256 ~ '^[0-9a-f]{64}$'),
    visibility varchar(20) NOT NULL CHECK(visibility IN ('CUSTOMER','INTERNAL')),
    state varchar(30) NOT NULL DEFAULT 'SECURITY_REVIEW_REQUIRED'
       CHECK(state='SECURITY_REVIEW_REQUIRED'),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_attachment_intent_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id),
    CONSTRAINT ck_attachment_name CHECK(original_filename NOT LIKE '%/%' AND
      position(chr(92) in original_filename)=0 AND original_filename NOT LIKE '%..%')
);
CREATE INDEX IF NOT EXISTS idx_attachment_intent_case ON case_attachment_intent(tenant_id,case_id);

-- Explicit UI action retries are deduplicated at tenant+actor+operation boundary.
CREATE TABLE IF NOT EXISTS case_command_idempotency (
    id uuid PRIMARY KEY,
    case_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    actor_id uuid NOT NULL REFERENCES app_user(id),
    idempotency_key varchar(140) NOT NULL,
    operation varchar(50) NOT NULL,
    request_sha256 char(64) NOT NULL CHECK(request_sha256 ~ '^[0-9a-f]{64}$'),
    resulting_revision bigint NOT NULL CHECK(resulting_revision>=0),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id,case_id,actor_id,idempotency_key),
    CONSTRAINT fk_idempotency_case_tenant FOREIGN KEY(case_id,tenant_id) REFERENCES client_case(id,tenant_id)
);

-- A parent article/forum thread must remain published before its comments are visible.
-- Security barrier view does not replace explicit per-user/tenant authorization.
CREATE OR REPLACE VIEW published_editorial_catalog WITH (security_barrier=true) AS
 SELECT e.id,e.content_type,e.title,e.body,e.source_url,e.created_at,e.published_at,e.parent_id
 FROM publication_entry e
 WHERE e.stage='PUBLISHED'
   AND (e.content_type<>'COMMENT' OR EXISTS(
       SELECT 1 FROM publication_entry parent
       WHERE parent.id=e.parent_id AND parent.stage='PUBLISHED'
         AND parent.content_type IN ('ARTICLE','FORUM_TOPIC')));

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['case_work_task','case_message',
    'case_attachment_intent','case_command_idempotency'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',table_name);
  END LOOP;
END $$;
-- No runtime RLS policies or data grants in this migration (fail closed).
