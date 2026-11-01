"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
test("password recovery never activates when customer login and owner release are closed",()=>{
 const c=read("src/app/auth/update-password/page.tsx");
 const launch=read("src/lib/launch-gates.ts");
 const release=read("src/lib/public-release-status.ts");
 assert.match(launch,/PUBLIC_ACCOUNT_LOGIN_ENABLED\s*=\s*false/);
 assert.match(release,/publicCustomerTransactionsAuthorized:\s*boolean\s*=\s*false/);
 assert.match(c,/const enabled=publicCustomerTransactionsAuthorized && PUBLIC_ACCOUNT_LOGIN_ENABLED;/);
 assert.match(c,/if\(!enabled\)\{setReady\(false\);setChecking\(false\);return;\}/);
 assert.match(c,/e\.preventDefault\(\);if\(!enabled\|\|password\.length<12\)return/);
 assert.ok(c.indexOf("if(!enabled)")<c.indexOf("supabase.auth.getSession()"));
 assert.ok(c.indexOf("if(!enabled||password.length<12)")<c.indexOf("supabase.auth.updateUser({password})"));
 assert.match(c,/!enabled\?<p role="status"/);
 assert.match(c,/Bu ekranda parola veya kişisel bilgi istenmez/);
});
test("public closed page remains usable independently of credentials",()=>{
 const c=read("src/app/auth/update-password/page.tsx");
 assert.match(c,/PageFrame/);
 assert.match(c,/!enabled\?/);
 assert.match(c,/PUBLIC_ACCOUNT_LOGIN_ENABLED/);
 assert.doesNotMatch(c,/NEXT_PUBLIC_AVOFIS_(?:CLIENT_PORTAL|LOGIN)_ENABLED/);
});
