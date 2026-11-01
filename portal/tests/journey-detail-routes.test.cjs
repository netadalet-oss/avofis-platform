"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/lib/journeys.ts");
const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  fileName: file,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", output)(mod, mod.exports);
const { journeys, getJourney, validateJourneyDetails } = mod.exports;
test("each of 12 legal preparation routes has a valid, distinct, bounded categorical workflow", () => {
  assert.equal(journeys.length, 12);
  assert.equal(new Set(journeys.map(item => item.id)).size, 12);
  for (const journey of journeys) {
    assert.equal(getJourney(journey.id), journey);
    assert.match(journey.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(journey.fields.length > 0, journey.id);
    const answers = {};
    for (const field of journey.fields) {
      assert.ok(field.options.length > 1, journey.id + ": " + field.key);
      assert.equal(new Set(field.options.map(option => option.value)).size, field.options.length);
      answers[field.key] = field.options[0].value;
    }
    assert.equal(validateJourneyDetails(journey.id, answers), true);
    assert.equal(validateJourneyDetails(journey.id, { ...answers, secret: "never" }), false);
    const invalid = { ...answers };
    invalid[journey.fields[0].key] = "<script>alert(1)</script>";
    assert.equal(validateJourneyDetails(journey.id, invalid), false);
  }
  assert.equal(getJourney("non-existent"), undefined);
});
test("12 static detail pages are personal-data-free and reached from all public entry points", () => {
  const read = item => fs.readFileSync(path.join(root, item), "utf8");
  const route = read("src/app/islemler/[id]/page.tsx");
  const component = read("src/components/JourneyPreparationView.tsx");
  assert.match(route, /generateStaticParams/);
  assert.match(route, /dynamicParams = false/);
  assert.match(route, /getJourney\(params.id\)/);
  assert.match(route, /robots: \{ index: false, follow: false \}/);
  assert.match(component, /role="alert"/);
  assert.match(component, /ind-decision-objection/);
  assert.match(component, /journey.fields.map/);
  assert.match(component, /onClick=\{\(\) => setSelected\(\{\}\)\}/);
  for (const prohibited of ["fetch(", "supabase", "localStorage", "sessionStorage",
    "process.env", "<form", "<textarea", 'type="file"', 'type="password"',
    ".insert(", ".update(", "sendBeacon"]) {
    assert.equal(component.includes(prohibited), false, prohibited);
  }
  for (const p of ["src/app/islemler/page.tsx", "src/app/page.tsx",
    "src/app/seviye-1-onizleme/page.tsx", "src/lib/whole-product-explorer.ts"]) {
    assert.ok(read(p).includes('"/islemler/"'), "missing detail route: " + p);
  }
});

test("R-503: localized public content exposes its actual language to assistive technology", () => {
  const read = item => fs.readFileSync(path.join(root, item), "utf8");
  const frame = read("src/components/avofis/PageFrame.tsx");
  const languageHook = read("src/hooks/usePortalLanguage.ts");
  assert.ok(frame.includes('<main lang={lang} className='), "Localized main landmark needs a language attribute");
  assert.ok(languageHook.includes("document.documentElement.lang=selected"), "Page root must follow validated locale");
});

test("all twelve journey topics link only to real service catalogue slugs, in both directions", () => {
  const read = item => fs.readFileSync(path.join(root, item), "utf8");
  const file = "src/lib/journey-service-links.ts";
  const script = ts.transpileModule(read(file), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const links = { exports: {} };
  new Function("module", "exports", script)(links, links.exports);
  const mapping = links.exports.journeyServiceSlugs;
  const servicesText = read("src/lib/service-catalog.ts");
  const known = new Set([...servicesText.matchAll(/"slug": "([a-z0-9-]+)"/g)].map(x => x[1]));
  assert.equal(known.size, 17);
  assert.deepEqual(Object.keys(mapping).sort(), journeys.map(item => item.id).sort());
  for (const journey of journeys) {
    assert.ok(mapping[journey.id].length >= 1, journey.id);
    for (const slug of mapping[journey.id]) {
      assert.ok(known.has(slug), journey.id + " -> " + slug);
    }
  }
  const detail = read("src/components/JourneyPreparationView.tsx");
  const service = read("src/app/hizmetler/[slug]/page.tsx");
  assert.match(detail, /journeyServiceSlugs\[journey.id\]/);
  assert.match(detail, /href=\{"\/hizmetler\/" \+ slug\}/);
  assert.match(service, /journeyServiceSlugs\[item.id\]/);
  assert.match(service, /href=\{"\/islemler\/" \+ item.id\}/);
});
