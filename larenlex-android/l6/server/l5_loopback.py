"""Independent, localhost-only L5 integration harness: NOT a deployed API.

Uses the L2 synthetic SQLite store and 453 historical feature IDs. Session tokens
remain in the native-style Authorization header and are never returned to UI.
"""
from contextlib import contextmanager
import http.client
import json
from pathlib import Path
import re
import threading
from urllib.parse import urlsplit
from wsgiref.simple_server import WSGIRequestHandler, make_server

from catalog import load_catalog
from l1_store import SyntheticStore
from l2_api import OfflineAPI

ROOT = Path(__file__).resolve().parent


class SilentHandler(WSGIRequestHandler):
    def log_message(self, format, *args):
        # Never record fixture bearer or identifiers to stdout/CI log.
        pass


class OriginBarrier:
    """Server-side request guard; no browser/WebView origin and no extra hosts."""
    def __init__(self, api):
        self.api = api

    def __call__(self, env, start_response):
        host = env.get('HTTP_HOST', '')
        if not re.fullmatch(r'(?:127\.0\.0\.1|10\.0\.2\.2):\d{1,5}', host) or env.get('HTTP_ORIGIN') or env.get('HTTP_ACCESS_CONTROL_REQUEST_METHOD'):
            payload = b'{"error":"origin unavailable","real_backend_connected":false}'
            start_response('403 Forbidden', [
                ('Content-Type','application/json; charset=utf-8'),
                ('Content-Length',str(len(payload))),
                ('Cache-Control','no-store'),
                ('X-Content-Type-Options','nosniff')])
            return [payload]
        return self.api(env, start_response)


@contextmanager
def local_fixture():
    """Unpublished, random-port loopback only; closes thread and SQLite."""
    catalog = load_catalog(ROOT / 'SOURCE_A2_453_LOCAL_REFERENCE.csv')
    store = SyntheticStore(catalog, schema=ROOT/'001_sqlite_synthetic_schema.sql')
    for tenant in ('a','b'):
        store.tenant(tenant)
    for principal, tenant, role in [
        ('owner','a','customer'),('other','a','customer'),('foreign','b','customer'),
        ('staff','a','staff')]:
        store.principal(principal,tenant,role)
    store.matter('casea','a','owner'); store.matter('caseb','b','foreign')
    tokens = {x:store.session(x,mfa=(x=='staff')) for x in ('owner','other','foreign','staff')}
    api = OriginBarrier(OfflineAPI(store,catalog))
    server = make_server('127.0.0.1',0,api,handler_class=SilentHandler)
    worker = threading.Thread(target=server.serve_forever,daemon=True)
    worker.start()
    try:
        yield store, catalog, tokens, f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown(); worker.join(timeout=4)
        server.server_close(); store.close()


class L5NativeStyleClient:
    """Local reference for the native HTTP boundary (not an Android SDK test)."""
    def __init__(self, endpoint, token):
        parsed=urlsplit(endpoint)
        if (parsed.scheme!='http' or parsed.hostname!='127.0.0.1'
                or parsed.username or parsed.password or parsed.path or parsed.query
                or parsed.fragment or parsed.port is None):
            raise ValueError('No external or untrusted HTTP endpoint allowed')
        self.port=parsed.port
        self._token=token

    def request(self, verb, path, obj=None, extra_headers=None):
        if not re.fullmatch(r'/v2/[A-Za-z0-9_./-]{1,200}',path):
            raise ValueError('Path must remain on native reference API')
        if verb not in ('GET','POST','PATCH','DELETE'):
            raise ValueError('HTTP method not supported')
        if not self._token:
            raise PermissionError('Session not available')
        body=json.dumps(obj,separators=(',', ':'),ensure_ascii=False).encode('utf-8') if obj is not None else None
        headers={'Authorization':'Bearer '+self._token,'Accept':'application/json',
                 'Cache-Control':'no-store','Content-Type':'application/json'}
        if extra_headers:
            forbidden={'authorization','cookie','origin','host'}
            if any(k.lower() in forbidden for k in extra_headers):
                raise ValueError('Forbidden header override')
            headers.update(extra_headers)
        connection=http.client.HTTPConnection('127.0.0.1',self.port,timeout=3)
        try:
            connection.request(verb,path,body=body,headers=headers)
            response=connection.getresponse()
            raw=response.read(65537)
            if len(raw)>65536 or response.getheader('Cache-Control')!='no-store':
                raise RuntimeError('Unsafe API response envelope')
            if response.status in (301,302,303,307,308):
                raise PermissionError('Cross-origin/redirect authentication forbidden')
            if response.status==401:
                self._token=None  # invalidate token on explicit 401
            if response.getheader('Content-Type','').split(';')[0] != 'application/json':
                raise RuntimeError('Unexpected content type')
            value=json.loads(raw)
            if value.get('real_backend_connected') is not False:
                raise RuntimeError('Synthetic protocol boundary missing')
            return response.status, value
        finally:
            connection.close()

    def logout(self):
        self._token=None
