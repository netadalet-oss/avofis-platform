'use strict';
// Historical v17 active-editor regression remains in Git history.
// The current CMS page is intentionally CLOSED; validate its current contract.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const page=fs.readFileSync(path.resolve(__dirname,'../src/app/cms/page.tsx'),'utf8');
const ast=ts.createSourceFile('page.tsx',page,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function nodes(predicate){const result=[];function walk(n){if(predicate(n))result.push(n);ts.forEachChild(n,walk);}walk(ast);return result;}
test('CMS informational page parses and does not run in client mode',()=>{
 assert.equal(ast.parseDiagnostics.length,0);
 assert.doesNotMatch(page,/"use client"/);
});
test('closed CMS screen has no reachable save, preview or DB interaction',()=>{
 for(const name of ['previewDefaults','saveHero','saveNavigation','saveModules','saveFooter',
 'updateAdminHomeHero','updateExistingSetting','supabase','fetch','requireCmsWriteAccess']){
  assert.equal(nodes(n=>ts.isIdentifier(n)&&n.text===name).length,0,name);
 }
});
test('closed CMS screen renders no editor controls or events',()=>{
 const prohibited=new Set(['form','button','input','textarea','select']);
 for(const n of nodes(n=>ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))){
  assert.equal(prohibited.has(n.tagName.getText(ast)),false,n.tagName.getText(ast));
 }
 for(const n of nodes(ts.isJsxAttribute))
  assert.equal(['onClick','onSubmit','onChange'].includes(n.name.text),false,n.name.text);
});
test('CMS publication notice explains identity, language, legal and second-person review',()=>{
 for(const required of ['henüz kullanıma açık değildir','Kişiye özel personel yetkisi',
 'hukukî ve dilsel gözden geçirme','ikinci kişinin yayın onayı'])
  assert.ok(page.includes(required),required);
 assert.match(page,/bir içeriğin yayımlandığını veya bir personelin işlem yetkisi bulunduğunu göstermez/);
});
test('closed CMS screen imports only navigation Link; no data clients',()=>{
 assert.deepEqual(nodes(ts.isImportDeclaration).map(n=>n.moduleSpecifier.text),['next/link']);
});
