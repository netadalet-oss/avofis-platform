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
    body: "Açık hizmet kataloğu ve kişisel veri toplamayan hazırlık ekranları için yazılım ve test çalışmaları yapıldı. Kamuya açık hesap kaydı ile içerik düzenleme işlevleri kapalı tutuldu.",
  },
  {
    title: "Şimdi neredeyiz?",
    body: "Portal kuruluş öncesi geliştirme ve önizleme aşamasındadır. Kod testlerinden geçmek, gerçek kullanıcı güvenliği veya bağımsız hukukî kabul anlamına gelmez.",
  },
  {
    title: "Sırada ne var?",
    body: "Ayrı bir test ortamında kimlik, dosya erişimi, yayın yetkisi ve güvenlik sınırları doğrulanacak. Dil ve hukuk içerikleri yetkili kişilerce ayrıca incelenecek.",
  },
  {
    title: "Önemli sınır",
    body: "Şu anda müşteri kabulü, kişisel belge gönderimi, resmî başvuru, hukukî temsil veya ödeme işlemi açık değildir. Bu sayfa güncel canlı sistem onayı değil, tarihli bir ilerleme özetidir.",
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
            Bilgi tarihi: 31 Ekim 2026 · Kaynak kodu kanıtı: 56697cdf ·
            Bu içerik bağımsız ürün kabulü veya üretim yayını beyanı değildir.
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
          <Link href="/hizmetler" className="text-sky-200 underline">Hizmet alanları</Link>
          <Link href="/baslangic" className="text-sky-200 underline">Kişisel verisiz hazırlık</Link>
          <Link href="/uyum" className="text-sky-200 underline">Yayın öncesi uyum sınırları</Link>
        </div>
      </div>
    </main>
  );
}
