import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { assessAccess, snapshotFile } from './stage2-access-readiness.mjs';

const sample = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
const fork = () => structuredClone(sample);
const here = path.dirname(fileURLToPath(import.meta.url));
const sqlFile = path.resolve(here, '../../docs/security/seviye2-salt-okunur-rls-denetimi.sql');

test('verified source metadata does not conceal seven legacy open risks', () => {
  const v = assessAccess(sample);
  assert.equal(v.catalog_tables_checked, 9);
  assert.equal(v.legacy_table_risks, 7);
  assert.deepEqual(v.cms_tables_with_rls, ['pages', 'site_settings']);
  assert.equal(v.cms_policy_risks, 2);
  assert.equal(v.ready_for_production, false);
  assert.equal(v.safe_to_mark_B01_B02_resolved, false);
});
test('original Stage 1 acceptance and 18 blockers are not erased', () => {
  const v = assessAccess(sample);
  assert.equal(v.stage_1_independently_accepted, 0);
  assert.equal(v.requirements_total, 594);
  assert.equal(v.blockers_open, 18);
});
test('false remediation flag is rejected', () => {
  const b = fork(); b.production_modified = true;
  assert.throws(() => assessAccess(b), /falsified/);
});
test('fraudulent independent acceptance is rejected', () => {
  const b = fork(); b.stage_1_independently_accepted = 594;
  assert.throws(() => assessAccess(b), /carryover/);
});
test('a lost table is rejected', () => {
  const b = fork(); b.tables.pop();
  assert.throws(() => assessAccess(b), /incomplete/);
});
test('duplicate table identity is rejected', () => {
  const b = fork(); b.tables[0].name = b.tables[1].name;
  assert.throws(() => assessAccess(b), /duplicate/);
});
test('malformed per-operation grants are rejected', () => {
  const b = fork(); b.tables[0].anon_crud = [true, true, 'yes', true];
  assert.throws(() => assessAccess(b), /privileges/);
});
test('invented policy metadata is rejected', () => {
  const b = fork(); b.cms_policy_inventory[0].table = 'private_messages';
  assert.throws(() => assessAccess(b), /policy metadata/);
});
test('production risk gate fails, but read-only status report succeeds', () => {
  const command = path.resolve(here, 'stage2-access-readiness.mjs');
  const report = spawnSync(process.execPath, [command], { encoding: 'utf8' });
  assert.equal(report.status, 0);
  assert.equal(JSON.parse(report.stdout).legacy_table_risks, 7);
  const gate = spawnSync(process.execPath, [command, '--fail-on-open-risk'], { encoding: 'utf8' });
  assert.equal(gate.status, 2);
});
test('catalog inspection SQL is read-only and never reads a user table', () => {
  const raw = fs.readFileSync(sqlFile, 'utf8');
  const sql = raw.replace(/--[^\n]*/g, '').replace(/'(?:''|[^'])*'/g, "''");
  assert.doesNotMatch(sql, /\b(?:ALTER|CREATE|DROP|DELETE|INSERT|UPDATE|TRUNCATE|REVOKE|GRANT|EXECUTE|DO|COPY|CALL)\b/i);
  assert.doesNotMatch(sql, /\bFROM\s+public\./i);
  assert.match(sql, /FROM pg_catalog\.pg_class/);
  assert.match(sql, /FROM pg_catalog\.pg_policies/);
  assert.equal((sql.match(/;/g) ?? []).length, 2);
});
