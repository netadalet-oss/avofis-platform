'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loadTs(localFile){
  const file=path.join(root,localFile);
  const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{
    fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
  });
  const m={exports:{}};
  new Function('module','exports',compiled.outputText)(m,m.exports);
  return m.exports;
}
const draft=loadTs('src/lib/draft-builder.ts');
const careers=loadTs('src/lib/local-careers.ts');
const forum=loadTs('src/lib/local-forum.ts');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');

const valid={title:'Dilekçe Taslağı',parties:'Taraflar',facts:'Olay özeti',requests:'Talep metni',evidence:'Ek listesi'};
test('user-authored document composes all five sections and warning',()=>{
 const result=draft.renderDraft(valid);
 for(const value of Object.values(valid))assert.ok(result.includes(value));
 assert.match(result,/Hukuki doğrulama yapılmamıştır/);
});
test('document builder cannot generate empty legal facts or requests',()=>{
 assert.match(draft.validateDraft({...valid,facts:' '}),/zorunlu/);
 assert.match(draft.validateDraft({...valid,requests:''}),/zorunlu/);
});
test('document content limits block oversized values',()=>{
 assert.ok(draft.validateDraft({...valid,evidence:'x'.repeat(10001)}));
});
test('document retains user-authored line breaks',()=>{
 assert.match(draft.renderDraft({...valid,facts:'Birinci satır\nİkinci satır'}),/Birinci satır\nİkinci satır/);
});
test('document keeps at most twelve independent local versions',()=>{
 let prev=[];
 for(let i=1;i<=18;i++)prev=draft.addVersion(prev,i,'Draft '+i);
 assert.equal(prev.length,12);
 assert.deepEqual(prev.map(x=>x.id),[7,8,9,10,11,12,13,14,15,16,17,18]);
});
test('document version ID reuse is rejected',()=>{
 const v=draft.addVersion([],1,'A');
 assert.deepEqual(draft.addVersion(v,1,'B'),v);
});
test('document filename rejects unsafe special characters',()=>{
 const name=draft.safeTextFilename('../unsafe?/template');
 assert.ok(name.endsWith('.txt'));
 assert.doesNotMatch(name,/[\\/?:"|<>*]/);
});
test('document exports directly in browser without network',()=>{
 const p=read('src/app/documents/page.tsx');
 assert.match(p,/new Blob\(/);
 assert.match(p,/URL.createObjectURL\(/);
 assert.match(p,/link.download = safeTextFilename/);
 assert.match(p,/URL.revokeObjectURL\(/);
 assert.doesNotMatch(p,/localStorage|sessionStorage|fetch\(|\.from\(/);
});
test('document draft has preview, versions and TXT export controls',()=>{
 const p=read('src/app/documents/page.tsx');
 for(const term of ['makePreview','saveVersion','exportText','versions.map','Taslağı görüntüle','TXT indir'])assert.ok(p.includes(term));
});
test('document builder does not invent AI or legal verification',()=>{
 const p=read('src/app/documents/page.tsx');
 assert.match(p,/hukuken yeterli olduğunu onaylamaz/);
 assert.match(p,/sunucuya/);
});

test('career item created from manually entered opportunity',()=>{
 const v=careers.createCareerItem([], '1', ' Büro A ','Stajyer', 'https://example.org/job');
 assert.equal(v.stage,'saved');
 assert.equal(v.organization,'Büro A');
 assert.equal(v.sourceUrl,'https://example.org/job');
});
test('career URL rejects javascript protocol and credentials',()=>{
 for(const u of ['javascript:alert(1)','data:text/html,abc','https://name:secret@host.test/'])assert.equal(careers.validatedSourceUrl(u),null);
});
test('career URL optional but bad URL rejected',()=>{
 assert.equal(careers.validatedSourceUrl(''),'');
 assert.equal(careers.createCareerItem([], '1','A','B','broken'),null);
});
test('career empty organization/title rejected',()=>{
 assert.equal(careers.createCareerItem([], '1',' ','B',''),null);
 assert.equal(careers.createCareerItem([], '1','A',' ','https://example.com'),null);
});
test('duplicate career item cannot silently overwrite another',()=>{
 const one=careers.createCareerItem([], '1','A','B','');
 assert.equal(careers.createCareerItem([one], '1','C','D',''),null);
});
test('career source item cap enforced',()=>{
 const list=Array.from({length:30},(_,i)=>({id:String(i),organization:'A',position:'B',sourceUrl:'',stage:'saved'}));
 assert.equal(careers.createCareerItem(list,'99','C','D',''),null);
});
test('career status is locally updatable but not a real application',()=>{
 const one=careers.createCareerItem([], '1','A','B','');
 const next=careers.updateCareerStage([one],'1','interview');
 assert.equal(next[0].stage,'interview');
 assert.equal(one.stage,'saved');
});
test('career search finds Turkish text, stage filter works',()=>{
 const one=careers.createCareerItem([], '1','İstanbul Hukuk','Stajyer','');
 const two=careers.createCareerItem([one], '2','Büro B','Avukat','');
 const list=careers.updateCareerStage([one,two],'2','applied');
 assert.deepEqual(careers.filterCareerItems(list,'İSTANBUL','all').map(x=>x.id),['1']);
 assert.deepEqual(careers.filterCareerItems(list,'','applied').map(x=>x.id),['2']);
});
test('career removal does not mutate other items',()=>{
 const one=careers.createCareerItem([], '1','A','B','');
 assert.deepEqual(careers.removeCareerItem([one],'1'),[]);
});
test('careers UI explains no platform job search or application submission',()=>{
 const p=read('src/app/careers/page.tsx');
 assert.match(p,/gerçek iş ilanlarını taramaz veya başvuru göndermez/);
 assert.match(p,/yenileyince kaybolur/);
 assert.doesNotMatch(p,/fetch\(|\.from\(|localStorage/);
});

test('forum accepts user-created local topic draft',()=>{
 const v=forum.addTopic([],'1','Konum','Açıklama');
 assert.deepEqual(v,{id:'1',title:'Konum',description:'Açıklama',replies:[]});
});
test('forum rejects empty title or post body',()=>{
 assert.equal(forum.addTopic([],'1',' ','Açıklama'),null);
 assert.equal(forum.addTopic([],'1','Başlık',' '),null);
});
test('forum cannot overwrite duplicate topic',()=>{
 const one=forum.addTopic([],'1','X','Y');
 assert.equal(forum.addTopic([one],'1','Other','Other'),null);
});
test('forum topic cap prevents unbounded drafts',()=>{
 const items=Array.from({length:20},(_,i)=>forum.addTopic([],String(i),'A','B'));
 assert.equal(forum.addTopic(items,'next','A','B'),null);
});
test('forum creates private reply in existing local topic',()=>{
 const item=forum.addTopic([],'1','A','B');
 const changed=forum.addReply([item],'1','r','  Tekrar bakılmalı ');
 assert.equal(changed[0].replies[0].body,'Tekrar bakılmalı');
 assert.equal(item.replies.length,0);
});
test('forum rejects replies to absent topic',()=>{
 assert.equal(forum.addReply([],'missing','r','body'),null);
});
test('forum rejects duplicate reply IDs',()=>{
 const initial=forum.addReply([forum.addTopic([],'1','A','B')],'1','r','one');
 assert.equal(forum.addReply(initial,'1','r','two'),null);
});
test('forum query and topic deletion preserve independent data',()=>{
 const first=forum.addTopic([],'1','İçtihat','Karar');
 const second=forum.addTopic([first],'2','Mevzuat','Yönetmelik');
 assert.deepEqual(forum.searchTopics([first,second],'İÇTİHAT').map(x=>x.id),['1']);
 assert.deepEqual(forum.removeTopic([first,second],'1').map(x=>x.id),['2']);
});
test('forum reply deletion retains topic and other replies',()=>{
 let list=[forum.addTopic([],'1','A','B')];
 list=forum.addReply(list,'1','r1','First');
 list=forum.addReply(list,'1','r2','Second');
 const next=forum.removeReply(list,'1','r1');
 assert.deepEqual(next[0].replies.map(x=>x.id),['r2']);
});
test('forum UI explicitly states drafts are not published',()=>{
 const p=read('src/app/forum/page.tsx');
 assert.match(p,/Bu bir canlı forum değildir/);
 assert.match(p,/başka kullanıcılar tarafından/);
 assert.doesNotMatch(p,/fetch\(|\.from\(|localStorage/);
});
test('all six workspaces are linked from module directory',()=>{
 const p=read('src/app/modules/page.tsx');
 for(const route of ['/cases','/statutes','/documents','/workspace','/careers','/forum'])
   assert.ok(p.includes('href: "'+route+'"'),route);
});
test('newer stage-1 homepage does not publish fabricated statistics',()=>{
 const p=read('src/app/page.tsx'),site=read('src/lib/site.ts');
 for(const word of ['120K+','18K+','9.800+','350+'])assert.ok(!site.includes(word),word);
 for(const word of ['currentStatsItems','<EditableStatGrid','meta: "248 başlık"'])assert.ok(!p.includes(word),word);
 assert.match(p,/AVOfis henüz kuruluş öncesi geliştirme aşamasındadır/);
});
test('newer stage-1 homepage flags demonstration and unavailable live services',()=>{
 const page=read('src/app/page.tsx');
 assert.doesNotMatch(page,/Canlı yapı|Doğrulanmış Ofis|Doğrulanmış profil yapısı/);
 for(const label of ['Temsili profil','Geliştirme örneği','Planlanan kariyer özellikleri'])
   assert.ok(page.includes(label),label);
});
