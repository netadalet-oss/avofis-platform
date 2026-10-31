-- L1 disposable SQLite synthetic model (not encrypted, not real Auth or PostgreSQL RLS).
PRAGMA foreign_keys=ON;
CREATE TABLE tenants(id TEXT PRIMARY KEY);
CREATE TABLE principals(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL REFERENCES tenants(id),
 kind TEXT NOT NULL CHECK(kind IN ('customer','staff')),active INTEGER NOT NULL DEFAULT 1,
 generation INTEGER NOT NULL DEFAULT 1,UNIQUE(tenant_id,id));
CREATE TABLE matters(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL REFERENCES tenants(id),
 owner_id TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'open',
 FOREIGN KEY(tenant_id,owner_id) REFERENCES principals(tenant_id,id),UNIQUE(tenant_id,id));
CREATE TABLE staff_assignments(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL,
 matter_id TEXT NOT NULL,principal_id TEXT NOT NULL,module_id TEXT NOT NULL,
 active INTEGER NOT NULL CHECK(active IN (0,1)),
 FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id),
 FOREIGN KEY(tenant_id,principal_id) REFERENCES principals(tenant_id,id));
CREATE TABLE module_records(id TEXT PRIMARY KEY,tenant_id TEXT NOT NULL,
 matter_id TEXT NOT NULL,owner_id TEXT NOT NULL,module_id TEXT NOT NULL,
 feature_id TEXT NOT NULL,label TEXT NOT NULL CHECK(length(label) BETWEEN 1 AND 150),
 version INTEGER NOT NULL DEFAULT 1,state TEXT NOT NULL DEFAULT 'draft',
 deleted INTEGER NOT NULL DEFAULT 0,
 FOREIGN KEY(tenant_id,matter_id) REFERENCES matters(tenant_id,id),
 FOREIGN KEY(tenant_id,owner_id) REFERENCES principals(tenant_id,id));
CREATE TABLE synthetic_sessions(token_hash TEXT PRIMARY KEY,principal_id TEXT NOT NULL
 REFERENCES principals(id),generation INTEGER NOT NULL,mfa INTEGER NOT NULL,revoked INTEGER NOT NULL DEFAULT 0);
CREATE TABLE audit_events(id INTEGER PRIMARY KEY,tenant_id TEXT NOT NULL,actor_id TEXT NOT NULL,
 matter_id TEXT NOT NULL,kind TEXT NOT NULL,previous_hash TEXT NOT NULL,event_hash TEXT NOT NULL);
-- WARNING: Access controls require application-layer enforcement; SQLite has NO RLS.
