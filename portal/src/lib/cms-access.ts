import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side CMS UI guard. It never grants a database privilege.
 * All real writes must also be protected by Supabase RLS.
 * Supabase user_metadata is editable by the user and is not trusted.
 */
export function isTrustedCmsRole(role: unknown): boolean {
  if (typeof role !== "string") return false;
  const normalized = role.toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
}

/**
 * Fail closed on missing ID, transport error, RLS denial or malformed result.
 * RLS on profiles must restrict users to their own profile record.
 */
export async function hasPortalCmsAdminAccess(
  client: Pick<SupabaseClient, "from">,
  userId: string | null | undefined
): Promise<boolean> {
  if (typeof userId !== "string" || userId.length === 0) return false;
  try {
    const { data, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    return !error && isTrustedCmsRole(data?.role);
  } catch {
    return false;
  }
}
