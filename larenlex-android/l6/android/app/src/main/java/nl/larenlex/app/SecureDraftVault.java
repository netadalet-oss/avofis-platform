package nl.larenlex.app;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Device-only non-exportable AES-256-GCM draft storage; NOT integrated with real sessions. */
public final class SecureDraftVault {
    private final Context context;
    private final String alias;
    private static final int MAX = 512 * 1024;
    // Serializes draft read/compare/write in this app process; not a multi-process lock.
    private static final Object LOCAL_WRITE_LOCK = new Object();
    private static final byte[] MAGIC = new byte[]{'L','L','X','3'};
    public SecureDraftVault(Context ctx, String tenant, String principal) throws Exception {
        if (!valid(tenant) || !valid(principal)) throw new IllegalArgumentException("Invalid account identity");
        context = ctx.getApplicationContext();
        alias = "llx3_" + hex(MessageDigest.getInstance("SHA-256").digest((tenant + ":" + principal).getBytes(StandardCharsets.UTF_8))).substring(0,32);
    }
    private static boolean valid(String s) { return s != null && s.matches("[a-zA-Z0-9_-]{1,64}"); }
    private static String hex(byte[] bytes) {
        StringBuilder b=new StringBuilder(); for(byte x:bytes) b.append(String.format(java.util.Locale.ROOT,"%02x",x & 255)); return b.toString();
    }
    private SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if (ks.containsAlias(alias)) return (SecretKey)ks.getKey(alias,null);
        KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(alias,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256).setRandomizedEncryptionRequired(true).build());
        return generator.generateKey();
    }
    private String fileName(String matterId, String draftId) {
        if (!valid(matterId)||!valid(draftId)) throw new IllegalArgumentException("Invalid draft reference");
        // The legacy shared file path could be overwritten by another local account.
        // Preserve the existing Keystore key alias, but scope ciphertext filenames.
        // Legacy unscoped data are not opened, deleted or silently migrated.
        return DraftFileNamespace.fileName(alias, matterId, draftId);
    }
    private byte[] aad(String matter, String draft, long revision) {
        return (alias + ":" + matter + ":" + draft + ":" + revision).getBytes(StandardCharsets.UTF_8);
    }
    public void save(String matter,String draft,long revision,byte[] plaintext) throws Exception {
        if (revision < 1 || plaintext == null || plaintext.length > MAX)
            throw new IllegalArgumentException("Invalid encrypted draft payload");
        String name = fileName(matter,draft);
        File output = new File(context.getFilesDir(),name);
        synchronized (LOCAL_WRITE_LOCK) {
            long previous = DraftRevisionPolicy.precedingRevision(output,revision,MAX);
            if (previous != 0) {
                // Do not overwrite corrupted or foreign ciphertext merely because its
                // clear header claims the expected revision. GCM authenticates the old bytes.
                read(matter,draft,previous);
            }
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE,key());
            cipher.updateAAD(aad(matter,draft,revision));
            byte[] iv=cipher.getIV(), sealed=cipher.doFinal(plaintext);
            if (iv.length!=12) throw new IllegalStateException("Unsupported GCM nonce size");
            ByteBuffer buffer=ByteBuffer.allocate(4+8+1+iv.length+sealed.length);
            buffer.put(MAGIC).putLong(revision).put((byte)iv.length).put(iv).put(sealed);
            // Unique ciphertext-only staging file avoids same-name pending collisions.
            File tmp=File.createTempFile("llx-sealed-", ".pending", context.getFilesDir());
            try {
                try(FileOutputStream stream=new FileOutputStream(tmp)) {
                    stream.write(buffer.array()); stream.getFD().sync();
                }
                // Fail closed if atomic replacement is unsupported; retain old draft.
                Files.move(tmp.toPath(),output.toPath(),
                        StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING);
                // This is local source-level verification, not an A6 device guarantee.
                read(matter,draft,revision);
            } finally {
                // Do not delete or migrate any preexisting legacy unscoped files.
                if (tmp.exists()) tmp.delete();
            }
        }
    }
    public byte[] read(String matter,String draft,long requiredRevision) throws Exception {
        File f=new File(context.getFilesDir(),fileName(matter,draft));
        if (f.length() > MAX+4096 || f.length() < 4+8+1+12+16) throw new IOException("Invalid encrypted draft size");
        byte[] payload=new byte[(int)f.length()];
        try(FileInputStream in=new FileInputStream(f)){
            int offset=0,n; while(offset<payload.length && (n=in.read(payload,offset,payload.length-offset))!=-1)offset+=n;
            if(offset!=payload.length) throw new IOException("Incomplete encrypted draft");
        }
        ByteBuffer bytes=ByteBuffer.wrap(payload);
        for(byte b:MAGIC) if(bytes.get()!=b) throw new IOException("Unknown encrypted draft format");
        long revision=bytes.getLong();
        int nonceLen=bytes.get() & 255;
        if(revision!=requiredRevision || nonceLen!=12) throw new SecurityException("Stale revision or nonce");
        byte[] nonce=new byte[12]; bytes.get(nonce);
        byte[] sealed=new byte[bytes.remaining()];bytes.get(sealed);
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,nonce));
        cipher.updateAAD(aad(matter,draft,requiredRevision));
        return cipher.doFinal(sealed);
    }
    public void delete(String matter,String draft) {
        File target=new File(context.getFilesDir(),fileName(matter,draft));
        if(target.exists()&&!target.delete())throw new IllegalStateException("Deletion failed");
    }
}
