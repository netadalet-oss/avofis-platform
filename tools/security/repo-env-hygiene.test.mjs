import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {isSensitiveEnvPath, findTrackedSensitiveEnv, inspectGitIndex} from './repo-env-hygiene.mjs';

test('block local .env variants in root and any workspace', () => {
  for(const p of ['.env','admin/.env.local','portal/.env.production','api/.env.test.local','admin\\.env.local']){
    assert.equal(isSensitiveEnvPath(p), true, p);
  }
});
test('allow public source files and explicitly synthetic examples', () => {
  for(const p of ['.env.example','admin/.env.example','README.md','admin/src/lib/supabase.ts']){
    assert.equal(isSensitiveEnvPath(p), false, p);
  }
});
test('audit cannot be tricked into treating duplicates as safe', () => {
  assert.deepEqual(findTrackedSensitiveEnv(['admin/.env.local','README.md','admin/.env.local']),['admin/.env.local','admin/.env.local']);
  assert.throws(()=>findTrackedSensitiveEnv('admin/.env.local'),TypeError);
});
test('git index does not include environment credential files', () => {
  const result=inspectGitIndex();
  assert.ok(result.tracked_count > 0);
  assert.deepEqual(result.forbidden_paths,[]);
});
test('gitignore protects nested local env while keeping example files allowed', () => {
  const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
  const content=fs.readFileSync(resolve(root,'.gitignore'),'utf8');
  assert.match(content,/^\*\*\/\.env\.\*$/m);
  assert.match(content,/^!\*\*\/\.env\.example$/m);
});
