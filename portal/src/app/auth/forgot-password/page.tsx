import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AVOfis | Parola kurtarma kapalı",
  description: "Müşteri hesap kurtarma ve gerçek kullanıcı işlemleri henüz açık değildir.",
  robots: { index: false, follow: false }
};

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16 md:py-24">
        <div className="max-w-3xl rounded-[28px] border border-amber-300/30 bg-white/5 p-7 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Seviye 1 · hesap güvenliği</p>
          <h1 className="mt-3 text-3xl font-semibold">Parola kurtarma şu anda kapalı</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            AVOfis henüz yeni müşteri hesabı açmaz ve bu sayfadan parola kurtarma
            bağlantısı göndermez. Gerçek kimlik ve bağımsız güvenlik/yayın onayı
            olmadan e-posta, parola veya kişisel belge istenmez.
          </p>
          <p className="mt-4 text-sm leading-7 text-amber-200">
            Mevcut hesaplar ve yetkili personel erişimi ayrı kimlik doğrulama
            ve veri güvenliği incelemesine tabidir. Bu ekran bir kurtarma
            talebini almış veya yerine getirmiş değildir.
          </p>
          <Link href="/baslangic" className="mt-6 inline-flex min-h-11 items-center text-sm text-sky-200 underline underline-offset-4">
            Kişisel verisiz hazırlık sayfasına git
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
