package nl.larenlex.app;

/** Explicit fail-closed API boundary until independent issuer, TLS and A4 schema approval.
 * No INTERNET permission appears in this development manifest. */
public final class NativeReadOnlyApiClient {
    private NativeReadOnlyApiClient() { }
    public static String get(String path) {
        throw new SecurityException("Independent Android backend and token issuer not configured; network disabled");
    }
}
