export type PortalService = {
  slug: string;
  title: string;
  description: string;
};

export type PortalGroup = {
  id: string;
  title: string;
  description: string;
  icon: string;
  services: PortalService[];
};

/**
 * Public-facing information architecture. These are service labels, not
 * promises that their server-side workflows are active.
 */
export const portalGroups: PortalGroup[] = [
  {
    id: "hizmetler", title: "Hukuki Hizmetler", icon: "scale",
    description: "İhtiyacınıza uygun hukuki hizmeti bulun ve başvuru sürecini inceleyin.",
    services: [
      { slug: "hukuki-danisma", title: "Hukuki danışma", description: "Hukuki durumunuzu açıklayın, uzman değerlendirmesi talep edin." },
      { slug: "dilekce-hazirlama", title: "Dilekçe hazırlama", description: "Dava, cevap, itiraz ve başvuru dilekçeleri için destek alın." },
      { slug: "sozlesme-hazirlama", title: "Sözleşme hazırlama", description: "İhtiyacınıza uygun sözleşme hazırlanması için talep oluşturun." },
      { slug: "sozlesme-inceleme", title: "Sözleşme inceleme", description: "Mevcut sözleşmenizin hükümlerini ve risklerini değerlendirin." },
      { slug: "ihtarname", title: "İhtarname ve bildirim", description: "İhtarname ve hukuki bildirim hazırlama hizmetlerini inceleyin." },
      { slug: "dosya-inceleme", title: "Dosya inceleme", description: "Evrak ve olay örgüsü üzerinden hukuki değerlendirme isteyin." },
      { slug: "arabuluculuk", title: "Arabuluculuk", description: "Arabuluculuk süreci ve başvuru seçenekleri hakkında bilgi alın." },
      { slug: "uyusmazlik-degerlendirmesi", title: "Uyuşmazlık değerlendirmesi", description: "Hak, yükümlülük ve olası çözüm yollarını inceletin." }
    ]
  },
  {
    id: "is-ve-teklifler", title: "İş ve Teklifler", icon: "briefcase",
    description: "İşinizi tanımlayın, bütçe önerin, teklifleri değerlendirin ve teslim alın.",
    services: [
      { slug: "is-talebi-olustur", title: "İş talebi oluştur", description: "İşin kapsamını, teslim beklentisini ve bütçesini belirleyin." },
      { slug: "acik-isler", title: "Açık iş talepleri", description: "Yayınlanan işler arasında uzmanlığınıza uygun talepleri bulun." },
      { slug: "tekliflerim", title: "Tekliflerim", description: "Aldığınız veya gönderdiğiniz teklifleri karşılaştırın." },
      { slug: "butce-onerileri", title: "Bütçe önerileri", description: "İşin kapsamı ve aşamalarına göre bütçe görüşmelerini yönetin." },
      { slug: "anlasmalarim", title: "İş anlaşmalarım", description: "Kapsam, teslim tarihi, revizyon ve ücret koşullarını takip edin." },
      { slug: "is-teslimi", title: "İş teslimi ve revizyon", description: "Teslim edilen çalışmaları inceleyin, onaylayın veya düzeltme isteyin." }
    ]
  },
  {
    id: "dosya-ve-basvurular", title: "Dosya ve Başvurular", icon: "folder",
    description: "Başvurularınızı, dosya hareketlerini, belgeleri ve sonuçları takip edin.",
    services: [
      { slug: "basvurularim", title: "Başvurularım", description: "Başvuru kayıtları ve inceleme aşamalarını tek yerden görün." },
      { slug: "dosyalarim", title: "Dosyalarım", description: "Size ait iş ve hizmet dosyalarının son durumunu takip edin." },
      { slug: "evraklarim", title: "Evraklarım", description: "Başvurularla ilişkili belgeleri ve teslim edilen dosyaları inceleyin." },
      { slug: "islem-gecmisi", title: "İşlem geçmişi", description: "Başvuru, inceleme, ek belge ve sonuç hareketlerini görüntüleyin." },
      { slug: "takvim-ve-tarihler", title: "Takvim ve tarihler", description: "Görüşme, teslim ve başvuru tarihlerini düzenli biçimde takip edin." },
      { slug: "sonuclanan-isler", title: "Sonuçlanan işler", description: "Tamamlanan başvuruları ve teslim edilen çalışmaları bulun." }
    ]
  },
  {
    id: "odemeler", title: "Bütçe ve Ödemeler", icon: "wallet",
    description: "Ücret koşullarını, aşamalı ödeme planlarını ve işlem kayıtlarını görüntüleyin.",
    services: [
      { slug: "butce-planim", title: "Bütçe planım", description: "İş taleplerine ilişkin bütçe ve teklif karşılaştırmaları." },
      { slug: "asama-odemeleri", title: "Aşamalı ödemeler", description: "İş aşamalarına bağlı ödeme koşullarını inceleyin." },
      { slug: "odeme-kayitlari", title: "Ödeme kayıtlarım", description: "İşlem ve ödeme belgelerine tek yerden ulaşın." },
      { slug: "iade-ve-itiraz", title: "İade ve itiraz", description: "Ödeme itirazları ve uyuşmazlık başvuru yollarını inceleyin." }
    ]
  },
  {
    id: "hukuk-bilgisi", title: "Hukuk Bilgi Merkezi", icon: "book",
    description: "Uzman içerikleri, mevzuat, içtihat ve anlaşılır hukuk rehberlerini keşfedin.",
    services: [
      { slug: "makaleler", title: "Hukuk makaleleri", description: "Hukukçuların kaleme aldığı konu bazlı incelemeler." },
      { slug: "uzman-gorusleri", title: "Uzman görüşleri", description: "Uygulamaya ilişkin değerlendirme ve farklı görüşler." },
      { slug: "hukuk-rehberleri", title: "Hukuk rehberleri", description: "Temel süreç ve kavramların anlaşılır açıklamaları." },
      { slug: "mevzuat", title: "Mevzuat", description: "Kanun, yönetmelik ve ilgili düzenlemeler için araştırma alanı." },
      { slug: "ictihat", title: "İçtihat ve kararlar", description: "Yargı kararları ve emsal değerlendirmeleri." },
      { slug: "sik-sorulanlar", title: "Sık sorulan sorular", description: "Günlük hukuki konularda temel bilgiye erişim." }
    ]
  },
  {
    id: "hukuk-haberleri", title: "Hukuk Haberleri", icon: "newspaper",
    description: "Hukuk dünyasındaki gelişmeleri konu ve kaynaklarına göre takip edin.",
    services: [
      { slug: "hukuk-gundemi", title: "Hukuk gündemi", description: "Hukuk dünyasından gündem ve haber içerikleri." },
      { slug: "mevzuat-degisiklikleri", title: "Mevzuat değişiklikleri", description: "Yeni düzenlemeler ve yürürlük gelişmeleri." },
      { slug: "yargi-gundemi", title: "Yargı gündemi", description: "Yüksek yargı kararları ve uygulamaya etkileri." },
      { slug: "resmi-duyurular", title: "Resmî duyurular", description: "İlgili kurumların kamuya açık duyuruları." }
    ]
  },
  {
    id: "topluluk", title: "Topluluk ve Soru–Cevap", icon: "messages",
    description: "Soru sorun, görüş alışverişinde bulunun ve hukuk tartışmalarını izleyin.",
    services: [
      { slug: "soru-sor", title: "Hukuki soru sor", description: "Hukuki konularda genel bilgi amacıyla soru oluşturun." },
      { slug: "sorular-ve-yanitlar", title: "Sorular ve yanıtlar", description: "Konu bazında soru ve hukukçu yanıtlarını inceleyin." },
      { slug: "forum", title: "Hukuk forumu", description: "Kullanıcılar ve uzmanlar arasında açık tartışma alanı." },
      { slug: "makale-yorumlari", title: "Makale yorumları", description: "Uzman yazılarına ilişkin yorum ve soruları takip edin." }
    ]
  },
  {
    id: "mesleki-ag", title: "Hukukçular ve Kariyer", icon: "users",
    description: "Uzmanlık alanlarına göre hukukçuları ve mesleki fırsatları keşfedin.",
    services: [
      { slug: "hukukcu-bul", title: "Hukukçu bul", description: "Uzmanlık alanları ve çalışma konularına göre profil arayın." },
      { slug: "hukuk-burolari", title: "Hukuk büroları", description: "Ofis profilleri ve hizmet alanlarını inceleyin." },
      { slug: "uzman-profilleri", title: "Uzman profilleri", description: "Mesleki deneyim ve yayınlar hakkında bilgi edinin." },
      { slug: "staj-ve-kariyer", title: "Staj ve kariyer", description: "Mesleki ilanları, staj fırsatlarını ve başvuru yollarını görün." }
    ]
  }
];

export const portalHighlights = [
  { title: "Danışmanlık talep et", slug: "hukuki-danisma", note: "Durumunuzu anlatın ve uzman desteği isteyin." },
  { title: "İş talebi yayınla", slug: "is-talebi-olustur", note: "İşinizi, sürenizi ve bütçenizi belirleyin." },
  { title: "Dosya takibi yap", slug: "dosyalarim", note: "İş ve başvuru süreçlerini kontrol edin." },
  { title: "Hukuk bilgisi edin", slug: "makaleler", note: "Makaleleri, kararları ve rehberleri okuyun." }
];

export function findPortalService(slug: string) {
  for (const group of portalGroups) {
    const service = group.services.find((entry) => entry.slug === slug);
    if (service) return { group, service };
  }
  return null;
}
