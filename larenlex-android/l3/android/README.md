# LarenLex L3 — Android native source (development-only)

This **new** Android Studio Java source skeleton is based on the authoritative LarenLex source inventory (14 modules/69 groups/453 A2 IDs). It is **not** a recovered historical A5.18 Android Git tree and does not claim that any of the 453 functions are independently accepted. App identity: `nl.larenlex.app`.

Uses Android API 26–35 and AGP 8.7.3, Java 17. No real endpoint or OAuth provider configured. No INTERNET permission by design; API client is blocked until authenticated issuer, endpoint and schema are independently verified. No WebView or JavaScript interface; only native Android navigation. Private data is not backed up; protected drafts use AndroidKeyStore AES-GCM. User-controlled SAF export is the only document output. No production/live backend, server migrations, or law-office actions.

SDK/JDK/Gradle prerequisites and real-device functional tests are **not satisfied** in this workspace. No Gradle wrapper binaries are included, so no false `./gradlew assembleDebug` claims. Open in Android Studio with Gradle/SDK installed, then run `gradle :app:assembleDebug` in an isolated test environment.
