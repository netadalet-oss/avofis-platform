import Link from "next/link";
import type { Metadata } from "next";
import { STAFF_TOP_LEVEL } from "@/lib/staff-module-directory";
import { staffScreenHandoffs, validateStaffScreenHandoffs } from "@/lib/staff-flow-handoffs";

export const metadata: Metadata = {
  title: "AVOfis | Seviye 2 Personel Akış İskeleti",
  description: "16 personel modülünde giriş, sentetik işlem ve kapalı sonuç geçişleri.",
  robots: { index: false, follow: false }
};

if (!validateStaffScreenHandoffs()) throw new Error("INVALID_STAGE_TWO_STAFF_SCREEN_NAVIGATION");

/** Only canonical modules are shown. No API call or staff/customer records. */
const stages = [
  { key: "ENTRY", title: "1. Giriş", detail: "Modülü ve konu sınırını seçin" },
  { key: "PREPARE", title: "2. Hazırlık", detail: "Sentetik ana eylem — kayıt oluşturulmaz" },
  { key: "REVIEW", title: "3. İnsan kontrolü", detail: "Yetki, AAL2, tenant ve RLS kanıtı gerekir" },
  { key: "CLOSED", title: "4. Sonuç", detail: "Yalnız sentetik sonuç; gerçek işlem kapalı" }
] as const;

export default function StaffLevelTwoFlow() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Personel gezinimi" className="flex flex-wrap gap-5 text-sm">
          <Link href="/" className="text-sky-200 underline">Yönetim ana sayfa</Link>
          <Link href="/seviye-1-onizleme" className="text-sky-200 underline">Seviye 1 kapsamı</Link>
        </nav>
        <header className="mt-10 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-300">
            Seviye 2 · 16 modül · Gezinim ve işlem iskeleti
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Personel modüllerinde giriş → işlem → sonuç
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Her modülün gerçek Next.js ekranına geçerek yerel ve sentetik
            hazırla → kontrol et → sıfırla adımlarını deneyebilirsiniz.
            Bu sayfalar gerçek personel yetkisi, müşteri dosyası, ödeme,
            mesajlaşma veya kurum gönderimi sağlamaz.
          </p>
        </header>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map(stage => (
            <li key={stage.key} className="rounded-xl border border-white/15 bg-white/5 p-5">
              <h2 className="font-semibold">{stage.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{stage.detail}</p>
            </li>
          ))}
        </ol>
        <section className="mt-11" aria-labelledby="module-flows">
          <h2 id="module-flows" className="text-2xl font-semibold">
            {STAFF_TOP_LEVEL.length} kanonik personel modülü
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAFF_TOP_LEVEL.map((module, index) => (
              <article key={module.slug} className="flex flex-col rounded-xl border border-white/15 bg-white/5 p-5">
                <p className="text-xs font-semibold text-sky-300">
                  AV-{String(62 + index).padStart(3, "0")} · {module.slug}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{module.title}</h3>
                <dl className="mt-3 flex-1 space-y-3 text-sm leading-6">
                  <div><dt className="font-semibold">Giriş</dt>
                    <dd className="text-slate-300">{module.scope}</dd></div>
                  <div><dt className="font-semibold">Sentetik hazırlık</dt>
                    <dd className="text-slate-300">{module.firstAction}</dd></div>
                  <div><dt className="font-semibold">Kapalı sonuç taslağı</dt>
                    <dd className="text-slate-300">{module.output}</dd></div>
                </dl>
                <p className="mt-3 text-xs text-slate-300">
                  {staffScreenHandoffs(module.slug).length} sonraki ekran bağlantısı · kayıt devri yok
                </p>
                <Link href={"/personel/" + module.slug}
                  className="mt-5 inline-flex min-h-11 items-center text-sm text-sky-200 underline">
                  Modülün gerçek sentetik ekranına geç
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-xl border border-amber-300/30 bg-amber-300/10 p-6">
          <h2 className="font-semibold text-amber-100">API, veri ve insan yetkisi sınırları</h2>
          <p className="mt-3 text-sm leading-7 text-amber-100">
            On API modülü ayrı program akış sözleşmesinde SCAFFOLD_NOT_AUTHORIZED
            kalır. Bağımsız staging, Auth/AAL2, tenant, RLS, audit, gerçek
            personel ve meslekî yetki olmadan işlem sonucu uygulanmaz.
            Seviye 1 güvenlik ve CI engelleri ayrı izlenmeye devam eder.
          </p>
          <p className="mt-3 text-sm text-amber-100">
            Bağımsız R kabulü: 0/594 · Canlı kabul: 0/594.
          </p>
        </section>
      </div>
    </main>
  );
}
