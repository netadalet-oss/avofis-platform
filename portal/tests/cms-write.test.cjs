'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const helperFile = path.join(root, 'src/lib/cms-write.ts');
const pageFile = path.join(root, 'src/app/page.tsx');
const js = ts.transpileModule(fs.readFileSync(helperFile, 'utf8'), {
  fileName: helperFile,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const moduleRef = { exports: {} };
new Function('module', 'exports', js)(moduleRef, moduleRef.exports);
const { updateExistingHomeContent } = moduleRef.exports;

function fakeClient(result, calls = []) {
  return {
    from(table) {
      calls.push(['from',table]);
      return {
        update(payload) {
          calls.push(['update',payload]);
          return {
            eq(field,value) {
              calls.push(['eq',field,value]);
              return {
                async select(fields) {
                  calls.push(['select',fields]);
                  return result;
                }
              };
            }
          };
        },
        insert() { throw Error('insert prohibited'); },
        upsert() { throw Error('upsert prohibited'); }
      };
    }
  };
}
test('updates only the existing uniquely identified home row', async () => {
  const calls = [];
  const content = { hero: { title:'updated' } };
  const result = await updateExistingHomeContent(fakeClient({ data:[{id:'123'}], error:null }, calls), content);
  assert.deepEqual(result, {error:null});
  assert.deepEqual(calls, [
    ['from','pages'], ['update',{content}], ['eq','slug','home'], ['select','id']
  ]);
});
test('returns a user-visible error if RLS blocks update (0 rows)', async () => {
  const r = await updateExistingHomeContent(fakeClient({data:[],error:null}),{hero:{}});
  assert.match(r.error?.message||'',/doğrulanamadı/);
});
test('returns failure on an unexpected two-row update', async () => {
  const r = await updateExistingHomeContent(fakeClient({data:[{id:'1'},{id:'2'}],error:null}),{hero:{}});
  assert.ok(r.error);
});
test('does not invent persistence when select result is missing', async () => {
  const r = await updateExistingHomeContent(fakeClient({data:null,error:null}),{hero:{}});
  assert.ok(r.error);
});
test('rejects affected row without verified id', async () => {
  const r = await updateExistingHomeContent(fakeClient({data:[{}],error:null}),{hero:{}});
  assert.ok(r.error);
});
test('forwards database permission failure', async () => {
  const r = await updateExistingHomeContent(fakeClient({data:null,error:{message:'permission denied for table pages'}}),{hero:{}});
  assert.equal(r.error.message,'permission denied for table pages');
});
test('handles transport or runtime exception without reporting success', async () => {
  const r = await updateExistingHomeContent({from(){throw Error('network secret');}}, {});
  assert.ok(r.error);
  assert.doesNotMatch(r.error.message,/network secret/);
});
test('does not perform an implicit INSERT or UPSERT', async () => {
  const calls=[];
  await updateExistingHomeContent(fakeClient({data:[{id:'abc'}],error:null},calls),{});
  assert.ok(!calls.some(c=>['insert','upsert'].includes(c[0])));
});
test('portal contains exactly two verified update call sites', () => {
  const page = fs.readFileSync(pageFile,'utf8');
  assert.equal((page.match(/updateExistingHomeContent\(supabase, nextContent\)/g)||[]).length,2);
});
test('portal no longer calls the previous unsafe pages upsert', () => {
  const page = fs.readFileSync(pageFile,'utf8');
  assert.doesNotMatch(page, /\.from\(["']pages["']\)\s*\.upsert\(/);
});
test('write helper uses equality on backed unique slug key, never creates rows', () => {
  const src = fs.readFileSync(helperFile,'utf8');
  assert.match(src,/\.update\(\{\s*content\s*\}\)/);
  assert.match(src,/\.eq\(["']slug["'],\s*["']home["']\)/);
  assert.match(src,/\.select\(["']id["']\)/);
  assert.doesNotMatch(src, /\.upsert\(/);
  assert.doesNotMatch(src, /\.insert\(/);
});
test('portal keeps both admin authorization checks on mutations', () => {
  const page=fs.readFileSync(pageFile,'utf8');
  for(const func of ['saveContentField','saveHeroField']) {
    const i=page.indexOf('function '+func);
    assert.ok(i>0,func);
    assert.match(page.slice(i,i+200),/if \(!isAdmin\)/,func);
  }
});
