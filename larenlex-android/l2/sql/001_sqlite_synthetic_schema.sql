-- Disposable, synthetic, non-encrypted SQLite reference only; NOT production RLS.
PRAGMA foreign_keys=ON;
CREATE TABLE tenants (
    id TEXT PRIMARY KEY, label TEXT NOT NULL CHECK(length(label)>0)
);
CREATE TABLE principals (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
    kind TEXT NOT NULL CHECK(kind IN ('customer','staff')),
    active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
    generation INTEGER NOT NULL DEFAULT 1 CHECK(generation>0),
    UNIQUE(tenant_id,id)
);
CREATE TABLE matters (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
    owner_id TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'open' CHECK(state IN ('open','closed')),
    UNIQUE(tenant_id,id),
    FOREIGN KEY(tenant_id,owner_id) REFERENCES principals(tenant_id,id)
);
CREATE TABLE staff_assignments (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, matter_id TEXT NOT NULL, principal_id TEXT NOT NULL,
    module_id TEXT NOT NULL, active INTEGER NOT NULL CHECK(active IN (0,1)),
    FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id),
    FOREIGN KEY(tenant_id,principal_id) REFERENCES principals(tenant_id,id),
    UNIQUE(tenant_id,matter_id,principal_id,module_id)
);
CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY, principal_id TEXT NOT NULL REFERENCES principals(id),
    generation INTEGER NOT NULL, mfa_verified INTEGER NOT NULL CHECK(mfa_verified IN (0,1)),
    revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1))
);
CREATE TABLE module_records (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, matter_id TEXT NOT NULL,
    owner_id TEXT NOT NULL, module_id TEXT NOT NULL, feature_id TEXT NOT NULL,
    label TEXT NOT NULL CHECK(length(label) BETWEEN 1 AND 150),
    state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','review','archived')),
    version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
    deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN (0,1)),
    FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id),
    FOREIGN KEY(tenant_id,owner_id) REFERENCES principals(tenant_id,id)
);
CREATE INDEX idx_records_matter ON module_records(tenant_id,matter_id,module_id,deleted);
CREATE TABLE audit_events (
    seq INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id TEXT NOT NULL, principal_id TEXT NOT NULL,
    matter_id TEXT NOT NULL, operation TEXT NOT NULL, subject_id TEXT NOT NULL,
    previous_hash TEXT NOT NULL, event_hash TEXT NOT NULL,
    FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id)
);
CREATE TABLE document_refs (
    id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, matter_id TEXT NOT NULL,
    record_id TEXT NOT NULL REFERENCES module_records(id), storage_key TEXT NOT NULL UNIQUE,
    mime TEXT NOT NULL, created_generation INTEGER NOT NULL,
    FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id)
);
