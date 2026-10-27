import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileCheck2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Hizmet alanları" };
const categories = [
  ["Belge ve apostil organizasyonu", "Belge türü, düzenleyen makam, apostil ve tercüme ihtiyacı belirlenir. AVOfis apostil veya noterlik işlemi yapmaz.", "İdarî koordinasyon"],
  ["Hollanda idarî başvuru hazırlığı", "BRP, belediye, IND randevu ve belge listeleri; kişisel DigiD şifresi talep edilmez.", "Yetkiye bağlı destek"],
  ["Diploma değerlendirme", "IDW için gerekli belgeler ve başvuru adımları düzenlenir. Diploma değerlendirmesi meslek icra yetkisi yerine geçmez.", "İdarî koordinasyon"],
  ["İşletme kuruluş hazırlığı", "KVK, noter, adres ve UBO evrakı planlanır. Noter ve vergi uzmanı işlemleri bağımsız yürütür.", "Uzman işbirliği"],
  ["Türkiye–Hollanda belge işlemleri", "Belgelerin alınması, tasdik, yeminli tercüme ve teslim aşamaları koordine edilir.", "Yetkili tercüman"],
  ["Göçmenlik, uyuşmazlık, AİHM ve dava", "Somut hukukî değerlendirme ve temsil yetkili bağımsız uzman tarafından yürütülür; yetkisiz temsil üstlenilmez.", "Bağımsız uzman"]
];
export default function ServicesPage() {
 return <main className="avofis-theme min-h-screen">
  <div className="avofis-container max-w-5xl py-10 sm:py-14">
   <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>AVOfis</Link>
   <div className="avofis-page-head">
    <p className="avofis-eyebrow">HİZMET ÇERÇEVESİ</p>
    <h1 className="avofis-page-title mt-3">Hizmetler ve yetki sınırları</h1>
    <p className="mt-4 max-w-3xl text-sm leading-[1.8] text-[#B9C5DF]">Bu katalog bilgilendirme amaçlıdır. AVOfis'in kuruluş ve çalışma yetkisi koşulları tamamlanmadan hizmet satışı veya dosya kabulü yapılmaz. Her işlem için ayrı sözleşme, kapsam ve ücret teyidi gerekir.</p>
   </div>
   <div className="mt-8 grid items-stretch gap-3 sm:grid-cols-2">
    {categories.map((c,i)=><article key={c[0]} className="avofis-card flex h-full flex-col rounded-[18px] border p-5 sm:p-6">
     <div className="flex items-center justify-between gap-3"><span className="avofis-icon-tile"><FileCheck2 aria-hidden="true" className="h-5 w-5"/></span><span className="text-xs font-semibold text-[#8D9AB9]">0{i+1}</span></div>
     <h2 className="mt-4 text-[17px] font-semibold leading-snug text-[#F2F5FF]">{c[0]}</h2>
     <p className="mt-2 flex-1 text-[13px] leading-[1.75] text-[#B9C5DF]">{c[1]}</p>
     <p className="mt-5 border-t border-[#dfbf59]/15 pt-3 text-[11px] font-semibold uppercase tracking-[.1em] text-[#dfbf59]">{c[2]}</p>
    </article>)}
   </div>
   <div className="avofis-card mt-6 flex items-start gap-3 rounded-[18px] border p-5 sm:p-6">
    <span className="avofis-icon-tile shrink-0"><ShieldCheck aria-hidden="true" className="h-5 w-5"/></span>
    <p className="text-[13px] leading-[1.8] text-[#DCE3F1]">AVOfis kendisini Hollanda barosuna kayıtlı bir advocatenkantoor olarak tanıtmaz. Göçmenlik hukukunda temsil, mahkeme işleri, yeminli tercüme ve noterlik gerektiğinde bağımsız yetkili meslek mensupları görev alır.</p>
   </div>
   <Link href="/basvuru" className="avofis-cta avofis-btn mt-6">İletişim kanalı<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
  </div>
 </main>;
}
