# AVOfis — Legal case clearance and payment launch runbook

**Status:** Source-controlled implementation only. This is not certification of regulatory approval or live readiness.

## Why a human review is required
AVOfis plans legal advice, some eligible Dutch non-advocaat representation, objections, immigration case preparation, contracts, collections and cross-border processes. A worker's actual right to work and the jurisdiction's professional and procedural rules determine whether a service can be delivered. A BV, a law degree, or prior judicial experience does not itself grant permission. German legal and collection services require separate review under RDG.

## Release gates and migrations
1. BACK UP STAGING. Apply migration 20261027_avofis_mvp.sql, then 20261028_avofis_expanded_workflows.sql, then 20261029_avofis_case_clearance.sql, and finally 20261030_avofis_scope_and_audit.sql, after code, backup and security review.
2. Bootstrap and verify staff accounts in avofis_staff. Roles must never be assigned from public user_metadata.
3. avofis_case_assessments is staff-only via RLS. It stores country, second country, receiving institution, notice date, deadline applicability and source, authorisation, independent specialist, decision and written justification.
4. SQL triggers require every new case to start in review, require administrator-approved assessment before contract issuance, block changes to a reviewed service, protect the client owner, prevent reopening closed cases and guard accepted terms. Status open/completed requires an approved assessment and signed service agreement. Direct completion is blocked.
5. Checkout requires case status open, an approved assessment and signed terms, plus server flags AVOFIS_LEGAL_READY and AVOFIS_PAYMENT_ENABLED. A separate NEXT_PUBLIC_AVOFIS_PAYMENT_ENABLED flag hides the customer pay control while disabled; the server always verifies independently.
6. GitHub/Vercel never automatically apply the database migrations. Do not open intake, customer files, or payments without staging security and compliance verification.

## Negative staging tests (test accounts only)
- Anonymous and clients cannot read, insert or update case assessments.
- Only staff can create and update an assessment; a client's own assessment is not visible to them.
- Staff cannot insert a case in awaiting_agreement, open or completed status; every case starts in review.
- An unreviewed or rejected case cannot advance to awaiting_agreement or open, and a service cannot change after assessment.
- Approval fails unless a verified administrator approves; operator accounts may save a pending or negative assessment.
- Approval fails unless authorisation is permitted or a named qualified specialist is confirmed.
- Approval fails while deadline review is pending, or when a confirmed deadline has no date and written source.
- Approval fails without a written rationale.
- Case cannot be activated until its agreement is signed by the client.
- Owner, accepted service scope and quoted price cannot be changed after the relevant immutability condition.
- Closed cases cannot be reopened; review cannot jump directly to completed.
- Client cannot accept or pay for a case which has not been legally cleared; newly uploaded documents are blocked if approval is revoked.
- The assessment audit records every change and cannot be edited through customer or staff APIs.
- Client B cannot read or pay Client A's case; clients cannot see staff-only tasks.
- With payment gates off, checkout rejects attempts regardless of client UI state.
- Webhook rejects mismatched ID, metadata, amount or currency.

## Positive staging tests
Create a staff and client test account. Staff opens a case in review. Staff prepares a documented legal jurisdiction and authorisation assessment; a verified administrator records final approval. Only then may staff change the case to awaiting_agreement and issue approved terms. Client signs. Staff transitions it to open. Only then should Mollie test checkout work. Check provider webhook verification, refund flows, client records, hidden tasks and negative RBAC cases.
Test TR/NL/DE/EN service search and all service/audience routes at 320, 375, 390, 768, 1024 and desktop widths. Check accessibility, menu focus and client/staff permission separation.

## Required compliance sign-off
Confirm actual right to work, Dutch or German practice rules, Wki/RDG registration when relevant, court and appeal procedure, independent professionals, insurance, approved service agreements, consumer withdrawal rules, privacy controller details, retention, DPA, international transfers and payment provider verification.

Keep founding/company tasks and personal immigration details completely outside public customer pages. These files contain source-controlled work, not evidence of completed operational readiness.
## Exact release blockers and test evidence

A code commit does not apply a database migration. Before live activation, inspect production/staging schema differences and run all migrations in order. Verify anonymous, unrelated client, case owner, operator and administrator RLS as separate JWT identities. Exercise the signed-agreement RPC directly (not only the React button), database case-state transitions, the private-storage upload policy, the service-role payment endpoint and repeated Mollie webhooks. Document responsible reviewer, source and result for each test.

The operator and administrator can record an assessment, but **only a verified admin may mark it approved** in the additional safeguard migration. The audit table captures decisions, with staff-only read access. No review field or check box constitutes a work permit, bar admission, Wki/RDG registration or representation authority.

The customer portal remains private from the incorporation plan. Keep legal, payment and data-collection flags OFF until external compliance review is complete.
