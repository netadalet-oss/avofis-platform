"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const modelPath = path.join(root, "src/lib/whole-product-levels.ts");
const source = fs.readFileSync(modelPath, "utf8");
const compiled = ts.transpileModule(source, {
  fileName: modelPath,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", compiled)(mod, mod.exports);
const model = mod.exports;
const page = fs.readFileSync(
  path.join(root, "src/app/seviye-1-onizleme/page.tsx"), "utf8"
);

test("all 101 AV instructions appear exactly once across seven whole-product areas", () => {
  const ids = model.avIds();
  assert.equal(model.AV_AREAS.length, 7);
  assert.equal(ids.length, 101);
  assert.equal(new Set(ids).size, 101);
  for (let i = 1; i <= 101; i++) {
    assert.equal(ids[i - 1], "AV-" + String(i).padStart(3, "0"));
  }
  assert.equal(model.AV_AREAS[0].id, "A0");
  assert.equal(model.AV_AREAS.at(-1).id, "A6");
});

test("all 594 R IDs and 33 source sections are represented without invented signoff", () => {
  assert.equal(model.R_SECTION_NAMES.length, 33);
  const ids = model.rIds();
  assert.equal(ids.length, 594);
  assert.equal(new Set(ids).size, 594);
  for (let i = 1; i <= 594; i++) {
    assert.equal(ids[i - 1], "R-" + String(i).padStart(3, "0"));
  }
  assert.equal(model.STAGE_COUNT, 12);
  assert.equal(model.STAGE_ONE_STATUS, "IN_PROGRESS_NOT_ACCEPTED");
  assert.equal(model.INDEPENDENT_R_ACCEPTANCE, 0);
  assert.equal(model.LIVE_R_ACCEPTANCE, 0);
});

test("all staff and IND top-level modules are preserved", () => {
  assert.deepEqual(model.STAFF_MODULE_SLUGS, [
    "inbox", "triage", "matters", "calendar", "documents", "pleadings",
    "research", "judicial", "ind", "messages", "billing", "payables",
    "reporting", "audit", "people", "settings"
  ]);
  assert.equal(model.IND_PROCEDURES.length, 8);
  assert.equal(new Set(model.IND_PROCEDURES).size, 8);
});

test("breadth register cannot claim completeness when any module or R ID is absent", () => {
  const ids = model.avIds(), rows = model.rIds();
  assert.equal(model.stageBreadthStatus({
    presentAvIds: ids, presentRIds: rows
  }).completeBreadth, true);
  const missing = model.stageBreadthStatus({
    presentAvIds: ids.filter(id => id !== "AV-062"),
    presentRIds: rows.filter(id => id !== "R-594")
  });
  assert.deepEqual(missing, {
    allAvAddressed: false, allRAddressed: false, completeBreadth: false
  });
  // Full ID inventory is not a legal, independent, technical, or live acceptance!
  assert.equal(model.INDEPENDENT_R_ACCEPTANCE, 0);
});

test("real Next page references actual 17 service, 14 audience and 12 journey sources", () => {
  const catalog = fs.readFileSync(path.join(root, "src/lib/service-catalog.ts"), "utf8");
  const journeys = fs.readFileSync(path.join(root, "src/lib/journeys.ts"), "utf8");
  const primary = fs.readFileSync(path.join(root, "src/lib/avofis-site.ts"), "utf8");
  const extra = fs.readFileSync(path.join(root, "src/lib/avofis-expanded.ts"), "utf8");
  assert.equal((catalog.match(/"slug":/g) || []).length, 17);
  assert.equal((journeys.match(/\{id:"/g) || []).length, 12);
  const audienceChunk = (s, start) => {
    const i = s.indexOf(start);
    assert.ok(i >= 0, start);
    const j = s.indexOf("\nexport ", i + start.length);
    return s.slice(i, j < 0 ? undefined : j);
  };
  assert.equal(
    (audienceChunk(primary, "export const audiences:").match(/slug:/g) || []).length +
    (audienceChunk(extra, "export const extraAudiences:").match(/slug:/g) || []).length,
    14
  );
  for (const term of [
    'SERVICES.map', 'audiences.map', 'journeys.map',
    'AV_AREAS.map', 'R_SECTION_NAMES.map',
    'STAFF_MODULE_SLUGS.map', 'IND_PROCEDURES.map'
  ]) assert.ok(page.includes(term), term);
});

test("whole product preview does not collect data or claim completion", () => {
  assert.match(page, /bağımsız/i);
  assert.match(page, /yedi RLS/i);
  assert.match(page, /resmî kurum gönderimi açık değildir/);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
  for (const item of [
    "J01–J16", "P01–P10", "B01–B18", "T01–T13", "G1–G4",
    "TR · NL · DE · EN · AR RTL · RU"
  ]) assert.ok(page.includes(item), item);
  for (const forbidden of [
    '"use client"', "supabase", "signInWithPassword",
    "createSignedUrl", "<form", "<input", "fetch(", "localStorage",
    "sessionStorage", "process.env"
  ]) assert.equal(page.includes(forbidden), false, forbidden);
});
