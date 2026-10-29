import { publicCustomerTransactionsAuthorized } from "./public-release-status";
/**
 * AVOfis v17 T08: release-authorisation gate.
 *
 * Environment variables are technical toggles, NOT professional, company,
 * GDPR, contract, payment, or consumer-law authorisation. No real acceptance
 * can take place until a reviewed, separately approved release change replaces
 * the null record below with source-backed evidence, plus staging tests.
 *
 * Never store secrets, identity documents or client data in this file.
 */
export type ReleaseEvidence = {
 releaseId: string;
 companyAndWorkAuthoritySignoff: string;
 professionalScopeSignoff: string;
 gdprArticle13AndDsarSignoff: string;
 dataInventoryDpaRetentionAndTransferSignoff: string;
 securityAndStagingSignoff: string;
 legalEditorAndLocaleSignoff: string;
 consumerContractAndWithdrawalSignoff: string;
 publishedFeesTaxesAndRefundSignoff: string;
 signedOwnerGoDecision: string;
};

export type ReleaseToggles = {
 legalReady: boolean;
 intakeEnabled: boolean;
 clientIntakeEnabled: boolean;
 paymentEnabled: boolean;
};

// Required documentary approval is absent. Never infer it from env/CI.
export const activeReleaseEvidence: ReleaseEvidence | null = null;

const hasSignedEvidence = (e: ReleaseEvidence | null): boolean =>
 !!e && Object.values(e).every(x => typeof x === "string" && x.trim().length >= 8);

export function decideRelease(t:ReleaseToggles,evidence:ReleaseEvidence|null,ownerReleaseSeal=false){
 const base = ownerReleaseSeal && t.legalReady && hasSignedEvidence(evidence);
 return {
  intakeAllowed:base && t.intakeEnabled && t.clientIntakeEnabled,
  paymentsAllowed:base && t.intakeEnabled && t.clientIntakeEnabled && t.paymentEnabled,
  // This does NOT itself make external processing lawful or authorise filing.
  humanSignoffPresent:hasSignedEvidence(evidence)
 };
}

export const releaseEnv = ():ReleaseToggles=>({
 legalReady:process.env.AVOFIS_LEGAL_READY==="true",
 intakeEnabled:process.env.AVOFIS_INTAKE_ENABLED==="true",
 clientIntakeEnabled:process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED==="true",
 paymentEnabled:process.env.AVOFIS_PAYMENT_ENABLED==="true",
});

export const intakeReleased=()=>decideRelease(releaseEnv(),activeReleaseEvidence,publicCustomerTransactionsAuthorized).intakeAllowed;
export const paymentsReleased=()=>decideRelease(releaseEnv(),activeReleaseEvidence,publicCustomerTransactionsAuthorized).paymentsAllowed;
