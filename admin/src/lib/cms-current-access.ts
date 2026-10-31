import type { SupabaseClient } from "@supabase/supabase-js";
import { isCmsAdminRole } from "./cms-role";

type AuthenticatedCmsClient = Pick<SupabaseClient, "auth" | "from">;

/**
 * Revalidates the current user via Supabase Auth server and then the
 * database-backed profile. Never trusts session.user_metadata or UI state.
 * This is a client-side UX gate only: database RLS remains authoritative.
 */
export async function canCurrentUserWriteCms(
  client: AuthenticatedCmsClient
): Promise<boolean> {
  try {
    const { data, error: authError } = await client.auth.getUser();
    const userId = data?.user?.id;
    if (authError || !userId) return false;

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !isCmsAdminRole(profile?.role)) return false;

    // A user could sign out/change identity while role lookup was pending.
    // Re-check the authenticated identity immediately before authorizing UI.
    const { data: checked, error: checkError } = await client.auth.getUser();
    return !checkError && checked?.user?.id === userId;
  } catch {
    return false;
  }
}
