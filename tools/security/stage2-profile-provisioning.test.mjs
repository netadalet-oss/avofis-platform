import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '../../database/staging');
const read=name=>readFileSync(resolve(root,name),'utf8');
const fixture=read('s2_profile_fixture.sql');
const proposal=read('s2_profile_provisioning_draft.sql');
const seed=read('s2_profile_provisioning_seed.sql');
const ab=read('s2_profile_ab_test.sql');

test('every script refuses a non-disposable database',()=>{
 for(const s of [fixture,proposal,seed,ab]){
  assert.match(s,/current_database\(\)\s*<>\s*'avofis_s2_profile_test'/);
  assert.match(s,/RAISE EXCEPTION/);
 }
});
test('profile fixture exactly mirrors source-backed Auth FK and default user',()=>{
 assert.match(fixture,/id uuid PRIMARY KEY REFERENCES auth\.users\(id\) ON DELETE CASCADE/);
 assert.match(fixture,/role text DEFAULT 'user'/);
 assert.match(fixture,/ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY/);
 assert.doesNotMatch(fixture,/email text|raw_app_meta_data|CREATE TRIGGER/i);
});
test('no privileged definer, public trigger or self-granted role is permitted',()=>{
 for(const s of [fixture,proposal,seed,ab]){
  const executable=s.replace(/^--[^\n]*/gm,'');
  assert.doesNotMatch(executable,/SECURITY DEFINER|CREATE TRIGGER|GRANT\s+[^\n;]*provisioner\s+TO\s+(?:anon|authenticated)/i);
 }
 assert.match(proposal,/REVOKE ALL PRIVILEGES ON public\.profiles FROM PUBLIC,anon,authenticated/);
 assert.match(proposal,/GRANT SELECT ON public\.profiles TO authenticated/);
 assert.match(proposal,/GRANT INSERT ON public\.profiles TO avofis_s2_profile_provisioner/);
 assert.doesNotMatch(proposal,/GRANT (?:INSERT|UPDATE|DELETE|ALL) ON public\.profiles TO authenticated/);
});
test('RLS holds privileged inserts to basic role regardless of self-asserted metadata',()=>{
 assert.match(proposal,/FOR INSERT TO avofis_s2_profile_provisioner/);
 assert.match(proposal,/WITH CHECK \(role='user' AND id IS NOT NULL\)/);
 assert.match(proposal,/id=\(SELECT auth\.uid\(\)\)/);
 assert.match(seed,/SET LOCAL ROLE avofis_s2_profile_provisioner/);
 assert.match(seed,/INSERT INTO public\.profiles\(id\)/);
 assert.doesNotMatch(seed,/INSERT INTO public\.profiles\(id,\s*role\).*raw_user_meta_data/i);
 assert.doesNotMatch(proposal,/user_metadata|raw_user_meta_data|auth\.role\(\)/i);
});
test('two principals, malicious metadata, outsider C, null session and denies are exercised',()=>{
 for(const x of ['00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-0000000000c1']){
  assert.match(fixture,new RegExp(x));
 }
 assert.match(fixture,/"role":"super_admin"/);
 assert.match(ab,/SET ROLE anon/);
 assert.match(ab,/SET ROLE authenticated/);
 assert.match(ab,/Missing identity/);
 assert.match(ab,/Authenticated user updated its role/);
 assert.match(ab,/Unauthorized elevated profile C/);
 assert.doesNotMatch(ab,/unique_violation THEN NULL/);
});
