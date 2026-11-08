import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

type AdminTile = { title: string; description: string; href?: string };
const workTiles: AdminTile[] = [
  { title: "Yeni başvurular", description: "Hizmet ve iş taleplerinin ilk incelemesi." },
  { title: "İnceleme ve yönlendirme", description: "Başvuruların kontrol edilmesi ve uygun uzmana yönlendirilmesi." },
  { title: "İş talepleri ve teklifler", description: "Yayımlanan işler, bütçe önerileri ve uzman teklifleri." },
  { title: "Anlaşmalar ve aktif işler", description: "Kapsamı onaylanan işlerin yürütülmesi ve takibi." },
  { title: "Teslim ve revizyon", description: "Sunulan çalışmaların kontrolü ve düzeltme talepleri." },
  { title: "Bütçe, ödeme ve itiraz", description: "Ödeme koşulları, işlem kayıtları ve uyuşmazlık incelemesi." }
];
const contentTiles: AdminTile[] = [
  { title: "Makaleler ve uzman görüşleri", description: "Yazıların inceleme ve yayımlama süreci.", href: "/cms" },
  { title: "Hukuk haberleri", description: "Haber seçimi, kaynak kontrolü ve yayın onayı.", href: "/cms" },
  { title: "Soru–cevap ve forum", description: "Yorum, soru, yanıt ve ihbar değerlendirmesi.", href: "/forum" },
  { title: "İçerik ve görsel kütüphanesi", description: "Yayımlanan sayfa ve medya içerikleri.", href: "/media" }
];
const managementTiles: AdminTile[] = [
  { title: "Kullanıcı ve hukukçu profilleri", description: "Hesaplar, profil durumları ve başvurular.", href: "/users" },
  { title: "Görev ve erişim yetkileri", description: "Ekip rolleri ve işlem yetkileri.", href: "/roles" },
  { title: "Sayfalar ve menüler", description: "Portal menü ve içerik düzenlemeleri.", href: "/menus" },
  { title: "İşlem kayıtları", description: "İşlem geçmişi ve yönetici denetimi.", href: "/audit" },
  { title: "Sistem ayarları", description: "Teknik ve kurumsal yapılandırma.", href: "/settings" }
];

function Tile({ tile }: { tile: AdminTile }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-bold text-[#27415b]">{tile.title}</h3>
        {tile.href && <ArrowRight size={15} className="shrink-0 text-[#9daab6]"/>}
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#7d8998]">{tile.description}</p>
    </>
  );
  const className = "block rounded-2xl border border-[#e5ebf1] bg-white p-5 " +
    (tile.href ? "hover:border-[#b7cbdc] hover:shadow-sm" : "");
  return tile.href
    ? <Link href={tile.href} className={className}>{inner}</Link>
    : <div className={className}>{inner}</div>;
}

function Group({ eyebrow, title, description, tiles }: {
  eyebrow: string; title: string; description: string; tiles: AdminTile[]
}) {
  return (
    <section className="mb-11">
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[#a48a58]">{eyebrow}</div>
        <h2 className="mt-2 text-[22px] font-bold tracking-[-.025em] text-[#203a55]">{title}</h2>
        <p className="mt-2 text-[13px] text-[#7c8999]">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => <Tile key={tile.title} tile={tile}/>)}
      </div>
    </section>
  );
}

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#273e57]">
      <header className="border-b border-[#e4eaf0] bg-white">
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a58] text-white"><Scale size={22}/></div>
            <div><div className="text-[18px] font-bold leading-5">AvOfis</div><div className="text-[11px] text-[#8390a0]">Yönetim masası</div></div>
          </div>
          <a href="https://avofis.com" className="inline-flex items-center gap-2 rounded-xl border border-[#dce5ed] px-4 py-2.5 text-[12px] font-semibold text-[#31516c]">Kullanıcı portalı <ArrowRight size={14}/></a>
        </div>
      </header>
      <div className="mx-auto max-w-[1240px] px-5 pb-20 pt-11">
        <div className="mb-11 max-w-[740px]">
          <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a48a58]">YÖNETİM MERKEZİ</p>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-.04em] text-[#203a55]">Başvurular, işler ve içerikler</h1>
          <p className="mt-3 text-[14px] leading-7 text-[#748394]">Hizmet taleplerinin incelenmesi, işlerin sonuçlandırılması, teslim kontrolleri ve hukuk bilgi yayınlarının yönetimi için tek çalışma alanı.</p>
        </div>
        <Group eyebrow="HİZMET SÜREÇLERİ" title="Başvuru ve iş yönetimi" description="Talebin alınmasından teslim ve sonuçlandırmaya kadar operasyon alanları." tiles={workTiles}/>
        <Group eyebrow="YAYIN VE TOPLULUK" title="Hukuk bilgisi ve içerik inceleme" description="Uzman yazıları, haberler ve kullanıcı katkılarının yayın süreçleri." tiles={contentTiles}/>
        <Group eyebrow="KURUMSAL İŞLEMLER" title="Kullanıcılar ve yönetim" description="Operasyon dışındaki yetki, kayıt ve yapılandırma araçları." tiles={managementTiles}/>
        <p className="mt-6 border-t border-[#e0e7ee] pt-5 text-[12px] leading-5 text-[#8b98a6]">İş ve ödeme modülleri için işlem yetkileri, denetim kayıtları ve onay süreçleri uygulama servisleriyle ilişkilendirildiğinde etkinleştirilecektir. Bu sayfa işlem kaydı veya ödeme gerçekleştirmez.</p>
      </div>
    </main>
  );
}
