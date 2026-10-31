'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const src = fs.readFileSync(path.resolve(__dirname, '../src/app/cms/page.tsx'), 'utf8');
const file = ts.createSourceFile('page.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const fn = [];
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'previewDefaults') fn.push(node);
  ts.forEachChild(node, visit);
}
visit(file);
const handler = fn[0];
const body = handler && src.slice(handler.body.pos, handler.body.end);
function callNames(node, out=[]) {
  if(ts.isCallExpression(node))out.push(node.expression.getText(file));
  ts.forEachChild(node, n=>{ callNames(n,out); });
  return out;
}
test('exactly one explicit previewDefaults handler exists',()=>{
  assert.equal(fn.length,1);
  assert.ok(body);
});
test('default preview cannot query or mutate Supabase',()=>{
  assert.doesNotMatch(body, /\bsupabase\b|\.from\(|\.upsert\(|\.update\(|\.insert\(|fetch\(/);
});
test('default preview cannot invoke any persistence helper',()=>{
  assert.doesNotMatch(body, /updateAdminHomeHero|updateExistingSetting|saveHero|saveNavigation|saveModules|saveFooter|loadHero|reloadAll/);
});
test('all handler calls belong to local React state setters',()=>{
  const called=callNames(handler.body);
  const allowed=new Set(['setMessage','setHeroTitle','setHeroSubtitle','setNavigation','setModules','setFooterColumns']);
  assert.ok(called.length>=7);
  for(const name of called)assert.ok(allowed.has(name),'unexpected function call '+name);
});
test('preview does not advance stored content baselines',()=>{
  assert.doesNotMatch(body, /\bheroBaseline\b|\bsettingBaseline\b/);
});
test('defaults preview cannot run for unauthorized or saving session',()=>{
  assert.match(body, /if\s*\(!isAuthorized\s*\|\|\s*saving\)\s*return/);
});
test('preview reports explicitly that nothing was saved',()=>{
  assert.match(body,/veritabanına kaydedilmedi/);
  assert.match(body,/ayrı ayrı kaydedin/);
});
test('CMS button advertises preview rather than persisted reset',()=>{
  assert.match(src,/onClick=\{previewDefaults\}/);
  assert.match(src,/Varsayılanları Önizle \(Kaydetmez\)/);
  assert.doesNotMatch(src,/onClick=\{loadDefaults\}/);
});
test('no accidental multistep CMS reset messages remain',()=>{
  assert.doesNotMatch(src,/Varsayılan içerikler başarıyla yüklendi/);
  assert.doesNotMatch(src,/Önceki adımlar uygulanmış olabilir/);
});
test('each remaining explicit save uses single-row CAS helper',()=>{
  assert.equal((src.match(/updateAdminHomeHero\(supabase/g)||[]).length,1);
  assert.equal((src.match(/updateExistingSetting\(/g)||[]).length,3);
});
test('preview does not misreport historical stage progress',()=>{
  assert.doesNotMatch(body,/stage|seviye|%80|onaylandi/i);
});
