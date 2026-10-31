'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');

const root=path.resolve(__dirname,'..');
function loadTs(relative) {
 const abs=path.join(root,relative);
 const code=ts.transpileModule(fs.readFileSync(abs,'utf8'),{
   fileName:abs,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
 }).outputText;
 const m={exports:{}};
 new Function('module','exports',code)(m,m.exports);
 return m.exports;
}
const r=loadTs('src/lib/local-research.ts');
const w=loadTs('src/lib/local-workspace.ts');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('pasted case can be added and retained in page-only memory',()=>{
 const {item,error}=r.createLocalText([],'a','  Karar  2026 ','Ayrıntılı karar metni');
 assert.equal(error,null); assert.equal(item.title,'Karar 2026');
 assert.equal(item.body,'Ayrıntılı karar metni');
});
test('cannot add empty research material',()=>{
 assert.ok(r.createLocalText([],'a','Title',' ').error);
 assert.ok(r.createLocalText([],'a',' ','Body').error);
});
test('duplicate research ID rejected, no accidental overwrite',()=>{
 assert.ok(r.createLocalText([{id:'a',title:'old',body:'old'}],'a','New','New').error);
});
test('research count limit is enforced',()=>{
 const items=Array.from({length:20},(_,i)=>({id:String(i),title:'x',body:'y'}));
 assert.ok(r.createLocalText(items,'new','title','body').error);
});
test('research text size limit is enforced',()=>{
 assert.ok(r.createLocalText([],'id','Title','x'.repeat(15001)).error);
});
test('Turkish case-insensitive search finds text in title and body',()=>{
 const items=[{id:'1',title:'İçtihat',body:'Yargılama'},
              {id:'2',title:'Diğer',body:'Zamanaşımı koşulları'}];
 assert.deepEqual(r.filterLocalTexts(items,'İÇTİHAT').map(x=>x.id),['1']);
 assert.deepEqual(r.filterLocalTexts(items,'zamanaşımı').map(x=>x.id),['2']);
});
test('research empty query returns all without mutating originals',()=>{
 const items=[{id:'x',title:'T',body:'B'}];
 assert.deepEqual(r.filterLocalTexts(items,' '),items);
 assert.notEqual(r.filterLocalTexts(items,' '),items);
});
test('research excerpt shows query context',()=>{
 const text='a'.repeat(130)+'zamanaşımı kararı';
 assert.match(r.excerpt(text,'zamanaşımı'),/zamanaşımı/);
});
test('remove research material preserves all other entries',()=>{
 const items=[{id:'1',title:'A',body:'A'},{id:'2',title:'B',body:'B'}];
 assert.deepEqual(r.removeLocalText(items,'1').map(x=>x.id),['2']);
});
test('cases and statutes are separate active workbench routes',()=>{
 const cases=read('src/app/cases/page.tsx');
 const statutes=read('src/app/statutes/page.tsx');
 assert.match(cases,/LocalResearchWorkbench/);
 assert.match(statutes,/LocalResearchWorkbench/);
 assert.match(cases,/İçtihat/);
 assert.match(statutes,/Mevzuat/);
});
test('workbench text is explicitly local and never promises external legal data',()=>{
 const src=read('src/components/research/local-research-workbench.tsx');
 assert.match(src,/Metinler sunucuya/);
 assert.match(src,/Gerçek hukuk/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(|\.from\(/);
});
test('local workspace can add a task',()=>{
 assert.deepEqual(w.createTask([],'1',' Kontrol et '),{id:'1',title:'Kontrol et',done:false});
});
test('blank or duplicate task rejected',()=>{
 const tasks=[{id:'1',title:'X',done:false}];
 assert.equal(w.createTask(tasks,'1','new'),null);
 assert.equal(w.createTask([],'2',' '),null);
});
test('completion can be toggled both ways',()=>{
 const tasks=[{id:'1',title:'X',done:false}];
 assert.equal(w.toggleTask(tasks,'1')[0].done,true);
 assert.equal(w.toggleTask(w.toggleTask(tasks,'1'),'1')[0].done,false);
 assert.equal(tasks[0].done,false);
});
test('filter open and completed tasks',()=>{
 const tasks=[{id:'1',title:'A',done:false},{id:'2',title:'B',done:true}];
 assert.deepEqual(w.filterTasks(tasks,'open').map(t=>t.id),['1']);
 assert.deepEqual(w.filterTasks(tasks,'done').map(t=>t.id),['2']);
 assert.equal(w.filterTasks(tasks,'all').length,2);
});
test('deleting task leaves other tasks intact',()=>{
 const tasks=[{id:'1',title:'A',done:false},{id:'2',title:'B',done:true}];
 assert.deepEqual(w.deleteTask(tasks,'1').map(t=>t.id),['2']);
});
test('note can be added',()=>{
 assert.deepEqual(w.createNote([],'n',' Başlık ',' İçerik '),{
   id:'n',title:'Başlık',content:'İçerik'
 });
});
test('blank note and duplicate note rejected',()=>{
 assert.equal(w.createNote([],'n',' ','Content'),null);
 assert.equal(w.createNote([{id:'n',title:'a',content:'b'}],'n','t','c'),null);
});
test('note size limited to safe in-memory amount',()=>{
 assert.equal(w.createNote([],'n','a','x'.repeat(6001)),null);
});
test('notes are removable without mutation',()=>{
 const list=[{id:'1',title:'A',content:'B'},{id:'2',title:'C',content:'D'}];
 assert.deepEqual(w.deleteNote(list,'1').map(x=>x.id),['2']);
 assert.equal(list.length,2);
});
test('workspace route has real task and note interactions',()=>{
 const src=read('src/app/workspace/page.tsx');
 for(const term of ['createTask(','toggleTask(','filterTasks(','deleteTask(','createNote(','deleteNote('])assert.ok(src.includes(term),term);
});
test('workspace does not pretend to persist client information',()=>{
 const src=read('src/app/workspace/page.tsx');
 assert.match(src,/yenilemede kaybolur/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(|\.from\(/);
});
test('all research and workspace forms have native labels and controls',()=>{
 const research=read('src/components/research/local-research-workbench.tsx');
 const work=read('src/app/workspace/page.tsx');
 assert.match(research,/htmlFor="research-title"/);
 assert.match(research,/htmlFor="research-body"/);
 assert.match(research,/htmlFor="research-query"/);
 assert.match(work,/htmlFor="work-task"/);
 assert.match(work,/htmlFor="note-body"/);
});
