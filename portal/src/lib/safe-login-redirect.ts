/**
 * AVOfis Seviye 1 / AV-019, AV-052: Never give untrusted query text to
 * Next.js router.replace(). Return only a known local authenticated route.
 * Query strings and fragments are not needed for ProtectedRoute return paths.
 */
export const DEFAULT_LOGIN_DESTINATION = "/dashboard";
const ALLOWED_PRIVATE_ROOTS = new Set([
  "dashboard", "musteri", "workspace", "documents", "cases"
]);

export function safePortalReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value || value.length > 512) {
    return DEFAULT_LOGIN_DESTINATION;
  }
  // Strict ASCII pathname only: forbid schemes, protocol-relative URLs,
  // encoded separators/dot segments, queries, control characters and escapes.
  if (!/^\/[A-Za-z0-9/_-]*$/.test(value) || value.includes("//")) {
    return DEFAULT_LOGIN_DESTINATION;
  }
  const parts = value.slice(1).split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    return DEFAULT_LOGIN_DESTINATION;
  }
  if (!ALLOWED_PRIVATE_ROOTS.has(parts[0])) {
    return DEFAULT_LOGIN_DESTINATION;
  }
  return value;
}

export function safeLoginDestinationFromSearch(search: string): string {
  if (typeof search !== "string" || search.length > 2048) {
    return DEFAULT_LOGIN_DESTINATION;
  }
  const params = new URLSearchParams(search);
  const next = params.getAll("next");
  return next.length === 1 ? safePortalReturnPath(next[0]) : DEFAULT_LOGIN_DESTINATION;
}
