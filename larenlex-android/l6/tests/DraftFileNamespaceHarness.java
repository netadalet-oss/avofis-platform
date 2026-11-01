import nl.larenlex.app.DraftFileNamespace;

/** JVM-only regression evidence, not Android Keystore/device acceptance. */
public final class DraftFileNamespaceHarness {
    private static int checks = 0;
    private static void ok(boolean value) {
        if (!value) throw new AssertionError("Scope check " + checks + " failed");
        checks++;
    }
    private static void rejects(String alias, String matter, String draft) {
        try {
            DraftFileNamespace.fileName(alias, matter, draft);
            throw new AssertionError("Invalid path accepted");
        } catch (IllegalArgumentException expected) { checks++; }
    }
    public static void main(String[] args) {
        String a = "llx3_0123456789abcdef0123456789abcdef";
        String b = "llx3_fedcba9876543210fedcba9876543210";
        String f = DraftFileNamespace.fileName(a, "matter", "draft");
        ok(f.equals(DraftFileNamespace.fileName(a, "matter", "draft")));
        ok(!f.equals(DraftFileNamespace.fileName(b, "matter", "draft")));
        ok(!f.equals(DraftFileNamespace.fileName(a, "other", "draft")));
        ok(!f.equals(DraftFileNamespace.fileName(a, "matter", "other")));
        ok(f.matches("draft_llx3_[a-f0-9]{32}_[a-f0-9]{32}\\.enc"));
        ok(!f.contains("matter") && !f.contains("draft_draft"));
        rejects(a, "../shared", "draft");
        rejects(a, "matter", "../other");
        rejects(a, "", "draft");
        rejects("llx3_wrong", "matter", "draft");
        rejects(a, "matter", null);
        rejects(a, "matter", "draft with spaces");
        System.out.println(checks + " PASS (pure JVM, no Android device)");
    }
}
