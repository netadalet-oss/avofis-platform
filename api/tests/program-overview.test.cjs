"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {once}=require("node:events");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const express=require("express");

const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/modules/program/program.router.ts"),"utf8");
const emitted=ts.transpileModule(source,{
 fileName:"program.router.ts",
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,
   esModuleInterop:true}
}).outputText;
const m={exports:{}};
new Function("module","exports","require",emitted)(m,m.exports,require);
const {programRouter,STAGE_ONE_COUNTS,API_MAIN_MODULES}=m.exports;
async function withServer(callback){
 const app=express();
 app.disable("x-powered-by");
 app.use("/api/program",programRouter);
 const server=app.listen(0,"127.0.0.1");
 await once(server,"listening");
 try{return await callback("http://127.0.0.1:"+server.address().port)}
 finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
}

test("GET real HTTP returns all 14 API module main headings but no enabled actions",async()=>{
 assert.equal(API_MAIN_MODULES.length,14);
 await withServer(async url=>{
  const r=await fetch(url+"/api/program/overview");
  assert.equal(r.status,200);
  assert.match(r.headers.get("cache-control"),/no-store/);
  const data=await r.json();
  assert.equal(data.product,"AVOfis");
  assert.equal(data.stageStatus,"IN_PROGRESS");
  assert.equal(data.totalLevels,12);
  assert.equal(data.level,1);
  assert.equal(data.independentRAccepted,0);
  assert.equal(data.liveRAccepted,0);
  assert.deepEqual(data.scope,STAGE_ONE_COUNTS);
  assert.equal(data.apiModules.length,14);
  assert.deepEqual(data.apiModules.map(x=>x.id),API_MAIN_MODULES);
  for(const item of data.apiModules){
   assert.equal(item.availability,"SCAFFOLD_NOT_AUTHORIZED");
   assert.deepEqual(item.enabledActions,[]);
  }
  for(const key of ["publicCustomerLoginEnabled","personalDataIntakeEnabled",
  "cmsPublicationEnabled","paymentEnabled","officialSubmissionEnabled"]){
   assert.equal(data[key],false,key);
  }
 });
});
test("technical status API cannot create or update any customer or CMS state",async()=>{
 await withServer(async url=>{
  const payload={secret:"SYNTHETIC_SECRET_MUST_NOT_ECHO"};
  for(const method of ["POST","PUT","PATCH","DELETE"]){
   const r=await fetch(url+"/api/program/overview",{
    method,
    headers:{"content-type":"application/json"},
    body:JSON.stringify(payload)
   });
   assert.equal(r.status,404,method);
   assert.doesNotMatch(await r.text(),/SYNTHETIC_SECRET_MUST_NOT_ECHO/);
  }
 });
});
test("module overview source contains no database or credential operations",()=>{
 for(const bad of [".from(", ".insert(", ".update(", ".delete(", "createClient(",
   "process.env", "req.body","request.body", "user_metadata", "service_role",
   "supabase", "externalProvider", "fetch("]){
  assert.equal(source.includes(bad),false,bad);
 }
 const server=fs.readFileSync(path.join(root,"src/server.ts"),"utf8");
 assert.match(server,/app\.use\("\/api\/program", programRouter\)/);
});
