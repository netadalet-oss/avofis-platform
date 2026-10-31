'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const rolePath = path.join(root, 'src/lib/cms-role.ts');
const guardPath = path.join(root, 'src/lib/cms-current-access.ts');
const page = fs.readFileSync(path.join(root,'src/app/cms/page.tsx'),'utf8');

function compile(file) {
  return ts.transpileModule(fs.readFileSync(file,'utf8'),{
    fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
  }).outputText;
}
const role = {exports:{}};
new Function('module','exports',compile(rolePath))(role,role.exports);
const guard = {exports:{}};
new Function('module','exports','require',compile(guardPath))(guard,guard.exports,(request)=>{
  if(request==='./cms-role')return role.exports;
  throw Error('unexpected module: '+request);
});
const {canCurrentUserWriteCms}=guard.exports;
function fake(opts={}){
  const log=[], ids=opts.ids||['admin-uuid','admin-uuid'];let count=0;
  const client={
    auth:{async getUser(){
      log.push(['getUser',count]);
      if(opts.authThrows)throw Error('Auth down');
      if(opts.authError)return {data:{user:null},error:{message:'Auth failure'}};
      const id=ids[Math.min(count++,ids.length-1)];
      return {data:{user:id?{id,user_metadata:{role:'super_admin'}}:null},error:null};
    }},
    from(table){
      log.push(['from',table]);
      if(opts.profileThrows)throw Error('Profile lookup failure');
      return {select(fields){
        log.push(['select',fields]);
        return {eq(field,id){
          log.push(['eq',field,id]);
          return {async maybeSingle(){
            log.push(['maybeSingle']);
            if(opts.profileError)return {data:null,error:{message:'RLS denied'}};
            return {data:opts.profile??{role:'admin'},error:null};
          }};
        }};
      }};
    }
  };
  return {client,log};
}
test('database admin with verified identity can access CMS write UI',async()=>{
  const {client,log}=fake();
  assert.equal(await canCurrentUserWriteCms(client),true);
  assert.deepEqual(log.map(x=>x[0]),['getUser','from','select','eq','maybeSingle','getUser']);
  assert.deepEqual(log[3],['eq','id','admin-uuid']);
});
test('database super_admin role authorizes',async()=>{
  assert.equal(await canCurrentUserWriteCms(fake({profile:{role:'super_admin'}}).client),true);
});
test('database ADMIN case normalization authorizes',async()=>{
  assert.equal(await canCurrentUserWriteCms(fake({profile:{role:'ADMIN'}}).client),true);
});
for(const invalid of ['member','user','auditor',null,undefined,' admin',123]){
 test('unprivileged DB role fails closed: '+String(invalid),async()=>{
   assert.equal(await canCurrentUserWriteCms(fake({profile:{role:invalid}}).client),false);
 });
}
test('forged user_metadata role cannot grant access',async()=>{
 const {client}=fake({profile:{role:'member'}});
 assert.equal(await canCurrentUserWriteCms(client),false);
});
test('missing authenticated user is rejected before database lookup',async()=>{
 const {client,log}=fake({ids:[null]});
 assert.equal(await canCurrentUserWriteCms(client),false);
 assert.deepEqual(log.map(x=>x[0]),['getUser']);
});
test('Auth error is a denial',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake({authError:true}).client),false);
});
test('unexpected Auth exception fails closed',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake({authThrows:true}).client),false);
});
test('role-query transport exception fails closed',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake({profileThrows:true}).client),false);
});
test('RLS permission error fails closed even if role would be admin',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake({profileError:true}).client),false);
});
test('nonexistent profile is denied',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake({profile:null}).client),true);
 // undefined/null helper default is intentionally used in the mock; assert
 // missing profile using a standalone minimal client instead.
 const client={
  auth:{async getUser(){return {data:{user:{id:'u'}},error:null};}},
  from(){return {select(){return {eq(){return {async maybeSingle(){return {data:null,error:null};}};}};}};}
 };
 assert.equal(await canCurrentUserWriteCms(client),false);
});
test('switching accounts during role lookup invalidates authorization',async()=>{
 const {client}=fake({ids:['admin-uuid','other-uuid']});
 assert.equal(await canCurrentUserWriteCms(client),false);
});
test('session disappearance during lookup invalidates authorization',async()=>{
 const {client}=fake({ids:['admin-uuid',null]});
 assert.equal(await canCurrentUserWriteCms(client),false);
});
test('current admin CMS page is an unavailable informational view',()=>{
 assert.match(page,/Yayın ve içerik kontrolü/);
 assert.match(page,/düzenleme ve yayımlama işlemleri henüz kullanıma açık değildir/);
 assert.match(page,/ikinci kişinin yayın onayı/);
 assert.doesNotMatch(page,/"use client"|from ["']@supabase|from ["'].*cms-(?:role|persistence|current-access)|useEffect|useState/);
});
test('CMS page has no reachable DB query, helper or write handler',()=>{
 for(const text of ['.from(','.select(','.insert(','.upsert(','.update(','.delete(','.rpc(','canCurrentUserWriteCms(','requireCmsWriteAccess('])
   assert.ok(!page.includes(text),text);
});
test('working DB-role helper alone cannot unlock the closed CMS page',async()=>{
 assert.equal(await canCurrentUserWriteCms(fake().client),true);
 assert.doesNotMatch(page,/canCurrentUserWriteCms|cms-current-access/);
});
