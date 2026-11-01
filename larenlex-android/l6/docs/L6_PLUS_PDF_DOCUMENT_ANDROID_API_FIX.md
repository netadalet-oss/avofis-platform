# LarenLex L6: Android SDK 35 PdfDocument compilation fix

**2026-11-01** — The real GitHub Android compilation job ran after the SDK bootstrapping issue was bypassed.

CI run: https://github.com/netadalet-oss/avofis-platform/actions/runs/41289545762

The Android API 35 Java compiler rejected `try (PdfDocument pdf = new PdfDocument())` in `PdfDraftWriter.java` because `PdfDocument` has `close()` but is not `AutoCloseable`.

Change: explicitly construct the document, finish the started page in an inner `finally`, and close the document in an outer `finally`; the caller-owned `OutputStream` remains open. All source strings stay sample-only (no personal data or legally approved output). The original manuals remain unchanged.

Verification must use a **new** CI run. A commit is not a passing build. No signed APK, A6 device run, independent A2 acceptance, RLS/Auth proof, or A7 publication is implied.
