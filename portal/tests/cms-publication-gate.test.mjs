import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { canOfferCmsEditing, refuseUnverifiedCmsWrite, CMS_PUBLICATION_UNAVAILABLE } from '../src/lib/cms-publication-gate.ts';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../src');
const read=p=>readFileSync(resolve(root,p),'utf8');
const cmsComponents=['EditableText','EditableCardGrid','EditableColumnList','EditableList','EditableMetaCardGrid','EditableStatGrid'];
const protectedFiles=['app/page.tsx','components/site-header.tsx',...cmsComponents.map(n=>'components/cms/'+n+'.tsx')];

test('public CMS editing is fail closed regardless of user metadata',()=>{
 assert.equal(canOfferCmsEditing(),false);
 assert.match(CMS_PUBLICATION_UNAVAILABLE,/kapalıdır/);
});
test('unverified publication is rejected locally with no I/O',async()=>{
 assert.deepEqual(await refuseUnverifiedCmsWrite(),{error:{message:CMS_PUBLICATION_UNAVAILABLE}});
 const src=read('lib/cms-publication-gate.ts');
 assert.doesNotMatch(src,/\bfetch\s*\(|createClient\s*\(|\.from\s*\(|localStorage|sessionStorage/i);
});
test('eight CMS surfaces never trust user-editable metadata for publishing',()=>{
 for(const p of protectedFiles){
  const src=read(p);
  assert.doesNotMatch(src,/user_metadata\??\.\s*role|user_metadata\s*\[\s*["']role["']\s*\]/,p);
  assert.match(src,/canOfferCmsEditing\(\)/,p);
 }
});
test('homepage and site menu cannot directly write to Supabase',()=>{
 for(const p of protectedFiles)assert.doesNotMatch(read(p),/\.(?:upsert|insert|update|delete)\s*\(/,p);
 for(const p of ['app/page.tsx','components/site-header.tsx']){
  assert.match(read(p),/refuseUnverifiedCmsWrite\(\)/,p);
  assert.match(read(p),/\.select\s*\(/,p);
 }
});
test('six editable content controls are all gated by server-only publishing prerequisite',()=>{
 for(const n of cmsComponents){
  const src=read('components/cms/'+n+'.tsx');
  assert.match(src,/const canEdit = canOfferCmsEditing\(\);/,n);
  assert.doesNotMatch(src,/const canEdit = isAdmin|role === "admin"/,n);
 }
});
