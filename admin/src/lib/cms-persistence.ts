import type { SupabaseClient } from "@supabase/supabase-js";

type CmsClient = Pick<SupabaseClient, "from">;
type Result = { error: { message: string } | null };
type Hero = { title: string; subtitle: string };
export type SiteSettingKey = "navigation" | "modules" | "footer";

const noResult = (item: string): Result => ({
  error: {
    message: `${item} kaydı güncellenmedi veya yetki doğrulanamadı. Sayfayı yenileyip tekrar kontrol edin.`,
  },
});

/**
 * This is UI-side safety only; database RLS is the write authorization.
 * Read/merge/update preserves other top-level CMS fields, but is not
 * a transactional compare-and-swap against concurrent editors.
 */
export async function updateAdminHomeHero(
  client: CmsClient,
  hero: Hero
): Promise<Result> {
  try {
    const { data: existing, error: readError } = await client
      .from("pages")
      .select("content")
      .eq("slug", "home")
      .maybeSingle();

    if (readError) return { error: { message: readError.message } };
    const content = existing?.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return noResult("Ana sayfa");
    }

    const mergedContent = {
      ...content,
      hero: {
        title: hero.title,
        subtitle: hero.subtitle,
      },
    };

    const { data, error } = await client
      .from("pages")
      .update({ content: mergedContent })
      .eq("slug", "home")
      .select("id");

    if (error) return { error: { message: error.message } };
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return noResult("Ana sayfa");
    }
    return { error: null };
  } catch {
    return noResult("Ana sayfa");
  }
}

/**
 * Live schema has UNIQUE(key) and each of these three rows already exists.
 * Never fall back to INSERT/UPSERT from the browser.
 */
export async function updateExistingSetting(
  client: CmsClient,
  key: SiteSettingKey,
  value: unknown
): Promise<Result> {
  if (key !== "navigation" && key !== "modules" && key !== "footer") {
    return noResult("CMS ayarı");
  }
  try {
    const { data, error } = await client
      .from("site_settings")
      .update({ value })
      .eq("key", key)
      .select("id");

    if (error) return { error: { message: error.message } };
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return noResult("CMS ayarı");
    }
    return { error: null };
  } catch {
    return noResult("CMS ayarı");
  }
}
