import Link from "next/link";
import {publicCustomerTransactionsAuthorized} from "@/lib/public-release-status";

export const metadata={title:"AVOfis | Yayın öncesi uyum durumu",robots:{index:false,follow:false}};
const gates=[
 ["Kurucu ve yetki","Tescilli şirket, gerçek yönetici, meslekî sıfat ve çalışma hakkı"],
 ["AVG/GDPR","Madde 13 kimlik/iletişim, amaç/dayanak, DPA, saklama/DSAR, gerekiyorsa aktarım"],
 ["Bilgi ve dil","Ülkeye bağlı hukukî kaynaklar, TR/NL editör, DE/EN/AR/RU insan kalite onayı"],
 ["Güvenlik","Bağımsız Supabase staging, A/B Auth/Storage, migrasyon/geri alma, RLS"],
 ["Tüketici","Gerçek hizmet sözleşmesi, ücret/KDV/harç ayrımı, cayma/iptal ve iade"],
 ["Proje sahibi","Tarih ve kanıt referanslı ayrı canlıya geçiş imzası"]
] as const;
export default function ComplianceStatusPage(){
 return <main className="avofis-theme min-h-screen px-5 py-10 sm:px-8">
   <div className="mx-auto max-w-5xl">
    <nav><Link href="/" className="text-[#dfbf59] underline">AVOfis · Ana sayfa</Link></nav>
    <header className="mt-8 max-w-3xl">
     <p className="avofis-eyebrow">T08 · B05/B06/B08/B09</p>
     <h1 className="avofis-page-title mt-3">Yayın ve işlem kabulü kontrolü</h1>
     <p className="mt-4 text-sm leading-7 text-[#b9c5df]">Şu andaki kod durumunda kişisel veri kabulü ve ödeme açılışı için gereken imzalı onaylar yoktur. Uygulama teknik bayraklarla tek başına açılamaz. Bu sayfa bir uygunluk sertifikası veya tam GDPR bildirimi değildir.</p>
    </header>
    <p className="mt-7 rounded-xl border border-[#dfbf59]/35 bg-[#071738] p-5 font-semibold text-[#f0d56d]" role="status">
     {publicCustomerTransactionsAuthorized?"İnsan onayı kaydı ayrıca doğrulanmalıdır.":"Başvuru / ödeme: KAPALI · NO-GO"}
    </p>
    <section className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Eksik bağımsız imzalar">
     {gates.map(([title,detail])=><article key={title} className="avofis-card rounded-xl border p-5">
       <h2 className="text-base font-semibold">{title}</h2>
       <p className="mt-2 text-sm leading-7 text-[#b9c5df]">{detail}</p>
       <p className="mt-3 text-xs font-semibold text-[#f0d56d]">İnsan kanıtı / onay: BEKLİYOR</p>
     </article>)}
    </section>
    <div className="mt-7 flex flex-wrap gap-5 text-sm">
     <Link href="/gizlilik?lang=tr" className="text-[#dfbf59] underline">Gizlilik taslağı</Link>
     <Link href="/cerezler?lang=tr" className="text-[#dfbf59] underline">Çerez durum açıklaması</Link>
     <Link href="/diller" className="text-[#dfbf59] underline">Altı dilin editör durumu</Link>
     <Link href="/basvuru?lang=tr" className="text-[#dfbf59] underline">Kapalı başvuru görünümü</Link>
    </div>
   </div>
  </main>;
}
