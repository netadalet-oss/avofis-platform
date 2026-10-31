import type { SupabaseClient } from "@supabase/supabase-js";

export type CmsUpdateResult = { error: { message: string } | null };

/**
 * Fail-closed update of the pre-existing, unique home page row.
 * Insert/upsert is intentionally prohibited: live RLS grants UPDATE to admins,
 * not an unrestricted INSERT to web clients. Only one returned row means success.
 * Database RLS remains the authoritative authorization layer.
 */
export async function updateExistingHomeContent(
  client: Pick<SupabaseClient, "from">,
  content: object
): Promise<CmsUpdateResult> {
  try {
    const { data, error } = await client
      .from("pages")
      .update({ content })
      .eq("slug", "home")
      .select("id");

    if (error) {
      return { error: { message: error.message } };
    }
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return {
        error: {
          message:
            "Ana sayfa kaydı doğrulanamadı. Güncelleme yapılmadı veya yetkiniz bulunmuyor.",
        },
      };
    }
    return { error: null };
  } catch {
    return { error: { message: "CMS kaydı doğrulanamadı; işlem başarısız." } };
  }
}
