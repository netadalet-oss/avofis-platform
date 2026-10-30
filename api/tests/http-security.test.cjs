'use strict';
// AVOfis Seviye 4: in-process, real Express HTTP integration tests.
// These are NOT staging, production, database or authenticated-user tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const express = require('express');
const cors = require('cors');

const API = path.resolve(__dirname, '..');
function loadTs(relativePath, mocks = {}) {
  const source = fs.readFileSync(path.join(API, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: relativePath,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', compiled.outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), mod, mod.exports);
  return mod.exports;
}
const { configuredCorsOrigins } = loadTs('src/security/cors-origin.ts');
const expectedSeed = { title: 'Test home page', menu: [{ label: 'Home', href: '/' }] };
function createCmsApp(origins) {
  const { cmsRouter } = loadTs('src/modules/cms/cms.router.ts', {
    './cms.seed': { homepageContent: expectedSeed },
  });
  const app = express();
  app.use(cors({ origin: configuredCorsOrigins(origins) }));
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/cms', cmsRouter);
  return app;
}
async function startServer(originConfiguration) {
  const server = createCmsApp(originConfiguration).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return { server, url: 'http://127.0.0.1:' + port };
}
async function withServer(origins, callback) {
  const { server, url } = await startServer(origins);
  try { await callback(url); } finally { await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }); }
}
const allowed = 'https://portal.example.org';
const denied = 'https://untrusted.example.org';

test('HTTP GET /pages/home keeps existing static data', async () => {
  await withServer(allowed, async (url) => {
    const r = await fetch(url + '/api/cms/pages/home');
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), expectedSeed);
  });
});
test('HTTP GET /menus/main keeps existing static menu', async () => {
  await withServer(allowed, async (url) => {
    const r = await fetch(url + '/api/cms/menus/main');
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), expectedSeed.menu);
  });
});
test('HTTP POST /pages/home refuses fake persistence and does not echo body', async () => {
  await withServer(allowed, async (url) => {
    const r = await fetch(url + '/api/cms/pages/home', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Overwritten', privateToken: 'CANARY_DO_NOT_ECHO' }),
    });
    assert.equal(r.status, 501);
    const body = await r.json();
    assert.equal(body.code, 'CMS_WRITE_NOT_IMPLEMENTED');
    assert.equal(body.persisted, false);
    assert.doesNotMatch(JSON.stringify(body), /CANARY_DO_NOT_ECHO/);
  });
});
test('CORS allows only declared origin on actual HTTP GET', async () => {
  await withServer(allowed, async (url) => {
    const permit = await fetch(url + '/api/cms/pages/home', { headers: { Origin: allowed } });
    assert.equal(permit.headers.get('access-control-allow-origin'), allowed);
    const deny = await fetch(url + '/api/cms/pages/home', { headers: { Origin: denied } });
    assert.equal(deny.headers.get('access-control-allow-origin'), null);
  });
});
test('CORS OPTIONS preflight allows declared origin, rejects undeclared origin', async () => {
  await withServer(allowed, async (url) => {
    const preflight = (origin) => fetch(url + '/api/cms/pages/home', {
      method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
    });
    const permit = await preflight(allowed);
    assert.equal(permit.status, 204);
    assert.equal(permit.headers.get('access-control-allow-origin'), allowed);
    const deny = await preflight(denied);
    assert.equal(deny.headers.get('access-control-allow-origin'), null);
  });
});
test('empty CORS setting never allows browser origin', async () => {
  await withServer(undefined, async (url) => {
    const r = await fetch(url + '/api/cms/pages/home', { headers: { Origin: allowed } });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('access-control-allow-origin'), null);
  });
});
