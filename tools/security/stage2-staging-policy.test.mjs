import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../database/staging');
const source=n=>fs.readFileSync(path.join(base,n),'utf8');
const patch=source('s2_rls_grants_draft.sql');
const fixture=source('s2_rls_fixture.sql');
const ab=source('s2_rls_ab_test.sql');
test('all scripts guard the isolated database name',()=>{
 for(const s of [patch,fixture,ab]){
  assert.match(s,/current_database\(\)\s*<>\s*'avofis_s2_test'/);
  assert.match(s,/RAISE EXCEPTION/);
 }
 assert.ok(patch.indexOf('BEGIN;')<patch.indexOf('ALTER TABLE'));
});
test('nine source-backed tables have RLS and broad grants revoked',()=>{
 for(const t of ['applications','jobs','media_assets','office_members','offices','posts','topics','pages','site_settings']){
  assert.ok(patch.includes('ALTER TABLE public.'+t+' ENABLE ROW LEVEL SECURITY;'));
 }
 assert.match(patch,/REVOKE ALL PRIVILEGES/);
 assert.match(patch,/FROM PUBLIC, anon, authenticated;/);
});
test('no unrestricted grant for ownerless tables or publication',()=>{
 assert.doesNotMatch(patch,/GRANT SELECT ON[^;]*public\.(?:offices|jobs|media_assets|pages|site_settings)[^;]*TO authenticated/);
 assert.doesNotMatch(patch,/SECURITY DEFINER|USING\s*\(\s*true\s*\)/i);
});
test('four source-backed own-row columns are SELECT-only',()=>{
 for(const [t,col] of [['applications','user_id'],['office_members','user_id'],['posts','author_id'],['topics','created_by']]){
  assert.match(patch,new RegExp('ON public\\.'+t+' FOR SELECT TO authenticated\\s+USING \\(\\(SELECT auth\\.uid\\(\\)\\) IS NOT NULL AND '+col+'=\\(SELECT auth\\.uid\\(\\)\\)\\)'));
 }
 assert.doesNotMatch(patch,/GRANT\s+(?:INSERT|UPDATE|DELETE)\s+ON/i);
});
test('synthetic A/B, null owner, anonymous and mutation checks exist',()=>{
 for(const v of ['00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1'])assert.match(fixture,new RegExp(v));
 assert.match(fixture, /Unassigned/);
 assert.match(ab,/SET ROLE anon/);
 assert.match(ab,/SET ROLE authenticated/);
 assert.match(ab,/EXCEPTION WHEN insufficient_privilege/);
});

test('synthetic profile identities never receive public or authenticated grants',()=>{
 assert.doesNotMatch(fixture,/ON ALL TABLES IN SCHEMA public TO anon/i);
 assert.match(fixture,/GRANT SELECT,INSERT,UPDATE,DELETE ON public\.applications/);
 assert.doesNotMatch(fixture,/GRANT [^;]*public\.profiles[^;]*TO anon/i);
 assert.match(ab,/Anonymous synthetic identity SELECT succeeded/);
 assert.match(ab,/Synthetic identity directory is readable/);
});
