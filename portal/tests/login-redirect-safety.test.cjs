"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const helperPath = path.join(root, "src/lib/safe-login-redirect.ts");
const source = readFileSync(helperPath, "utf8");
const compiled = ts.transpileModule(source, {
  fileName: helperPath,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
});
const m = { exports: {} };
new Function("module", "exports", compiled.outputText)(m, m.exports);
const { safePortalReturnPath, safeLoginDestinationFromSearch } = m.exports;

test("only allowlisted local private routes can survive return-path validation", () => {
  const allowed = [
    "/dashboard", "/musteri/dosyalar", "/workspace",
    "/documents/123", "/cases/id-123"
  ];
  for (const value of allowed) {
    assert.equal(safePortalReturnPath(value), value);
  }
});

test("hostile and ambiguous return-path values always fail closed", () => {
  const denied = [
    "javascript:alert(1)", "https://evil.test/path",
    "//evil.test", "/\\evil.test", "/dashboard//x",
    "/dashboard/../auth", "/dashboard/%2e%2e",
    "/dashboard/%252f", "/dashboard?next=foo", "/dashboard#frag",
    "/dashboard\n", "/auth/login", "/api/intake", "/yonetim",
    "../dashboard", null, undefined, {}, "", "x".repeat(600)
  ];
  for (const value of denied) {
    assert.equal(safePortalReturnPath(value), "/dashboard", String(value));
  }
});

test("search parameter decoding is safe, and duplicate next keys are rejected", () => {
  assert.equal(
    safeLoginDestinationFromSearch("?next=%2Fmusteri%2Fdosyalar"),
    "/musteri/dosyalar"
  );
  for (const query of [
    "?next=javascript%3Aalert(1)",
    "?next=%2F%2Fevil.test",
    "?next=%2Fdashboard%252F..%252Fauth",
    "?next=%2Fmusteri&next=javascript%3Aalert(1)",
    "?next=https%3A%2F%2Fevil.test",
    "?" + "next=foo".repeat(1000)
  ]) {
    assert.equal(safeLoginDestinationFromSearch(query), "/dashboard", query.slice(0, 50));
  }
});

test("both login paths and the ProtectedRoute producer use the same safe policy", () => {
  const login = readFileSync(path.join(root, "src/app/auth/login/page.tsx"), "utf8");
  const protectedRoute = readFileSync(
    path.join(root, "src/components/auth/ProtectedRoute.tsx"), "utf8"
  );
  assert.equal(
    (login.match(/router\.replace\(safeLoginDestinationFromSearch\(window\.location\.search\)\)/g) || []).length,
    2
  );
  assert.doesNotMatch(login, /router\.replace\(next\s*\|\|/);
  assert.match(protectedRoute, /safePortalReturnPath\(pathname\)/);
  assert.match(protectedRoute, /encodeURIComponent\(safePath\)/);
});
