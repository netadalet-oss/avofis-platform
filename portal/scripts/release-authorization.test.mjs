import test from "node:test";
import assert from "node:assert/strict";
import {activeReleaseEvidence,decideRelease,intakeReleased,paymentsReleased} from "../src/lib/release-authorization.ts";
import {publicCustomerTransactionsAuthorized} from "../src/lib/public-release-status.ts";

const enabled={legalReady:true,intakeEnabled:true,clientIntakeEnabled:true,paymentEnabled:true};
const fakeEvidence=()=>({
 releaseId:"synthetic-release-v17",
 companyAndWorkAuthoritySignoff:"synthetic-company-review",
 professionalScopeSignoff:"synthetic-professional-review",
 gdprArticle13AndDsarSignoff:"synthetic-gdpr-article13",
 dataInventoryDpaRetentionAndTransferSignoff:"synthetic-data-inventory",
 securityAndStagingSignoff:"synthetic-staging-no-client",
 legalEditorAndLocaleSignoff:"synthetic-six-locale-review",
 consumerContractAndWithdrawalSignoff:"synthetic-consumer-review",
 publishedFeesTaxesAndRefundSignoff:"synthetic-fees-review",
 signedOwnerGoDecision:"synthetic-owner-go-decision"
});

test("T08: actual API release remains sealed even with every env switch true",()=>{
 assert.equal(activeReleaseEvidence,null);
 assert.equal(publicCustomerTransactionsAuthorized,false);
 assert.equal(decideRelease(enabled,activeReleaseEvidence,true).intakeAllowed,false);
 assert.equal(decideRelease(enabled,activeReleaseEvidence,true).paymentsAllowed,false);
 assert.equal(intakeReleased(),false);
 assert.equal(paymentsReleased(),false);
});
test("T08: forged env flags and fabricated evidence cannot bypass unsigned owner seal",()=>{
 const outcome=decideRelease(enabled,fakeEvidence(),false);
 assert.equal(outcome.intakeAllowed,false);
 assert.equal(outcome.paymentsAllowed,false);
});
test("T08: missing single legal, DPO, consumer or security signature fails closed",()=>{
 for(const field of Object.keys(fakeEvidence())){
  const evidence=fakeEvidence();
  evidence[field]="";
  const decision=decideRelease(enabled,evidence,true);
  assert.equal(decision.intakeAllowed,false,"missing "+field);
  assert.equal(decision.paymentsAllowed,false,"missing "+field);
 }
});
test("T08: payment requires full intake and payment flags in addition to owner/approval",()=>{
 const evidence=fakeEvidence();
 assert.equal(decideRelease({...enabled,clientIntakeEnabled:false},evidence,true).paymentsAllowed,false);
 assert.equal(decideRelease({...enabled,intakeEnabled:false},evidence,true).paymentsAllowed,false);
 assert.equal(decideRelease({...enabled,paymentEnabled:false},evidence,true).intakeAllowed,true);
 assert.equal(decideRelease({...enabled,paymentEnabled:false},evidence,true).paymentsAllowed,false);
 // Only a hypothetical, artificial all-approved fixture demonstrates gate logic.
 assert.equal(decideRelease(enabled,evidence,true).paymentsAllowed,true);
});
