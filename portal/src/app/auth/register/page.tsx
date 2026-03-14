import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-24">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold text-white">Hesap Oluştur</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Avukat, stajyer ve ofis hesabı için rol seçimi destekli kayıt ekranı.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
