"use strict";
/**
 * AVOfis Seviye 1 / AV-023 / R-540: fail PR CI for tracked filenames that
 * ordinarily contain local credentials or private keys. Filename-only audit:
 * does not read secrets, scan content, rewrite Git history, or rotate keys.
 */
const { execFileSync } = require("node:child_process");

function prohibitedTrackedPath(input) {
  if (typeof input !== "string" || !input || input.includes("\0")) {
    return "INVALID_GIT_PATH";
  }
  const basename = input.replace(/\\/g, "/").split("/").at(-1);
  if (/^\.env(?:\.(?!example$|sample$|template$).+)?$/i.test(basename)) {
    return "TRACKED_ENV_CONFIGURATION";
  }
  if (/\.(?:pem|key|p8|p12|pfx|jks|keystore)$/i.test(basename) ||
      /^(?:id_rsa|id_ed25519|id_ecdsa)$/i.test(basename)) {
    return "TRACKED_PRIVATE_KEY_FILENAME";
  }
  return null;
}

function auditTrackedPaths(paths) {
  if (!Array.isArray(paths)) throw new TypeError("Expected Git path array");
  return paths
    .map(path => ({ path, reason: prohibitedTrackedPath(path) }))
    .filter(row => row.reason !== null)
    .sort((a,b) => a.path.localeCompare(b.path));
}

if (require.main === module) {
  try {
    // NUL boundaries; file bodies and environment variable values are never read.
    const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
      .split("\0").filter(Boolean);
    const findings = auditTrackedPaths(files);
    console.log(JSON.stringify({
      audit: "tracked-filenames-only",
      checked: files.length,
      pass: findings.length === 0,
      findings
    }, null, 2));
    if (findings.length) process.exitCode = 1;
  } catch (error) {
    console.error("Tracked filename audit unavailable; rejecting unchecked release.");
    process.exitCode = 2;
  }
}

module.exports = { prohibitedTrackedPath, auditTrackedPaths };
