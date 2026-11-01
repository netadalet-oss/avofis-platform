"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
const portal=path.resolve(__dirname,"..");
const contract=JSON.parse(fs.readFileSync(path.join(portal,"../docs/program/AVOFIS_STAGE1_WHOLE_PRODUCT_CONTRACT_2026-11-01.json"),"utf8"));
const filename=path.join(portal,"src/lib/whole-product-levels.ts");
const code=ts.transpileModule(fs.readFileSync(filename,"utf8"),{
 fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const mod={exports:{}};new Function("module","exports",code)(mod,mod.exports);
const model=mod.exports;
test("cross-branch canonical contract equals exact portal A, AV, R and staff inventory",()=>{
 assert.equal(contract.product,"AVOfis");
 assert.equal(contract.levelCount,model.STAGE_COUNT);
 assert.equal(contract.activeLevel,1);
 assert.equal(contract.levelStatus,"IN_PROGRESS");
 assert.deepEqual(contract.areas,model.AV_AREAS.map(({id,avFrom,avTo})=>({id,avFrom,avTo})));
 assert.equal(contract.avTasks,model.avIds().length);
 assert.equal(contract.rRequirements,model.rIds().length);
 assert.equal(contract.rSections,model.R_SECTION_NAMES.length);
 assert.deepEqual(contract.staffModuleSlugs,model.STAFF_MODULE_SLUGS);
 assert.equal(contract.indProcedures,model.IND_PROCEDURES.length);
});
test("canonical whole product inventory never grants acceptance or processing",()=>{
 assert.equal(contract.independentRAccepted,model.INDEPENDENT_R_ACCEPTANCE);
 assert.equal(contract.liveRAccepted,model.LIVE_R_ACCEPTANCE);
 assert.equal(contract.carryoverAttemptsPerNewLevel,2);
 for(const k of ["realCustomerIntake","payments","officialSubmission","productionAuthorization"])
  assert.equal(contract[k],false,k);
 assert.equal(contract.staffModuleSlugs.length,16);
 assert.equal(contract.apiModuleSlugs.length,10);
 assert.equal(contract.services,17);
 assert.equal(contract.audiences,14);
 assert.equal(contract.journeys,12);
 assert.equal(contract.justiceTasks,16);
 assert.equal(contract.staffProtocols,10);
 assert.equal(contract.launchBlockers,18);
 assert.equal(contract.milestones,13);
 assert.equal(contract.languages,6);
});
