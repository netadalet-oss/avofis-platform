"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "src/app/mfa/page.tsx");
const page = fs.readFileSync(pagePath, "utf8");

test("MFA enrollment cannot be unlocked by client-accessible environment flags", () => {
  assert.match(page, /const mayEnroll=false;/);
  assert.doesNotMatch(page, /process\.env\.NEXT_PUBLIC_AVOFIS_STAFF_MFA_ENROLLMENT_ENABLED/);
  assert.doesNotMatch(page, /const mayEnroll\s*=\s*true/);
  assert.match(page, /if\(!mayEnroll\|\|busy\)return;/);
});
test("staff identity and database role are checked before MFA setup UI", () => {
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /\.from\("avofis_staff"\)/);
  assert.match(page, /\.eq\("user_id",user\.id\)/);
  assert.match(page, /getAuthenticatorAssuranceLevel\(\)/);
  assert.match(page, /Yönetici|Personel|personel|personel staging/);
});
test("the static release gate remains present after TypeScript transpilation", () => {
  const emitted=ts.transpileModule(page,{
    fileName:pagePath,
    compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}
  }).outputText;
  assert.match(emitted,/const mayEnroll = false;/);
});
