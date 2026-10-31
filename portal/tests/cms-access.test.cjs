'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const portalRoot = path.resolve(__dirname, '..');
const helperFile = path.join(portalRoot, 'src/lib/cms-access.ts');
const pageFile = path.join(portalRoot, 'src/app/page.tsx');
const compiled = ts.transpileModule(fs.readFileSync(helperFile, 'utf8'), {
  fileName: helperFile,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const output = { exports: {} };
new Function('module', 'exports', compiled.outputText)(output, output.exports);
const { isTrustedCmsRole, hasPortalCmsAdminAccess } = output.exports;

function clientWithResult(result, calls = []) {
  return {
    from(name) {
      calls.push(['from', name]);
      return { select(fields) {
        calls.push(['select', fields]);
        return { eq(column, value) {
          calls.push(['eq', column, value]);
          return { async maybeSingle() {
            calls.push(['maybeSingle']);
            return result;
          } };
        } };
      } };
    }
  };
}
for (const role of ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN']) {
  test('trusted DB role recognized: ' + role, () => {
    assert.equal(isTrustedCmsRole(role), true);
  });
}
for (const role of ['', 'user', 'member', 'super-admin', ' admin', 'admin ', null, undefined, true, 123, ['admin']]) {
  test('untrusted/invalid role rejected: ' + String(role), () => {
    assert.equal(isTrustedCmsRole(role), false);
  });
}
test('verified own profile grants CMS UI access', async () => {
  const calls = [];
  assert.equal(await hasPortalCmsAdminAccess(clientWithResult({ data: { role: 'admin' }, error: null }, calls), 'self-id'), true);
  assert.deepEqual(calls, [['from', 'profiles'], ['select', 'role'], ['eq', 'id', 'self-id'], ['maybeSingle']]);
});
test('super_admin in DB profile is accepted', async () => {
  assert.equal(await hasPortalCmsAdminAccess(clientWithResult({ data: { role: 'super_admin' }, error: null }), 'self-id'), true);
});
test('no session identity fails without database call', async () => {
  assert.equal(await hasPortalCmsAdminAccess({ from() { throw Error('should not query'); } }, null), false);
});
test('blank session identity fails without database call', async () => {
  assert.equal(await hasPortalCmsAdminAccess({ from() { throw Error('should not query'); } }, ''), false);
});
test('member cannot gain admin via forged user_metadata', async () => {
  const client = clientWithResult({ data: { role: 'member', user_metadata: { role: 'super_admin' } }, error: null });
  assert.equal(await hasPortalCmsAdminAccess(client, 'self-id'), false);
});
test('unknown profile denies', async () => {
  assert.equal(await hasPortalCmsAdminAccess(clientWithResult({ data: null, error: null }), 'self-id'), false);
});
test('RLS permission denied fails closed', async () => {
  assert.equal(await hasPortalCmsAdminAccess(clientWithResult({ data: { role: 'admin' }, error: { code:'42501' } }), 'self-id'), false);
});
test('database transport failure fails closed', async () => {
  assert.equal(await hasPortalCmsAdminAccess({ from() { throw Error('Network down'); } }, 'self-id'), false);
});
test('broken response fails closed', async () => {
  assert.equal(await hasPortalCmsAdminAccess(clientWithResult({}), 'self-id'), false);
});
test('portal page must not use editable user metadata as a role source', () => {
  const page = fs.readFileSync(pageFile, 'utf8');
  assert.doesNotMatch(page, /session\?\.user\?\.user_metadata\?\.role/);
  assert.match(page, /hasPortalCmsAdminAccess\(supabase,\s*currentUserId\)/);
  assert.match(page, /authorizedAdminSession\?\.userId\s*===\s*currentUserId/);
  assert.match(page, /authorizedAdminSession\.accessToken\s*===\s*currentAccessToken/);
});
test('portal CMS mutations and edit enablement are each gated', () => {
  const page = fs.readFileSync(pageFile, 'utf8');
  for (const name of ['saveContentField', 'saveHeroField', 'openHeroEditMode']) {
    const beginning = page.indexOf('function ' + name);
    assert.ok(beginning > 0, 'missing ' + name);
    assert.match(page.slice(beginning, beginning + 180), /if \(!isAdmin\)/, name);
  }
});
test('portal role query depends on current session and is cancelled on change', () => {
  const page = fs.readFileSync(pageFile, 'utf8');
  assert.match(page, /setAuthorizedAdminSession\(null\)/);
  assert.match(page, /if \(active\)/);
  assert.match(page, /active = false/);
  assert.match(page, /\[currentUserId,\s*currentAccessToken\]/);
});
test('metadata roles cannot change RLS grants or authorized session state', () => {
  const page = fs.readFileSync(pageFile, 'utf8');
  assert.match(page, /const isAdmin = Boolean\(/);
  assert.doesNotMatch(page, /const isAdmin = role ===/);
});
