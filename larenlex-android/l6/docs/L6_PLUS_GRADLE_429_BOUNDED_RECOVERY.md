# LarenLex L6: bounded Maven HTTP 429 recovery and branch cache

**2026-11-01 source:** GitHub Actions run 41289675996 on commit `0ef9ec071382ff63bec0f3172653ded864d3197f`.

The source-test job succeeded. The SDK 35 preflight succeeded. `:app:compileDebugJavaWithJavac` failed during Gradle dependency resolution: Maven Central and Gradle Plugin Portal responses included `429 Too Many Requests` for transitive Gradle/Android plugin artifacts. This log does NOT prove a Java source compilation error on that run.

**Controlled CI change:** Keep `ubuntu-24.04`, SDK 35, Java 17, Gradle 8.9 and the compile-only target unchanged. Allow Gradle cache writes on the protected, long-lived `work/larenlex-android` development branch (`cache-read-only: false`); skip cleanup for incomplete initial dependency fetch (`cache-cleanup: never`); constrain workers to two. If and only if the first compile attempt's log contains an HTTP 429/rate-limit diagnostic, pause 45 seconds and retry **once**. For every other failure, fail immediately. On second failure, fail without further retries. Logs are printed for evidence; no network permissions or production secrets are provided.

**Evidence boundary:** CI configuration changes are not successful runs. Keep independent A2 0/453, A6 real device 0/12, A5.18 source history unverified, live Auth/RLS and legal approval open. No APK signing, store publication, payment, personal data, official action, `main` merge or production credentials.

**References:** https://github.com/gradle/actions/blob/main/docs/setup-gradle.md and https://github.com/netadalet-oss/avofis-platform/actions/runs/41289675996
