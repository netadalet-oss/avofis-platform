"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { prohibitedTrackedPath, auditTrackedPaths } = require("./tracked-file-gate.cjs");

test("private environment and key filenames are prohibited irrespective of directory", () => {
  for (const name of [
    ".env", "admin/.env.local", "portal/.env.production",
    "api/.env.staging", "secrets/id_rsa", "keys/id_ed25519",
    "keys/private.pem", "upload/client.p12", "keys/signing.jks",
    "keys/prod.keystore", "keys/cert.pfx", "keys/apns.p8",
    "config/server.key", "windows\\nested\\.env.local"
  ]) {
    assert.ok(prohibitedTrackedPath(name), name);
  }
});

test("safe sample filenames and source files are not rejected by filename alone", () => {
  for (const name of [
    "admin/.env.example", ".env.sample", "api/.env.template",
    "src/app/page.tsx", "docs/security/rls-readonly-preflight.sql",
    "tools/security/tracked-file-gate.cjs", "public/readme.md"
  ]) {
    assert.equal(prohibitedTrackedPath(name), null, name);
  }
});

test("audit is deterministic and does not read file contents", () => {
  const entries = ["src/index.ts", "admin/.env.local", "keys/private.pem", "docs/readme.md"];
  assert.deepEqual(auditTrackedPaths(entries), [
    { path: "admin/.env.local", reason: "TRACKED_ENV_CONFIGURATION" },
    { path: "keys/private.pem", reason: "TRACKED_PRIVATE_KEY_FILENAME" }
  ]);
  assert.deepEqual(auditTrackedPaths([".env.example", "src/test.ts"]), []);
});

test("invalid input fails safe instead of silently succeeding", () => {
  assert.equal(prohibitedTrackedPath(""), "INVALID_GIT_PATH");
  assert.equal(prohibitedTrackedPath(null), "INVALID_GIT_PATH");
  assert.throws(() => auditTrackedPaths(null), /Expected Git path array/);
});
