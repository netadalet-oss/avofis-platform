"use strict";
/**
 * AVOfis AV-023 / Seviye 1. Minimal high-confidence secret scanner.
 * Only file names and finding types leave the process. No matching content,
 * tokens, keys, line excerpts, hashes of secret values or customer data.
 *
 * This checks current tracked plaintext, NOT Git history, dynamic runtime
 * secrets, dependency CVEs, or external credential revocation.
 */
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const detectors = [
  ["PRIVATE_KEY_BLOCK", /-----BEGIN (?:OPENSSH|RSA|EC|DSA|ENCRYPTED|PRIVATE) PRIVATE KEY-----/],
  ["GITHUB_TOKEN", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/],
  ["GITHUB_FINE_GRAINED_TOKEN", /\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ["AWS_ACCESS_KEY_ID", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["STRIPE_LIVE_SECRET", /\bsk_live_[A-Za-z0-9]{20,}\b/],
  ["SUPABASE_SECRET_KEY", /\bsb_secret_[A-Za-z0-9_-]{20,}\b/]
];

function findHighConfidenceSecrets(content) {
  if (typeof content !== "string") throw new TypeError("string required");
  return detectors.filter(([, re]) => re.test(content)).map(([id]) => id);
}
function auditTrackedContent(paths, readFile) {
  const output = [];
  for (const file of paths) {
    // Only text-ish tracked files; errors fail closed so an unreadable file
    // never yields a falsely clean scan.
    if (/\.(?:png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|otf|mp4|mp3|bin)$/i.test(file)) continue;
    const bytes = readFile(file);
    if (!Buffer.isBuffer(bytes)) throw new TypeError("reader must return bytes");
    if (bytes.length > 5 * 1024 * 1024) throw new Error("Unscanned large tracked file: " + file);
    if (bytes.includes(0)) continue; // binary, not plaintext
    const findings = findHighConfidenceSecrets(bytes.toString("utf8"));
    for (const type of findings) output.push({ path: file, type });
  }
  return output;
}

if (require.main === module) {
  try {
    const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
      .split("\0").filter(Boolean);
    if (paths.length < 100) throw new Error("Git index too small to trust");
    const results = auditTrackedContent(paths, file => fs.readFileSync(file));
    process.stdout.write(JSON.stringify({
      audit: "high-confidence-tracked-plaintext",
      filesChecked: paths.length,
      pass: results.length === 0,
      findings: results // ONLY category and filename, never actual secret text.
    }) + "\n");
    if (results.length) process.exitCode = 1;
  } catch {
    console.error("Source secret scan unavailable or incomplete; refusing clean result.");
    process.exitCode = 2;
  }
}

module.exports = { findHighConfidenceSecrets, auditTrackedContent };
