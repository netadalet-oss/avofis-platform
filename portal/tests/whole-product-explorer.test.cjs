"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
const root=path.resolve(__dirname,"..");
const code=fs.readFileSync(path.join(root,"src/lib/whole-product-explorer.ts"),"utf8");
const emitted=ts.transpileModule(code,{
 fileName:"whole-product-explorer.ts",
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const mod={exports:{}};new Function("module","exports",emitted)(mod,mod.exports);
const {previewInternalHref,previewSelectionExists}=mod.exports;
test("only known service/journey ids can become local links",()=>{
 const services=["hukuki-danismanlik","belge-apostil-tercume"];
 const journeys=["tr-to-nl","other"];
 assert.equal(previewInternalHref("service",services[0],services),"/hizmetler/hukuki-danismanlik");
 assert.equal(previewInternalHref("journey",journeys[0],journeys),"/islemler#tr-to-nl");
 assert.equal(previewSelectionExists("tr-to-nl",journeys.map(id=>({id}))),true);
 assert.equal(previewSelectionExists("not-known",journeys.map(id=>({id}))),false);
 for(const invalid of ["javascript:alert(1)","//evil.invalid","../admin","foo%2Fbar",
  "<script>alert(1)</script>","", "not-found", "a_b", "TR-to-NL"]){
  assert.equal(previewInternalHref("service",invalid,services),"/seviye-1-onizleme",invalid);
  assert.equal(previewInternalHref("journey",invalid,journeys),"/seviye-1-onizleme",invalid);
 }
});
test("explorer is a local-state navigator, not a PII form or network/credential call",()=>{
 const component=fs.readFileSync(path.join(root,"src/components/WholeProductExplorer.tsx"),"utf8");
 const page=fs.readFileSync(path.join(root,"src/app/seviye-1-onizleme/page.tsx"),"utf8");
 assert.match(component,/"use client"/);
 assert.match(component,/useState\(/);
 assert.match(component,/services\.map/);
 assert.match(component,/journeys\.map/);
 assert.match(component,/previewInternalHref/);
 assert.match(page,/services=\{SERVICES\.map/);
 assert.match(page,/journeys=\{journeys\.map/);
 for(const bad of ["fetch(", "axios", "supabase", "localStorage", "sessionStorage",
  ".insert(", "window.location", "<form", "type=\"password\"", "email","full_name",
  "NEXT_PUBLIC_", "process.env","request.formData"]){
  assert.equal(component.includes(bad),false,bad);
 }
});
