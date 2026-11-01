package nl.larenlex.app;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import org.json.JSONArray;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.KeyStore;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Device-private encrypted *single-user development* tasks; not account-scoped or reviewed for real client data. */
public final class EncryptedLocalTaskStore {
    private static final String ALIAS="larenlex_dev_local_tasks_v1";
    private static final String FILE="llx-tasks-v1.enc";
    private static final byte[] MAGIC={'L','L','T','1'};
    private static final byte[] AAD="LarenLex:offline-tasks:dev:v1".getBytes(StandardCharsets.UTF_8);
    private static final int MAX_BYTES=192*1024;
    private static final Object GUARD=new Object();
    private final Context context;
    public EncryptedLocalTaskStore(Context ctx){context=ctx.getApplicationContext();}

    private SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
        if(ks.containsAlias(ALIAS))return (SecretKey)ks.getKey(ALIAS,null);
        KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        gen.init(new KeyGenParameterSpec.Builder(ALIAS,
            KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setRandomizedEncryptionRequired(true)
            .setKeySize(256).build());
        return gen.generateKey();
    }
    private File file(){return new File(context.getFilesDir(),FILE);}

    public JSONArray load() throws Exception {
        synchronized(GUARD){
            File f=file();
            if(!f.exists())return new JSONArray();
            if(!f.isFile() || f.length()<4+12+16 || f.length()>MAX_BYTES+64)
                throw new SecurityException("Encrypted task file invalid");
            byte[] bytes=new byte[(int)f.length()];
            try(FileInputStream in=new FileInputStream(f)){
                int used=0,n;
                while(used<bytes.length && (n=in.read(bytes,used,bytes.length-used))!=-1)used+=n;
                if(used!=bytes.length || in.read()!=-1)throw new SecurityException("Truncated task file");
            }
            for(int i=0;i<4;i++)if(bytes[i]!=MAGIC[i])
                throw new SecurityException("Unknown task format");
            byte[] iv=new byte[12];
            System.arraycopy(bytes,4,iv,0,12);
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,iv));
            cipher.updateAAD(AAD);
            byte[] clear=cipher.doFinal(bytes,16,bytes.length-16);
            if(clear.length>MAX_BYTES)throw new SecurityException("Task payload too large");
            JSONArray result=new JSONArray(new String(clear,StandardCharsets.UTF_8));
            if(result.length()>100)throw new SecurityException("Task limit exceeded");
            for(int i=0;i<result.length();i++){
                org.json.JSONObject o=result.getJSONObject(i);
                String id=o.getString("id");
                if(!id.matches("[0-9a-f-]{36}"))throw new SecurityException("Invalid task identity");
                TaskInputPolicy.title(o.getString("title"));
                TaskInputPolicy.detail(o.getString("detail"));
                o.getBoolean("complete");
            }
            return result;
        }
    }
    public void save(JSONArray tasks) throws Exception {
        synchronized(GUARD){
            if(tasks==null || tasks.length()>100)throw new IllegalArgumentException("Task limit");
            // Validate before touching the previously encrypted file.
            for(int i=0;i<tasks.length();i++){
                org.json.JSONObject o=tasks.getJSONObject(i);
                if(!o.getString("id").matches("[0-9a-f-]{36}"))
                    throw new IllegalArgumentException("Invalid task ID");
                TaskInputPolicy.title(o.getString("title"));
                TaskInputPolicy.detail(o.getString("detail"));
                o.getBoolean("complete");
            }
            byte[] clear=tasks.toString().getBytes(StandardCharsets.UTF_8);
            if(clear.length>MAX_BYTES)throw new IllegalArgumentException("Task data limit");
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE,key());
            byte[] iv=cipher.getIV();
            if(iv==null || iv.length!=12)throw new SecurityException("Unexpected GCM IV");
            cipher.updateAAD(AAD);
            byte[] sealed=cipher.doFinal(clear);
            ByteBuffer payload=ByteBuffer.allocate(MAGIC.length+iv.length+sealed.length);
            payload.put(MAGIC).put(iv).put(sealed);
            File next=File.createTempFile("llx-tasks-", ".pending", context.getFilesDir());
            try{
                try(FileOutputStream out=new FileOutputStream(next)){
                    out.write(payload.array());out.getFD().sync();
                }
                Files.move(next.toPath(),file().toPath(),
                    StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING);
            }finally{if(next.exists())next.delete();}
        }
    }
}
