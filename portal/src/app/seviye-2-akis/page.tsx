import Link from "next/link";
import type { Metadata } from "next";
import { audiences } from "@/lib/avofis-site";
import { journeys } from "@/lib/journeys";
import { SERVICES } from "@/lib/service-catalog";
import { audienceFirstPaths } from "@/lib/audience-journey-map";
import { journeyServiceSlugs } from "@/lib/journey-service-links";
import { StageTwoPublicFlow } from "@/components/StageTwoPublicFlow";
import { validateStageTwoNavigation } from "@/lib/stage-two-navigation";

export const metadata: Metadata = {
  title: "AVOfis | Seviye 2 İşlem Akışı Önizlemesi",
  description: "Hedef kitle, işlem ve hizmet sayfalarını bağlayan kişisel verisiz gezinti.",
  robots: { index: false, follow: false }
};

const stageAudiences = audiences.map(item => ({
  slug: item.slug,
  title: item.title.tr,
  journeyIds: audienceFirstPaths[item.slug] ?? [],
  serviceSlugs: item.serviceSlugs
}));
const stageJourneys = journeys.map(item => ({
  id: item.id,
  title: item.title.tr,
  serviceSlugs: journeyServiceSlugs[item.id] ?? [],
  fields: item.fields.map(field => ({
    key: field.key, label: field.label.tr,
    options: field.options.map(option => ({value: option.value, label: option.label.tr}))
  }))
}));
const stageServices = SERVICES.map(item => ({ slug: item.slug, title: item.title }));
validateStageTwoNavigation(stageAudiences, stageJourneys, stageServices);

export default function StageTwoPublicNavigation() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Seviye 2 önizleme" className="flex flex-wrap gap-5 text-sm">
          <Link href="/" className="text-sky-200 underline">AVOfis ana sayfa</Link>
          <Link href="/seviye-1-onizleme" className="text-sky-200 underline">Seviye 1 kanıt önizlemesi</Link>
          <Link href="/uyum" className="text-sky-200 underline">Açık onay koşulları</Link>
        </nav>
        <header className="my-9 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            Seviye 2 · Yatay akış iskeleti · Geliştirme önizlemesi
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Hedef kitleden güvenli bilgi sonucuna
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            14 hedef kitle, 12 işlem rotası ve 17 hizmet için gerçek sayfalara
            giden navigasyon. Bu ekran henüz işlem, dosya, kimlik ve ücret kabul etmez.
          </p>
        </header>
        <StageTwoPublicFlow audiences={stageAudiences}
          journeys={stageJourneys} services={stageServices} />
        <section className="mt-9 rounded-2xl border border-amber-300/30 p-6 text-sm leading-7 text-amber-100">
          <h2 className="font-semibold">Seviye 1’den devreden açık işler</h2>
          <p className="mt-2">
            Portal HTTP CI eski bağlantı beklentisi, bağımsız staging,
            7 RLS güvenlik bulgusu, gerçek yetkili oturum ve 594 gereksinimin
            bağımsız/hukukî kabulü açık. Bu gezinim onların yerine geçmez.
          </p>
        </section>
      </div>
    </main>
  );
}
