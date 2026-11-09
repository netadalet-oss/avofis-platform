import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Java 21 local-only preview of W1 Gold catalogue.
 * NOT the production Spring Boot/Vaadin portal; does not authenticate users.
 */
public final class LarenLexW1Preview {
    public static void main(String[] args) throws Exception {
        if (args.length < 1 || args.length > 2) {
            System.err.println("Usage: java LarenLexW1Preview <Gold-preview.html> [port]");
            System.exit(2);
        }
        Path html = Path.of(args[0]).toAbsolutePath().normalize();
        if (!Files.isRegularFile(html)) throw new IOException("Preview HTML not found: " + html);
        int port = args.length == 2 ? Integer.parseInt(args[1]) : 8765;
        if (port < 1024 || port > 65535) throw new IllegalArgumentException("port 1024..65535 only");
        byte[] content = Files.readAllBytes(html);
        HttpServer server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), port), 16);
        server.createContext("/", (HttpExchange ex) -> {
            try {
                if (!"GET".equals(ex.getRequestMethod()) || !"/".equals(ex.getRequestURI().getPath())) {
                    ex.sendResponseHeaders(404, -1);
                    return;
                }
                ex.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
                ex.getResponseHeaders().set("Cache-Control", "no-store");
                ex.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
                ex.getResponseHeaders().set("X-Frame-Options", "DENY");
                ex.sendResponseHeaders(200, content.length);
                try (var os = ex.getResponseBody()) { os.write(content); }
            } finally { ex.close(); }
        });
        server.start();
        System.out.println("LarenLex W1 internal preview at http://127.0.0.1:" + port + "/");
        System.out.println("Loopback only; no auth, no real user workflows. Ctrl+C to stop.");
    }
}
