/** Restrict browser cross-origin access to explicitly configured origins. */
export function configuredCorsOrigins(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  const origins = raw.split(",").map((entry) => entry.trim()).filter(Boolean);
  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("CORS_ORIGIN contains an invalid origin");
    }
    const isHttps = parsed.protocol === "https:";
    const isLocalHttp = parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]");
    if ((!isHttps && !isLocalHttp) || parsed.origin !== origin || parsed.username || parsed.password) {
      throw new Error("CORS_ORIGIN contains a disallowed origin");
    }
  }
  return [...new Set(origins)];
}
