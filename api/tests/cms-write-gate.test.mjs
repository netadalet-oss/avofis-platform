import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { rejectUnverifiedCmsMutation } from '../src/lib/cms-write-gate.ts';

const routeSource = readFileSync(new URL('../src/modules/cms/cms.router.ts', import.meta.url), 'utf8');

// Check wiring without Express; CI also builds the full API with dependencies.
test('original public CMS reads remain explicitly wired', () => {
  assert.match(routeSource, /cmsRouter\.get\(["']\/pages\/home["']/);
  assert.match(routeSource, /cmsRouter\.get\(["']\/menus\/main["']/);
});

test('every mutating CMS route uses the same fail-closed handler', () => {
  for (const verb of ['post', 'put', 'patch', 'delete']) {
    assert.ok(routeSource.includes('cmsRouter.' + verb + '("/pages/home", rejectUnverifiedCmsMutation);'));
  }
  assert.doesNotMatch(routeSource, /req\.body|received:\s*req\./);
  assert.doesNotMatch(routeSource, /upsert\s*\(|insert\s*\(|update\s*\(/);
});

test('API mutation guard denies real local HTTP without reflecting secrets', async () => {
  const server = createServer((req, res) => {
    if (req.url === '/api/cms/pages/home' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      rejectUnverifiedCmsMutation(req, res);
      return;
    }
    res.statusCode = 404;
    res.end('Not found');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const secret = 'private-document-' + method + '-123';
      const response = await fetch('http://127.0.0.1:' + port + '/api/cms/pages/home', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer spoofed-token' },
        body: JSON.stringify({ content: secret, user_metadata: { role: 'super_admin' } })
      });
      assert.equal(response.status, 503, method);
      assert.match(response.headers.get('cache-control') ?? '', /no-store/);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      const body = await response.text();
      assert.equal(JSON.parse(body).code, 'CMS_WRITE_UNAVAILABLE');
      assert.ok(!body.includes(secret), method + ': sensitive content must not be echoed');
      assert.ok(!body.includes('spoofed-token'), method + ': authorization must not be echoed');
      assert.ok(!body.includes('super_admin'), method + ': client role must not be echoed');
    }
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('empty request, fake role, and alleged approval all remain unavailable', () => {
  for (const request of [null, {}, { user_metadata: { role: 'admin' } }, { approval: true }]) {
    const headers = {};
    let body;
    const res = {
      statusCode: 200,
      setHeader: (name, value) => { headers[name.toLowerCase()] = value; },
      end: (message) => { body = message; }
    };
    rejectUnverifiedCmsMutation(request, res);
    assert.equal(res.statusCode, 503);
    assert.match(headers['cache-control'], /no-store/);
    assert.equal(JSON.parse(body).code, 'CMS_WRITE_UNAVAILABLE');
  }
});
