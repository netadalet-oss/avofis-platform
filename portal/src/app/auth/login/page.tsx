import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PUBLIC_ACCOUNT_LOGIN_ENABLED } from "@/lib/launch-gates";

export const metadata: Metadata = {
  title: "Müşteri girişi kapalı | AVOfis",
  description: "AVOfis henüz gerçek müşteri hesabı veya oturum açma işlemi kabul etmemektedir.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  // Explicit immutable release evidence is absent. Do not import the Supabase
  // browser client, request passwords or execute any authentication operation.
  if (PUBLIC_ACCOUNT_LOGIN_ENABLED) {
    throw new Error("PUBLIC_ACCOUNT_LOGIN_REQUIRES_REVIEWED_IMPLEMENTATION");
  }

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16 md:py-24">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Kuruluş öncesi bilgilendirme
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Müşteri girişi şu anda kapalı</h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Müşteri hesaplarına giriş, bağımsız kimlik ve güvenlik testleri,
            veri koruma incelemesi ve yetkili yayın onayı tamamlanana kadar
            kullanıma açık değildir. Bu sayfa oturum, parola veya belge almaz.
          </p>
          <p role="status" className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
            Bu ekran üzerinden yeni müşteri dosyası oluşturulmaz, kişisel
            veri alınmaz ve hukukî temsil ilişkisi kurulmaz.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/baslangic" className="rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white">
              Kişisel verisiz hazırlık
            </Link>
            <Link href="/hizmetler" className="rounded-xl border border-white/20 px-5 py-3 text-sm text-slate-100 hover:bg-white/10">
              Hizmet alanlarını inceleyin
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
