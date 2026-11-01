"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/lib/client-workspace-release.ts"),"utf8");
const emitted=ts.transpileModule(source,{
 fileName:"client-workspace-release.ts",
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
function evaluate(seal){
 const mod={exports:{}};
 new Function("module","exports","require",emitted)(mod,mod.exports,
  p=>{assert.match(p,/public-release-status/);return {publicCustomerTransactionsAuthorized:seal}});
 return mod.exports.clientWorkspaceReleased;
}
test("public portal client/management workspaces fail closed even with NEXT_PUBLIC=true",()=>{
 const release=evaluate(false);
 assert.equal(release(true),false);
 assert.equal(release(false),false);
 assert.match(fs.readFileSync(path.join(root,"src/lib/public-release-status.ts"),"utf8"),
  /publicCustomerTransactionsAuthorized:\s*boolean\s*=\s*false/);
});
test("future release seal does not open a workspace when the technical toggle is false",()=>{
 const release=evaluate(true);
 assert.equal(release(false),false);
 assert.equal(release(true),true);
});
test("customer and staff screens actually invoke shared seal; all data paths fail closed",()=>{
 const customer=fs.readFileSync(path.join(root,"src/app/musteri/page.tsx"),"utf8");
 const staff=fs.readFileSync(path.join(root,"src/app/yonetim/page.tsx"),"utf8");
 for(const [label,src,flag] of [
  ["customer",customer,"live"],["staff",staff,"ready"]
 ]){
  assert.match(src,/clientWorkspaceReleased\(process\.env\.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true"\)/,label);
  assert.ok(!src.includes(flag+"=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="),label);
  assert.match(src,new RegExp("if\\(!"+flag+"\\|\\|"),label);
  assert.match(src,/<PageFrame/,label);
 }
 assert.match(customer,/if\(!live\|\|!selected\|\|!user\)return;/);
 assert.match(customer,/if\(!live\|\|!session\|\|!current/);
 assert.match(customer,/if\(!live\|\|!file\|\|!user/);
 assert.match(customer,/if\(!live\|\|!user\|\|!current\|\|!note\.trim\(\)\)return/);
 assert.match(staff,/async function load\(\)\{\s*if\(!ready\)return;/);
 assert.match(staff,/if\(!ready\|\|!user\)\{setIsStaff\(null\)/);
 assert.match(staff,/if\(!ready\|\|!isStaff\)return;/);
 assert.match(staff,/if\(!ready\|\|!isStaff\|\|!selectedCase\)/);
});
