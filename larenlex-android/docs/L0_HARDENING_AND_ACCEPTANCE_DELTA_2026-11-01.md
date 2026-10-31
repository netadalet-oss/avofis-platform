# L0 hardening and acceptance delta — 2026-11-01

**Product:** LarenLex Android only. **Level:** L0 OPEN; L1 transition NOT requested. **Working branch:** work/larenlex-android. No changes to portal/admin runtime or main.

## Fixed defect 1 — rejected Git bundle persisted at destination
- Prior code cloned directly to the designated checkout and checked expected A5.18 refs afterwards. An incorrect bundle failed but left a rejected Git checkout at the intended destination.
- Fixed: perform standalone bundle verification, isolated clone, exact develop/main/A5.14 ancestry, fsck, clean tree and source hash checks in a private temporary directory on the destination filesystem.
- Publish a checkout only after successful checks; existing and dangling-symlink targets are refused. A rejected bundle leaves no target checkout.
- Negative tests cover missing source, existing target, mismatched branch SHAs, and dangling-symlink target.

## Fixed defect 2 — trace generator trusted canonical index without source-line comparison
- Prior trace generator checked archive manifest and set identity but did not independently bind each canonical index entry to the actual LarenLex main document line.
- Fixed: 62 LX, 453 A2 and 102 API records must match their exact 1-based source lines, line hashes and unique occurrences; no acceptance can be inferred from a matching identifier.
- A4 API CSV identity+verb+route agreement, 73 unique paths, and A2 historical no-acceptance baseline now checked before emission.
- Negative regression tests cover a mismatched canonical source line and altered index hash.

## Independent local execution, NOT GitHub Actions or device acceptance
Execution evidence artifact: LARENLEX_L0_GUVENLIK_DUZELTME_KANITI_2026-11-01.json (local conversation deliverable, **not** uploaded to the public GitHub repository).
- Local source/bundle tests 14/14 PASS.
- Local trace/identity tests 11/11 PASS (executed under python -O).
- Bash syntax PASS; Python compileall PASS; trace generator PASS.
- Trace inventory: 62 LX, 453 A2, 102 API, 594 external R references = 1211 entries. History: 87 RAM operations, 37 SQLite *subset*, 15 disabled, 0 live production; no actual acceptance.
- Private ZIPs were not committed to public GitHub. Local code staging was not a verified clone of the exact GitHub HEAD. Individual changed GitHub files were read back after updates.
- CI workflow enhanced to run shell syntax, compileall and optimized-Python regressions. No successful GitHub Actions run ID independently verified.

## L0 open blocking conditions
1. Authentic independent A5.18 Git bundle, actual Android develop history and A5.14 handoff: not available in the supplied packages; cannot run source-level A5 checks.
2. Android SDK/Gradle/ADB/device and independently sourced PostgreSQL/Auth staging: unavailable in this execution context; no build or device test was claimed.
3. A1–A4 architecture, live service identity and end-to-end security/legal/translation acceptance: source-dependent verification remains open.
4. Repository is public; no secrets, production keys, real persons' data, or confidential independent Android source were pushed.

**Status:** L0 hardening completed for these two defects; overall L0 NOT complete, L1 NOT authorized. User instruction: ask approval only at actual level transition; no main merge or external production action.
