'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const helperPath = path.join(root, 'src/lib/cms-persistence.ts');
const cmsPage = fs.readFileSync(path.join(root, 'src/app/cms/page.tsx'), 'utf8');
const js = ts.transpileModule(fs.readFileSync(helperPath, 'utf8'), {
  fileName: helperPath,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const entry = { exports: {} };
new Function('module', 'exports', js)(entry, entry.exports);
const { updateAdminHomeHero, updateExistingSetting } = entry.exports;

const one = [{ id: 'uuid-1' }];
function fake(results = {}, calls = []) {
  return {
    from(table) {
      calls.push(['from', table]);
      return {
        select(column) {
          calls.push(['select', column]);
          return {
            eq(field, value) {
              calls.push(['eq-read', field, value]);
              return {
                async maybeSingle() { return results.read ?? { data: { content: { hero: { title:'old' }, modules:['keep'], statsItems:[1] } }, error:null }; }
              };
            }
          };
        },
        update(payload) {
          calls.push(['update', payload]);
          return {
            eq(field, value) {
              calls.push(['eq-update', field, value]);
              return {
                async select(column) {
                  calls.push(['return', column]);
                  return results.update ?? { data:one, error:null };
                }
              };
            }
          };
        },
        insert() { throw Error('INSERT must not be used'); },
        upsert() { throw Error('UPSERT must not be used'); }
      };
    }
  };
}
const hero = { title:'new title', subtitle:'new subtitle' };
test('admin hero only changes existing page and preserves other top-level CMS data', async () => {
  const calls=[];
  const r=await updateAdminHomeHero(fake({},calls),hero);
  assert.deepEqual(r,{error:null});
  assert.deepEqual(calls[0],['from','pages']);
  assert.deepEqual(calls[1],['select','content']);
  assert.deepEqual(calls[2],['eq-read','slug','home']);
  const upd=calls.find(x=>x[0]==='update');
  assert.deepEqual(upd[1],{content:{hero,modules:['keep'],statsItems:[1]}});
  assert.deepEqual(calls.slice(-2),[['eq-update','slug','home'],['return','id']]);
});
test('read denied by RLS: do not update', async () => {
  const calls=[];
  const r=await updateAdminHomeHero(fake({read:{data:null,error:{message:'permission denied'}}},calls),hero);
  assert.match(r.error?.message||'',/permission denied/);
  assert.equal(calls.some(x=>x[0]==='update'),false);
});
for(const content of [null, undefined, [], 'not-object', 42]){
  test('unavailable or malformed homepage content fails without overwriting: '+String(content),async ()=>{
    const calls=[];
    const r=await updateAdminHomeHero(fake({read:{data:{content},error:null}},calls),hero);
    assert.ok(r.error);
    assert.equal(calls.some(x=>x[0]==='update'),false);
  });
}
test('zero updated homepage rows never reports success',async ()=>{
  assert.ok((await updateAdminHomeHero(fake({update:{data:[],error:null}}),hero)).error);
});
test('two updated homepage rows never reports success',async ()=>{
  assert.ok((await updateAdminHomeHero(fake({update:{data:[{id:'one'},{id:'two'}],error:null}}),hero)).error);
});
test('one returned row without ID cannot claim persistence',async ()=>{
  assert.ok((await updateAdminHomeHero(fake({update:{data:[{}],error:null}}),hero)).error);
});
test('database update error propagated, not swallowed as success',async ()=>{
  assert.equal((await updateAdminHomeHero(fake({update:{data:null,error:{message:'denied'}}}),hero)).error.message,'denied');
});
test('exceptions fail closed without leaking exception text',async ()=>{
  const r=await updateAdminHomeHero({from(){throw Error('connection-secret');}},hero);
  assert.ok(r.error);
  assert.doesNotMatch(r.error.message,/connection-secret/);
});
for(const key of ['navigation','modules','footer']){
  test('setting '+key+' only updates existing key and checks result',async ()=>{
    const calls=[];
    const r=await updateExistingSetting(fake({},calls),key,['v1']);
    assert.deepEqual(r,{error:null});
    assert.deepEqual(calls,[['from','site_settings'],['update',{value:['v1']}],['eq-update','key',key],['return','id']]);
  });
}
test('invalid settings key returns error without DB call',async ()=>{
  const r=await updateExistingSetting({from(){throw Error('should not call DB');}},'privileged',[]);
  assert.ok(r.error);
});
test('setting 0 rows from RLS/absent key cannot claim saved',async ()=>{
  assert.ok((await updateExistingSetting(fake({update:{data:[],error:null}}),'footer',[])).error);
});
test('setting 2 rows cannot claim saved',async ()=>{
  assert.ok((await updateExistingSetting(fake({update:{data:[{id:1},{id:2}],error:null}}),'footer',[])).error);
});
test('setting database error remains failure',async ()=>{
  assert.equal((await updateExistingSetting(fake({update:{data:null,error:{message:'denied'}}}),'footer',[])).error.message,'denied');
});
test('setting exception does not expose transport secret',async ()=>{
  const r=await updateExistingSetting({from(){throw Error('SECRET');}},'modules',[]);
  assert.ok(r.error);
  assert.doesNotMatch(r.error.message,/SECRET/);
});
test('admin CMS page has no upsert or insert paths',()=>{
  assert.doesNotMatch(cmsPage,/\.upsert\(/);
  assert.doesNotMatch(cmsPage,/\.insert\(/);
});
test('all 8 former upserts now use existing-row update functions',()=>{
  assert.equal((cmsPage.match(/updateAdminHomeHero\(supabase/g)||[]).length,2);
  assert.equal((cmsPage.match(/updateExistingSetting\(/g)||[]).length,6);
});
test('admin CMS retains database-backed role check',()=>{
  assert.match(cmsPage,/allowed = isCmsAdminRole\(profile\?\.role\)/);
  assert.doesNotMatch(cmsPage,/session\.user\.user_metadata\?\.role/);
});
test('helper does not insert, upsert or bypass RLS',()=>{
  const s=fs.readFileSync(helperPath,'utf8');
  assert.doesNotMatch(s,/\.upsert\(|\.insert\(|service_role|SECURITY DEFINER/);
});
