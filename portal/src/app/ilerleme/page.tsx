import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVOfis | İlerleme ve Şeffaflık",
  description: "AVOfis portalının tarihli, kanıt sınırları belirtilmiş geliştirme durumu.",
  robots: { index: false, follow: false },
};

const report = [
  {
    title: "Bu dönem ne değişti?",
    body: "17 hizmet, 14 hedef kitle ve 12 işlem rotası esas alınarak kamu ana sayfası yenilendi. Kamu sayfaları yalnız AVOfis hizmet, işlem ve hukukî hazırlık kapsamına göre düzenlendi.",
  },
  {
    title: "Şimdi neredeyiz?",
    body: "Portal hâlâ kuruluş öncesi geliştirme ve önizleme aşamasındadır. Kod testlerinin başarılı olması, gerçek müşteri güvenliği veya bağımsız hukukî kabul anlamına gelmez.",
  },
  {
    title: "Sırada ne var?",
    body: "Bağımsız test ortamında hesap, dosya erişimi, rol ve yayın yetkileri doğrulanmalı. Hukukî içerik ile altı dildeki metinler yetkili kişilerce ayrıca incelenmelidir.",
  },
  {
    title: "Önemli sınır",
    body: "Müşteri kabulü, kişisel belge gönderimi, resmî başvuru, hukukî temsil ve ödeme işlemleri açık değildir. Bu sayfa üretim yayını, güvenlik sertifikası veya doğrulanmış hukukî hizmet taahhüdü değildir.",
  },
] as const;

export default function PublicProgressPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Sayfa konumu">
          <Link href="/" className="text-sky-200 underline underline-offset-4">
            AVOfis ana sayfa
          </Link>
        </nav>
        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Seviye 1 · Önizleme
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            İlerleme ve Şeffaflık
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Bilgi tarihi: 1 Kasım 2026 · Her kodun CI sonucu ilgili GitHub PR ve
            kanıt kayıtlarında ayrı doğrulanır. Bu içerik bağımsız ürün kabulü
            veya üretim yayını beyanı değildir.
          </p>
        </header>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {report.map(({ title, body }) => (
            <section key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-7 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100" role="note">
          Bu sayfadan veri, belge veya ödeme talep edilmez. Bir karar veya süre konusunda
          aciliyet varsa ilgili resmî kurum ve gerektiğinde yetkili hukuk profesyoneliyle görüşün.
        </p>
        <div className="mt-7 flex flex-wrap gap-5 text-sm">
          <Link href="/seviye-1-onizleme" className="text-sky-200 underline">Bütün ürün Seviye 1 önizlemesi</Link>
          <Link href="/hizmetler" className="text-sky-200 underline">Hizmet alanları</Link>
          <Link href="/baslangic" className="text-sky-200 underline">Kişisel verisiz hazırlık</Link>
          <Link href="/uyum" className="text-sky-200 underline">Yayın öncesi uyum sınırları</Link>
        </div>
      </div>
    </main>
  );
}
