import nl.larenlex.app.DraftRevisionPolicy;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

/** JVM-only revision/header checks. NOT Android Keystore/APK/device evidence. */
public final class DraftRevisionPolicyHarness {
    private static int checks;
    private static void ok(boolean accepted) {
        if (!accepted) throw new AssertionError("Draft revision check #" + (checks+1));
        checks++;
    }
    private static void rejects(File file, long revision, int max, Class<?> expected)
            throws Exception {
        try {
            DraftRevisionPolicy.precedingRevision(file, revision, max);
            throw new AssertionError("Expected rejection " + expected.getSimpleName());
        } catch (Exception ex) {
            if (!expected.isInstance(ex)) throw ex;
            checks++;
        }
    }
    private static byte[] ciphertextHeader(long revision, int ivLength) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        DataOutputStream stream = new DataOutputStream(bytes);
        stream.write(new byte[]{'L','L','X','3'});
        stream.writeLong(revision);
        stream.writeByte(ivLength);
        stream.write(new byte[28]); // mock IV + GCM tag (NOT authentic ciphertext)
        stream.flush();
        return bytes.toByteArray();
    }
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("llx-revision-test-");
        try {
            File file = root.resolve("scoped.enc").toFile();
            ok(DraftRevisionPolicy.precedingRevision(file,1,512*1024)==0);
            rejects(file,2,512*1024,SecurityException.class);
            rejects(file,0,512*1024,IllegalArgumentException.class);
            rejects(file,1,-1,IllegalArgumentException.class);
            Files.write(file.toPath(),ciphertextHeader(3,12));
            ok(DraftRevisionPolicy.precedingRevision(file,4,512*1024)==3);
            rejects(file,3,512*1024,SecurityException.class);
            rejects(file,2,512*1024,SecurityException.class);
            rejects(file,5,512*1024,SecurityException.class);
            Files.write(file.toPath(),ciphertextHeader(Long.MAX_VALUE,12));
            rejects(file,Long.MAX_VALUE,512*1024,SecurityException.class);
            Files.write(file.toPath(),ciphertextHeader(3,9));
            rejects(file,4,512*1024,java.io.IOException.class);
            byte[] malformed = ciphertextHeader(3,12);
            malformed[0] = 'X';
            Files.write(file.toPath(),malformed);
            rejects(file,4,512*1024,java.io.IOException.class);
            Files.write(file.toPath(),new byte[6]);
            rejects(file,4,512*1024,java.io.IOException.class);
            Files.write(file.toPath(),new byte[512*1024+4097]);
            rejects(file,4,512*1024,java.io.IOException.class);
            ok(file.exists());
        } finally {
            try (java.util.stream.Stream<Path> paths = Files.walk(root)) {
                paths.sorted(java.util.Comparator.reverseOrder()).forEach(path -> path.toFile().delete());
            }
        }
        System.out.println(checks + " PASS (pure JVM revision preflight; no Android device)");
    }
}
