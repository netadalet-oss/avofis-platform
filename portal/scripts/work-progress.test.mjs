import test from "node:test";
import assert from "node:assert/strict";
import {calculateProgress,readProgressLedger,reportLines,EXPECTED_WORK_COUNT}
 from "./work-progress.mjs";
const ledger=readProgressLedger();
const clone=()=>structuredClone(ledger);
test("PROGRESS: precisely 973 source-backed work IDs, 0 independent acceptance",()=>{
 const p=calculateProgress(ledger);
 assert.equal(EXPECTED_WORK_COUNT,973);
 assert.deepEqual(p.breakdown.map(g=>g.total),[594,192,113,74]);
 assert.equal(p.accepted,0);
 assert.equal(p.remaining,973);
 assert.equal(p.percent,0);
 assert.equal(p.partial,69);
 assert.equal(p.synthetic,4);
 assert.equal(p.productionStatus,"NO_GO");
 assert.equal(p.e2eStagingVerified,false);
 assert.deepEqual(reportLines(ledger),[
  "AVOFIS_ACCEPTED=0/973","AVOFIS_REMAINING=973/973",
  "AVOFIS_PARTIAL_REQUIREMENTS=69/594",
  "AVOFIS_SYNTHETIC_AUXILIARY=4/113",
  "AVOFIS_PRODUCTION=NO_GO","AVOFIS_STAGING_E2E=NOT_VERIFIED"
 ]);
});
test("PROGRESS: R-001..594, 16×12 staff tasks and B/J/P/IND/G/T names stay valid",()=>{
 const p=calculateProgress(ledger);
 assert.equal(p.breakdown.filter(x=>x.accepted!==0).length,0);
 for(const corrupt of ["R-000","R-595","B02","R-001","random"]){
  const d=clone();d.groups[0].partial.push(corrupt);
  if(corrupt==="R-001")continue;
  if(corrupt==="B02")assert.throws(()=>calculateProgress(d),/unknown partial ID/);
  else assert.throws(()=>calculateProgress(d),/unknown partial ID/);
 }
});
test("PROGRESS: never count an unreviewed or self-approved work item as complete",()=>{
 const cases=[
  {id:"B02"},
  {id:"B02",owner:"Alice owner",reviewer:"Alice owner",sourceUrl:"https://example.test/work"},
  {id:"B02",owner:"Alice owner",reviewer:"Bob reviewer",sourceUrl:"https://example.test/work"},
  {id:"B99",owner:"Alice owner",reviewer:"Bob reviewer"}
 ];
 for(const fake of cases){
  const d=clone();d.groups[2].accepted.push(fake);
  assert.throws(()=>calculateProgress(d),/PROGRESS_LEDGER_INVALID/);
 }
});
test("PROGRESS: denominator cannot be quietly reduced and GO cannot be forged",()=>{
 const d=clone();d.groups[1].total=191;
 assert.throws(()=>calculateProgress(d),/denominator\/ID group drift/);
 const go=clone();go.productionStatus="GO";
 assert.throws(()=>calculateProgress(go),/release cannot be called GO/);
 const double=clone();double.groups[0].partial.push("R-005");
 assert.throws(()=>calculateProgress(double),/duplicate status ID/);
});
