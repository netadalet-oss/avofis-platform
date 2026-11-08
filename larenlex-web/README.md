# LarenLex — Java 21 Spring Boot / Vaadin W1 incomplete scaffold
Source limit: **only AVOfis v86 and earlier**; do not use v87 DB/schema/HTML. Exact source SHA-256: 0918445c9368c9e0672854d53682da61bd9122e8f9f77911bee38a159cef194b. Original v86 ZIP is NOT committed to GitHub.
Existing `portal/`, `admin/`, `api/`, `database/` remain unchanged.
This commit introduces parallel Java code, fail-closed protected review route, 25 module metadata routes and new PostgreSQL Flyway schema.
Put metadata TSV at `larenlex-web/data/modules.tsv` with 25 tab-separated lines (ID/name/description), derived exclusively from v86/W1 devir source. The full catalog/inventory/import implementation is in the current cumulative transfer ZIP, not yet synchronized to this branch.
**Not W1_DONE:** Maven, DB, Vaadin browser integration, RLS, auth/MFA, and imported 554 bodies are not proven here; no payment, live institution action, legal publication, or production deployment permitted. GitHub PR #17 remains draft and `main` untouched.
**Security notice:** `admin/.env.local` was detected tracked. Values were not retrieved; stop use of any exposed secrets, rotate relevant credentials, and plan reviewed history remediation. Do not write secrets to GitHub.
