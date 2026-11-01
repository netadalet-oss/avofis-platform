package nl.larenlex.app;

/** Bounded in-memory user-authored content. No legal template, account or cloud storage. */
public final class DocumentDraft {
    public final String title;
    public final String body;
    public static final int MAX_TITLE = 140;
    public static final int MAX_BODY = 20000;

    public DocumentDraft(String title, String body) {
        this.title = validate(title, MAX_TITLE, false, "Başlık");
        this.body = validate(body, MAX_BODY, true, "Metin");
    }

    private static String validate(String value, int max, boolean multiline, String label) {
        if (value == null || value.isEmpty() || value.length() > max)
            throw new IllegalArgumentException(label + " boş veya uzun");
        String normalized = value.replace("\r\n", "\n").replace('\r', '\n');
        if (normalized.trim().isEmpty()) throw new IllegalArgumentException(label + " boş");
        for (int i = 0; i < normalized.length();) {
            int cp = normalized.codePointAt(i);
            int size = Character.charCount(cp);
            if (Character.isSurrogate(normalized.charAt(i)) && size == 1)
                throw new IllegalArgumentException("Eşleşmemiş Unicode karakteri");
            if (cp == 0xFFFE || cp == 0xFFFF || !Character.isValidCodePoint(cp)
                || (cp < 32 && cp != '\t' && !(multiline && cp == '\n'))
                || (cp >= 0x7F && cp <= 0x9F))
                throw new IllegalArgumentException("Geçersiz karakter");
            if (!multiline && cp == '\n')
                throw new IllegalArgumentException("Başlık tek satır olmalı");
            i += size;
        }
        return normalized;
    }
}
