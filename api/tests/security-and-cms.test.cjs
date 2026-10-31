'use strict';
// AVOfis Seviye 4: isolated regression coverage. Not an end-to-end HTTP test.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const API = path.resolve(__dirname, '..');

function loadTs(relativePath, mocks = {}) {
  const source = fs.readFileSync(path.join(API, relativePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relativePath,
  });
  const module = { exports: {} };
  const getDependency = (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name);
  new Function('require', 'module', 'exports', compiled.outputText)(getDependency, module, module.exports);
  return module.exports;
}

function cmsHandlers() {
  const routes = { get: {}, post: {}, put: {}, patch: {}, delete: {} };
  const router = Object.fromEntries(Object.keys(routes).map(verb =>
    [verb, (url, handler) => { routes[verb][url] = handler; return router; }]
  ));
  const page = { title: 'Read only example', menu: [{ label: 'Homepage' }] };
  const { rejectUnverifiedCmsMutation } = loadTs('src/lib/cms-write-gate.ts');
  loadTs('src/modules/cms/cms.router.ts', {
    express: { Router: () => router },
    './cms.seed': { homepageContent: page },
    '../../lib/cms-write-gate': { rejectUnverifiedCmsMutation },
  });
  return { routes, page };
}
function invoke(handler, body) {
  const response = { statusCode: 200, json: null, headers: {} };
  const res = {
    get statusCode() { return response.statusCode; },
    set statusCode(value) { response.statusCode = value; },
    status(code) { response.statusCode = code; return res; },
    json(value) { response.json = value; return res; },
    setHeader(name, value) { response.headers[name.toLowerCase()] = value; return res; },
    end(value) { response.json = JSON.parse(value); return res; },
  };
  handler({ body }, res);
  return response;
}
const { configuredCorsOrigins } = loadTs('src/security/cors-origin.ts');

test('empty CORS configuration yields no allowed origins', () => {
  assert.deepEqual(configuredCorsOrigins(undefined), []);
  assert.deepEqual(configuredCorsOrigins('   '), []);
});
test('canonical HTTPS origin is allowed', () => {
  assert.deepEqual(configuredCorsOrigins('https://example.org'), ['https://example.org']);
});
test('duplicate entries removed, order preserved', () => {
  assert.deepEqual(configuredCorsOrigins('https://example.org, http://localhost:3000, https://example.org'),
    ['https://example.org', 'http://localhost:3000']);
});
test('local development HTTP accepted', () => {
  assert.deepEqual(configuredCorsOrigins('http://127.0.0.1:5173'), ['http://127.0.0.1:5173']);
});
for (const value of ['*', 'null', 'file:///', 'http://example.org', 'https://example.org/path',
  'https://user:pass@example.org', 'https://example.org/', 'https://example.org?tracking=1',
  'https://example.org/#fragment', 'javascript:alert(1)']) {
  test('invalid/unsafe origin rejected: ' + value, () => {
    assert.throws(() => configuredCorsOrigins(value), /origin/i);
  });
}
test('one invalid origin invalidates the full list', () => {
  assert.throws(() => configuredCorsOrigins('https://example.org, *'), /origin/i);
});
test('CMS GET routes retain existing static data', () => {
  const { routes, page } = cmsHandlers();
  assert.deepEqual(invoke(routes.get['/pages/home']).json, page);
  assert.deepEqual(invoke(routes.get['/menus/main']).json, page.menu);
});
test('CMS POST is explicitly non-persistent and never indicates success', () => {
  const { routes } = cmsHandlers();
  const reply = invoke(routes.post['/pages/home'], { title: 'Changed' });
  assert.equal(reply.statusCode, 503);
  assert.equal(reply.json.code, 'CMS_WRITE_UNAVAILABLE');
  assert.notEqual(reply.json.persisted, true);
});
test('CMS POST never reflects confidential request body', () => {
  const { routes } = cmsHandlers();
  const reply = invoke(routes.post['/pages/home'], { secret: 'not-for-response' });
  assert.doesNotMatch(JSON.stringify(reply), /not-for-response/);
});
test('CMS route declarations remain unchanged', () => {
  const { routes } = cmsHandlers();
  assert.deepEqual(Object.keys(routes.get).sort(), ['/menus/main', '/pages/home']);
  for (const verb of ['post', 'put', 'patch', 'delete']) {
    assert.deepEqual(Object.keys(routes[verb]), ['/pages/home'], verb);
    const reply = invoke(routes[verb]['/pages/home'], { secret: 'cannot-persist' });
    assert.equal(reply.statusCode, 503, verb);
    assert.equal(reply.json.code, 'CMS_WRITE_UNAVAILABLE', verb);
    assert.doesNotMatch(JSON.stringify(reply), /cannot-persist/);
  }
});
