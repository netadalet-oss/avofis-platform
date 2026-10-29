import test from "node:test";
import assert from "node:assert/strict";
import {COURTS,ECLI_RE,buildOfficialQuery,parseAtomEntries,parseContentMetadata,
 validatePublicSearch,searchDefaults,matchesLocalFilters} from "../src/lib/rechtspraak-open-data.ts";
import {evaluateOfficialExchange} from "../src/lib/official-justice-gates.ts";
const search=(partial={})=>({...searchDefaults,...partial});
test("J02 official, independently web-verified 2026 ECLI identifiers",()=>{
 for(const ecli of ["ECLI:NL:HR:2026:1684","ECLI:NL:HR:2026:1682","ECLI:NL:HR:2026:1587"])
  assert.ok(ECLI_RE.test(ecli));
});
test("J02 official Open Data URLs are allowlisted and use only documented parameters",()=>{
 const u=new URL(buildOfficialQuery(search({dateFrom:"2026-10-01",dateTo:"2026-10-20"})));
 assert.equal(u.host,"data.rechtspraak.nl");assert.equal(u.pathname,"/uitspraken/zoeken");
 assert.deepEqual(u.searchParams.getAll("date"),["2026-10-01","2026-10-20"]);
 assert.equal(u.searchParams.get("max"),"20");assert.equal(u.searchParams.get("sort"),"DESC");
 assert.equal(u.searchParams.has("q"),false);assert.equal(u.searchParams.has("keyword"),false);
 const v=new URL(buildOfficialQuery(search({ecli:"ECLI:NL:HR:2026:1684"})));
 assert.equal(v.pathname,"/uitspraken/content");assert.equal(v.searchParams.get("return"),"META");
});
test("J02 no open-ended dump, invalid date, long range, encoded injection or mixed ECLI",()=>{
 for(const q of [
 {},{dateFrom:"2026-10-01"},{dateFrom:"2026-10-01",dateTo:"2026-12-01"},
 {dateFrom:"2026-10-29",dateTo:"2026-10-01"},
 {dateFrom:"2026-02-30",dateTo:"2026-03-01"},
 {ecli:"ECLI:NL:HR:2026:1684&return=DOC"},
 {ecli:"ECLI:NL:HR:2026:1684",keyword:"test"},
 {dateFrom:"2026-10-01",dateTo:"2026-10-10",court:"SOME-CODE"},
 {dateFrom:"2026-10-01",dateTo:"2026-10-10",keyword:"<script>"}
 ]){assert.ok(validatePublicSearch(search(q)),JSON.stringify(q));}
 assert.ok(COURTS.includes("RBDHA"));
});
const feed=`<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom">
 <entry><id>ECLI:NL:HR:2026:1684</id><title>ECLI:NL:HR:2026:1684, Hoge Raad</title><summary>Personen- en familierecht</summary><updated>2026-10-16</updated></entry>
 <entry deleted="doc"><id>ECLI:NL:HR:2026:1682</id></entry>
 <entry><id>javascript:alert(1)</id><title>unsafe</title></entry>
 <entry><id>ECLI:NL:HR:2026:1587</id><title>Belastingrecht &amp; openbaar</title><summary>Toets &lt;wet&gt;</summary></entry>
 </feed>`;
test("J02 parse namespaced Atom fixture and exclude deleted documents/invalid ECLI",()=>{
 const results=parseAtomEntries(feed);assert.equal(results.length,2);
 assert.equal(results[0].ecli,"ECLI:NL:HR:2026:1684");
 assert.equal(results[1].title,"Belastingrecht & openbaar");
 assert.equal(results[1].summary,"Toets <wet>");
 assert.equal(results[0].url,"https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AHR%3A2026%3A1684");
});
test("J02 result keyword & court filters are LOCAL and explicit",()=>{
 const [r]=parseAtomEntries(feed);
 assert.equal(matchesLocalFilters(r,search({court:"HR",keyword:"familie"})),true);
 assert.equal(matchesLocalFilters(r,search({court:"RBDHA"})),false);
 assert.equal(matchesLocalFilters(r,search({keyword:"tax"})),false);
});
test("J02 XML size, unknown XML and mismatched content ECLI fail closed",()=>{
 assert.throws(()=>parseAtomEntries("not xml"),/NOT_ATOM/);
 assert.throws(()=>parseAtomEntries("<feed>"+". ".repeat(150000)+"</feed>"),/TOO_LARGE/);
 assert.throws(()=>parseContentMetadata("<root>ECLI:NL:HR:2026:1684</root>","ECLI:NL:HR:2026:1682"),/MISMATCH/);
});
const scope={
 family:"civil",verifiedProfessional:true,jurisdictionVerified:true,writtenMandateVerified:true,
 g1ToG4IfInd:true,reviewerOne:true,reviewerTwo:true,independentReviewers:true,
 providerAccreditation:true,verifiedProviderReceipt:true
};
test("J03 every simulated legal approval still cannot transmit without external system acceptance",()=>{
 for(const family of ["civil","commercial","family","general_administrative","tax","asylum",
  "detention","ind_objection","ind_residence","unknown"]){
  const res=evaluateOfficialExchange({...scope,family});
  assert.equal(res.canTransmit,false);assert.equal(res.canMarkSubmitted,false);
  assert.equal(res.externalStatus,"NOT_SUBMITTED");
  assert.equal(res.canCollectDigiDOrAdvocatenpas,false);
 }
});
test("J03 lack of a receipt never becomes a verified official filing",()=>{
 const res=evaluateOfficialExchange({...scope,verifiedProviderReceipt:false});
 assert.equal(res.canMarkSubmitted,false);
 assert.equal(res.canImpersonatePortalUser,false);
 assert.equal(res.canShareIndData,false);
});
