"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname,"..");
const filename = path.join(root,"src/lib/staff-module-directory.ts");
const script = ts.transpileModule(fs.readFileSync(filename,"utf8"), {
  fileName:filename,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
}).outputText;
const mod={exports:{}};
new Function("module","exports",script)(mod,mod.exports);
const { STAFF_TOP_LEVEL, staffModuleBySlug }=mod.exports;
const route = fs.readFileSync(path.join(root,"src/app/personel/[module]/page.tsx"),"utf8");
const preview=fs.readFileSync(path.join(root,"src/app/seviye-1-onizleme/page.tsx"),"utf8");
const expected=[
  "inbox","triage","matters","calendar","documents","pleadings",
  "research","judicial","ind","messages","billing","payables",
  "reporting","audit","people","settings"
];

test("one real restricted static module route per all 16 staff modules",()=>{
  assert.deepEqual(STAFF_TOP_LEVEL.map(x=>x.slug),expected);
  assert.equal(new Set(STAFF_TOP_LEVEL.map(x=>x.slug)).size,16);
  for(const item of STAFF_TOP_LEVEL){
    assert.ok(item.title && item.scope && item.firstAction && item.output,item.slug);
    assert.equal(staffModuleBySlug(item.slug),item);
  }
  assert.equal(staffModuleBySlug("unknown"),null);
  assert.match(route,/generateStaticParams\(\)/);
  assert.match(route,/STAFF_TOP_LEVEL\.map/);
  assert.match(route,/dynamicParams = false/);
  assert.match(route,/if \(!item\) notFound\(\)/);
  assert.match(preview,/href=\{"\/personel\/" \+ slug\}/);
});

test("all 16 module pages have safe nontransactional semantics",()=>{
  assert.match(route,/robots:\s*\{\s*index:\s*false/);
  assert.match(route,/hiçbir gerçek personel\/müşteri verisi/);
  assert.match(route,/ana işlev/i);
  assert.match(route,/Beklenen çıktı/);
  for(const forbidden of ['"use client"',"@/lib/supabase", "supabase.",
    "createClient(", "fetch(", "<form","<input", "process.env",
    ".insert(",".upsert(",".delete(",".update(","signInWithPassword"]) {
    assert.equal(route.includes(forbidden),false,forbidden);
  }
});
