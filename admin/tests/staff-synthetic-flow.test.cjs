"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
function loadTs(filename, mocks={}) {
  const source = fs.readFileSync(path.join(root, filename), "utf8");
  const code = ts.transpileModule(source, {
    fileName:filename,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
  }).outputText;
  const m = {exports:{}};
  new Function("require", "module", "exports", code)(
    name => Object.hasOwn(mocks,name)?mocks[name]:require(name), m, m.exports
  );
  return m.exports;
}
const directory=loadTs("src/lib/staff-module-directory.ts");
const demo=loadTs("src/lib/staff-synthetic-flow.ts",{
  "./staff-module-directory":directory
});
const slugs=directory.STAFF_TOP_LEVEL.map(item=>item.slug);

test("all 16 modules expose distinct deterministic no-PII core workflow examples",()=>{
  assert.equal(slugs.length,16);
  assert.deepEqual(Object.keys(demo.SYNTHETIC_STAFF_SCENARIOS).sort(),[...slugs].sort());
  const inputs = new Set();
  for(const slug of slugs){
    const empty=demo.staffDemoDisplay(slug,"EMPTY");
    const prepared=demo.staffDemoDisplay(slug,"PREPARED");
    const reviewed=demo.staffDemoDisplay(slug,"REVIEWED");
    assert.ok(empty.input.length>15,slug);
    assert.ok(prepared.result.length>15,slug);
    assert.ok(reviewed.result.length>15,slug);
    assert.notEqual(empty.result,prepared.result);
    assert.notEqual(prepared.result,reviewed.result);
    inputs.add(empty.input);
  }
  assert.equal(inputs.size,16);
});
test("each module has a concrete start, review and reset action with strict ordering",()=>{
  for(const slug of slugs){
    assert.equal(demo.transitionStaffDemo(slug,"EMPTY","prepare"),"PREPARED");
    assert.equal(demo.transitionStaffDemo(slug,"PREPARED","review"),"REVIEWED");
    assert.equal(demo.transitionStaffDemo(slug,"REVIEWED","reset"),"EMPTY");
    assert.throws(()=>demo.transitionStaffDemo(slug,"EMPTY","review"),/INVALID_DEMO_TRANSITION/);
    assert.throws(()=>demo.transitionStaffDemo(slug,"PREPARED","prepare"),/INVALID_DEMO_TRANSITION/);
    assert.throws(()=>demo.transitionStaffDemo(slug,"REVIEWED","review"),/INVALID_DEMO_TRANSITION/);
  }
  assert.throws(()=>demo.transitionStaffDemo("wrong","EMPTY","prepare"),/UNKNOWN_MODULE/);
  assert.throws(()=>demo.staffDemoDisplay("wrong","EMPTY"),/UNKNOWN_MODULE/);
});
test("client demo never asks for credentials or writes to service, database or storage",()=>{
  const source=fs.readFileSync(path.join(root,"src/components/StaffSyntheticDemonstration.tsx"),"utf8");
  assert.match(source,/"use client"/);
  assert.match(source,/useState<DemoState>\("EMPTY"\)/);
  assert.match(source,/onClick=\{\(\) => advance\("prepare"\)\}/);
  assert.match(source,/onClick=\{\(\) => advance\("review"\)\}/);
  assert.match(source,/onClick=\{\(\) => advance\("reset"\)\}/);
  assert.match(source,/Supabase veya API ile işlem yapmaz/);
  for(const bad of ["fetch(","createClient(","@/lib/supabase", "localStorage",
    "sessionStorage", ".from(", ".insert(", ".upsert(", ".update(", "navigator.sendBeacon",
    "process.env", "<form", "<input"]){
    assert.equal(source.includes(bad),false,bad);
  }
  const route=fs.readFileSync(path.join(root,"src/app/personel/[module]/page.tsx"),"utf8");
  assert.match(route,/StaffSyntheticDemonstration slug=\{item.slug\}/);
});
