'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { assess } = require('./rls-readiness.cjs');
const base = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../docs/security/rls-live-baseline-2026-10-31.json'),'utf8'));
const fork = () => structuredClone(base);

test('grounded seven-table audit is explicitly open risk, not remediated', () => {
  const r = assess(base);
  assert.equal(r.table_count, 7);
  assert.equal(r.risk_count, 7);
  assert.equal(r.live_fix_applied, false);
  assert.equal(r.safe_to_merge_as_remediation, false);
  assert.equal(r.historical_level4_completion, null);
});
test('zero recorded rows must not conceal exposure', () => {
  const r = assess(base);
  assert.equal(r.observed_rows_at_snapshot, 0);
  assert.equal(r.risk_count, 7);
});
test('tables without profile owner remain explicitly blocked', () => {
  assert.deepEqual(assess(base).no_direct_profile_owner.sort(), ['jobs','media_assets','offices']);
});
test('owner-bearing fields are nullable; no authorization policy is proven', () => {
  assert.deepEqual(assess(base).nullable_profile_owner.sort(), ['applications','office_members','posts','topics']);
});
test('duplicate table rejected', () => {
  const b = fork(); b.tables[6].name='applications';
  assert.throws(() => assess(b), /duplicate|ungrounded/);
});
test('missing table rejected', () => {
  const b = fork(); b.tables.pop();
  assert.throws(() => assess(b), /seven/);
});
test('falsely closed risk rejected', () => {
  const b = fork(); b.status='FIXED';
  assert.throws(() => assess(b), /production security/);
});
test('fabricated production remediation rejected', () => {
  const b = fork(); b.production_modified=true;
  assert.throws(() => assess(b), /production security/);
});
test('historical 80% cannot be claimed', () => {
  const b = fork(); b.historical_level4_mapping='COMPLETED';
  assert.throws(() => assess(b), /Historical project/);
});
test('18 original open decisions cannot be changed', () => {
  const b = fork(); b.approved_open_decisions=0;
  assert.throws(() => assess(b), /Historical project/);
});
test('imaginary direct owner column rejected', () => {
  const b = fork(); b.tables.find(t=>t.name==='offices').candidate_owner_column='owner_user_id';
  assert.throws(() => assess(b), /source-backed/);
});
test('unrelated owner key rejected even if column exists', () => {
  const b = fork(); b.tables.find(t=>t.name==='jobs').candidate_owner_column='office_id';
  assert.throws(() => assess(b), /profile FK/);
});
test('negative row count rejected', () => {
  const b = fork(); b.tables[0].rows_total=-1;
  assert.throws(() => assess(b), /aggregate count/);
});
test('unrecognised privileges rejected', () => {
  const b = fork(); b.tables[0].anon_grants.push('SUPERUSER');
  assert.throws(() => assess(b), /privilege type/);
});
test('preflight SQL must remain read-only', () => {
  const query = fs.readFileSync(path.resolve(__dirname,'../../docs/security/rls-readonly-preflight.sql'),'utf8');
  const uncommented = query.replace(/--[^\n]*/g,'').trim();
  assert.doesNotMatch(uncommented, /\b(?:ALTER|CREATE|DROP|DELETE|INSERT|UPDATE|TRUNCATE|REVOKE|GRANT|EXECUTE|DO|COPY)\b/i);
  assert.match(uncommented, /FROM pg_class/);
  assert.match(uncommented, /FROM pg_policies/);
});
