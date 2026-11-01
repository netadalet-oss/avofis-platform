# LarenLex L6: canonical A2 source and all-module catalogue recheck

**Scope:** LX-005, LX-054, and LX-001–LX-062 evidence boundaries. This adds a read-only drift check; it does not grant implementation acceptance.

**Defect class guarded:** Counting 14/69/453 alone misses relabelled source items, duplicate feature IDs, changed parent groups, and unsubstantiated acceptance flags.

**Change:** The new verifier reconciles every module, group and feature ID/title against the 453-row source CSV. A separately delivered original A2 CSV is optionally checked byte-for-byte by SHA-256. Optional A4, AVOfis-shared R, and LX heading inventories are distinct from implementation evidence. Omitted external inputs are reported as NOT_PROVIDED.

**Local evidence (2026-11-01):** 14 modules, 69 groups, 453 A2 rows and no mismatches. The independently delivered original A2 CSV had SHA-256 624a52797ad97323d598b5659c664f73887734ce82deb90455e22607d6ba9300 and matched the local copy. Also checked 102 distinct A4 operation IDs, 594 AVOfis-shared R references and 62 original LX task headings. Fourteen local tests passed (8 inherited L6 tests, 6 new tests) on the handed-over L6 snapshot. Newer GitHub-only scoped draft tests were not part of that local run.

**Commands:** python3 -m unittest discover -s tests -v; python3 tools/verify_a2_source_sync.py. Optionally supply --original-a2, --a4, --refs and --manual.

**Remaining blockers:** original independent A5.18 Git bundle, real Android SDK/Gradle/APK/12 device scenarios, PostgreSQL RLS/Auth, legal and language human acceptance, and A7 signing and publication permissions. A source inventory is not a functional acceptance.
