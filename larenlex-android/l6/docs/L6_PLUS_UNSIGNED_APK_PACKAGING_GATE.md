# LarenLex L6 — Unsigned package structural gate

2026-11-01. This is a controlled continuation of the successful Java compilation in GitHub Actions run 41290274683 (`df845b8c781b602bac969901d75784c5e0a5f3a8`).

**Boundary:** The user has not authorized Android app signing, keystore creation, installation onto a personal device, Play Store release, private data, or production credentials. Consequently no debug `assembleDebug` task is used: the Android SDK ordinarily signs debug APKs automatically. Instead, the existing app release variant has no signing configuration and `:app:assembleRelease` produces an **unsigned**, non-installable APK for structural inspection only.

**CI checks:** The package must exist, be a readable ZIP, include DEX, report `nl.larenlex.app` in `aapt dump badging`, and fail Android `apksigner verify`. A verified signature is treated as an error and prohibits artifact upload. SHA-256 is generated and the unsigned ZIP is kept as a short-lived GitHub Actions artifact. No external distribution destination is used.

**Scope:** 14 LX modules, 69 groups, 453 A2 requirements remain inventory identifiers and are not accepted implementation. 102 A4 operations and 594 shared R references remain separate sources. Independent A2 0/453, A6 device 0/12, live RLS/Auth and legal approval all remain open; A5.18 history is not verified and A7 release is not authorized.

**Evidence:** This note and CI workflow are plans until the GitHub Actions job completes. Do not claim an actual APK was generated from this source commit without the run ID, successful packaging step, artifact metadata and SHA-256.
