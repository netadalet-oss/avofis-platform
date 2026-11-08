# Security blockers (W1 NO_GO)
- GitHub tree contains tracked `admin/.env.local` (305 bytes at first audit); contents were NOT read or quoted. Tracked file may contain secrets. Credential owners must review and rotate affected secrets, revoke exposed tokens, remove tracked file and remediate Git history using a coordinated process. Adding .gitignore alone is insufficient.
- No provider-backed identity, MFA, or dedicated least-privilege PostgreSQL DB roles have been validated. Private routes intentionally deny access; no synthetic accounts.
- No PostgreSQL RLS live test, case ownership/tenant E2E, payment authorization, partner licensing or agency access approval. Keep these functions disabled.
- Full 554-card text is *not* published; source archive remains within the cumulative private transfer ZIP. No v87 database/HTML/schema is used.
- W1_DONE and WEB_GO are **not** asserted. Draft PR #17 must remain unmerged pending verification.
