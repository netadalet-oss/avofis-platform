"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname,"..");
const helper=fs.readFileSync(path.join(root,"src/lib/safe-admin-redirect.ts"),"utf8");
const js=ts.transpileModule(helper,{
  fileName:"safe-admin-redirect.ts",
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const m={exports:{}};
new Function("module","exports",js)(m,m.exports);
const { safeAdminReturnPath, safeAdminDestinationFromSearch }=m.exports;

test("admin login permits only local, known admin routes",()=>{
  for(const dest of ["/cms","/dashboard","/roles","/audit","/users/requests","/settings"]){
    assert.equal(safeAdminReturnPath(dest),dest);
  }
});
test("admin login rejects XSS, open redirect, control and path traversal inputs",()=>{
  for(const dest of [
    "javascript:alert(1)","https://evil.test","//evil.test",
    "/\\evil.test","/cms//users","/cms/../login","/cms/%2e%2e",
    "/cms?next=https://evil.test","/cms#hash","/cms\r\n",
    "/api/payments","/auth/login","/login","/","",
    "x".repeat(600),null,undefined
  ]){
    assert.equal(safeAdminReturnPath(dest),"/cms",String(dest));
  }
});
test("duplicate URLSearchParams and encoded scripts cannot cause a redirect",()=>{
  assert.equal(safeAdminDestinationFromSearch("?next=%2Fusers%2Fnew"),"/users/new");
  for(const query of [
    "?next=javascript%3Aalert(1)",
    "?next=%2F%2Fevil.test",
    "?next=%2Fcms&next=https%3A%2F%2Fevil.test",
    "?next=%2Fcms%252f..%252flogin"
  ])assert.equal(safeAdminDestinationFromSearch(query),"/cms");
});
test("admin component uses sanitizer in both existing-session and sign-in flow",()=>{
  const page=fs.readFileSync(path.join(root,"src/app/auth/login/page.tsx"),"utf8");
  assert.equal((page.match(/router\.replace\(safeAdminDestinationFromSearch\(window\.location\.search\)\)/g)||[]).length,2);
  assert.doesNotMatch(page,/router\.replace\(next\s*\|\|/);
});
