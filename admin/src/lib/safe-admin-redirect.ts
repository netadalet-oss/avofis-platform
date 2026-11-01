/** AVOfis Seviye 1 / AV-019: admin return URL must never be untrusted router input. */
export const DEFAULT_ADMIN_DESTINATION = "/cms";
const ADMIN_ROOTS = new Set([
  "cms", "dashboard", "users", "roles", "audit", "settings",
  "cases", "statutes", "forum", "careers", "analytics", "media",
  "menus", "mfa", "notifications"
]);

export function safeAdminReturnPath(value: unknown): string {
  if (typeof value !== "string" || value.length < 2 || value.length > 512) {
    return DEFAULT_ADMIN_DESTINATION;
  }
  // Accept only literal local pathnames; never accept URLs, escapes,
  // backslashes, queries, fragments, dot segments or encoded separators.
  if (!/^\/[A-Za-z0-9/_-]*$/.test(value) || value.includes("//")) {
    return DEFAULT_ADMIN_DESTINATION;
  }
  const parts = value.slice(1).split("/");
  if (parts.some(segment => !segment || segment === "." || segment === "..")) {
    return DEFAULT_ADMIN_DESTINATION;
  }
  return ADMIN_ROOTS.has(parts[0]) ? value : DEFAULT_ADMIN_DESTINATION;
}

export function safeAdminDestinationFromSearch(search: string): string {
  if (typeof search !== "string" || search.length > 2048) {
    return DEFAULT_ADMIN_DESTINATION;
  }
  const values = new URLSearchParams(search).getAll("next");
  return values.length === 1 ? safeAdminReturnPath(values[0]) : DEFAULT_ADMIN_DESTINATION;
}
