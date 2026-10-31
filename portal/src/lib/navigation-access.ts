import type { SupabaseClient } from "@supabase/supabase-js";
import type { NavigationItem } from "./site";
import { hasPortalCmsAdminAccess } from "./cms-access";

type PublicClient = Pick<SupabaseClient, "auth" | "from">;

/** An extra browser-side safeguard, never a replacement for database RLS. */
export async function saveVerifiedNavigation(
  client: PublicClient,
  expectedUserId: string | null,
  proposed: NavigationItem[],
  observedValue: NavigationItem[] | null
): Promise<{ error: { message: string } | null }> {
  if (!expectedUserId || !Array.isArray(observedValue) || !Array.isArray(proposed) ||
      proposed.length === 0 || proposed.length > 30 ||
      proposed.some((x) => !x.label?.trim() || !x.href?.trim() ||
        x.label.length > 100 || x.href.length > 500)) {
    return { error: { message: "Yetki veya menü verileri doğrulanamadı." } };
  }
  try {
    const { data: current, error: authError } = await client.auth.getUser();
    if (authError || current?.user?.id !== expectedUserId ||
        !(await hasPortalCmsAdminAccess(client, expectedUserId))) {
      return { error: { message: "Menü güncellemesi için geçerli yönetici yetkisi yok." } };
    }
    const { data, error } = await client
      .from("site_settings")
      .update({ value: proposed })
      .eq("key", "navigation")
      .eq("value", JSON.stringify(observedValue))
      .select("id");
    if (error) return { error: { message: error.message } };
    if (!Array.isArray(data) || data.length !== 1 || !data[0]?.id) {
      return { error: { message: "Menü başka bir oturumda değişmiş olabilir; yenileyin." } };
    }
    return { error: null };
  } catch {
    return { error: { message: "Menü kaydedilemedi. Yetki ve bağlantıyı kontrol edin." } };
  }
}
