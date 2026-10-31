"use strict";
/**
 * AVOfis S1 / AV-004, AV-005: filename-only Git index protection.
 * No tracked file contents or credentials are read by this audit.
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

function prohibitedName(path) {
  const file = path.split("/").at(-1);
  return /^\.env(?:\.(?!example$|sample$|template$)[^/]*)?$/i.test(file)
    || /\.(?:pem|key|p8|p12|pfx|jks|keystore)$/i.test(file)
    || /^id_(?:rsa|ed25519|ecdsa)$/i.test(file);
}
test("index guard catches local env files and private key filenames", () => {
  for (const name of [
    "admin/.env.local", ".env", "api/.env.production",
    "keys/id_ed25519", "secrets/key.p8", "secrets/server.key"
  ]) assert.equal(prohibitedName(name), true, name);
  for (const name of [
    "portal/.env.example", "api/.env.sample",
    "admin/.env.template", "src/site.tsx"
  ]) assert.equal(prohibitedName(name), false, name);
});

test("no secret-shaped filename is tracked in the portal branch Git index", () => {
  const paths = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8", maxBuffer: 5 * 1024 * 1024
  }).split("\0").filter(Boolean);
  assert.ok(paths.length >= 100, "unexpected incomplete Git index; refusing blind audit");
  assert.deepEqual(paths.filter(prohibitedName), [], "private filenames must not be tracked");
});
