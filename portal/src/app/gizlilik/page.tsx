import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, LockKeyhole } from "lucide-react";
export const metadata: Metadata = { title:"Gizlilik ve veri işleme" };
const topics = [
  ["Ön başvuru verileri","Başvuru açıldığında ad, e-posta, ilgili ülke, hizmet kategorisi, kısa açıklama, bilgilendirme sürümü ve onay zamanı kaydedilir. İlk başvuruda kimlik veya dava evrakı istenmez. Amacımız talebi değerlendirmek ve yanıt vermektir. Uygun hukukî dayanak, süreler ve silme usulü lansman öncesinde kesinleştirilecektir."],
  ["Belgeler ve erişim","Dosya portalına yalnızca hesap doğrulaması ve sözleşme süreci tamamlanınca erişilebilir. Belge işlemleri için özel depolama alanı ve erişim denetimi uygulanır. Hassas belgeler WhatsApp üzerinden istenmez."],
  ["Haklar ve dış sağlayıcılar","GDPR kapsamında kişisel verilere erişim, düzeltme, silme ve uygun durumlarda diğer haklar kullanılır. Barındırma, kimlik doğrulama ve ödeme sağlayıcılarına aktarım koşulları için nihai aydınlatma ve veri işleyen sözleşmeleri ayrıca onaylanacaktır."],
  ["İletişim","Veri koruma iletişim kanalı, şirketin doğrulanmış kurumsal e-postası ve adresi tescil ve hizmet açılışından önce burada yayımlanacaktır. Henüz belirlenmemiş bir adres veya e-posta gerçekte varmış gibi gösterilmemektedir."]
] as const;
export default function PrivacyPage() {
 return <main className="avofis-theme min-h-screen">
  <article className="avofis-container max-w-3xl py-10 sm:py-14">
   <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>AVOfis</Link>
   <div className="avofis-page-head"><p className="avofis-eyebrow"><LockKeyhole aria-hidden="true" className="h-4 w-4"/>GİZLİLİK</p><h1 className="avofis-page-title mt-3">Gizlilik ve ön başvuru bilgileri</h1><p className="mt-4 text-sm leading-[1.8] text-[#B9C5DF]">Bu sayfa üretim öncesi bilgilendirme taslağıdır. Veri sorumlusu şirketin tescilli adı, KVK numarası ve ulaşılabilir adresi kesinleşmeden başvuru toplama özelliği açılmamalıdır.</p></div>
   <div className="mt-8 space-y-3">{topics.map(([title,description],i)=>
    <section key={title} className="avofis-card flex items-start gap-4 rounded-[18px] border p-5 sm:p-6">
      <span className="avofis-icon-tile shrink-0 text-[12px] font-semibold">0{i+1}</span>
      <div className="min-w-0"><h2 className="text-[17px] font-semibold text-[#F2F5FF]">{title}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{description}</p></div>
    </section>)}</div>
  </article>
 </main>;
}
