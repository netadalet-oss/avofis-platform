# AVOfis — Legal case clearance and payment launch runbook

**Status:** Source-controlled implementation only. This is not certification of regulatory approval or live readiness.

## Why a human review is required
AVOfis plans legal advice, some eligible Dutch non-advocaat representation, objections, immigration case preparation, contracts, collections and cross-border processes. A worker's actual right to work and the jurisdiction's professional and procedural rules determine whether a service can be delivered. A BV, a law degree, or prior judicial experience does not itself grant permission. German legal and collection services require separate review under RDG.

## Release gates and migrations
1. BACK UP STAGING. Apply migration 20261027_avofis_mvp.sql, then 20261028_avofis_expanded_workflows.sql, then 20261029_avofis_case_clearance.sql, after code and security review.
2. Bootstrap and verify staff accounts in avofis_staff. Roles must never be assigned from public user_metadata.
3. avofis_case_assessments is staff-only via RLS. It stores country, second country, receiving institution, notice date, deadline applicability and source, authorisation, independent specialist, decision and written justification.
4. SQL triggers reject creating already-active cases, changing case owners, reopening closed cases and changing agreed scope after client signature. Status open/completed requires an approved assessment and signed service agreement. Direct completion is blocked.
5. Checkout requires case status open, an approved assessment and signed terms, plus server flags AVOFIS_LEGAL_READY and AVOFIS_PAYMENT_ENABLED. A separate NEXT_PUBLIC_AVOFIS_PAYMENT_ENABLED flag hides the customer pay control while disabled; the server always verifies independently.
6. GitHub/Vercel never automatically apply the database migrations. Do not open intake, customer files, or payments without staging security and compliance verification.

## Negative staging tests (test accounts only)
- Anonymous and clients cannot read, insert or update case assessments.
- Only staff can create and update an assessment; a client's own assessment is not visible to them.
- Staff cannot insert a case already in open or completed status.
- Unreviewed or rejected case cannot transition to open.
- Approval fails unless authorisation is permitted or a named qualified specialist is confirmed.
- Approval fails while deadline review is pending, or when a confirmed deadline has no date and written source.
- Approval fails without a written rationale.
- Case cannot be activated until its agreement is signed by the client.
- Owner, accepted service scope and quoted price cannot be changed after the relevant immutability condition.
- Closed cases cannot be reopened; review cannot jump directly to completed.
- Client cannot pay for a case which has not been activated and cleared.
- Client B cannot read or pay Client A's case; clients cannot see staff-only tasks.
- With payment gates off, checkout rejects attempts regardless of client UI state.
- Webhook rejects mismatched ID, metadata, amount or currency.

## Positive staging tests
Create a staff and client test account. Staff opens a case in awaiting_agreement, performs a documented legal jurisdiction and authorisation review, and attaches approved terms. Client signs. Staff transitions it to open. Only then should Mollie test checkout work. Check provider webhook verification, refund flows, client records, hidden tasks and negative RBAC cases.
Test TR/NL/DE/EN service search and all service/audience routes at 320, 375, 390, 768, 1024 and desktop widths. Check accessibility, menu focus and client/staff permission separation.

## Required compliance sign-off
Confirm actual right to work, Dutch or German practice rules, Wki/RDG registration when relevant, court and appeal procedure, independent professionals, insurance, approved service agreements, consumer withdrawal rules, privacy controller details, retention, DPA, international transfers and payment provider verification.

Keep founding/company tasks and personal immigration details completely outside public customer pages. These files contain source-controlled work, not evidence of completed operational readiness.