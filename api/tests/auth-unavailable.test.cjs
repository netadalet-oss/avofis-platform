"use strict";
// Synthetic loopback HTTP: no Supabase, customer identity or real credentials.
const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/modules/auth/auth.router.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  fileName: "auth.router.ts",
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const authModule = { exports: {} };
new Function("require", "module", "exports", compiled.outputText)(
  require, authModule, authModule.exports
);

async function withServer(fn) {
  const app = express();
  app.use(express.json({ limit: "64kb" }));
  app.use("/api/auth", authModule.exports.authRouter);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn("http://127.0.0.1:" + server.address().port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    });
  }
}

test("HTTP auth discovery is fail-closed, never advertises unimplemented actions", async () => {
  await withServer(async (url) => {
    const r = await fetch(url + "/api/auth");
    assert.equal(r.status, 503);
    assert.match(r.headers.get("cache-control"), /no-store/);
    const body = await r.json();
    assert.equal(body.code, "PUBLIC_AUTH_UNAVAILABLE");
    assert.equal(body.registrationEnabled, false);
    assert.equal(body.loginEnabled, false);
    assert.deepEqual(body.enabledActions, []);
    assert.equal("actions" in body, false);
  });
});

test("no public registration, login, session or forgotten-password route is activated", async () => {
  await withServer(async (url) => {
    for (const route of ["register", "login", "refresh", "forgot-password", "verify-email"]) {
      const canary = "SYNTHETIC_NOT_TO_ECHO";
      const r = await fetch(url + "/api/auth/" + route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-real@example.invalid", secret: canary }),
      });
      assert.equal(r.status, 404, route);
      assert.doesNotMatch(await r.text(), /SYNTHETIC_NOT_TO_ECHO/);
    }
  });
});
