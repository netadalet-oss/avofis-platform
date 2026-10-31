'use strict';
// AVOfis: read-only snapshot verifier. This tool NEVER connects to a database,
// never runs SQL and never changes permissions or declares a historical level complete.
const fs = require('node:fs');
const path = require('node:path');
const baselinePath = path.resolve(__dirname, '../../docs/security/rls-live-baseline-2026-10-31.json');
const expected = ['applications', 'jobs', 'media_assets', 'office_members', 'offices', 'posts', 'topics'];
const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

function assess(baseline) {
  if (!baseline || !Array.isArray(baseline.tables) || baseline.tables.length !== expected.length) {
    throw new Error('Expected exactly seven live-snapshot table records');
  }
  if (baseline.production_modified !== false || baseline.status !== 'OPEN_RISK_NOT_REMEDIATED') {
    throw new Error('Snapshot must not imply production security remediation');
  }
  if (baseline.historical_level4_mapping !== 'UNKNOWN' || baseline.approved_open_decisions !== 18) {
    throw new Error('Historical project constraints cannot be inferred or overwritten');
  }
  const names = baseline.tables.map((t) => t.name);
  if (new Set(names).size !== expected.length ||
      expected.some((name) => !names.includes(name))) {
    throw new Error('Missing, duplicate, or ungrounded table name in snapshot');
  }
  const affected = [];
  const noDirectOwner = [];
  const nullableDirectOwner = [];
  let observedRows = 0;
  for (const t of baseline.tables) {
    if (!Array.isArray(t.columns) || !t.columns.includes('id') || !t.foreign_keys ||
        !Number.isSafeInteger(t.rows_total) || t.rows_total < 0) {
      throw new Error('Missing source-backed schema or aggregate count for ' + t.name);
    }
    if (t.candidate_owner_column !== null) {
      if (!t.columns.includes(t.candidate_owner_column) ||
          t.foreign_keys[t.candidate_owner_column] !== 'profiles.id') {
        throw new Error('Candidate ownership lacks source-backed profile FK for ' + t.name);
      }
      if (t.owner_nullable === true) nullableDirectOwner.push(t.name);
    } else {
      noDirectOwner.push(t.name);
    }
    observedRows += t.rows_total;
    const grants = [...t.anon_grants, ...t.authenticated_grants];
    if (grants.some((x) => !operations.includes(x))) {
      throw new Error('Unexpected privilege type for ' + t.name);
    }
    if (t.rls_enabled === false && grants.length > 0) {
      affected.push(t.name);
    }
  }
  return {
    source_snapshot: baseline.observed_on,
    exposed_rls_risk_tables: affected,
    risk_count: affected.length,
    table_count: expected.length,
    observed_rows_at_snapshot: observedRows,
    no_direct_profile_owner: noDirectOwner,
    nullable_profile_owner: nullableDirectOwner,
    live_fix_applied: false,
    historical_level4_completion: null,
    safe_to_merge_as_remediation: false,
  };
}

if (require.main === module) {
  const data = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const result = assess(data);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (process.argv.includes('--fail-on-open-risk') && result.risk_count !== 0) process.exitCode = 2;
}
module.exports = { assess };
