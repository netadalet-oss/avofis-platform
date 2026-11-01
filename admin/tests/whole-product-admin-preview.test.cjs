"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const page = fs.readFileSync(path.join(root, "src/app/seviye-1-onizleme/page.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
const modules = [
  "inbox","triage","matters","calendar","documents","pleadings",
  "research","judicial","ind","messages","billing","payables",
  "reporting","audit","people","settings"
];
test("the 16 canonical staff modules have exactly one safe first-level card",()=>{
  const directory=fs.readFileSync(path.join(root,"src/lib/staff-module-directory.ts"),"utf8");
  const names=[...directory.matchAll(/\\{\\s*slug:"([a-z]+)"/g)].map(x=>x[1]);
  assert.equal(names.length,16);
  assert.ok(page.includes('import { STAFF_TOP_LEVEL } from "@/lib/staff-module-directory"'));
  assert.ok(page.includes("const staffModules = STAFF_TOP_LEVEL;"));
  assert.doesNotMatch(page,/const staffModules = \\[/);
  assert.match(page,/staffModules\\.map\\(\\(module,i\\)/);
  assert.match(page,/href=\\{"\\/personel\\/" \\+ module\\.slug\\}/);
  assert.deepEqual(names,modules);
  assert.match(page,/staffModules\.map/);
  assert.match(page,/İşlem ve yetki kabulü bekliyor/);
});
test("all current 10 API modules and seven A workstreams appear without fake CRUD",()=>{
  const expected=["admin","analytics","auth","cases","cms","messaging",
    "notifications","statutes","support","workspace"];
  const start=page.indexOf("const backendModules = [");
  const end=page.indexOf("] as const;",start);
  assert.ok(start>=0 && end>start);
  const names=[...page.slice(start,end).matchAll(/"([a-z]+)"/g)].map(x=>x[1]);
  assert.deepEqual(names,expected);
  for(let i=0;i<7;i++) assert.match(page,new RegExp('"A'+i+'"'));
  assert.match(page,/Endpoint bildirimi, çalışan CRUD/);
});
test("the preview is no-PII, no-auth, no-Supabase and remains nonindexed",()=>{
  assert.match(page,/robots:\s*\{\s*index:\s*false/);
  for(const term of ['"use client"',"@/lib/supabase","supabase.","fetch(", "<form",
    "<input", "process.env","signInWithPassword","createClient(", "from(\"avofis_"]) {
    assert.equal(page.includes(term),false,term);
  }
  assert.match(page,/0\/594 bağımsız R kabul/);
  assert.match(page,/Personel erişimi, gerçek dosya, ödeme/);
});
test("the admin home provides a path to the comprehensive preview",()=>{
  assert.match(home,/href="\/seviye-1-onizleme"/);
});

test("all admin routes inherit noindex until independent publication signoff",()=>{
 const layout=fs.readFileSync(path.join(root,"src/app/layout.tsx"),"utf8");
 assert.match(layout,/robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
});
