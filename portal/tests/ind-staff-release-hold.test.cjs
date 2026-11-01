"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.resolve(__dirname,"../src/app/yonetim/ind-inceleme/page.tsx"),"utf8");
test("IND clearance cannot be activated by two client-visible environment switches alone",()=>{
 assert.match(src,/clientWorkspaceReleased\(process\.env\.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true"\)/);
 assert.match(src,/process\.env\.NEXT_PUBLIC_AVOFIS_IND_CLEARANCE_ENABLED==="true"/);
 assert.match(src,/if\(!enabled\|\|authLoading\)return;/);
 assert.match(src,/if\(!enabled\|\|role!=="admin"\|\|!user\|\|!selected/);
 assert.match(src,/async function load\(\)\{\s*if\(!enabled\)return;/);
 assert.match(src,/!enabled\?<div/);
 const gate=fs.readFileSync(path.resolve(__dirname,"../src/lib/public-release-status.ts"),"utf8");
 assert.match(gate,/publicCustomerTransactionsAuthorized:\s*boolean\s*=\s*false/);
});
test("no unreviewed IND live upsert or data read before the closed switch",()=>{
 const loadAt=src.indexOf("async function load()");
 const loadGuard=src.indexOf("if(!enabled)return;",loadAt);
 const loadDB=src.indexOf('supabase.from("avofis_cases")',loadAt);
 assert.ok(loadAt>=0&&loadGuard>loadAt&&loadDB>loadGuard);
 const saveAt=src.indexOf("async function save(");
 const saveGuard=src.indexOf('if(!enabled||role!=="admin"',saveAt);
 const saveDB=src.indexOf('supabase.from("avofis_case_clearances").upsert(',saveAt);
 assert.ok(saveAt>=0&&saveGuard>saveAt&&saveDB>saveGuard);
});
