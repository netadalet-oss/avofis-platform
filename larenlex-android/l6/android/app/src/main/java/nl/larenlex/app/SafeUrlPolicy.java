package nl.larenlex.app;

import java.net.URI;
import java.net.URISyntaxException;

/** Default reject: this Android shell does not install WebView or JS bridge. */
public final class SafeUrlPolicy {
    private SafeUrlPolicy() { }
    public static boolean isAllowed(String url) {
        if (url == null || url.length()>2048) return false;
        try {
            URI u = new URI(url);
            // A verified independent LarenLex API origin must be established first.
            // No URL is approved in this L3 development-only build.
            return false;
        } catch (URISyntaxException exception) { return false; }
    }
}
