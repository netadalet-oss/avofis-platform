-- NOT EXECUTED. L1 fail-closed draft for NEW disposable 'larenlex_test_*' database ONLY.
-- No production/shared clusters. Never run with real customer data or production credentials.
-- Requires separate independent instance approval and PSQL preflight; not server-side JWT auth.
-- Safe default: NO application principal can read or write; five tables FORCE ROW LEVEL SECURITY.
BEGIN;
DO $guard$
BEGIN
  IF current_database() !~ '^larenlex_test_[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Refusing non-disposable database name';
  END IF;
END
$guard$;
CREATE SCHEMA IF NOT EXISTS larenlex_sandbox;
CREATE TABLE larenlex_sandbox.principals (
  tenant_id uuid NOT NULL, id uuid NOT NULL, kind text NOT NULL CHECK(kind IN ('customer','staff')),
  enabled boolean NOT NULL DEFAULT TRUE, session_generation bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, id)
);
CREATE TABLE larenlex_sandbox.matters (
  tenant_id uuid NOT NULL, id uuid NOT NULL, owner_id uuid NOT NULL,
  state text NOT NULL DEFAULT 'open' CHECK(state IN ('open','closed')),
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,owner_id) REFERENCES larenlex_sandbox.principals(tenant_id,id)
);
CREATE TABLE larenlex_sandbox.drafts (
  tenant_id uuid NOT NULL, id uuid NOT NULL, matter_id uuid NOT NULL,
  owner_id uuid NOT NULL, module_id text NOT NULL CHECK(module_id ~ '^LX-[0-9]{2}$'),
  feature_id text NOT NULL, revision bigint NOT NULL DEFAULT 1 CHECK(revision > 0),
  state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','review','archived')),
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,matter_id) REFERENCES larenlex_sandbox.matters(tenant_id,id),
  FOREIGN KEY (tenant_id,owner_id) REFERENCES larenlex_sandbox.principals(tenant_id,id)
);
CREATE TABLE larenlex_sandbox.staff_assignments (
  tenant_id uuid NOT NULL, id uuid NOT NULL, matter_id uuid NOT NULL, staff_id uuid NOT NULL,
  module_id text NOT NULL, revoked_at timestamptz,
  PRIMARY KEY (tenant_id,id), UNIQUE (tenant_id,matter_id,staff_id,module_id),
  FOREIGN KEY (tenant_id,matter_id) REFERENCES larenlex_sandbox.matters(tenant_id,id),
  FOREIGN KEY (tenant_id,staff_id) REFERENCES larenlex_sandbox.principals(tenant_id,id)
);
CREATE TABLE larenlex_sandbox.staff_permissions (
  tenant_id uuid NOT NULL, id uuid NOT NULL, staff_id uuid NOT NULL,
  permission_code text NOT NULL, active boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (tenant_id,id),
  FOREIGN KEY (tenant_id,staff_id) REFERENCES larenlex_sandbox.principals(tenant_id,id)
);
ALTER TABLE larenlex_sandbox.principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.principals FORCE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.matters FORCE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.drafts FORCE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.staff_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE larenlex_sandbox.staff_permissions FORCE ROW LEVEL SECURITY;
CREATE POLICY deny_principals ON larenlex_sandbox.principals USING (false) WITH CHECK (false);
CREATE POLICY deny_matters ON larenlex_sandbox.matters USING (false) WITH CHECK (false);
CREATE POLICY deny_drafts ON larenlex_sandbox.drafts USING (false) WITH CHECK (false);
CREATE POLICY deny_staff_assignments ON larenlex_sandbox.staff_assignments USING (false) WITH CHECK (false);
CREATE POLICY deny_staff_permissions ON larenlex_sandbox.staff_permissions USING (false) WITH CHECK (false);
-- No GRANT and no SECURITY DEFINER. Current code does not offer a trusted issuer binding.
-- Owner and BYPASSRLS role validation must occur in future disposable-PG integration tests.
COMMIT;
