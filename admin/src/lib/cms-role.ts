/** A client UI guard only. Database RLS must enforce every privileged write. */
export function isCmsAdminRole(profileRole: unknown): boolean {
  if (typeof profileRole !== "string") return false;
  const normalized = profileRole.toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
}
