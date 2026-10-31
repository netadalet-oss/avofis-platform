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
test('admin CMS page must revalidate before all four persisted saves',()=>{
 assert.equal((page.match(/await requireCmsWriteAccess\(\)/g)||[]).length,4);
 for(const action of ['saveHero','saveNavigation','saveModules','saveFooter']){
   const pos=page.indexOf('async function '+action+'()');
   assert.ok(pos>=0,'missing handler '+action);
   const body=page.slice(pos,pos+430);
   assert.match(body,/await requireCmsWriteAccess\(\)/,action);
   assert.match(body,/if \(!\(await requireCmsWriteAccess\(\)\)\) return;/,action);
 }
});
test('denied authorization revokes admin UI and never writes',()=>{
 const pos=page.indexOf('async function requireCmsWriteAccess()');
 assert.ok(pos>0);
 const body=page.slice(pos,pos+500);
 assert.match(body,/setIsAuthorized\(false\)/);
 assert.match(body,/canCurrentUserWriteCms\(supabase\)/);
});
test('auth event revokes stale admin access before asynchronous recheck',()=>{
 assert.match(page,/onAuthStateChange\(/);
 assert.match(page,/const generation = \+\+authGeneration\.current/);
 assert.match(page,/setIsAuthorized\(false\)/);
 assert.match(page,/queueMicrotask\(/);
 assert.match(page,/authGeneration\.current === generation/);
});
test('initial auth check uses verified getUser, not local getSession',()=>{
 assert.match(page,/supabase\.auth\.getUser\(\)/);
 assert.doesNotMatch(page,/supabase\.auth\.getSession\(\)/);
});
test('unsafe user metadata cannot grant CMS role',()=>{
 assert.match(page,/isCmsAdminRole\(profile\?\.role\)/);
 assert.doesNotMatch(page,/session\.user\.user_metadata/);
});
test('no server-side role bypass or service secret is used',()=>{
 const guardSrc=fs.readFileSync(guardPath,'utf8');
 assert.doesNotMatch(guardSrc,/service_role|SECURITY DEFINER|\.upsert\(|\.insert\(/);
});
