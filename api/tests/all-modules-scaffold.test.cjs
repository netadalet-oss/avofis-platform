"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {once}=require("node:events");
const ts=require("typescript");
const express=require("express");
const root=path.resolve(__dirname,"..");

function load(relative, dependencies={}){
 const code=ts.transpileModule(fs.readFileSync(path.join(root,relative),"utf8"),{
  fileName:relative,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
 }).outputText;
 const mod={exports:{}};
 new Function("require","module","exports",code)(
  key=>Object.hasOwn(dependencies,key)?dependencies[key]:require(key),mod,mod.exports
 );
 return mod.exports;
}
const {unavailableModuleMetadata}=load("src/security/module-availability.ts");
const declared=[
 ["admin",["dashboard","users","roles","audit","settings"]],
 ["analytics",["overview","content","conversion"]],
 ["cases",["search","detail","filters","related","bookmark","notes"]],
 ["messaging",["threads","messages","attachments","status"]],
 ["notifications",["list","mark-read","preferences","templates"]],
 ["statutes",["search","detail","article","history","related-cases","bookmark"]],
 ["support",["tickets","create","reply","status"]],
 ["workspace",["files","tasks","notes","members","versions"]]
];
const app=express();
for(const [name] of declared){
 const router=load("src/modules/"+name+"/"+name+".router.ts",{
  "../../security/module-availability":{unavailableModuleMetadata}
 })[name+"Router"];
 assert.ok(router, "missing router: "+name);
 app.use("/api/"+name,router);
}
async function withServer(fn){
 const server=app.listen(0,"127.0.0.1");
 await once(server,"listening");
 try{await fn("http://127.0.0.1:"+server.address().port);}
 finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()))}
}

test("all 8 scaffold routes expose planned headings but zero enabled actions over HTTP",async()=>{
 await withServer(async base=>{
  for(const [module,planned] of declared){
   const response=await fetch(base+"/api/"+module);
   assert.equal(response.status,200,module);
   assert.match(response.headers.get("cache-control"),/no-store/,module);
   const data=await response.json();
   assert.equal(data.module,module);
   assert.equal(data.stage,1);
   assert.equal(data.availability,"SCAFFOLD_NOT_AUTHORIZED");
   assert.deepEqual(data.enabledActions,[]);
   assert.deepEqual(data.plannedActions,planned);
   assert.equal("actions" in data,false,"legacy misleading enabled actions: "+module);
   assert.equal("customer" in data,false);
  }
 });
});

test("no scaffold GET module grants write/mutation endpoints",async()=>{
 await withServer(async base=>{
  const body=JSON.stringify({secret:"DO_NOT_REFLECT_SYNTHETIC"});
  for(const [module] of declared){
   const response=await fetch(base+"/api/"+module,{
    method:"POST",headers:{"Content-Type":"application/json"},body
   });
   assert.equal(response.status,404,module);
   assert.doesNotMatch(await response.text(),/DO_NOT_REFLECT_SYNTHETIC/,module);
  }
 });
});

test("metadata helper rejects bad module/action identifiers",()=>{
 assert.throws(()=>unavailableModuleMetadata("../admin",[]),/INVALID_MODULE_SCAFFOLD/);
 assert.throws(()=>unavailableModuleMetadata("admin",["x;drop table"]),/INVALID_MODULE_SCAFFOLD/);
 assert.deepEqual(unavailableModuleMetadata("cases",[]).enabledActions,[]);
});
