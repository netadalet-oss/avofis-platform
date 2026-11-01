"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
const root=path.resolve(__dirname,"../..");
const contract=JSON.parse(fs.readFileSync(path.join(root,"docs/program/AVOFIS_STAGE1_WHOLE_PRODUCT_CONTRACT_2026-11-01.json"),"utf8"));
const plan=require("./whole-product-levels.cjs");
const directory=path.join(root,"admin/src/lib/staff-module-directory.ts");
const emitted=ts.transpileModule(fs.readFileSync(directory,"utf8"),{
 fileName:directory,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const mod={exports:{}};new Function("module","exports",emitted)(mod,mod.exports);
const staff=mod.exports.STAFF_TOP_LEVEL.map(x=>x.slug);
const apiSource=fs.readFileSync(path.join(root,"api/src/modules/program/program.router.ts"),"utf8");
const apiMatch=apiSource.match(/export const API_MAIN_MODULES = \[([\s\S]*?)\] as const;/);
const apiModules=apiMatch?JSON.parse("["+apiMatch[1]+"]"):null;
test("cross-branch canonical contract equals exact app/portal AV, R, staff and API inventory",()=>{
 assert.equal(contract.product,"AVOfis");
 assert.equal(contract.levelCount,plan.DEPTHS.length);
 assert.equal(contract.activeLevel,1);
 assert.equal(contract.levelStatus,"IN_PROGRESS");
 assert.deepEqual(contract.areas,plan.AV_AREAS.map(a=>({id:a.id,avFrom:a.first,avTo:a.last})));
 assert.equal(contract.avTasks,plan.AV_IDS.length);
 assert.equal(contract.rRequirements,plan.R_IDS.length);
 assert.deepEqual(contract.staffModuleSlugs,plan.STAFF_MODULES);
 assert.deepEqual(contract.staffModuleSlugs,staff);
 assert.deepEqual(contract.apiModuleSlugs,apiModules);\n assert.equal(apiModules.length,10);
});
test("cross-branch release and retry model does not create phantom authorization",()=>{
 assert.equal(contract.carryoverAttemptsPerNewLevel,2);
 assert.equal(contract.independentRAccepted,0);
 assert.equal(contract.liveRAccepted,0);
 for(const key of ["realCustomerIntake","payments","officialSubmission","productionAuthorization"])
  assert.equal(contract[key],false,key);
 const p=plan.stagePlan(2,["RLS_PUBLIC_7"]);
 assert.equal(p.carryover[0].requiredNewAttempts,contract.carryoverAttemptsPerNewLevel);
 assert.equal(p.releasePermissionsGranted,false);
 for(const [key,count] of [
  ["services",17],["audiences",14],["journeys",12],["indProcedures",8],
  ["justiceTasks",16],["staffProtocols",10],["launchBlockers",18],
  ["milestones",13],["languages",6],["rSections",33]
 ])assert.equal(contract[key],count,key);
});
