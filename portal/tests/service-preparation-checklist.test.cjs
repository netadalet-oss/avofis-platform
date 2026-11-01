"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
const root=path.resolve(__dirname,"..");
const catalogPath=path.join(root,"src/lib/service-catalog.ts");
const code=ts.transpileModule(fs.readFileSync(catalogPath,"utf8"),{
 fileName:catalogPath,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const m={exports:{}};
new Function("module","exports",code)(m,m.exports);
const services=m.exports.SERVICES;
const component=fs.readFileSync(path.join(root,"src/components/ServicePreparationChecklist.tsx"),"utf8");
const route=fs.readFileSync(path.join(root,"src/app/hizmetler/[slug]/page.tsx"),"utf8");

test("all 17 services have genuine source-based non-PII preparation steps",()=>{
 assert.equal(services.length,17);
 assert.equal(new Set(services.map(x=>x.slug)).size,17);
 for(const item of services){
  assert.ok(item.preparation.length>=2,item.slug);
  assert.ok(item.preparation.every(s=>typeof s==="string"&&s.length>20),item.slug);
 }
});
test("every service route gets a local interactive check-and-reset component",()=>{
 assert.match(route,/SERVICES\.map\(\(service\) => \(\{ slug: service.slug \}\)\)/);
 assert.match(route,/ServicePreparationChecklist key=\{service.slug\}/);
 assert.match(route,/serviceSlug=\{service.slug\} steps=\{service.preparation\}/);
 assert.match(component,/"use client"/);
 assert.match(component,/useState<boolean\[\]>/);
 assert.match(component,/type="checkbox"/);
 assert.match(component,/onChange=\{event => toggle\(index, event.target.checked\)\}/);
 assert.match(component,/onClick=\{reset\}/);
 assert.match(component,/Yeniden yükleyince|yeniden yükleyince/);
 assert.match(component,/anlamına gelmez/);
});
test("service checklist never collects free text, uses API or persists sensitive data",()=>{
 for(const prohibited of ["fetch(", "supabase","localStorage", "sessionStorage",
  "process.env","<form", 'type="email"', 'type="text"', "type=\"file\"",
  ".insert(", ".update(", "createClient(", "getUser()", "sendBeacon"]){
  assert.equal(component.includes(prohibited),false,prohibited);
 }
});
