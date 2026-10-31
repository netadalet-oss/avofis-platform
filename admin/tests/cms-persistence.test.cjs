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
const one = [{ id:'uuid-1' }];
const before = { hero:{title:'old'}, modules:['keep'], statsItems:[1] };
const hero = { title:'changed', subtitle:'subtitle' };
function fake(response = { data:one, error:null }, calls = []) {
  return {
    from(table) {
      calls.push(['from',table]);
      return {
        update(payload) {
          calls.push(['update',payload]);
          return {
            eq(column, value) {
              calls.push(['eq',column,value]);
              return this;
            },
            async select(columns) {
              calls.push(['return',columns]);
              return response;
            }
          };
        },
        select() { throw Error('A write must not fetch a fresh snapshot at save time'); },
        insert() { throw Error('INSERT prohibited'); },
        upsert() { throw Error('UPSERT prohibited'); },
      };
    }
  };
}
test('home hero update preserves unrelated CMS fields using originally loaded snapshot', async ()=>{
  const calls=[];
  const result=await updateAdminHomeHero(fake(undefined,calls),hero,before);
  assert.deepEqual(result,{error:null,updatedContent:{...before,hero}});
  assert.deepEqual(calls,[
    ['from','pages'],
    ['update',{content:{...before,hero}}],
    ['eq','slug','home'],
    ['eq','content',JSON.stringify(before)],
    ['return','id']
  ]);
});
for(const snapshot of [null,undefined,[],42,'invalid']){
  test('cannot update missing or malformed original snapshot '+String(snapshot),async ()=>{
    const calls=[];
    const r=await updateAdminHomeHero(fake(undefined,calls),hero,snapshot);
    assert.ok(r.error);
    assert.deepEqual(calls,[]);
  });
}
test('stale homepage editor gets 0 affected rows, which must never claim success',async ()=>{
  const r=await updateAdminHomeHero(fake({data:[],error:null}),hero,before);
  assert.ok(r.error);
  assert.match(r.error.message,/değişmiş/);
});
test('multiple returned rows do not count as success',async ()=>{
  assert.ok((await updateAdminHomeHero(fake({data:[{id:1},{id:2}],error:null}),hero,before)).error);
});
test('missing returned id does not count as success',async ()=>{
  assert.ok((await updateAdminHomeHero(fake({data:[{}],error:null}),hero,before)).error);
});
test('RLS error is surfaced and is not treated as success',async ()=>{
  assert.equal((await updateAdminHomeHero(fake({data:null,error:{message:'permission denied'}}),hero,before)).error.message,'permission denied');
});
test('exception is fail closed without exposing internal error detail',async ()=>{
  const r=await updateAdminHomeHero({from(){throw Error('token-secret');}},hero,before);
  assert.ok(r.error);
  assert.doesNotMatch(r.error.message,/token-secret/);
});
test('semantic atomic compare-and-swap precondition depends on ORIGINAL content',async ()=>{
  const earlier={hero:{title:'original'},statsItems:[5]};
  const calls=[];
  await updateAdminHomeHero(fake(undefined,calls),hero,earlier);
  assert.deepEqual(calls.find(x=>x[0]==='eq'&&x[1]==='content'),['eq','content',JSON.stringify(earlier)]);
});
for(const key of ['navigation','modules','footer']){
  test('setting '+key+' uses loaded value CAS before saving',async ()=>{
    const calls=[];
    const original=['old',{id:1}];
    const r=await updateExistingSetting(fake(undefined,calls),key,['new'],original);
    assert.deepEqual(r,{error:null});
    assert.deepEqual(calls,[
      ['from','site_settings'],['update',{value:['new']}],
      ['eq','key',key],['eq','value',JSON.stringify(original)],['return','id']
    ]);
  });
}
test('settings key cannot be arbitrary',async ()=>{
  const calls=[];
  assert.ok((await updateExistingSetting(fake(undefined,calls),'roles',[],[])).error);
  assert.deepEqual(calls,[]);
});
test('settings reject missing initial loaded value before DB access',async ()=>{
  const calls=[];
  assert.ok((await updateExistingSetting(fake(undefined,calls),'navigation',[],null)).error);
  assert.deepEqual(calls,[]);
});
test('settings reject nonarray original snapshot to avoid destructive rewrite',async ()=>{
  assert.ok((await updateExistingSetting(fake(),'footer',[],{foo:1})).error);
});
test('settings reject malformed proposed value',async ()=>{
  assert.ok((await updateExistingSetting(fake(),'modules',{foo:1},[])).error);
});
test('settings conflict with 0 affected rows fails closed',async ()=>{
  assert.ok((await updateExistingSetting(fake({data:[],error:null}),'navigation',[],['old'])).error);
});
test('settings 2 affected rows fail closed',async ()=>{
  assert.ok((await updateExistingSetting(fake({data:[{id:1},{id:2}],error:null}),'navigation',[],['old'])).error);
});
test('settings RLS error is not suppressed',async ()=>{
  const r=await updateExistingSetting(fake({data:null,error:{message:'denied'}}),'modules',[],['old']);
  assert.equal(r.error.message,'denied');
});
test('settings exception hides transport details',async ()=>{
  const r=await updateExistingSetting({from(){throw Error('secret');}},'footer',[],['old']);
  assert.ok(r.error);
  assert.doesNotMatch(r.error.message,/secret/);
});
test('admin CMS page has no insert or upsert call sites',()=>{
  assert.doesNotMatch(cmsPage,/\.insert\(|\.upsert\(/);
});
test('all explicit CMS saves still use conditional-update helpers',()=>{
  // Bulk default reset is a local-only preview, not four database writes.
  assert.equal((cmsPage.match(/updateAdminHomeHero\(supabase/g)||[]).length,1);
  assert.equal((cmsPage.match(/updateExistingSetting\(/g)||[]).length,3);
});
test('immutable loaded snapshots are stored without sharing mutable UI objects',()=>{
  assert.match(cmsPage,/useRef<Record<string, unknown> \| null>/);
  assert.match(cmsPage,/heroBaseline\.current/);
  assert.match(cmsPage,/settingBaseline\.current\.(?:navigation|modules|footer)/);
  assert.ok((cmsPage.match(/JSON\.parse\(JSON\.stringify\(data\.value\)\)/g)||[]).length===3);
});
test('each explicit CMS save uses the original observed snapshot',()=>{
  assert.ok((cmsPage.match(/heroBaseline\.current\)/g)||[]).length===1);
  for(const key of ['navigation','modules','footer']){
    assert.equal((cmsPage.match(new RegExp('settingBaseline\\.current\\.'+key+'\\s*\\)','g'))||[]).length,1);
  }
});
test('admin page still authorizes using database profile role',()=>{
  assert.match(cmsPage,/allowed = isCmsAdminRole\(profile\?\.role\)/);
  assert.doesNotMatch(cmsPage,/session\.user\.user_metadata\?\.role/);
});
test('helper has no INSERT, upsert, service key or privileged bypass',()=>{
  const helper=fs.readFileSync(helperPath,'utf8');
  assert.doesNotMatch(helper,/\.insert\(|\.upsert\(|service_role|SECURITY DEFINER/);
});
