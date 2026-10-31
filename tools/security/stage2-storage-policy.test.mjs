import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const base=resolve(dirname(fileURLToPath(import.meta.url)),'../../database/staging');
const fixture=readFileSync(resolve(base,'s2_storage_fixture.sql'),'utf8');
const proposal=readFileSync(resolve(base,'s2_storage_rls_proposal.sql'),'utf8');
const tests=readFileSync(resolve(base,'s2_storage_ab_test.sql'),'utf8');
const scripts=[fixture,proposal,tests];

test('every SQL script is guarded against live database execution',()=>{
  for(const script of scripts){
    assert.match(script,/current_database\(\)\s*<>\s*'avofis_s2_storage_test'/);
    assert.match(script,/RAISE EXCEPTION/);
  }
  assert.ok(proposal.indexOf('BEGIN;')<proposal.indexOf('REVOKE ALL PRIVILEGES'));
});
test('fixture creates only synthetic private buckets and scoped objects',()=>{
  assert.match(fixture,/CREATE TABLE storage\.buckets/);
  assert.match(fixture,/CREATE TABLE storage\.objects/);
  assert.match(fixture,/avofis-s2-private-only/);
  assert.match(fixture,/avofis-s2-other-private/);
  assert.doesNotMatch(fixture,/INSERT INTO storage\.buckets[^;]*,true\)/i);
});
test('storage RLS is enabled and broad grants are revoked in staging',()=>{
  assert.match(proposal,/ALTER TABLE storage\.objects ENABLE ROW LEVEL SECURITY;/);
  assert.match(proposal,/ALTER TABLE storage\.buckets ENABLE ROW LEVEL SECURITY;/);
  assert.match(proposal,/REVOKE ALL PRIVILEGES ON storage\.objects,storage\.buckets FROM PUBLIC,anon,authenticated;/);
  assert.match(proposal,/GRANT SELECT ON storage\.objects TO authenticated;/);
  assert.doesNotMatch(proposal,/GRANT\s+(INSERT|UPDATE|DELETE|ALL)\s+ON/i);
});
test('policy requires exact bucket, authenticated ID and owner AND path',()=>{
  assert.match(proposal,/FOR SELECT TO authenticated/);
  assert.match(proposal, /\(SELECT auth\.uid\(\)\) IS NOT NULL/);
  assert.match(proposal,/bucket_id='avofis-s2-private-only'/);
  assert.match(proposal,/owner_id=\(SELECT auth\.uid\(\)\)::text/);
  assert.match(proposal,/split_part\(name,'\/',1\)=\(SELECT auth\.uid\(\)\)::text/);
  assert.doesNotMatch(proposal,/SECURITY DEFINER|USING\s*\(\s*true\s*\)|user_metadata|raw_user_meta_data|app_metadata/i);
});
test('actual SQL tests exercise both identities, anon, null, cross-bucket and writes',()=>{
  for(const id of ['00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1']) assert.match(tests,new RegExp(id));
  assert.match(tests,/SET ROLE anon/);
  assert.match(tests,/SET ROLE authenticated/);
  assert.match(tests,/Missing JWT subject/);
  assert.match(tests,/different bucket/);
  assert.match(tests,/object upload/);
  assert.match(tests,/ownership change/);
  assert.match(tests,/object delete/);
  assert.match(tests,/EXCEPTION WHEN insufficient_privilege THEN NULL/);
});
