# LarenLex L6 — Temporary brand mark and debug signing scope

**Date:** 2026-11-01. User asked to continue with a developer-installable debug APK and use a logo. The screenshot shows an Android generic mascot, not an externally supplied canonical LarenLex logo file. No original corporate logo binary was present in the handover archive or current Android res directory.

**Provisional branding:** New navy/gold/white `LL` vector, adaptive launcher icon and a shared accessible `LarenLexBrandHeader` across the Main, L4, L5 and L6 screens. This is a draft visual identity. No claim of legal/trademark acceptance or original-logo provenance.

**Debug-only package:** CI task `:app:assembleDebug`, automatic *temporary runner* Android debug certificate, `apksigner` signature and debug certificate subject verification, package `nl.larenlex.app`, DEX/ZIP checks and a SHA-256 record. Upload only the debug APK and its reports, not `debug.keystore`. No production key or custom store credentials.

**Warnings:** A debug APK may be installable but has not been executed on a real Android phone, simulator or ADB. `allowBackup=false`; no INTERNET permission in release main manifest. No real personal information or legal decisions should be entered. The debug key changes across CI runs; updating an installed build may fail with a certificate mismatch and require uninstalling that test installation (which deletes its app-local test data). Avoid installing over an important copy.

**Acceptance:** Original A5.18 independent Git bundle unverified; independent A2 0/453, A6 real device 0/12, PostgreSQL RLS/Auth, independent legal/language review, A7 production signing and publication remain blocked. Source tests and CI runs do not change these counts.
