"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const csvPath = path.join(root, "docs/program/r594-kanit-esleme-2026-10-31.csv");
const metaPath = path.join(root, "docs/program/r594-kanit-esleme-katalogu-2026-10-31.json");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

function readRows() {
  const lines = fs.readFileSync(csvPath, "utf8").trimEnd().split(/\r?\n/);
  assert.equal(lines.shift(),
    '"R_ID","BOLUM","KANIT_DUZEYI","ESLESME_KODLARI","BAGIMSIZ_KABUL","CANLI_KABUL","KANIT_KOD_SHA"');
  return lines.map((line, i) => {
    // Historical ledger has seven double-quoted fields, with literal commas
    // in some descriptions. Reject unparsed or ambiguous formats.
    const m = line.match(/^"(R-\d{3})","(\d{2})","((?:[^"]|"")*)","((?:[^"]|"")*)","([^"]*)","([^"]*)","((?:[^"]|"")*)"$/);
    assert.ok(m, "unparseable evidence row at line " + (i + 2));
    return { id:m[1], section:m[2], status:m[3], codes:m[4],
      independent:m[5], live:m[6], sha:m[7] };
  });
}

test("all 594 canonical R IDs are unique and exactly 18 appear in each of 33 sections", () => {
  const rows = readRows();
  assert.equal(rows.length, 594);
  const ids = new Set(rows.map(row => row.id));
  assert.equal(ids.size, 594);
  for (let i=1; i<=594; i++) {
    const row = rows[i-1];
    assert.equal(row.id, "R-" + String(i).padStart(3, "0"));
    assert.equal(row.section, String(Math.ceil(i / 18)).padStart(2, "0"));
  }
});

test("formal and production R acceptance remain denied without individual signed evidence", () => {
  const rows = readRows();
  for (const row of rows) {
    assert.equal(row.independent, "HAYIR", row.id);
    assert.equal(row.live, "HAYIR", row.id);
  }
  assert.equal(meta.formal_independent_acceptance, 0);
  assert.equal(meta.live_acceptance, 0);
  assert.match(meta.acceptance_scope, /NOT product R signoff/);
});

test("historical evidence status counts match rows and old SHA is not today's acceptance", () => {
  const rows = readRows();
  const counts = Object.create(null);
  for (const row of rows) {
    counts[row.status] = (counts[row.status] || 0) + 1;
    if (row.sha) assert.match(row.sha, /^[0-9a-f]{40}$/, row.id);
  }
  assert.deepEqual({ ...counts }, meta.statuses);
  assert.equal(meta.canonical_r_ids, "R-001..R-594");
  assert.match(meta.source_commit_sha, /^[0-9a-f]{40}$/);
  assert.equal(meta.open_blockers, 18);
  assert.equal(meta.open_live_rls, 7);
});

test("source-evidence ledger is not permission to merge or deploy", () => {
  assert.equal(meta.formal_independent_acceptance + meta.live_acceptance, 0);
  assert.ok(meta.evidence_cutoff <= "2026-11-01");
  assert.equal(typeof meta.active_pr, "string");
});
