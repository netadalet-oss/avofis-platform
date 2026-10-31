"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { findHighConfidenceSecrets, auditTrackedContent } =
  require("./tracked-content-secret-gate.cjs");

test("synthetic known credential formats raise only category identifiers", () => {
  const patterns = [
    ["PRIVATE_KEY_BLOCK", "-----BEGIN " + "PRIVATE KEY-----"],
    ["PRIVATE_KEY_BLOCK", "-----BEGIN " + "RSA PRIVATE KEY-----"],
    ["GITHUB_TOKEN", "ghp_" + "Q".repeat(39)],
    ["GITHUB_FINE_GRAINED_TOKEN", "github_pat_" + "A".repeat(67)],
    ["AWS_ACCESS_KEY_ID", "AKIA" + "Z".repeat(16)],
    ["STRIPE_LIVE_SECRET", "sk_live_" + "A".repeat(30)],
    ["SUPABASE_SECRET_KEY", "sb_secret_" + "x".repeat(35)]
  ];
  for (const [type, text] of patterns) {
    assert.ok(findHighConfidenceSecrets(text).includes(type), type);
  }
});

test("fake examples, source paths and nonsensitive env keys are not misclassified", () => {
  for (const text of [
    "NEXT_PUBLIC_SUPABASE_URL=https://synthetic.invalid",
    "SUPABASE_SERVICE_ROLE_KEY=not-a-real-key",
    "env.example",
    "just a simple sample",
    "sk_test_" + "B".repeat(30),
    "-----BEGIN CERTIFICATE-----"
  ]) assert.deepEqual(findHighConfidenceSecrets(text), []);
});

test("findings exclude matched values, excerpts and line numbers", () => {
  const canary = "ghp_" + "X".repeat(45);
  const results = auditTrackedContent(["docs/fixture.txt"],
    () => Buffer.from("prefix\n" + canary + "\npostfix"));
  assert.deepEqual(results, [
    { path:"docs/fixture.txt", type:"GITHUB_TOKEN" }
  ]);
  assert.equal(JSON.stringify(results).includes(canary), false);
  assert.equal(JSON.stringify(results).includes("prefix"), false);
});

test("binary skip and oversized unreadable source fail closed", () => {
  assert.deepEqual(auditTrackedContent(["img.png", "data.txt"],
    file => Buffer.from(file === "data.txt" ? "\u0000ignored" : "N/A")), []);
  assert.throws(() => auditTrackedContent(["source.ts"],
    () => Buffer.alloc(5 * 1024 * 1024 + 1)), /Unscanned large/);
  assert.throws(() => auditTrackedContent(["source.ts"],
    () => { throw Error("access denied") }), /access denied/);
});
