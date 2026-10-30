import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {buildLocalTriageReview,isValidCalendarDate} from "../src/lib/public-triage-review.ts";
import {evaluatePublicTriage} from "../src/lib/public-triage.ts";
const input=()=>({
 country:"nl",residenceCountry:"nl",preferredLanguage:"tr",topic:"work",
 personRole:"self",counterpartyType:"employer",requestType:"general_information",evidenceKind:"none",
 noticeCategory:"notice_received",timeBand:"unknown",immediateHarm:false,
 professionalNeeded:false
});
test("L4 R-346: self-reported receipt date validates calendar, not legal service or deadline",()=>{
 for(const valid of ["2024-02-29","2000-02-29","2026-10-30","1998-12-31"])
   assert.equal(isValidCalendarDate(valid),true,valid);
 for(const invalid of ["2023-02-29","1900-02-29","2026-13-01","2026-04-31","30/10/2026",
  "2026-01-01T00:00:00Z","2026-01-01 ","","2026-00-15","2101-01-01"])
   assert.equal(isValidCalendarDate(invalid),false,invalid);
 const r=buildLocalTriageReview(input(),"2024-02-29");
 assert.equal(r.noticeDate,"2024-02-29");
 assert.equal(r.noticeDateStatus,"SELF_REPORTED_UNVERIFIED");
 assert.equal(r.deadlineCalculated,false);
 assert.equal(r.officialActionSubmitted,false);
 assert.equal(r.clientRecordCreated,false);
 assert.equal(r.referenceNumber,null);
 assert.equal(r.humanVerificationRequired,true);
});
test("L4 R-346: invalid and missing dates never become asserted facts or fabricated deadlines",()=>{
 for(const noticeDate of ["2023-02-29","not-a-date","2026-10-99"]){
  const r=buildLocalTriageReview(input(),noticeDate);
  assert.equal(r.noticeDate,null);
  assert.equal(r.noticeDateStatus,"INVALID_FORMAT");
  assert.ok(!JSON.stringify(r).includes(noticeDate));
 }
 const missing=buildLocalTriageReview(input(),"");
 assert.equal(missing.noticeDate,null);
 assert.equal(missing.noticeDateStatus,"NOT_SUPPLIED");
 const noNotice=buildLocalTriageReview({...input(),noticeCategory:"no_notice"},"2026-10-30");
 assert.equal(noNotice.noticeDateStatus,"NOT_APPLICABLE");
 assert.equal(noNotice.noticeDate,null);
});
test("L4 R-355: review only reflects bounded category selections, no official filing or case ID",()=>{
 const r=buildLocalTriageReview(input(),"2026-01-15");
 assert.equal(r.matterCountry,"nl");
 assert.equal(r.residenceCountry,"nl");
 assert.equal(r.topic,"work");
 assert.equal(r.personRole,"self");
 assert.equal(r.counterpartyType,"employer");
 assert.equal(r.requestType,"general_information");
 assert.equal(r.officialActionSubmitted,false);
 assert.equal(r.clientRecordCreated,false);
 assert.equal(r.referenceNumber,null);
 const classified=evaluatePublicTriage(input());
 assert.equal(classified.maySubmitOfficialAction,false);
 assert.equal(classified.mayCreateClientRecord,false);
 assert.equal(classified.deadlineCalculated,false);
});
test("L4 R-346/R-355: date field and review confirmation are local-only UI; no submit/upload",()=>{
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 const helper=readFileSync(fileURLToPath(new URL("../src/lib/public-triage-review.ts",import.meta.url)),"utf8");
 assert.ok(ui.includes('type="date" className="avofis-field'));
 assert.ok(ui.includes('input.noticeCategory==="notice_received"'));
 assert.ok(ui.includes('setNoticeDate("")'));
 assert.ok(ui.includes("buildLocalTriageReview(input,noticeDate,topicNote)"));
 assert.ok(ui.includes("checked={isReviewed}"));
 assert.ok(ui.includes("setConfirmationKey(e.target.checked?reviewSignature:null)"));
 assert.ok(ui.includes("Local selection review — no submission"));
 assert.ok(ui.includes("not a filing")||ui.includes("Resmî başvuru"));
 assert.ok(!/<form[^>]*action=/.test(ui));
 assert.ok(!/<button[^>]*type="submit"/.test(ui));
 assert.ok(!/<input[^>]*type="file"/.test(ui));
 assert.ok(!/\b(fetch|localStorage|sessionStorage|sendBeacon)\b/.test(helper));
});

test("L4 R-344: free-text topic note is limited, stays local and cannot classify or submit a case",()=>{
 const basic=input();
 const draft=buildLocalTriageReview(basic,"","  Housing deposit question  ");
 assert.equal(draft.topicNote,"Housing deposit question");
 assert.equal(draft.topicNoteStatus,"LOCAL_DRAFT_UNVERIFIED");
 assert.equal(draft.topic,"work","route remains based only on selected category");
 assert.equal(draft.officialActionSubmitted,false);
 assert.equal(draft.clientRecordCreated,false);
 assert.equal(draft.deadlineCalculated,false);
 const overflow="a".repeat(161);
 const invalid=buildLocalTriageReview(basic,"",overflow);
 assert.equal(invalid.topicNote,"");
 assert.equal(invalid.topicNoteStatus,"TOO_LONG");
 assert.ok(!JSON.stringify(invalid).includes(overflow));
 const blank=buildLocalTriageReview(basic,"","");
 assert.equal(blank.topicNoteStatus,"NONE");
});
test("L4 R-344: selected route and short note must be reviewed, not filed",()=>{
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(ui,/maxLength=\{160\}/);
 assert.match(ui,/textarea className="avofis-field/);
 assert.match(ui,/setTopicNote\(e\.target\.value\)/);
 assert.match(ui,/\{review\.topicNote\}/);
 assert.match(ui,/reviewSignature=JSON\.stringify\(input\)\+"\|"\+noticeDate\+"\|"\+topicNote/);
 assert.match(ui,/setConfirmationKey\(e\.target\.checked\?reviewSignature:null\)/);
 assert.match(ui,/özel kişisel bilgi yazmayın/);
 assert.doesNotMatch(ui,/<button[^>]*type="submit"/);
});

test("L4 R-355: local pre-review includes every selected route/role/urgency statement",()=>{
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 for(const field of ["t.preferred","t.residence","t.country","t.topic","t.role",
  "t.counterparty","t.request","t.evidence","t.notice","t.time","t.harm","t.professional"]){
   assert.ok(ui.includes("["+field+","),"Missing review field "+field);
 }
 assert.match(ui,/reviewFields\.map\(\(\[label,value\],index\)/);
 assert.match(ui,/reviewSignature=JSON\.stringify\(input\)\+"\|"\+noticeDate\+"\|"\+topicNote/);
 assert.match(ui,/checked=\{isReviewed\}/);
 assert.match(ui,/no submission/);
});

test("L4 R-376: evidence category and truth-check are in same local review signature as choices",()=>{
 const selected=input();
 const r=buildLocalTriageReview({...selected,evidenceKind:"contract"},"","");
 assert.equal(r.evidenceKind,"contract");
 assert.equal(r.clientRecordCreated,false);
 assert.equal(r.officialActionSubmitted,false);
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(ui,/\[t\.evidence,evidenceOptions\[review\.evidenceKind/);
 assert.match(ui,/checked=\{isTruthReviewed\}/);
 assert.match(ui,/setTruthKey\(e\.target\.checked\?reviewSignature:null\)/);
 assert.match(ui,/reviewSignature=JSON\.stringify\(input\)\+"\|"\+noticeDate\+"\|"\+topicNote/);
 assert.doesNotMatch(ui,/<form[^>]*action=/);
});
