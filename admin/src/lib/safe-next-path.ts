/**
 * AVOfis S2: redirect only to an on-site, well-formed route.
 * Never use an attacker-controlled next query directly in router.replace.
 * This is navigation hygiene, not authentication or staff authorization.
 */
export function safeNextPath(candidate: string | null | undefined): string {
  const fallback = "/cms";
  if (typeof candidate !== "string" || candidate.length === 0 || candidate.length > 1024) return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  // Reject nested/double-encoded paths and separators, not just literal //.
  if (/%(?:2f|5c|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(candidate)) return fallback;

  try {
    const origin = "https://avofis.invalid";
    const url = new URL(candidate, origin);
    if (url.origin !== origin || !url.pathname.startsWith("/")) return fallback;
    if (/^\/(?:auth(?:\/|$)|login(?:\/|$))/i.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
