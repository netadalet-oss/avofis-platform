import assert from "node:assert/strict";
import test from "node:test";
import {serviceSlugs,draftLocales,newPreparation,validatePreparation,preparationDocx,preparationText,isServiceSlug} from "../src/lib/document-preparation.ts";

test("FORM-01: every original service has a distinct safe preparation entry point",()=>{
 assert.equal(serviceSlugs.length,17);assert.equal(new Set(serviceSlugs).size,17);
 for(const service of serviceSlugs){assert.equal(isServiceSlug(service),true);assert.equal(newPreparation(service,"tr").service,service);}
 assert.equal(isServiceSlug("/api/intake"),false);
});
test("FORM-01: six locale drafts are valid and carry no official sending state",()=>{
 for(const locale of draftLocales){const draft=newPreparation("konut-kira-sigorta",locale);assert.deepEqual(validatePreparation(draft),draft);
  assert.doesNotMatch(JSON.stringify(draft),/submitted|paid|approved|clientId/);
  assert.match(preparationText(draft,"service name"),/service name/);
 }
});
test("FORM-01: rejects malformed, unexpected or oversized private files",()=>{
 const d=newPreparation("konut-kira-sigorta","tr");
 for(const patch of [{version:3},{schemaRevision:2},{answers:{unknown:"field"}},{service:"bad"},{locale:"xx"},{country:"x".repeat(4001)},{institution:"a\u0000b"},{submitted:true}])assert.equal(validatePreparation({...d,...patch}),null);
 assert.equal(validatePreparation([]),null);assert.equal(validatePreparation(null),null);
});
test("FORM-01: produces an actual ZIP/Office DOCX with safe XML escaping and correct Arabic bidi",()=>{
 const d=newPreparation("egitim-diploma","ar");d.purpose='<& > " hidden';
 const doc=preparationDocx(d,"اختبار & test");
 assert.equal(String.fromCharCode(...doc.slice(0,4)),"PK\u0003\u0004");
 assert.ok(doc.length>1200);
 const s=new TextDecoder().decode(doc);
 assert.match(s,/<w:bidi\/>/);assert.match(s,/&lt;&amp; &gt; &quot; hidden/);
 assert.doesNotMatch(s,/<w:t xml:space="preserve"><&/);
});
test("FORM-03: legacy version 1 remains editable and exportable",()=>{
 const v2=newPreparation("mahkeme-temsil","nl");
 const {schemaRevision,answers,...old}=v2;
 const legacy={...old,version:1};
 assert.deepEqual(validatePreparation(legacy),legacy);
 assert.match(preparationText(legacy,"Court"),/Court/);
 assert.equal(validatePreparation({...legacy,answers:{}}),null);
});
test("FORM-03: answers are preserved in actual DOCX including Arabic direction",()=>{
 const d=newPreparation("mahkeme-temsil","ar");
 d.answers={caseReference:"ECLI:NL:HR:2020:123",requestedAction:"أريد مراجعة القرار"};
 assert.deepEqual(validatePreparation(d),d);
 const decoded=new TextDecoder().decode(preparationDocx(d,"محكمة"));
 assert.match(decoded,/ECLI:NL:HR:2020:123/);
 assert.match(decoded,/أريد مراجعة القرار/);
 assert.match(decoded,/<w:bidi\/>/);
});
