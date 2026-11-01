import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { audiences } from "@/lib/avofis-site";
import { SERVICES } from "@/lib/service-catalog";

export const metadata: Metadata = {
  title: "Kimler için? | AVOfis",
  description: "14 hedef kitlenin özgün ihtiyaçları ve 17 hizmet alanıyla doğrudan eşleştirmeleri.",
  robots: { index: false, follow: false }
};

const groups = audiences;
const servicesBySlug = new Map(SERVICES.map(item => [item.slug, item] as const));

export default function AudiencesPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <div className="container-shell py-12 sm:py-16">
        <nav aria-label="Sayfa konumu" className="text-sm">
          <Link href="/" className="text-sky-200 underline underline-offset-4">AVOfis ana sayfa</Link>
        </nav>
        <header className="mt-9 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            AV-044 · 14 özgün kullanıcı ve ihtiyaç grubu
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Hukukî ve idarî destek kimler için?
          </h1>
          <p className="mt-5 text-sm leading-8 text-slate-300">
            Her hedef kitlenin özgün ihtiyaçları, talimatnamedeki hizmet adları
            üzerinden eşleştirilir. Bu eşleştirme uygun hizmeti araştırmaya
            yardımcı olur; ülkeye özel avukatlık veya temsil yetkisi,
            hukukî sonuç, ücret veya kabul taahhüdü oluşturmaz.
            Kişisel veri girmeniz gerekmez.
          </p>
        </header>
        <nav aria-label="Hedef kitle seçimi" className="mt-9 flex flex-wrap gap-2">
          {groups.map((group, index) => (
            <a key={group.slug} href={"#" + group.slug}
              className="inline-flex min-h-10 items-center rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs text-sky-100 hover:border-sky-300/60">
              {String(index + 1).padStart(2, "0")} · {group.title.tr}
            </a>
          ))}
        </nav>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {groups.map((group, index) => (
            <article id={group.slug} key={group.slug}
              className="scroll-mt-24 rounded-2xl border border-white/15 bg-white/[.04] p-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-sky-300">
                HEDEF KİTLE {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{group.title.tr}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{group.lead.tr}</p>
              <h3 className="mt-5 text-sm font-semibold text-white">Başlıca konular</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300">
                {group.needs.map(need => <li key={need.tr}>{need.tr}</li>)}
              </ul>
              <h3 className="mt-5 text-sm font-semibold text-white">İlgili hizmetler</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.serviceSlugs.map(slug => {
                  const service = servicesBySlug.get(slug);
                  if (!service) return null;
                  return (
                    <li key={slug}>
                      <Link href={"/hizmetler/" + slug}
                        className="inline-flex min-h-10 items-center rounded-lg border border-sky-300/30 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-300/10">
                        {service.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
        <aside role="note" className="mt-10 rounded-xl border border-amber-300/25 bg-amber-300/[.08] p-6 text-sm leading-7 text-amber-100">
          Hukukî temsil ve kişisel dosya işlemleri yetki, güvenli kimlik, veri
          koruma ve bağımsız insan onayı tamamlanana dek açık değildir. Özel
          bilgilerinizi veya karar belgelerinizi bu kamu sayfasına göndermeyin.
        </aside>
        <div className="mt-7 flex flex-wrap gap-5 text-sm">
          <Link href="/islemler" className="text-sky-200 underline underline-offset-4">12 işlem rotasını inceleyin</Link>
          <Link href="/katalog" className="text-sky-200 underline underline-offset-4">Altı dil hizmet kataloğu</Link>
          <Link href="/uyum" className="text-sky-200 underline underline-offset-4">Hukukî sınırlar</Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
