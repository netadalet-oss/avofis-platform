import Link from "next/link";

/**
 * Seviye 1 / B02 / R-524 / R-527 / R-580 / R-587.
 * Publicly renderable information only; do not fetch client/staff data or
 * expose CMS writes before server-side staff + MFA + scoped approval exist.
 * The invalid historical TSX source is retained in Git history for review.
 */
export default function CmsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-14 text-slate-900">
      <Link href="/dashboard" className="text-sm font-medium text-slate-600 underline underline-offset-4">
        Yönetim alanına dön
      </Link>
      <header className="space-y-3">
        <p className="text-sm font-semibold text-slate-500">AVOfis · İçerik yönetimi</p>
        <h1 className="text-3xl font-semibold tracking-tight">Yayın ve içerik kontrolü</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-700">
          Bu alanda içerik düzenleme ve yayımlama işlemleri henüz kullanıma açık değildir.
          Yayın izinleri ve hukukî inceleme sorumluları doğrulandıktan sonra yetkili
          personelin çalışma akışına bağlanacaktır.
        </p>
      </header>
      <section aria-labelledby="release-requirements" className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 id="release-requirements" className="text-lg font-semibold">Yayından önce gereken kontroller</h2>
        <p className="mt-3 leading-7 text-slate-700">
          Kişiye özel personel yetkisi, güvenli kimlik doğrulama, içerik sürümü,
          hukukî ve dilsel gözden geçirme ile ikinci kişinin yayın onayı tamamlanmadan
          içerik değişikliği kabul edilmez.
        </p>
      </section>
      <p className="text-sm leading-6 text-slate-600">
        Bu ekran, bir içeriğin yayımlandığını veya bir personelin işlem yetkisi bulunduğunu göstermez.
      </p>
    </main>
  );
}
