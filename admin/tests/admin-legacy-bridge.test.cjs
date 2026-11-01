"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
const root=path.resolve(__dirname,"..");
const component=fs.readFileSync(path.join(root,"src/components/AdminSectionBridge.tsx"),"utf8");
const expected=[
 "analytics","audit","careers","cases","dashboard","forum","media",
 "menus","notifications","roles","settings","statutes","users"
];
const staff=[
 "inbox","triage","matters","calendar","documents","pleadings",
 "research","judicial","ind","messages","billing","payables",
 "reporting","audit","people","settings"
];

test("13 former admin empty sections now expose canonical stage-one staff flows",()=>{
 const matched=[...component.matchAll(/^\s{2}([a-z]+):\s*\{\s*name:\s*"[^"]+",\s*modules:\s*\[([^\]]+)\]/gm)];
 assert.deepEqual(matched.map(x=>x[1]),expected);
 const reachable=new Set();
 for(const m of matched){
  const modules=[...m[2].matchAll(/"([a-z]+)"/g)].map(x=>x[1]);
  assert.ok(modules.length>0,m[1]);
  for(const slug of modules){
   assert.ok(staff.includes(slug),m[1]+" → "+slug);
   reachable.add(slug);
  }
 }
 assert.ok(reachable.size>=10);
 for(const section of expected){
  const page=fs.readFileSync(path.join(root,"src/app",section,"page.tsx"),"utf8");
  assert.match(page,/AdminSectionBridge/);
  assert.ok(page.includes('section="'+section+'"'),section);
  for(const prohibited of ["supabase", "fetch(", "<form", "<input", ".insert(", ".delete("]){
   assert.equal(page.includes(prohibited),false,section+": "+prohibited);
  }
 }
});
test("legacy bridge has no auth, API, storage or payment side effects",()=>{
 assert.match(component,/staffModuleBySlug\(slug\)/);
 assert.match(component,/href=\{"\/personel\/" \+ slug\}/);
 assert.match(component,/Hiçbir|hiçbiri|Henüz müşteri verisi/);
 for(const bad of ["use client", "fetch(", "supabase", "sessionStorage",
   "localStorage","process.env", "<form", "<input", "createClient(", "checkout"]){
  assert.equal(component.includes(bad),false,bad);
 }
});
test("admin page wrappers and shared bridge compile as valid TSX",()=>{
 for(const target of [
  path.join(root,"src/components/AdminSectionBridge.tsx"),
  ...expected.map(x=>path.join(root,"src/app",x,"page.tsx"))
 ]){
  const code=fs.readFileSync(target,"utf8");
  const out=ts.transpileModule(code,{fileName:target,
   compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}
  });
  assert.equal(out.diagnostics?.length??0,0,target);
 }
});
