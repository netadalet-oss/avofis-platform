import Link from "next/link";
import { staffModuleBySlug } from "@/lib/staff-module-directory";

/**
 * Stage-one replacements for 13 legacy empty admin pages: real safe navigation
 * to the currently implemented 16 synthetic personnel workspaces, not CRUD.
 */
export const ADMIN_LEGACY_BRIDGES = {
  analytics: { name: "Analitik", modules: ["reporting", "audit"] },
  audit: { name: "Denetim kayıtları", modules: ["audit"] },
  careers: { name: "Kariyer", modules: ["people", "calendar"] },
  cases: { name: "Dosyalar", modules: ["matters", "documents", "calendar"] },
  dashboard: { name: "Yönetim göstergeleri", modules: ["inbox", "reporting"] },
  forum: { name: "Topluluk moderasyonu", modules: ["messages", "audit"] },
  media: { name: "Medya ve belgeler", modules: ["documents"] },
  menus: { name: "Menü ve yayın ayarları", modules: ["settings"] },
  notifications: { name: "Bildirimler", modules: ["messages", "inbox"] },
  roles: { name: "Roller ve personel", modules: ["people", "settings"] },
  settings: { name: "Sistem ayarları", modules: ["settings", "audit"] },
  statutes: { name: "Mevzuat ve kaynaklar", modules: ["research"] },
  users: { name: "Kullanıcı yönetimi", modules: ["people", "audit"] }
} as const;

export type AdminLegacySection = keyof typeof ADMIN_LEGACY_BRIDGES;

export function AdminSectionBridge({ section }: { section: AdminLegacySection }) {
  const item = ADMIN_LEGACY_BRIDGES[section];
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap gap-4 text-sm text-sky-200">
          <Link href="/" className="underline underline-offset-4">AVOfis yönetim</Link>
          <Link href="/seviye-1-onizleme" className="underline underline-offset-4">
            Bütün 16 modül
          </Link>
        </nav>
        <header className="mt-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            Seviye 1 · Ana çalışma alanı · {section}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{item.name}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Bu alandaki çalışma yolları ilgili personel modülünün temel önizlemesine bağlandı.
            Henüz müşteri verisi, personel hesabı, kalıcı işlem veya gerçek yayın yetkisi yok.
          </p>
        </header>
        <section aria-labelledby="module-paths" className="mt-8">
          <h2 id="module-paths" className="text-xl font-semibold">
            Bu bölümün ana modül yolları
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {item.modules.map((slug) => {
              const module = staffModuleBySlug(slug);
              if (!module) return null;
              return (
                <Link key={slug} href={"/personel/" + slug}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6 hover:border-sky-300/50">
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{module.scope}</p>
                  <p className="mt-4 text-xs font-semibold text-sky-200">
                    Yerel, sentetik ana akışı deneyin
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5"
          role="note">
          <h2 className="font-semibold">Yetki ve yayın kapısı</h2>
          <p className="mt-2 text-sm leading-7 text-amber-100">
            Bu bağlantılar özel API, gerçek Auth, tenant, Storage, CRM, ödeme veya kurum
            erişimini açmaz. Kimlik, AAL2, RLS, insan ve hukukî onay henüz yoktur.
            Bu ekran yalnız Seviye 1 bütün ürün ana işlev önizlemesidir.
          </p>
        </section>
      </div>
    </main>
  );
}
