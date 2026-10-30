# AVOfis — Production document workflow: operational acceptance contract

Date: 2026-10-29. Owner: project operator and authorized Dutch legal/privacy reviewers.
This is **real-usage engineering**, not an example-data product. No fictitious
customer, court receipt, approval, price, payment or professional licence may
ever be represented as real.

## Implemented code contracts

- Customer document creation: `POST /api/document-drafts`, authenticated
  Supabase user, exact validated FORM-01 fields and optional OWN case.
- Customer revision: `PATCH /api/document-drafts`, optimistic integer
  revision, no overwrite of a submitted or withdrawn document.
- Customer history: `GET /api/document-drafts?id=<uuid>` reads the
  append-only revisions and actual staff review notes for its owner.
- Consent handoff: explicit `review_requested` plus `consent_to_staff=true`.
  A staff reviewer must simultaneously be an active assigned **operator**
  with **documents** and **pleadings** grants and AAL2.
- Independent staff API: `GET /api/client-documents` lists only the current
  reviewer’s assigned/consented cases; `GET ...?id=<uuid>` reads the
  real content, versions and notes; `POST /api/client-documents` inserts
  a permanent separate review note but cannot change customer-authored text.
- Consent withdrawal: owner `PATCH` transitions reviewed document to
  `withdrawn` and `consent_to_staff=false` without changing original content.
  Past customer revisions remain visible to the owner. Every delegated
  staff read and note insertion is immediately blocked by RLS after withdrawal.
  Restoring personnel grants **does not restore the consent**.
- Official filing, court submission, actual payment and professional-signature
  records are separate operations; these endpoints perform NONE of them.

## Production configuration

The **portal** and **admin** deployments require independently reviewed
Supabase project references, not copied production API secrets.

- `AVOFIS_DOCUMENT_DRAFT_ENV=production`
- `AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF=<verified production project ref>`
- `AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF=<distinct development project ref>`
- `NEXT_PUBLIC_SUPABASE_URL=https://<verified ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key, never service role>`
- `AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED=true`
- `AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED=true`, only after documented,
  human-signed baseline inspection/restore and RLS review
- `VERCEL_ENV=production` supplied by Vercel
- Portal UI: `NEXT_PUBLIC_AVOFIS_DOCUMENT_DRAFTS_ENABLED=true`
- Admin review API: `AVOFIS_STAFF_DOCUMENT_REVIEW_ENABLED=true`

The default is **disabled** when controls are not configured. Never paste
tokens or customer records into CI, documentation or chat.

## Mandatory release conditions

1. **B01/B02 first.** The last read-only production inventory identified seven
   legacy public tables without RLS and anonymous CRUD, plus broad CMS read
   policies. The proposed production data flow must not be enabled until all
   exposed tables have reviewed grants and tested RLS. See
   `docs/v17_b01_b18_safe_remediation_runbook.md` if available in the branch.
2. Use a separate Supabase environment for irreversible migration testing.
   Capture encrypted, access-controlled backups, perform **restore verification**
   and a reversible deployment/feature-off procedure before real cutover.
3. Apply the precise reviewed AVOfis schema chain in dependency order, then
   the FORM-02 versioned documents migration; validate that the actual Storage,
   Auth and postgREST configuration matches the disposable tests.
4. Exercise two real isolated user accounts A and B and two real staff identities
   using Supabase Auth JWTs. Verify invalid/expired sessions, AAL1/AAL2
   boundaries, two independent capability grants, assignment removal, grant
   removal and repeated review attempts.
5. Validate current 6-language strings, accessibility, document retention,
   access/deletion request procedure, audit visibility and GDPR/legal basis.
   Do not claim human legal review until the reviewer provides evidence.
6. Confirm production HTTP status codes and independent browser accessibility
   of **the exact commit** to be released, including real login -> save ->
   revision -> explicit consent -> staff review note -> owner sees note ->
   consent withdrawal -> staff 403/404 scenario.
7. Only after green signed acceptance: enable the account flags. A Vercel READY
   build or a local PostgreSQL test alone never counts as a live user transaction.

## Failure behaviour and verification

- Anonymous/expired JWT, incorrect URL/project, missing security authorization:
  deny without disclosing customer document content.
- Unassigned operator, missing either document capability, or AAL1:
  no customer document/read-history/note access.
- Admin role without explicit scoped operator assignment:
  no automatic privacy bypass.
- Revision conflict: HTTP 409, never silent overwrite.
- Withdrawn record: immutable content; no staff access even if staff grant restored.
- When reviewing failure, disable deployment gates and inspect RLS and Auth.
  Do not delete audit/version history or perform undocumented production SQL.
- Production logs must not contain document text, identity tokens or user files.

## Evidence at creation

GitHub PR #5, `feature/avofis-v17-two-person-clearance-20261029`.
Disposable PG17 script: `database/tests/form02_client_drafts_synthetic.sql`.
API and contract tests are in `portal/scripts` and `admin/scripts`.
These verify code and isolated authorization logic; real Auth/Storage and
deployment validation must be recorded independently before launch.
