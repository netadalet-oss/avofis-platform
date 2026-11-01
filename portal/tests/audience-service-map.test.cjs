"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const output = { exports: {} };
  new Function("module", "exports", "require", code)(
    output, output.exports,
    key => key === "lucide-react" ? new Proxy({}, { get: () => function Icon() {} })
      : Object.hasOwn(dependencies, key) ? dependencies[key]
      : (() => { throw new Error("Unexpected source import: " + key); })()
  );
  return output.exports;
}
const expanded = load("src/lib/avofis-expanded.ts");
const site = load("src/lib/avofis-site.ts", { "./avofis-expanded": expanded });
const catalog = load("src/lib/service-catalog.ts");
const groups = [...site.audiences, ...expanded.extraAudiences];
test("AV-044: fourteen unique audiences link to all seventeen canonical services", () => {
  const services = new Set(catalog.SERVICES.map(s => s.slug));
  const audiences = new Set(groups.map(a => a.slug));
  assert.equal(services.size, 17);
  assert.equal(groups.length, 14);
  assert.equal(audiences.size, 14);
  const mapped = new Set();
  for (const group of groups) {
    assert.ok(group.title.tr && group.lead.tr && group.needs.length, group.slug);
    assert.ok(group.serviceSlugs.length, group.slug);
    for (const service of group.serviceSlugs) {
      assert.ok(services.has(service), group.slug + " -> " + service);
      mapped.add(service);
    }
  }
  assert.deepEqual([...mapped].sort(), [...services].sort());
});
test("audience overview is in actual public navigation, local and privacy-safe", () => {
  const page = fs.readFileSync(path.join(root, "src/app/kimler-icin/page.tsx"), "utf8");
  const home = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  const nav = fs.readFileSync(path.join(root, "src/lib/site.ts"), "utf8");
  assert.match(page, /groups\.map/);
  assert.match(page, /servicesBySlug\.get/);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
  assert.match(home, /href=\{"\/kimler-icin#" \+ item\.slug\}/);
  assert.ok(nav.includes('href: "/kimler-icin"'));
  for (const blocked of ["fetch(", "supabase", "localStorage", "<form", "<input", "onSubmit="]) {
    assert.equal(page.includes(blocked), false, blocked);
  }
});
