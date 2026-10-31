import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { safeNextPath as portalNext } from '../../portal/src/lib/safe-next-path.ts';
import { safeNextPath as adminNext } from '../../admin/src/lib/safe-next-path.ts';

const base=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>readFileSync(resolve(base,p),'utf8');

test('portal and admin preserve legitimate relative return paths',()=>{
 assert.equal(portalNext('/workspace?tab=files#top'),'/workspace?tab=files#top');
 assert.equal(portalNext('/dashboard'),'/dashboard');
 assert.equal(adminNext('/cms?revision=1'),'/cms?revision=1');
 assert.equal(adminNext('/dashboard'),'/dashboard');
});
test('external URLs, schemes, scheme-relative URLs and backslashes are rejected',()=>{
 const vectors=[
 'https://attacker.example/', 'http://attacker.example/', '//attacker.example/x',
 '/\\attacker.example','/\\\\attacker.example',
 'javascript:alert(1)','data:text/html,hi','mailto:someone@example.org',
 '   /cms','/%2f%2fattacker.example','/%5cattacker.example',
 '/%252f%252fattacker.example','/cms%0d%0aX-Evil:1',
 '\n/cms','/cms\0junk','/cms\u007f'
 ];
 for(const path of vectors){
  assert.equal(portalNext(path),'/dashboard','portal: '+JSON.stringify(path));
  assert.equal(adminNext(path),'/cms','admin: '+JSON.stringify(path));
 }
});
test('missing, huge, recursive login paths and auth paths fall back safely',()=>{
 const vectors=[null,undefined,'','/'.repeat(1050),
 '/auth/login','/auth/register','/auth/forgot-password','/login',
 '/../auth/login','/a/../auth/login','/AUTH/login'];
 for(const value of vectors){
  assert.equal(portalNext(value),'/dashboard');
  assert.equal(adminNext(value),'/cms');
 }
});
test('login pages use the tested sanitization on all redirects',()=>{
 for(const file of ['portal/src/app/auth/login/page.tsx','admin/src/app/auth/login/page.tsx']){
  const src=read(file);
  assert.match(src,/import \{ safeNextPath \} from "@\/lib\/safe-next-path";/);
  assert.doesNotMatch(src,/router\.replace\(next \|\|/);
  assert.match(src,/router\.replace\(safeNextPath\(next\)\);/);
  assert.doesNotMatch(src,/router\.push\(next\)/);
 }
});
test('signup stores only an unverified role request, not a verified role',()=>{
 const src=read('portal/src/app/auth/register/page.tsx');
 assert.match(src,/requested_role:\s*requestedRole/);
 assert.doesNotMatch(src,/\brole,\s*(?:\n|})/);
 assert.doesNotMatch(src,/\.from\("profiles"\)\.upsert/);
 assert.match(src,/meslekî yetki vermez|mesleki yetki vermez/i);
});
test('public dashboard does not claim a metadata role as verified professional status',()=>{
 const src=read('portal/src/app/dashboard/page.tsx');
 assert.doesNotMatch(src,/user\?\.user_metadata\?\.role/);
 assert.match(src,/doğrulanmadı/i);
});
