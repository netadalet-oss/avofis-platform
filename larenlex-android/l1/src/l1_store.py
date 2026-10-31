"""Offline synthetic model with server-side SQLite authorization; NOT PG RLS or live Auth.

No personal data, real documents, external adapters, payment, signed production URLs,
or publication is performed. Token identity is minted only by this synthetic fixture.
"""
import hashlib
import hmac
import json
import re
import secrets
import sqlite3
from pathlib import Path


class Denied(PermissionError):
    pass


class Conflict(RuntimeError):
    pass


class Invalid(ValueError):
    pass


STAFF_ONLY = {'LX-09', 'LX-12', 'LX-13', 'LX-14'}  # synthetic minimum privilege; roles still unverified
IDENTIFIER = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$')


def ident(s):
    if not isinstance(s, str) or not IDENTIFIER.fullmatch(s):
        raise Invalid('invalid synthetic identifier')
    return s


class SyntheticStore:
    def __init__(self, catalog, *, schema, clock=lambda: 1_000_000):
        self.catalog = catalog
        self.allowed = {m['id']: {f['id'] for g in m['groups'].values()
                                     for f in g['features']} for m in catalog.values()}
        self.db = sqlite3.connect(':memory:', isolation_level=None)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(Path(schema).read_text(encoding='utf-8'))
        self.clock = clock
        self.signing_key = secrets.token_bytes(32)  # process-only synthetic; no production key

    def close(self):
        self.db.close()

    def _run(self, sql, args=()):
        return self.db.execute(sql, args)

    def _one(self, sql, args=()):
        return self._run(sql, args).fetchone()

    def tenant(self, tenant_id):
        self._run('INSERT INTO tenants VALUES (?, ?)', (ident(tenant_id), 'synthetic organization'))

    def principal(self, principal_id, tenant_id, kind):
        if kind not in {'customer', 'staff'}:
            raise Invalid('fixture role invalid')
        self._run('INSERT INTO principals(id,tenant_id,kind) VALUES (?,?,?)',
                  (ident(principal_id), ident(tenant_id), kind))

    def matter(self, matter_id, tenant_id, owner):
        owner_row = self._one('SELECT kind FROM principals WHERE id=? AND tenant_id=?',
                              (owner, tenant_id))
        if not owner_row or owner_row['kind'] != 'customer':
            raise Denied('matter owner not eligible')
        self._run('INSERT INTO matters(id,tenant_id,owner_id) VALUES (?,?,?)',
                  (ident(matter_id), ident(tenant_id), ident(owner)))

    def assign(self, assignment_id, staff, matter_id, module):
        if module not in self.allowed:
            raise Invalid('unknown module')
        s = self._one('SELECT tenant_id,kind,active FROM principals WHERE id=?', (staff,))
        matter = self._one('SELECT tenant_id,state FROM matters WHERE id=?', (matter_id,))
        if not s or s['kind'] != 'staff' or not s['active'] or not matter or s['tenant_id'] != matter['tenant_id'] or matter['state'] != 'open':
            raise Denied('invalid assignment')
        self._run('INSERT INTO staff_assignments VALUES (?,?,?,?,?,1)',
                  (ident(assignment_id), s['tenant_id'], matter_id, staff, module))

    def revoke_assignment(self, assignment_id):
        self._run('UPDATE staff_assignments SET active=0 WHERE id=?', (assignment_id,))

    def session(self, principal_id, *, mfa=False):
        p = self._one('SELECT active,generation FROM principals WHERE id=?', (principal_id,))
        if not p or not p['active']:
            raise Denied('invalid fixture principal')
        secret = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(secret.encode()).hexdigest()
        self._run('INSERT INTO sessions VALUES (?,?,?,?,0)',
                  (token_hash, principal_id, p['generation'], int(bool(mfa))))
        return secret

    def revoke_sessions(self, principal_id):
        self._run('UPDATE principals SET generation=generation+1 WHERE id=?', (principal_id,))
        self._run('UPDATE sessions SET revoked=1 WHERE principal_id=?', (principal_id,))

    def deactivate_principal(self, principal_id):
        self._run('UPDATE principals SET active=0,generation=generation+1 WHERE id=?', (principal_id,))
        self._run('UPDATE sessions SET revoked=1 WHERE principal_id=?', (principal_id,))

    def _context(self, token):
        if not isinstance(token, str) or len(token) < 20:
            raise Denied('invalid session')
        row = self._one('''SELECT p.id,p.tenant_id,p.kind,p.active,p.generation,
                         s.mfa_verified,s.revoked,s.generation AS session_generation
                         FROM sessions s JOIN principals p ON s.principal_id=p.id
                         WHERE s.token_hash=?''', (hashlib.sha256(token.encode()).hexdigest(),))
        if not row or not row['active'] or row['revoked'] or row['generation'] != row['session_generation']:
            raise Denied('expired or revoked session')
        return row

    def _access(self, token, matter_id, module):
        if module not in self.allowed:
            raise Invalid('unknown module')
        actor = self._context(token)
        matter = self._one('SELECT * FROM matters WHERE id=?', (matter_id,))
        if not matter or matter['tenant_id'] != actor['tenant_id'] or matter['state'] != 'open':
            raise Denied('matter not accessible')
        if actor['kind'] == 'customer':
            if module in STAFF_ONLY:
                raise Denied('restricted staff-only module')
            if actor['id'] != matter['owner_id']:
                raise Denied('not matter owner')
        elif actor['kind'] == 'staff':
            if not actor['mfa_verified']:
                raise Denied('staff MFA required')
            a = self._one('''SELECT 1 FROM staff_assignments WHERE tenant_id=?
                             AND matter_id=? AND principal_id=? AND module_id=? AND active=1''',
                          (actor['tenant_id'], matter_id, actor['id'], module))
            if not a:
                raise Denied('active matter+module assignment required')
        else:
            raise Denied('unknown actor kind')
        return actor, matter

    def _audit(self, actor, matter_id, operation, subject_id):
        last = self._one('SELECT event_hash FROM audit_events ORDER BY seq DESC LIMIT 1')
        prev = last['event_hash'] if last else '0' * 64
        event = json.dumps([actor['tenant_id'], actor['id'], matter_id,
                            operation, subject_id, prev], separators=(',', ':'), ensure_ascii=False)
        mac = hmac.new(self.signing_key, event.encode(), hashlib.sha256).hexdigest()
        self._run('''INSERT INTO audit_events(tenant_id,principal_id,matter_id,operation,
                     subject_id,previous_hash,event_hash) VALUES (?,?,?,?,?,?,?)''',
                  (actor['tenant_id'],actor['id'],matter_id,operation,subject_id,prev,mac))

    def verify_audit(self):
        previous = '0' * 64
        for r in self._run('SELECT * FROM audit_events ORDER BY seq ASC'):
            event = json.dumps([r['tenant_id'],r['principal_id'],r['matter_id'],
                                r['operation'],r['subject_id'],previous],
                               separators=(',', ':'), ensure_ascii=False)
            mac = hmac.new(self.signing_key,event.encode(),hashlib.sha256).hexdigest()
            if r['previous_hash'] != previous or not hmac.compare_digest(r['event_hash'],mac):
                return False
            previous = mac
        return True

    def create(self, token, record_id, matter_id, module, feature, label):
        ident(record_id)
        if module not in self.allowed or feature not in self.allowed[module]:
            raise Invalid('feature does not belong to module')
        if not isinstance(label, str) or len(label) == 0 or len(label) > 150:
            raise Invalid('label outside bounds')
        self._run('BEGIN IMMEDIATE')
        try:
            actor, matter = self._access(token,matter_id,module)
            self._run('''INSERT INTO module_records(id,tenant_id,matter_id,owner_id,module_id,feature_id,label)
                      VALUES (?,?,?,?,?,?,?)''',
                      (record_id,actor['tenant_id'],matter_id,matter['owner_id'],module,feature,label))
            self._audit(actor,matter_id,'record.create',record_id)
            self._run('COMMIT')
        except Exception:
            self._run('ROLLBACK')
            raise
        return self.read(token,record_id)

    def read(self, token, record_id):
        record = self._one('SELECT * FROM module_records WHERE id=? AND deleted=0', (record_id,))
        if not record:
            raise Denied('record not accessible')
        self._access(token,record['matter_id'],record['module_id'])
        return dict(record)

    def list_records(self, token, matter_id, module):
        actor, _ = self._access(token,matter_id,module)
        return [dict(r) for r in self._run('''SELECT * FROM module_records
                            WHERE tenant_id=? AND matter_id=? AND module_id=? AND deleted=0
                            ORDER BY id''', (actor['tenant_id'],matter_id,module))]

    def update(self, token, record_id, version, label, state):
        if state not in {'draft','review','archived'}:
            raise Invalid('unknown lifecycle stage')
        if not isinstance(label,str) or not 0 < len(label) <= 150:
            raise Invalid('invalid label')
        self._run('BEGIN IMMEDIATE')
        try:
            r = self.read(token,record_id)
            if r['state'] == 'archived' or (r['state'] == 'review' and state == 'draft'):
                raise Denied('lifecycle transition rejected')
            if self._run('''UPDATE module_records SET label=?,state=?,version=version+1
                            WHERE id=? AND version=? AND deleted=0''',
                         (label,state,record_id,version)).rowcount != 1:
                raise Conflict('stale optimistic version')
            actor = self._context(token)
            self._audit(actor,r['matter_id'],'record.update',record_id)
            self._run('COMMIT')
        except Exception:
            self._run('ROLLBACK')
            raise
        return self.read(token,record_id)

    def delete(self, token, record_id, version):
        self._run('BEGIN IMMEDIATE')
        try:
            r = self.read(token,record_id)
            if r['state'] == 'archived':
                raise Denied('archived record immutable')
            if self._run('''UPDATE module_records SET deleted=1,version=version+1
                            WHERE id=? AND version=? AND deleted=0''', (record_id,version)).rowcount != 1:
                raise Conflict('stale optimistic version')
            self._audit(self._context(token),r['matter_id'],'record.delete',record_id)
            self._run('COMMIT')
        except Exception:
            self._run('ROLLBACK')
            raise

    def document_reference(self, token, record_id, doc_id, mime):
        if mime not in {'application/pdf','text/plain'}:
            raise Invalid('unsupported fixture MIME')
        r = self.read(token,record_id)
        a = self._context(token)
        key = secrets.token_hex(24)
        self._run('INSERT INTO document_refs VALUES (?,?,?,?,?,?,?)',
                  (ident(doc_id),a['tenant_id'],r['matter_id'],record_id,key,mime,a['generation']))
        return {'document_id':doc_id,'storage_key':key,'content_uploaded':False}

    def short_lived_document_token(self, token, doc_id, *, ttl=60):
        if type(ttl) is not int or not 1 <= ttl <= 120:
            raise Invalid('TTL outside synthetic bounds')
        r = self._one('SELECT * FROM document_refs WHERE id=?', (doc_id,))
        if not r:
            raise Denied('document inaccessible')
        record = self.read(token,r['record_id'])
        a = self._context(token)
        if r['tenant_id'] != a['tenant_id'] or r['matter_id'] != record['matter_id']:
            raise Denied('cross-tenant document')
        expires = int(self.clock())+ttl
        payload = [doc_id,hashlib.sha256(token.encode()).hexdigest(),
                   a['generation'], expires]
        encoded = json.dumps(payload,separators=(',', ':'))
        return {'payload':encoded,'signature':hmac.new(self.signing_key,encoded.encode(),hashlib.sha256).hexdigest(),
                'type':'SYNTHETIC_NON_NETWORK_REFERENCE'}

    def verify_document_token(self, session, grant):
        a = self._context(session)
        payload = grant.get('payload','')
        signature = grant.get('signature','')
        if not isinstance(payload,str) or not isinstance(signature,str):
            raise Denied('bad grant format')
        mac=hmac.new(self.signing_key,payload.encode(),hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature,mac):
            raise Denied('tampered grant')
        try:
            doc,token_hash,generation,expiry=json.loads(payload)
        except (TypeError,ValueError):
            raise Denied('invalid grant')
        if token_hash!=hashlib.sha256(session.encode()).hexdigest() or generation!=a['generation'] or expiry<=int(self.clock()):
            raise Denied('expired or mismatched grant')
        r=self._one('SELECT record_id FROM document_refs WHERE id=?',(doc,))
        if not r: raise Denied('missing document')
        self.read(session,r['record_id'])
        return True