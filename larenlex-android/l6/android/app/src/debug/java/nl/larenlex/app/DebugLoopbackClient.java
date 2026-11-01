package nl.larenlex.app;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** DEBUG source-set only. No production backend or release token ever accepted. */
public final class DebugLoopbackClient {
    private DebugLoopbackClient() {}
    /** An ephemeral, synthetic-only reference token; never stored or placed in a WebView. */
    public interface SyntheticToken { String get(); void invalidate(); }

    public static JSONObject get(String endpoint, String path, SyntheticToken token) throws Exception {
        if(endpoint == null || !endpoint.matches("http://10\\.0\\.2\\.2:[0-9]{1,5}")
                || path == null || !path.matches("/v2/[A-Za-z0-9_./-]{1,200}")
                || token == null) throw new SecurityException("Untrusted debug loopback endpoint");
        String value = token.get();
        if(value == null || !value.matches("[A-Za-z0-9_-]{20,512}"))
            throw new SecurityException("Synthetic session unavailable");
        HttpURLConnection conn = (HttpURLConnection)new URL(endpoint+path).openConnection();
        try {
            conn.setConnectTimeout(3000); conn.setReadTimeout(3000);
            conn.setInstanceFollowRedirects(false);
            conn.setUseCaches(false);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + value);
            conn.setRequestProperty("Cache-Control", "no-store");
            conn.setRequestProperty("Accept", "application/json");
            int status = conn.getResponseCode();
            if(status == 401) { token.invalidate(); throw new SecurityException("Synthetic session expired"); }
            if(status >= 300 && status <= 399) throw new SecurityException("Redirect prohibited");
            if(status != 200 || !"no-store".equals(conn.getHeaderField("Cache-Control")))
                throw new SecurityException("Untrusted API response envelope");
            String contentType = conn.getHeaderField("Content-Type");
            if(contentType == null || !contentType.startsWith("application/json"))
                throw new SecurityException("Non-JSON response");
            try(InputStream stream = conn.getInputStream(); ByteArrayOutputStream b = new ByteArrayOutputStream()) {
                byte[] buf = new byte[1024]; int count;
                while((count = stream.read(buf)) != -1) {
                    if(b.size() + count > 65536) throw new SecurityException("Response over limit");
                    b.write(buf,0,count);
                }
                JSONObject body = new JSONObject(b.toString(StandardCharsets.UTF_8.name()));
                if(body.optBoolean("real_backend_connected",true))
                    throw new SecurityException("Expected synthetic-only response");
                return body;
            }
        } finally { conn.disconnect(); }
    }
}
