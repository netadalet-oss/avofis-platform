# LarenLex L6: encrypted draft filename account isolation

**Authoritative requirements:** LX-032, LX-035, LX-037; LX-06/LX-07/LX-12. No original manual is altered.

**Observed source defect:** SecureDraftVault used a tenant+principal-specific AndroidKeyStore alias but saved ciphertext as `draft_<matter>_<draft>.enc` in a common app-private directory. Two local identities choosing identical matter/draft references could overwrite one another's ciphertext, even though AES-GCM prevented decrypting it using the other key.

**Source correction:** Keep existing `llx3_` key aliases unchanged. Filename is now `draft_<account-key-alias>_<SHA256-derived matter-and-draft suffix>.enc`, consistently for save/read/delete. Do not display matter/draft identifiers in filenames. This is a local file isolation measure only, not a server-side permission check.

**Legacy boundary:** Do not guess who owns `draft_<matter>_<draft>.enc` files; leave old files in place without automatic migration or deletion. Account-verified migration and backup/recovery require separately proven identity and device tests.

**Evidence:** `tests/DraftFileNamespaceHarness.java` tests 12 pure JVM conditions (determinism; tenant/principal namespace separation via different aliases; different matter/draft separation; forbidden path data). `tests/test_draft_namespace.py` runs it from the GitHub source tree. JDK source-only results are not Android Keystore, native APK, A6 device, live RLS/Auth or legal acceptance.

**Status:** KUSURLU_KISMI_DUZELT / SENTETIK_ISPAT, real independent A2 acceptance unchanged.
