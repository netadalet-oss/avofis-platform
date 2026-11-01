/**
 * AVOfis whole-product, breadth-first Seviye 1 inventory.
 * Exact AV/R section boundaries are transcribed from the separate canonical
 * AVOfis instruction ZIP. Each unit is represented at EVERY stage; later
 * stages deepen that same scope. This is an inventory, NOT acceptance.
 */
export type WholeProductArea = {
  id: string;
  title: string;
  avFrom: number;
  avTo: number;
  href: string;
  status: "PUBLIC_PREVIEW_ONLY" | "RESTRICTED_PREVIEW" | "NOT_RELEASED";
  next: string;
};

export const AV_AREAS: readonly WholeProductArea[] = [
  { id: "A0", title: "Program, kaynak, mimari ve kalite", avFrom: 1, avTo: 10, href: "/ilerleme", status: "PUBLIC_PREVIEW_ONLY", next: "101 AV / 594 R kanıtını tek yatay defterde izle" },
  { id: "A1", title: "Veri güvenliği, kimlik ve staging", avFrom: 11, avTo: 25, href: "/uyum", status: "NOT_RELEASED", next: "Bağımsız staging, gerçek Auth ve 7 canlı RLS bulgusu" },
  { id: "A2", title: "Hizmet kataloğu, içerik, kitle ve diller", avFrom: 26, avTo: 51, href: "/katalog", status: "PUBLIC_PREVIEW_ONLY", next: "17 hizmet, 14 kitle, 12 yol ve altı dilde insan incelemesi" },
  { id: "A3", title: "Müşteri yolculuğu, dosya ve belgeler", avFrom: 52, avTo: 61, href: "/baslangic", status: "RESTRICTED_PREVIEW", next: "Kişisel verisiz yolculuk korunur; gerçek dosya/ödeme kapalı" },
  { id: "A4", title: "Personel ve yönetim: 16 modül", avFrom: 62, avTo: 77, href: "/modules", status: "NOT_RELEASED", next: "16 ayrı personel işlevi, yetki/rol/MFA ve gerçek işlem akışları" },
  { id: "A5", title: "IND, yargı, finans ve kurumlar", avFrom: 78, avTo: 92, href: "/yargi-baglantilari", status: "NOT_RELEASED", next: "Sekiz IND ve 16 yargı işi; resmî işlem ve ödeme kapalı" },
  { id: "A6", title: "Uçtan uca kalite, kabul, yayın ve işletim", avFrom: 93, avTo: 101, href: "/uyum", status: "NOT_RELEASED", next: "Dil, cihaz, hukuk, veri, güvenlik ve bağımsız kabul" },
] as const;

export const R_SECTION_NAMES: readonly string[] = [
  "İş modeli, hizmet kapsamı ve meslekî sınırlar",
  "Hedef kitle ve kullanıcı senaryoları",
  "Marka, adlandırma ve görsel kimlik",
  "Üst menü, bilgi mimarisi ve site haritası",
  "Ana sayfa ve dönüşüm akışı",
  "Hakkımızda, uzman profilleri ve güven",
  "Hizmet kataloğu ve paket tanımları",
  "İş hukuku ve çalışma yaşamı",
  "Göç, oturum ve vatandaşlık",
  "Aile, çocuk ve kişi hukuku",
  "Kira, konut ve taşınmaz",
  "Tüketici, sözleşme ve borç uyuşmazlıkları",
  "Şirketler, girişimcilik ve ticaret",
  "İdarî işlemler, sosyal haklar ve kamu kurumları",
  "Türkiye–Hollanda sınır aşan hukukî işlemler",
  "Dosya inceleme, delil ve uyuşmazlık analizi",
  "Bilgi bankası, rehberler ve hukuk sözlüğü",
  "Haber, yorum, analiz ve bültenler",
  "Belge kütüphanesi, şablonlar ve üretim",
  "Başvuru sihirbazı ve ilk triyaj",
  "İş, kira ve tüketici başvuru formları",
  "Göç, aile, idarî ve uluslararası başvuru formları",
  "Güvenli belge yükleme ve dijital dosya",
  "Müşteri hesabı, panel ve dosya durumu",
  "Görüşme, randevu, mesajlaşma ve bildirim",
  "Ücretler, sözleşme, ödeme ve tüketici hakları",
  "Uzman ağı, iş ortakları ve yönlendirme",
  "Çok dillilik, hukukî çeviri ve yerelleştirme",
  "AVG/GDPR, gizlilik ve veri yönetimi",
  "Siber güvenlik, kimlik ve operasyonel dayanıklılık",
  "İç yönetim paneli, CRM ve otomasyon",
  "Erişilebilirlik, arama, SEO ve kullanıcı deneyimi",
  "Teknik mimari, kalite güvencesi ve yayına geçiş"
] as const;

export const STAFF_MODULE_SLUGS = [
  "inbox", "triage", "matters", "calendar", "documents", "pleadings",
  "research", "judicial", "ind", "messages", "billing", "payables",
  "reporting", "audit", "people", "settings"
] as const;

export const IND_PROCEDURES = [
  "IND-01 İlk MVV / oturum / aile",
  "IND-02 Bezwaar / idarî itiraz",
  "IND-03 Beroep",
  "IND-04 Hoger beroep",
  "IND-05 Asiel / iltica",
  "IND-06 Bewaring / uitzetting",
  "IND-07 Dosya / bilgi temini",
  "IND-08 Naturalisatie"
] as const;

export const STAGE_COUNT = 12 as const;
export const STAGE_ONE_STATUS = "IN_PROGRESS_NOT_ACCEPTED" as const;
export const INDEPENDENT_R_ACCEPTANCE = 0 as const;
export const LIVE_R_ACCEPTANCE = 0 as const;

export function avIds(): string[] {
  return AV_AREAS.flatMap(area => Array.from(
    { length: area.avTo - area.avFrom + 1 },
    (_, i) => "AV-" + String(area.avFrom + i).padStart(3, "0")
  ));
}
export function rIds(): string[] {
  return R_SECTION_NAMES.flatMap((_, section) => Array.from(
    { length: 18 },
    (_, i) => "R-" + String(section * 18 + i + 1).padStart(3, "0")
  ));
}

/** A stage can cover all modules while remaining legally unreleased. */
export function stageBreadthStatus(input: {
  presentAvIds: readonly string[];
  presentRIds: readonly string[];
}): { allAvAddressed: boolean; allRAddressed: boolean; completeBreadth: boolean } {
  const av = new Set(input.presentAvIds);
  const r = new Set(input.presentRIds);
  const allAvAddressed = avIds().every(id => av.has(id));
  const allRAddressed = rIds().every(id => r.has(id));
  return { allAvAddressed, allRAddressed, completeBreadth: allAvAddressed && allRAddressed };
}
