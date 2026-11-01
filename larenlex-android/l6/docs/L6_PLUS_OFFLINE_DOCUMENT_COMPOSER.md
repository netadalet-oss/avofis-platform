# LarenLex L6: real offline document editing and user-authored export

Date: 2026-11-01. Implement a **usable but bounded** offline native document editor. Unlike the former synthetic example, the user can enter a document title and body and explicitly choose a destination through Android SAF, then export DOCX or multipage A4 PDF. No online services or legal templates are implied.

**Components:** `DocumentComposerActivity.java` (in-memory editor), `DocumentDraft.java` (size, Unicode and control-character validation), `DraftDocxWriter.java` (DOCX with user title and paragraphs; XML escaped), `PdfDraftWriter.java` (A4 wrapped/repaginated user content). The existing example paths remain synthetic and separate. Manifest declares the editor non-exported; main navigation and feature detail link to the **same general editing tool** without marking any of the 453 functions accepted.

**Security/limitations:** No login or personal account exists. No service/provider integration. No automatic persistence of unsaved editor text; process termination may lose it. The SAF file stream is opened only after user selection and controlled by the caller. `FLAG_SECURE` retains screenshot protection. Some RTL and complex-script PDF typography may vary; not independently tested on devices. Avoid real client content until the full authorization/security reviews.

**Tests:** `DocumentDraftHarness.java` verifies valid/invalid input, Unicode, newline normalization, actual zipped DOCX output with escaped XML and unchanged destination ownership. Additional Python source-boundary tests ensure only user-selected SAF writing and a non-exported activity. CI Android compilation and APK packaging are separate; success must be observed, not assumed.

**No acceptance promotion:** Full 14/69/453 inventory preserved, independent A2 accepted 0/453, real device A6 0/12, A5.18 history unresolved, independent backend/Postgres RLS/Auth and A7 publishing not approved.
