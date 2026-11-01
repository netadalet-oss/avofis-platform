package nl.larenlex.app;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/** Header/version preflight only. Existing ciphertext MUST also be GCM-authenticated
 * by SecureDraftVault before replacement; header contents are not trusted as proof. */
public final class DraftRevisionPolicy {
    private DraftRevisionPolicy() { }
    private static final int MIN_BYTES = 4 + 8 + 1 + 12 + 16;

    public static long precedingRevision(File ciphertext, long requested, int maxPlaintext)
            throws IOException {
        if (requested < 1 || maxPlaintext < 1) {
            throw new IllegalArgumentException("Invalid draft revision or size limit");
        }
        if (!ciphertext.exists()) {
            if (requested != 1) throw new SecurityException("First revision must be 1");
            return 0;
        }
        if (!ciphertext.isFile() || ciphertext.length() < MIN_BYTES
                || ciphertext.length() > ((long) maxPlaintext) + 4096) {
            throw new IOException("Malformed existing encrypted draft");
        }
        try (DataInputStream input = new DataInputStream(new FileInputStream(ciphertext))) {
            if (input.readUnsignedByte() != 'L' || input.readUnsignedByte() != 'L'
                    || input.readUnsignedByte() != 'X' || input.readUnsignedByte() != '3') {
                throw new IOException("Unknown existing draft format");
            }
            long previous = input.readLong();
            if (input.readUnsignedByte() != 12) {
                throw new IOException("Invalid existing GCM nonce length");
            }
            if (previous < 1 || previous == Long.MAX_VALUE || requested != previous + 1) {
                throw new SecurityException("Stale or skipped draft revision");
            }
            return previous;
        }
    }
}
