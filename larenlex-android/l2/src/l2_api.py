"""OFFLINE WSGI API reference for all 14 LarenLex modules.

No real authentication provider, server listener, production secrets, file storage,
PostgreSQL RLS, external network, legal submissions or actual mobile client.
The only bearer credentials are SyntheticStore fixture tokens passed in-process.
"""
import io
import json
import re
import sqlite3
from urllib.parse import parse_qs

from l1_store import Denied, Invalid, Conflict

MAX_BODY = 16 * 1024
SAFE_PATH = re.compile(r'^/v2/(?:catalog|session|matters/[A-Za-z0-9_-]{1,64}/modules/LX-(?:0[1-9]|1[0-4])/records|records/[A-Za-z0-9_-]{1,64}(?:/documents)?|documents/[A-Za-z0-9_-]{1,64}/(?:grants|verify))$')
M_COLLECTION = re.compile(r'^/v2/matters/([A-Za-z0-9_-]{1,64})/modules/(LX-(?:0[1-9]|1[0-4]))/records$')
M_RECORD = re.compile(r'^/v2/records/([A-Za-z0-9_-]{1,64})$')
M_DOCREF = re.compile(r'^/v2/records/([A-Za-z0-9_-]{1,64})/documents$')
M_GRANT = re.compile(r'^/v2/documents/([A-Za-z0-9_-]{1,64})/grants$')
M_VERIFY = re.compile(r'^/v2/documents/([A-Za-z0-9_-]{1,64})/verify$')
ALLOWED = ('GET', 'POST', 'PATCH', 'DELETE')


class HttpError(Exception):
    def __init__(self, status, reason):
        self.status, self.reason = status, reason


def as_object(blob):
    # Refuse duplicate names: a normal JSON parser silently changes meaning.
    def nondup(pairs):
        d = {}
        for name, value in pairs:
            if name in d:
                raise ValueError('duplicate json name')
            d[name] = value
        return d
    data = json.loads(blob.decode('utf-8'), object_pairs_hook=nondup,
                      parse_constant=lambda _: (_ for _ in ()).throw(ValueError('non-finite number')))
    if not isinstance(data, dict):
        raise ValueError('JSON object required')
    return data


def fields(body, required, optional=()):
    allowed = set(required) | set(optional)
    if not set(required).issubset(body) or set(body) - allowed:
        raise HttpError(422, 'unrecognized or missing request fields')


def integer(value):
    if type(value) is not int or not (1 <= value <= 1_000_000_000):
        raise HttpError(422, 'invalid version')
    return value


class OfflineAPI:
    def __init__(self, store, catalog):
        self.store, self.catalog = store, catalog

    def _bearer(self, env):
        h = env.get('HTTP_AUTHORIZATION', '')
        match = re.fullmatch(r'Bearer ([A-Za-z0-9_-]{20,512})', h)
        if not match:
            raise HttpError(401, 'authentication required')
        # Validate even on operations without a record access check.
        try:
            self.store._context(match.group(1))
        except Denied:
            raise HttpError(401, 'authentication required')
        return match.group(1)

    def _body(self, env):
        content = env.get('CONTENT_TYPE', '')
        if content.lower() not in ('application/json', 'application/json; charset=utf-8'):
            raise HttpError(415, 'application/json required')
        try:
            size = int(env.get('CONTENT_LENGTH', ''))
        except ValueError:
            raise HttpError(411, 'content length required')
        if size < 0 or size > MAX_BODY:
            raise HttpError(413, 'body too large')
        body = env.get('wsgi.input', io.BytesIO()).read(size + 1)
        if len(body) != size:
            raise HttpError(400, 'invalid body length')
        try:
            return as_object(body)
        except (UnicodeError, ValueError, json.JSONDecodeError):
            raise HttpError(400, 'invalid JSON body')

    def dispatch(self, method, path, env):
        if env.get('QUERY_STRING'):
            raise HttpError(400, 'query parameters not supported')
        if method not in ALLOWED:
            raise HttpError(405, 'unsupported HTTP method')
        if not SAFE_PATH.fullmatch(path):
            raise HttpError(404, 'route not found')
        if path == '/v2/catalog':
            if method != 'GET':
                raise HttpError(405, 'unsupported HTTP method')
            return 200, {'scope': 'HISTORICAL_453_A2_REFERENCE_ONLY',
                         'modules': [{'id': m['id'], 'title': m['title'],
                                      'groups': len(m['groups']),
                                      'features': sum(len(g['features']) for g in m['groups'].values()),
                                      'independent_acceptance': False}
                                     for m in self.catalog.values()]}
        token = self._bearer(env)
        if path == '/v2/session':
            if method != 'GET':
                raise HttpError(405, 'unsupported HTTP method')
            ctx = self.store._context(token)
            return 200, {'principal_id': ctx['id'], 'tenant_id': ctx['tenant_id'],
                         'role': ctx['kind'], 'mfa': bool(ctx['mfa_verified']),
                         'synthetic': True}
        m = M_COLLECTION.fullmatch(path)
        if m:
            matter, module = m.groups()
            if method == 'GET':
                return 200, {'records': self.store.list_records(token, matter, module),
                             'module_id': module, 'synthetic': True}
            if method == 'POST':
                body = self._body(env)
                fields(body, ('id', 'feature_id', 'label'))
                return 201, self.store.create(token, body['id'], matter, module,
                                              body['feature_id'], body['label'])
            raise HttpError(405, 'unsupported HTTP method')
        m = M_RECORD.fullmatch(path)
        if m:
            rec = m.group(1)
            if method == 'GET':
                return 200, self.store.read(token, rec)
            if method == 'PATCH':
                body = self._body(env)
                fields(body, ('version', 'label', 'state'))
                return 200, self.store.update(token, rec, integer(body['version']),
                                              body['label'], body['state'])
            if method == 'DELETE':
                if env.get('CONTENT_LENGTH') not in ('', '0', None):
                    raise HttpError(400, 'DELETE body not supported')
                ver = integer(int(env.get('HTTP_IF_MATCH', '0')) if
                              re.fullmatch(r'[0-9]{1,10}', env.get('HTTP_IF_MATCH', '')) else None)
                self.store.delete(token, rec, ver)
                return 200, {'deleted': True, 'synthetic': True}
            raise HttpError(405, 'unsupported HTTP method')
        m = M_DOCREF.fullmatch(path)
        if m:
            if method != 'POST':
                raise HttpError(405, 'unsupported HTTP method')
            data = self._body(env)
            fields(data, ('document_id', 'mime'))
            internal = self.store.document_reference(token, m.group(1), data['document_id'], data['mime'])
            # A client never receives an internal storage locator or upload capability.
            return 201, {'document_id': internal['document_id'],
                         'content_uploaded': False, 'synthetic': True}
        m = M_GRANT.fullmatch(path)
        if m:
            if method != 'POST':
                raise HttpError(405, 'unsupported HTTP method')
            data = self._body(env)
            fields(data, (), ('ttl',))
            return 200, self.store.short_lived_document_token(token, m.group(1), ttl=data.get('ttl', 60))
        m = M_VERIFY.fullmatch(path)
        if m:
            if method != 'POST':
                raise HttpError(405, 'unsupported HTTP method')
            data = self._body(env)
            fields(data, ('payload', 'signature'))
            result = self.store.verify_document_token(token, data)
            # Bind URI identity to the signed payload; no cross-document confusion.
            try:
                claim = json.loads(data['payload'])
                if not isinstance(claim, list) or len(claim) != 4 or claim[0] != m.group(1):
                    raise ValueError('claim mismatch')
            except (TypeError, ValueError):
                raise Denied('mismatched document grant')
            return 200, {'verified': bool(result), 'synthetic': True}
        raise HttpError(404, 'route not found')

    def __call__(self, environ, start_response):
        method = environ.get('REQUEST_METHOD', '')
        path = environ.get('PATH_INFO', '')
        try:
            code, response = self.dispatch(method, path, environ)
        except HttpError as exc:
            code, response = exc.status, {'error': exc.reason}
        except Denied:
            code, response = 404, {'error': 'resource unavailable'}
        except Invalid:
            code, response = 422, {'error': 'invalid operation'}
        except Conflict:
            code, response = 409, {'error': 'version conflict'}
        except sqlite3.IntegrityError:
            code, response = 409, {'error': 'conflicting or invalid identifier'}
        except (TypeError, ValueError):
            code, response = 422, {'error': 'invalid operation'}
        except Exception:
            # Never leak tokens, SQLite SQL, paths, or stack traces to API caller.
            code, response = 500, {'error': 'internal error'}
        response['real_backend_connected'] = False
        raw = json.dumps(response, ensure_ascii=False, allow_nan=False, separators=(',', ':')).encode('utf-8')
        statuses = {200: 'OK', 201: 'Created', 400: 'Bad Request', 401: 'Unauthorized',
                    404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict',
                    411: 'Length Required', 413: 'Content Too Large', 415: 'Unsupported Media Type',
                    422: 'Unprocessable Content', 500: 'Internal Server Error'}
        headers = [('Content-Type', 'application/json; charset=utf-8'),
                   ('Content-Length', str(len(raw))), ('Cache-Control', 'no-store'),
                   ('X-Content-Type-Options', 'nosniff'), ('Referrer-Policy', 'no-referrer'),
                   ('Content-Security-Policy', "default-src 'none'")]
        if code == 401:
            headers.append(('WWW-Authenticate', 'Bearer'))
        start_response(f'{code} {statuses[code]}', headers)
        return [raw]
