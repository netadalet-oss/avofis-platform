package nl.larenlex.app;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/** Pure Java filename boundary for offline encrypted drafts (not authorization). */
public final class DraftFileNamespace {
    private DraftFileNamespace() { }

    public static String fileName(String keyAlias, String matter, String draft) {
        if (keyAlias == null || !keyAlias.matches("llx3_[0-9a-f]{32}")
                || !valid(matter) || !valid(draft)) {
            throw new IllegalArgumentException("Invalid scoped draft reference");
        }
        return "draft_" + keyAlias + "_" + sha256("larenlex/draft-file/v1:" + matter + ":" + draft)
                .substring(0, 32) + ".enc";
    }

    private static boolean valid(String value) {
        return value != null && value.matches("[A-Za-z0-9_-]{1,64}");
    }

    private static String sha256(String value) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            char[] alphabet = "0123456789abcdef".toCharArray();
            char[] hex = new char[bytes.length * 2];
            for (int i = 0; i < bytes.length; i++) {
                hex[i * 2] = alphabet[(bytes[i] >>> 4) & 15];
                hex[i * 2 + 1] = alphabet[bytes[i] & 15];
            }
            return new String(hex);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);
        }
    }
}
