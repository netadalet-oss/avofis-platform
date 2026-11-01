"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/lib/site.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  fileName: "src/lib/site.ts",
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", compiled)(mod, mod.exports);
const { navigation, footerColumns } = mod.exports;
const links = [...navigation, ...footerColumns.flatMap(column => column.links)];

/** R-072 / Stage 1: a static source-to-route audit, not a deployed crawl. */
test("R-072: every published canonical navigation/footer link resolves to a real Next.js page", () => {
  assert.ok(links.length >= 20, "The canonical public navigation/footer inventory unexpectedly shrank");
  for (const item of links) {
    assert.ok(typeof item.label === "string" && item.label.trim(), "Link requires an accessible label");
    assert.ok(item.href.startsWith("/") && !item.href.startsWith("//"), "Only local pages: " + item.href);
    const destination = new URL(item.href, "https://avofis.example.invalid");
    assert.equal(destination.origin, "https://avofis.example.invalid", item.href);
    const pathname = decodeURIComponent(destination.pathname);
    assert.match(pathname, /^[/a-z0-9-]+$/, pathname);
    assert.match(destination.hash, /^$|^#[a-z0-9-]+$/, item.href);
    const pageFile = path.join(root, "src/app", pathname.slice(1), "page.tsx");
    assert.ok(fs.existsSync(pageFile), "Broken internal page route: " + item.href);
    if (destination.hash) {
      const fragment = decodeURIComponent(destination.hash.slice(1));
      const body = fs.readFileSync(pageFile, "utf8");
      assert.ok(body.includes('id: "' + fragment + '"') ||
        body.includes('id="' + fragment + '"'),
        "Missing section anchor on actual destination page: " + item.href);
    }
  }
});

test("R-072: policy/footer links are informational, with no invented external or transactional URLs", () => {
  for (const item of links) {
    assert.equal(item.href.includes("?"), false, "Public canonical link must not carry credentials or user data");
    assert.equal(item.href.includes("//"), false, "External or scheme-relative URL is not canonical: " + item.href);
  }
  for (const expected of ["/gizlilik", "/cerezler", "/iletisim",
    "/uyum#genel-sartlar", "/uyum#sikayet", "/uyum#erisilebilirlik",
    "/uyum#tuketici-haklari"]) {
    assert.ok(links.some(item => item.href === expected), "Missing R-068 disclosure: " + expected);
  }
});
