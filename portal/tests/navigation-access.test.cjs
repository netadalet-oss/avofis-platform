'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),T=require('typescript');
const root=path.resolve(__dirname,'..');
function tsModule(p,requireFn=()=>{throw Error('Unexpected import')}) {
 const f=path.join(root,p);
 const src=T.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:T.ModuleKind.CommonJS,target:T.ScriptTarget.ES2020}}).outputText;
 const m={exports:{}};
 new Function('module','exports','require',src)(m,m.exports,requireFn);
 return m.exports;
}
const access=tsModule('src/lib/navigation-access.ts',s=> {
 if(s==='./cms-access')return {hasPortalCmsAdminAccess:async()=>true};
 throw Error('Invalid import: '+s);
});
const {saveVerifiedNavigation}=access;
function fake(opts={}) {
 const calls=[],identity=opts.identity??'admin-1', role=opts.role??'admin';
 return {calls,client:{
   auth:{async getUser(){return {data:{user:identity?{id:identity}:null},error:opts.authError?{message:'Auth failed'}:null};}},
   from(table){
     calls.push(['from',table]);
     return {select(field){
       calls.push(['select-profile',field]);
       return {eq(col,id){
         calls.push(['profile',col,id]);
         return {async maybeSingle(){return {data:{role},error:opts.roleError?{message:'denied'}:null};}};
       }};
     },update(data){
       calls.push(['update',data]);
       return {eq(col,val){calls.push(['eq',col,val]);return this;},
               async select(field){calls.push(['return',field]);return opts.result??{data:[{id:'row'}],error:null};}};
     }};
   }
 }};
}
const nav=[{label:'Hukuk',href:'/cases'}];
test('verified admin and existing navigation can update exactly one row',async()=>{
 const {client,calls}=fake();const res=await saveVerifiedNavigation(client,'admin-1',nav,nav);
 assert.deepEqual(res,{error:null});
 assert.ok(calls.some(c=>c[0]==='update'));
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='key'&&c[2]==='navigation'));
 assert.ok(calls.some(c=>c[0]==='eq'&&c[1]==='value'&&c[2]===JSON.stringify(nav)));
});
test('changed current user cannot write',async()=>{
 const {client,calls}=fake({identity:'other'});
 assert.ok((await saveVerifiedNavigation(client,'admin-1',nav,nav)).error);
 assert.equal(calls.some(c=>c[0]==='update'),false);
});
test('missing admin session cannot write',async()=>{
 const {client,calls}=fake();
 assert.ok((await saveVerifiedNavigation(client,null,nav,nav)).error);
 assert.deepEqual(calls,[]);
});
test('missing server baseline refuses writes',async()=>{
 const {client,calls}=fake();
 assert.ok((await saveVerifiedNavigation(client,'admin-1',nav,null)).error);
 assert.deepEqual(calls,[]);
});
test('empty or malformed proposed menu refuses writes',async()=>{
 const {client,calls}=fake();
 assert.ok((await saveVerifiedNavigation(client,'admin-1',[],nav)).error);
 assert.ok((await saveVerifiedNavigation(client,'admin-1',[{label:'',href:'/'}],nav)).error);
 assert.deepEqual(calls,[]);
});
test('authentication failure refuses writes',async()=>{
 const {client,calls}=fake({authError:true});
 assert.ok((await saveVerifiedNavigation(client,'admin-1',nav,nav)).error);
 assert.deepEqual(calls,[]);
});
test('RLS returns 0 modified rows: never report success',async()=>{
 const {client}=fake({result:{data:[],error:null}});
 assert.ok((await saveVerifiedNavigation(client,'admin-1',nav,nav)).error);
});
test('RLS returns error: never report success',async()=>{
 const {client}=fake({result:{data:null,error:{message:'denied'}}});
 assert.equal((await saveVerifiedNavigation(client,'admin-1',nav,nav)).error.message,'denied');
});
test('two modified rows cannot be accepted',async()=>{
 const {client}=fake({result:{data:[{id:'a'},{id:'b'}],error:null}});
 assert.ok((await saveVerifiedNavigation(client,'admin-1',nav,nav)).error);
});
test('header does not trust user_metadata and never upserts navigation',()=>{
 const src=fs.readFileSync(path.join(root,'src/components/site-header.tsx'),'utf8');
 assert.doesNotMatch(src,/user_metadata|\.upsert\(/);
 assert.match(src,/hasPortalCmsAdminAccess\(supabase,\s*currentUserId\)/);
 assert.match(src,/saveVerifiedNavigation\(/);
});
test('header has token- and identity-scoped verified access',()=>{
 const src=fs.readFileSync(path.join(root,'src/components/site-header.tsx'),'utf8');
 assert.match(src,/verifiedAdmin\?\.userId === currentUserId/);
 assert.match(src,/verifiedAdmin\.token === currentToken/);
 assert.match(src,/setVerifiedAdmin\(null\)/);
});
test('header uses original loaded navigation value as CAS precondition',()=>{
 const src=fs.readFileSync(path.join(root,'src/components/site-header.tsx'),'utf8');
 assert.match(src,/navigationBaseline\.current = JSON\.parse/);
 assert.match(src,/normalizedItems,\s*navigationBaseline\.current/);
});
