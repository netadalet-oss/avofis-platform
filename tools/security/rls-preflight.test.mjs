import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { evaluateRlsPreflight, LEGACY_TABLES, CMS_TABLES } from './rls-preflight.mjs';

function safeFixture() {
  return {
    tables: [...LEGACY_TABLES,...CMS_TABLES].map(table_name => ({
      table_name, rls_enabled:true, anon_insert:false, anon_update:false,
      anon_delete:false, policy_count:CMS_TABLES.includes(table_name) ? 1 : 0
    })),
    policies: CMS_TABLES.map(tablename => ({
      tablename, cmd:'SELECT', permissive:'PERMISSIVE', roles:'{authenticated}',
      qual:"EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')"
    }))
  };
}
test('restricted synthetic fixture passes only the offline evaluator', () => {
  assert.deepEqual(evaluateRlsPreflight(safeFixture()),
    {releaseReady:true, checkedTables:9, findings:[]});
});
test('live-like B01/B02 weaknesses fail closed', () => {
  const snapshot = safeFixture();
  for (const row of snapshot.tables.filter(r => LEGACY_TABLES.includes(r.table_name))) {
    row.rls_enabled=false; row.anon_insert=true; row.anon_update=true; row.anon_delete=true;
  }
  snapshot.policies[0].qual="(auth.role() = 'authenticated'::text)";
  snapshot.policies[1].qual="true";
  const result=evaluateRlsPreflight(snapshot);
  assert.equal(result.releaseReady,false);
  assert.equal(result.findings.filter(f=>f.code==='RLS_NOT_ENABLED').length,7);
  assert.equal(result.findings.filter(f=>f.code==='ANON_MUTATION_GRANT_UNREVIEWED').length,7);
  assert.equal(result.findings.filter(f=>f.code==='BROAD_CMS_READ_POLICY').length,2);
  assert.ok(!JSON.stringify(result).includes('auth.role'));
});
test('missing tables and incomplete policy sets cannot pass',()=>{
  const snapshot=safeFixture();
  snapshot.tables=snapshot.tables.filter(r=>r.table_name!=='applications');
  snapshot.policies.pop();
  const report=evaluateRlsPreflight(snapshot);
  assert.ok(report.findings.some(f=>f.code==='METADATA_MISSING'));
  assert.ok(report.findings.some(f=>f.code==='POLICY_INVENTORY_INCOMPLETE'));
});
test('unknown anon grants and duplicated metadata cannot pass',()=>{
  const snapshot=safeFixture();
  delete snapshot.tables[0].anon_delete;
  snapshot.tables.push({...snapshot.tables[0]});
  const report=evaluateRlsPreflight(snapshot);
  assert.ok(report.findings.some(f=>f.code==='ANON_MUTATION_GRANT_UNREVIEWED'));
  assert.ok(report.findings.some(f=>f.code==='DUPLICATE_TABLE_METADATA'));
});
test('malformed input rejected',()=>{
  assert.throws(()=>evaluateRlsPreflight({tables:[]}),TypeError);
  assert.throws(()=>evaluateRlsPreflight(null),TypeError);
});
test('CLI exits with code 1 for unsafe metadata, without echoing policy detail',()=>{
  const folder=mkdtempSync(join(tmpdir(),'avofis-rls-'));
  try {
    const input=join(folder,'snapshot.json');
    const snapshot=safeFixture(); snapshot.tables[0].rls_enabled=false;
    writeFileSync(input,JSON.stringify(snapshot));
    const cmd=spawnSync(process.execPath,[new URL('./rls-preflight.mjs',import.meta.url).pathname,input],{encoding:'utf8'});
    assert.equal(cmd.status,1);
    assert.match(cmd.stdout,/RLS_NOT_ENABLED/);
    assert.doesNotMatch(cmd.stdout,/SELECT 1 FROM profiles/);
  } finally {rmSync(folder,{recursive:true,force:true});}
});
