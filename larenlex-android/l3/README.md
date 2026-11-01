# LarenLex Android — L3 / 2026-11-01

**Authoritative product scope:** LarenLex Android independent from AVOfis Portal. 14 system modules, 69 subgroups, 453 source A2 feature IDs, 16 staff areas. Distinct historical 102 A4 operations are **not** represented as implemented by the L3 shell.

**Deliverables:** `android/` is a new native Java / Android Studio source scaffold for all modules. `preview/LARENLEX_ANDROID_L3_BUTUN_UYGULAMA_ONIZLEME.html` is the interactive mobile/desktop offline whole-product prototype. The prototype is not a runtime view of the compiled APK, which does not exist.

## What was built
- Native MainActivity lists all modules, groups and feature IDs from canonical inventory, plus staff and privacy screens. Features show explicit non-acceptance and are not offered as real legal services.
- Native Android screenshot protection, disabled application backups, no INTERNET permission, no WebView or JS interface, fail-closed native API client.
- AndroidKeyStore AES-256-GCM `SecureDraftVault` implementation; it is **not activated for real users**, does not contain signing material and lacks real-device Keystore tests. Scoped encryption binds tenant, user, matter, draft and revision; no plaintext draft export without a separately authorized lifecycle.
- User-initiated Android Storage Access Framework document chooser for **synthetic** DOCX and PDF examples, not real case documents or court submissions. XML escapes validated for sample DOCX; PDF source requires Android SDK to build.
- Ownership/page/schema validation building blocks, non-legal reminders, locked-until-real-provider session boundary.
- The L2 synthetic Python reference remains in the previous L2 folder; it is **not a live backend**, not integrated into Android shell and not copied here as production logic.

## Reproducible validations (single bounded round)
```
python3 retry_previous_gates.py
python3 build_preview.py
python3 tests/verify_l3.py
```
Note: Browser testing loads the local HTML markup in Chromium without external file:// access, network calls or server listeners. Open this HTML directly as a local file for interactive viewing.

## Known blockers
- Independent historical A5.18 Android bundle and A5.14 handoff absent; this **new** L3 source is not derived from a verified Android Git history.
- Android Gradle/SDK 35/ADB device unavailable; no assembled APK, signing, verified merged manifest, instrumentation, Android Keystore acceptance, PDF renderer device acceptance or accessibility TalkBack outcome.
- Real PostgreSQL RLS/Auth/token issuer, A4 production API, 13 authoritative role profiles and 52 original data entities not verified.
- The 8 inherited gate groups have 16 new bounded checks (2 per group), recorded in `evidence/L3_PREVIOUS_LEVEL_RETRIES.json`; none was falsely closed.
- No production customer data, service publication, AVOfis Portal mutation, security approval, legal authorization or release.

L3 whole-product development prototype may be submitted for **L3→L4 user approval** while technical acceptance remains open and next level retries remain due. Approval is not release permission.
