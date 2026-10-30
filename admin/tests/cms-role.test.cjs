'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const adminRoot = path.resolve(__dirname, '..');
const roleFile = path.join(adminRoot, 'src/lib/cms-role.ts');
const pageFile = path.join(adminRoot, 'src/app/cms/page.tsx');
const compiled = ts.transpileModule(fs.readFileSync(roleFile, 'utf8'), {
  fileName: roleFile,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const moduleObject = { exports: {} };
new Function('module', 'exports', compiled.outputText)(moduleObject, moduleObject.exports);
const { isCmsAdminRole } = moduleObject.exports;

for (const role of ['admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN']) {
  test('trusted database profile role permits: ' + role, () => {
    assert.equal(isCmsAdminRole(role), true);
  });
}
for (const role of [undefined, null, '', 'member', 'user', 'admin ', 'super-admin', true, 1, {}, ['admin']]) {
  test('untrusted or unknown role denied: ' + String(role), () => {
    assert.equal(isCmsAdminRole(role), false);
  });
}
test('CMS auth gate consults only profile.role from the database', () => {
  const page = fs.readFileSync(pageFile, 'utf8');
  assert.match(page, /\.from\(["']profiles["']\)/);
  assert.match(page, /\.select\(["']role["']\)/);
  assert.match(page, /allowed\s*=\s*isCmsAdminRole\(profile\?\.role\)/);
  assert.doesNotMatch(page, /session\.user\.user_metadata/);
  assert.doesNotMatch(page, /session\.user\.app_metadata/);
});
test('UI-only role gate expressly delegates real write authorization to RLS', () => {
  assert.match(fs.readFileSync(roleFile, 'utf8'), /Database RLS must enforce/);
});
