# LarenLex L6 — Android SDK bootstrap CI correction (2026-11-01)

Observed GitHub run: https://github.com/netadalet-oss/avofis-platform/actions/runs/41288740641

GitHub `source-tests` job passed, but `android-java-compile` stopped at `android-actions/setup-android@v3`. The user-supplied setup log shows that the runner already had command-line tools 20.0, yet the action requested 12266719 (16.0), downloaded a second version, and entered an SDK licenses prompt (7 of 8 not accepted). The final stack-trace/exit message is not included in the supplied screenshots, so the precise failing exit reason remains unproven.

The corrected CI job pins `ubuntu-24.04` and verifies the runner's existing Android 35 platform and Build Tools 35.0.0 before compilation. It does not run `sdkmanager --licenses`, download software, or automatically accept SDK agreements. If either dependency is absent, the CI step fails explicitly with a diagnostic rather than silently changing the environment.

Only `:app:compileDebugJavaWithJavac` is requested. No APK, signature, deployment, production database access, or independent A2/A6/A7 acceptance is created. CI result must be inspected at the new commit before claiming success.

Reference: https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md (preinstalled Android SDK packages).
