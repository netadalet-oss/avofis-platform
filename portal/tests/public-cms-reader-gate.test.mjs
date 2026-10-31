import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PUBLIC_CMS_CONTENT_READER_ENABLED} from "../src/lib/launch-gates.ts";
const read=p=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");
test("public CMS release is disabled and cannot be enabled by environment",()=>{
 assert.equal(PUBLIC_CMS_CONTENT_READER_ENABLED,false);
 const gate=read("lib/launch-gates.ts");
 assert.match(gate,/PUBLIC_CMS_CONTENT_READER_ENABLED = false/);
 assert.doesNotMatch(gate,/process\.env|NEXT_PUBLIC_/);
});
for(const [path,fn,table] of [
 ["components/site-header.tsx","loadNavigation","site_settings"],
 ["app/page.tsx","loadCMS","pages"]
]){
 test(path+" cannot request unreviewed CMS before code-level gate",()=>{
  const code=read(path),start=code.indexOf("async function "+fn+"()");
  const guard=code.indexOf("if (!PUBLIC_CMS_CONTENT_READER_ENABLED)",start);
  const query=code.indexOf('.from("'+table+'")',start);
  assert.ok(start>=0&&guard>start&&query>guard,"guard must precede request");
  assert.ok(code.slice(guard,query).includes("return;"),"deny branch must return");
  assert.match(code,/PUBLIC_CMS_CONTENT_READER_ENABLED/);
 });
}
