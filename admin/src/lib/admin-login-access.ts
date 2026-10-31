import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seviye 1 / P09 and B04: client navigation guard only.
 * NEVER a grant of API/CMS/Storage privileges. Those require separately
 * verified server identity, authorization, staff assignment and RLS.
 *
 * User-editable metadata and a successful password login are NOT roles.
 * The live/staging staff schema may be absent: that must fail closed.
 */
export type AdminLoginAccess =
  | { allowed: true; reason: "VERIFIED_ADMIN_AAL2" }
  | { allowed: false; reason: "NO_SESSION" | "NOT_ADMIN" | "MFA_REQUIRED" | "VERIFY_FAILED" };

export async function verifyAdminLoginAccess(
  client: Pick<SupabaseClient, "auth" | "from">
): Promise<AdminLoginAccess> {
  try {
    const first = await client.auth.getUser();
    const uid = first.data?.user?.id;
    if (first.error || !uid) return { allowed: false, reason: "NO_SESSION" };

    // The DB row is only a UI qualification signal. Do not read user_metadata.
    const role = await client.from("avofis_staff")
      .select("role").eq("user_id", uid).maybeSingle();
    if (role.error || role.data?.role !== "admin") {
      return { allowed: false, reason: "NOT_ADMIN" };
    }

    const aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.error || !aal.data) return { allowed: false, reason: "VERIFY_FAILED" };
    if (aal.data.currentLevel !== "aal2") {
      return { allowed: false, reason: "MFA_REQUIRED" };
    }

    // A session switch while resolving staff membership must invalidate UI access.
    const second = await client.auth.getUser();
    if (second.error || second.data?.user?.id !== uid) {
      return { allowed: false, reason: "VERIFY_FAILED" };
    }
    return { allowed: true, reason: "VERIFIED_ADMIN_AAL2" };
  } catch {
    return { allowed: false, reason: "VERIFY_FAILED" };
  }
}
