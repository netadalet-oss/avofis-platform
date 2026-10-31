import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES, findService } from "@/lib/service-catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = findService(params.slug);
  return service
    ? { title: `${service.title} | AVOfis`, description: service.summary }
    : { title: "Sayfa bulunamadı | AVOfis" };
}

export default function HizmetBilgiPage({ params }: { params: { slug: string } }) {
  const service = findService(params.slug);
  if (!service) notFound();
  return (
    <main>
      <SiteHeader />
      <article className="container-shell py-12 md:py-16">
        <nav aria-label="Sayfa yolu" className="text-sm text-slate-300">
          <Link href="/hizmetler" className="text-sky-300 underline underline-offset-4 hover:text-white">Hizmet alanları</Link>
          <span aria-hidden="true" className="mx-3">/</span>
          <span aria-current="page">{service.title}</span>
        </nav>
        <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Bilgi ve hazırlık rehberi</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">{service.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{service.summary}</p>
        <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100" role="note">
          <strong>Hizmet durumu: yalnız genel bilgi.</strong> AVOfis henüz kuruluş öncesindedir.
          Bu sayfa ücretli kişisel danışmanlık, avukatlık, dosya kabulü, resmî başvuru veya temsil teklifi değildir.
          Kurum ve meslekî yetki doğrulanmadan işlem başlatılmaz. Kişisel dosyanızı bu sayfaya göndermeyin.
        </div>
        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Bu konu kimin için?</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">{service.audience}</p>
            <h2 className="mt-8 text-xl font-semibold">Kendiniz nasıl hazırlanabilirsiniz?</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-200">
              {service.preparation.map((line) => <li key={line}>{line}</li>)}
            </ol>
          </section>
          <section className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">İşleme başlamadan önce</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-200">
              {service.checks.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <p className="mt-8 text-xs leading-6 text-slate-400">
              Kaynak çerçevesi: 29 Ekim 2026 AVOfis v18 tarihli hizmet kapsamı. Bu metin hukukî
              ve dilsel insan onayından geçmiş güncel mevzuat özeti değildir.
              Somut ülke, yetkili kurum ve başvuru usulü ayrıca resmî kaynaktan doğrulanmalıdır.
            </p>
          </section>
        </div>
        <section className="mt-9 rounded-[24px] border border-sky-400/20 bg-[#10213a]/70 p-6">
          <h2 className="text-xl font-semibold">Konunuza uygun ilk hazırlığı yapın</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Kişisel belge veya kimlik bilgisi vermeden ilgili ülkeyi, konuyu ve varsa resmî karar/süre
            endişesini seçerek bir hazırlık listesi oluşturabilirsiniz. Bu araç dosya açmaz ve bilgi göndermez.
          </p>
          <Link href="/baslangic" className="mt-5 inline-block rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white">
            Sorununuza göre başlayın
          </Link>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
