import { STAFF_TOP_LEVEL, staffModuleBySlug } from "./staff-module-directory";

/** No user records, credentials, network or durable state in the S1 demo. */
export type DemoState = "EMPTY" | "PREPARED" | "REVIEWED";
type DemoScenario = { input: string; prepared: string; review: string };
export const SYNTHETIC_STAFF_SCENARIOS: Record<(typeof STAFF_TOP_LEVEL)[number]["slug"], DemoScenario> = {
  inbox: { input: "Anonim örnek: evrak sorusu", prepared: "Yeni ileti → tür: belge bilgisi", review: "Kuyruk önizlemesi; gerçek başvuru alınmadı" },
  triage: { input: "Anonim örnek: idarî karar", prepared: "Ülke → konu → süre riski alanları ayrıldı", review: "Yetkili uzman ve kurum teyidi gerekir" },
  matters: { input: "Anonim örnek: boş dosya taslağı", prepared: "Taslak durum: inceleme gerekli", review: "Müşteri, tenant ve dosya ID'si üretilmedi" },
  calendar: { input: "Anonim örnek: olası kurum süresi", prepared: "Tarih ve resmî kaynak türü ayrıldı", review: "Takvim ya da süre bildirimi oluşturulmadı" },
  documents: { input: "Anonim örnek: diploma türü", prepared: "Belge türü: diploma; gizli içerik alınmadı", review: "Gerçek Storage yüklemesi yok" },
  pleadings: { input: "Anonim örnek: dilekçe kapsamı", prepared: "Taslak türü ve işlem aşaması ayrıldı", review: "Hukukî taslak üretilmedi ve gönderilmedi" },
  research: { input: "Anonim örnek: kaynak denetimi", prepared: "Kaynak türü: resmî mevzuat", review: "Güncellik ve uzman inceleme gerekli" },
  judicial: { input: "Anonim örnek: J01 kamu kararı", prepared: "ECLI ve özel dosya kanalı ayrıldı", review: "Yargı sistemi bağlantısı kurulmadı" },
  ind: { input: "Anonim örnek: IND bezwaar", prepared: "IND süreç türü ile belge/temsil ayrıldı", review: "G1–G4 ve gerçek mandat kanıtı yok" },
  messages: { input: "Anonim örnek: konu başlığı", prepared: "Mesaj taslak kategorisi seçildi", review: "Hiçbir alıcıya mesaj gönderilmedi" },
  billing: { input: "Anonim örnek: ücret kalemi", prepared: "Hizmet / harç / vergi kalemleri ayrıldı", review: "Fiyat, fatura veya borç oluşturulmadı" },
  payables: { input: "Anonim örnek: ödeme isteği", prepared: "Yetkili kişi / ikinci onay adımı belirlendi", review: "Ödeme sağlayıcısı veya banka çağrılmadı" },
  reporting: { input: "Anonim örnek: 0 kayıt", prepared: "Metrik: örnek işlem sayısı = 0", review: "Gerçek kullanıcı faaliyeti veya analitik yok" },
  audit: { input: "Anonim örnek: güvenlik olayı", prepared: "Olay sınıfı: yetki isteği", review: "Bu demo gerçek audit log kaydı üretmez" },
  people: { input: "Anonim örnek: uzman rolü", prepared: "Önerilen rol: uzman incelemesi bekler", review: "Kimlik, meslekî belge veya hesap doğrulanmadı" },
  settings: { input: "Anonim örnek: yayın bayrağı", prepared: "Önerilen değişiklik: yayın kapalı", review: "Gerçek ortam veya yayın izni değiştirilmedi" }
};

export function transitionStaffDemo(slug: string, current: DemoState, action: "prepare" | "review" | "reset"): DemoState {
  if (!staffModuleBySlug(slug)) throw new Error("UNKNOWN_MODULE");
  if (action === "reset") return "EMPTY";
  if (action === "prepare") {
    if (current !== "EMPTY") throw new Error("INVALID_DEMO_TRANSITION");
    return "PREPARED";
  }
  if (action === "review") {
    if (current !== "PREPARED") throw new Error("INVALID_DEMO_TRANSITION");
    return "REVIEWED";
  }
  throw new Error("UNKNOWN_DEMO_ACTION");
}
export function staffDemoDisplay(slug: string, state: DemoState) {
  const scenario = SYNTHETIC_STAFF_SCENARIOS[slug as keyof typeof SYNTHETIC_STAFF_SCENARIOS];
  if (!staffModuleBySlug(slug) || !scenario) throw new Error("UNKNOWN_MODULE");
  return {
    input: scenario.input,
    result: state === "EMPTY" ? "Henüz bir sentetik adım seçilmedi"
      : state === "PREPARED" ? scenario.prepared : scenario.review,
    status: state === "EMPTY" ? "Başlatılmadı" :
      state === "PREPARED" ? "Sentetik taslak" : "Sentetik kontrol tamamlandı"
  };
}
