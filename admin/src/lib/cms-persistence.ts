import type { SupabaseClient } from "@supabase/supabase-js";

type CmsClient = Pick<SupabaseClient, "from">;
type Failure = { message: string };
type Result = { error: Failure | null };
type Hero = { title: string; subtitle: string };
type HomeResult = Result & { updatedContent?: Record<string, unknown> };
export type SiteSettingKey = "navigation" | "modules" | "footer";

const notUpdated = (item: string): Result => ({
  error: {
    message: `${item} kaydı değişmiş, kaybolmuş veya yetki reddedilmiş olabilir. İçeriği yenileyip tekrar deneyin.`,
  },
});

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Update ONLY the home record originally observed by this editor.
 * PostgreSQL jsonb = jsonb comparison on the extra content filter makes
 * the check-and-update one atomic filtered UPDATE. If another editor changed
 * any field since load, the update affects zero rows and fails closed.
 * The browser cannot bypass RLS; this check is not its substitute.
 *
 * No automatic retry: doing so can overwrite the other editor's changes.
 */
export async function updateAdminHomeHero(
  client: CmsClient,
  hero: Hero,
  observedContent: unknown
): Promise<HomeResult> {
  if (!isPlainObject(observedContent)) return notUpdated("Ana sayfa");
  const updatedContent = {
    ...observedContent,
    hero: { title: hero.title, subtitle: hero.subtitle },
  };

  try {
    const { data, error } = await client
      .from("pages")
      .update({ content: updatedContent })
      .eq("slug", "home")
      .eq("content", JSON.stringify(observedContent))
      .select("id");

    if (error) return { error: { message: error.message } };
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return notUpdated("Ana sayfa");
    }
    return { error: null, updatedContent };
  } catch {
    return notUpdated("Ana sayfa");
  }
}

/**
 * Settings are arrays in the actual navigation/modules/footer UI.
 * Compare against the last content this browser loaded, not a newly fetched
 * snapshot at save time; stale editors must not overwrite intervening edits.
 * This does not make the multi-setting "load defaults" action transactional.
 */
export async function updateExistingSetting(
  client: CmsClient,
  key: SiteSettingKey,
  value: unknown,
  observedValue: unknown
): Promise<Result> {
  if (!["navigation", "modules", "footer"].includes(key) ||
      !Array.isArray(observedValue) || !Array.isArray(value)) {
    return notUpdated("CMS ayarı");
  }
  try {
    const { data, error } = await client
      .from("site_settings")
      .update({ value })
      .eq("key", key)
      .eq("value", JSON.stringify(observedValue))
      .select("id");

    if (error) return { error: { message: error.message } };
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return notUpdated("CMS ayarı");
    }
    return { error: null };
  } catch {
    return notUpdated("CMS ayarı");
  }
}
