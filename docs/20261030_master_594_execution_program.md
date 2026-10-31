# AVOfis v18 — master execution programme, 594 original requirements

**Date:** 30 October 2026. **Branch:** `feature/avofis-v17-two-person-clearance-20261029`; draft PR #5. The canonical requirement wording remains in the original 594-row source workbook / the 29 October 2026 user-provided handover. This file is a *delivery plan*, not a replacement for any R-ID or legal instruction.

## Inventory preservation

| Source / obligation | Full scope | Acceptance rule |
| --- | ---: | --- |
| Original R-001–R-594 | 594 = 33 × 18; P0 324 / P1 270 | Never rewrite/renumber any source requirement; create one independent proof for each |
| Customer-facing service categories | 17 | Service/country/procedure, document, sources, role, consent and evidence |
| Client audiences | 14 | Route/content identity preserved, country/language legal equivalence tested |
| Problem journeys | 12 | Relevant services, official sources and safely scoped intake |
| Law guides | 16 | Source version + dated URLs + reviewer/locale signoff before publishing |
| Corporate pages | 7 | Company, fees, legal status, complaints, accessibility, privacy, process; no invented entity status |
| Document checklists | 8 | **Historical TR/NL v7 source exists by reference; 8 canonical individual entries are not independently verified in the available nested archive** |
| Languages | TR, NL, DE, EN, AR RTL, RU | Six-locale product and legal/linguistic review per published unit |
| Internal modules | 16 × 12 acceptance checks = 192 | Real list/new/update/retention/state/task/audit/revoke/files/i18n/tests/staging |
| J01–J16 justice | 16 | Public ECLI separate from protected Mijn and Aansluitpunt; official receipt only from actual institution |
| P01–P10 staff | 10 | Individual AAL2 + module/case capability + independent review and audit |
| IND operations | IND-01–08; G1–G4; IND-T01–T15 | Exact original eight classes (including bezwaar, beroep, hoger beroep, asiel, bewaring, dossier access); professional and written mandate |
| Launch blockers | B01–B18 | Each independently closed with actual evidence, not a combined pass |
| Company tasks | G-01–G-24, Y-01–Y-05 | Human-approved documentation, not algorithmically fabricated |
| Delivery stages | T01–T13 | Isolated tests, restored staging, real Auth/Storage, publication and rollback |

The 29 October workbook had **0/594 independent accepted, 41/594 partially technical evidenced, 553/594 not individually evidenced**, and **0 live accepted**. Neither later commits nor this plan change these counters without row-specific independent evidence.

## Dependency-led execution waves

1. **W1 – B01/B02/B03/B04/B06/B13:** harden legacy RLS/ACL, preserve source data, verify real Supabase staging and A/B/Auth/Storage (including MFA revocation), real encrypted backup/restore, GDPR/DSAR. This is a **release prerequisite**, not an excuse to stop independent coding.
2. **W2 – B05/B07/B15/B18:** confirmed company/work authority, independent licensed specialists, signed scope, professional insurance, conflict checks, IND G1–G4 two-person approval. Synthetic test accounts cannot provide this proof.
3. **W3 – catalog, CMS and account:** 17 services × 14 audiences × 12 problem routes; informative client flows, B01/B02-gated content rights, true client account and consented hand-off.
4. **W4 – case, documents, forms and staff:** procedure-specific forms, immutable version history, six-language DOCX/PDF, 16 staff module CRUD/state/tasks/audit, client/personnel document collaboration; signed authority for reserved legal work.
5. **W5 – quality and knowledge:** 16 NL guide drafts from original v10, original v15 66-unit AR/RU catalog, seven corporate pages, eight checklists from exact recovered source, legal source/version/rights metadata, human review, WCAG 2.2 AA, mobile/RTL/SEO.
6. **W6 – finance:** approved real prices, fee/official charge split, consumer terms, signed contract, signed PSP/banking integrations, refund/chargeback/webhook idempotency, dual controls for payables. No bank transfer on role flag alone.
7. **W7 – controlled launch:** true E2E Auth/Storage, professional clearance, legal/DPO/owner signoffs, mobile accessibility, independent security testing, source-controlled release/rollback, production and first-90-day verification.

Waves are **risk/acceptance order**, not promises of completion dates. Each R-ID belongs to one primary wave but can depend on multiple other workstreams. A phase is not done until all required independent evidence is present.

## Actual work performed at programme start

- Verified source workbook preserves **594 unique R-IDs, 33 sections × 18, P0 324 and P1 270**, including original requirement sentences and existing status history.
- Produced additional independently actionable registers: **594 R-ID work entries, 192 staff module checks, 113 supplementary B/J/P/IND/founder/T obligations, and 74 public content checks (66 confirmed archive records + eight unresolved checklist source mapping tasks)**.
- Retained prior 16 staff capability IDs, all 18 launch blockers and all original IND procedure types, rather than substituting invented names.
- Extracted actual archival `AVOfis_66_Icerik_AR_RU_Birlesik_Katalog_v15_2026-10-29.json` and `AVOfis_16_Hukuk_Rehberi_NL_Yapilandirilmis_v10_2026-10-29.json`. **All NL guides are explicitly unapproved in the source.**
- Implemented the 16-entry sourced NL guide index, editable/searchable **internal editorial preview only**, with each guide linked to its original official URL and relevant service-document preparation. `AVOFIS_EDITORIAL_GUIDE_PREVIEW=true`, `AVOFIS_EDITORIAL_REVIEW_MODE=unapproved`, and nonproduction runtime are mandatory. Production returns 404. Neither developer switches nor the preview confer legal/editorial publication approval.
- Added CI source-completeness and fail-closed production gate tests in `portal/scripts/guide-catalog-regression.test.mjs` to the integrated workflow.
- An offline archived-source preview can show the **66** source content units without asserting that they were deployed or legally accepted.

## Acceptance protocol applied to every R-ID

Required fields: original wording/hash/section/priority, exact code and environment, source and official last-check date, developer/test owner, positive+negative test ID, current synthetic SQL status, **real staging Auth/Storage result**, human legal/professional signoff, data-protection signoff, native-language review where needed, actual preview/browsers, owner publication decision and rollback. “Code present”, “test passed”, “legal approval” and “live verified” are **separate dimensions**.

Source protection: the original requirements must never be silently overwritten; any new client direction is dated, additive and cross-referenced. No marketing claim of a licensed Dutch advocacy practice or professional representation without independently verified right. No fake customer entries, success rates, banking/court receipts or publication approvals.

## First outstanding blockers after this work

- **B01/B02:** live Supabase seven legacy tables RLS OFF with anon CRUD; two broadly permissive CMS reads, profile/role/default ACL exposure. Proposed migrations are in branch but **NOT applied to live DB**.
- **B03/B04/B12/B13:** separate real Supabase staging, production-grade backup and restoration, real Auth/MFA/Storage signed-URL and revoke E2E remain unverified.
- **B05–B09/B15/B18:** actual professional/organization/GDPR/consumer/IND/court release authority and independently signed reviews unavailable.
- **B14/B16/B17:** WCAG and six-language real-device audit, legal/editorial guide release approval and procedure-specific official templates not independently accepted.
- **Original eight checklist documents:** canonical TR/NL v7 content names/IDs absent from independently located archive extract. Mark unknown and recover source, **do not invent**.

**No `main` merge, production DDL/RLS/Storage/Auth, real client intake, bank/payment or official filing was performed here.**
