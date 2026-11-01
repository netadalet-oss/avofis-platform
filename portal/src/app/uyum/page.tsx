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

/** R-068: navigable disclosure status, not approved policies or a customer complaint intake. */
const disclosureStatus = [
 { id: "genel-sartlar", title: "Genel şartlar — henüz onaylanmadı",
   body: "Hizmet şartları, sözleşmenin tarafları, meslekî yetki, ücretler ve veri işleme hükümleri bağımsız incelemeden geçmedi. Bu sayfa yürürlükte hizmet sözleşmesi veya gerçek teklif değildir." },
 { id: "sikayet", title: "Şikâyet ve itiraz kanalı — henüz açık değil",
   body: "AVOfis için doğrulanmış bir şikâyet iletişim kanalı, yanıt politikası ve sorumlu kişi henüz yayımlanmadı. Bu sayfadan şikâyet veya kişisel bilgi alınmaz. Resmî süreye bağlı bir işlem varsa yetkili kuruma veya hukuk profesyoneline doğrudan başvurun." },
 { id: "erisilebilirlik", title: "Erişilebilirlik — bağımsız test bekliyor",
   body: "WCAG 2.2 AA, klavye ile kullanım, ekran okuyucu ve çok dilli erişilebilirlik kontrollerinin bütünü bağımsız olarak kabul edilmedi. Erişilebilirlik geri bildirim kanalı henüz doğrulanmadı." },
 { id: "tuketici-haklari", title: "Tüketici hakları — işlem ve sözleşme kapalı",
   body: "Hizmetin uygulanabilir cayma, iptal, iade, bedel ve şikâyet koşulları açılış öncesinde ayrı hukuki inceleme gerektirir. Henüz çevrim içi ücretli sözleşme, ödeme veya gerçek hizmet kabulü sunulmaz. Bu açıklama tüketicinin kanundan doğan haklarını sınırlandırmaz." }
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
    <section className="mt-10" aria-labelledby="disclosure-status-title">
     <h2 id="disclosure-status-title" className="text-xl font-semibold">Politika ve haklara erişim — hazırlık durumu</h2>
     <p className="mt-3 text-sm leading-7 text-[#b9c5df]">Bu başlıklar tamamlanmış politika, şikâyet sistemi veya erişilebilirlik sertifikası değildir. Yalnız mevcut eksikleri şeffaf biçimde gösterir.</p>
     <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {disclosureStatus.map(item => (
       <section id={item.id} key={item.id} aria-labelledby={item.id + "-baslik"}
        className="avofis-card scroll-mt-24 rounded-xl border p-5">
        <h3 id={item.id + "-baslik"} className="text-base font-semibold">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#b9c5df]">{item.body}</p>
        <p className="mt-3 text-xs font-semibold text-[#f0d56d]">Bağımsız kabul: BEKLİYOR</p>
       </section>
      ))}
     </div>
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
