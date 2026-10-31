// Kaynak: AVOfis v18 (29.10.2026), 17 özgün hizmet slug'ı.
// İçerik genel hazırlık taslağıdır; hukukî ve dilsel insan yayım onayı değildir.
export type ServiceInfo = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  preparation: readonly string[];
  checks: readonly string[];
};

export const SERVICES: ReadonlyArray<ServiceInfo> = [
  {
    "slug": "hukuki-danismanlik",
    "title": "Hukukî bilgi ve dosya değerlendirmesi",
    "summary": "Bir sözleşme, karar veya dosyaya ilişkin soruların kapsamını netleştirme.",
    "audience": "Belgesini veya hukuki durumunu anlamak isteyen kişiler.",
    "preparation": [
      "Sorunuzu, ilgili ülkeyi ve belge türünü belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Genel bilgi ile kişiye özel görüş ayrıdır; uzman yetkisi doğrulanmadan danışmanlık sunulmaz.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "mahkeme-temsil",
    "title": "Mahkeme ve idarî mercilerde temsil",
    "summary": "İşleme ve ülkeye göre temsil şartlarını anlamaya hazırlık.",
    "audience": "Mahkeme veya kurum işlemi olanlar.",
    "preparation": [
      "Ülke, mahkeme, işlem aşaması ve varsa karar türünü ayırın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Vekâlet tek başına her mahkemede temsil hakkı vermez; avukat zorunluluğu ayrıca incelenir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "avrupa-turkiye-hukuki-uzman-koordinasyonu",
    "title": "Bağımsız uzmanlarla sınır ötesi koordinasyon",
    "summary": "Birden çok ülkedeki işlem ve uzman rollerinin ayrıştırılması.",
    "audience": "Başka ülkelerde uzman gerektiren kişiler.",
    "preparation": [
      "İlgili ülkeleri, makamları ve her ülkedeki işin türünü listeleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Doğrulanmış iş ortağı veya temsil yetkisi varsayılmaz; veri paylaşımı ayrıca değerlendirilir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "alacak-takibi",
    "title": "Alacak, borç ve tahsilat",
    "summary": "Borç veya alacak konusunu işlemin dayanağıyla değerlendirmeye hazırlık.",
    "audience": "Ödeme isteyen veya ödeme talebi alan kişiler.",
    "preparation": [
      "Sözleşme/fatura türünü, vadeyi ve ödeme yazışmalarını sıralayın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Tahsilat kaydı, icra yetkisi ve dava koşulları ülkeye göre farklıdır.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "sozlesmeler-uyusmazliklar",
    "title": "Sözleşmeler ve uyuşmazlıklar",
    "summary": "Sözleşmenin taraflarını, koşullarını ve uyuşmazlığın nedenini ayırma.",
    "audience": "Sözleşme hazırlayan veya ihtilaf yaşayan kişi ve işletmeler.",
    "preparation": [
      "Sözleşme türü, ülke, yükümlülük ve uyuşmazlık başlıklarını listeleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Uygulanacak hukuk ve görevli merci kişisel görüş olmadan kesinleştirilemez.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "konut-kira-sigorta",
    "title": "Konut, kira ve sigorta",
    "summary": "Kira, depozito, bakım, tahliye veya sigorta konusunu sınıflandırma.",
    "audience": "Kiracı, ev sahibi ve sigorta muhatapları.",
    "preparation": [
      "Sözleşme, depozito, yazışma ve talebin türünü belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Kiracı ve ev sahibinin başvuru yolları aynı olmayabilir; süre hesabı yapılmaz.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "ceza-sikayet-trafik",
    "title": "Şikâyet, trafik ve idarî yaptırımlar",
    "summary": "Resmî yaptırım ve şikâyetin hangi işlem türü olduğunu anlama.",
    "audience": "Trafik cezası, idarî yaptırım veya şikâyet sorunu olanlar.",
    "preparation": [
      "İşlemin hangi kurumdan geldiğini ve hangi usule bağlı olduğunu belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Ceza yargısı ve müdafilik yetkili avukat gerektirebilir; gizli evrak paylaşmayın.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "resmi-basvuru-itiraz",
    "title": "Resmî başvuru ve itiraz",
    "summary": "İdarî bir kararın türünü, bildirimini ve olası başvuru yollarını ayırma.",
    "audience": "Belediye, vergi, göç veya başka kamu kurumu kararı alanlar.",
    "preparation": [
      "Kararı veren kurum, bildirim yolu ve kararın açıkladığı usulü belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Her kurum için tek süre yoktur; resmî başvuru bu sayfadan yapılmaz.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "sosyal-guvenlik-vergi",
    "title": "Sosyal güvenlik, ödenekler ve vergi",
    "summary": "Ödenek, sosyal yardım, vergi ve sınır ötesi sosyal hakları sınıflandırma.",
    "audience": "Kurum kararı veya sosyal hak sorunu bulunanlar.",
    "preparation": [
      "Kurum, ödenek/vergi türü ve ilgili ülkeleri not edin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Sınır ötesi vergi ve sosyal güvenlik kuralları ayrı uzmanlık gerektirebilir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "vize-oturum-vatandaslik",
    "title": "Vize, oturum ve vatandaşlık",
    "summary": "Göçmenlik başvurusunun konusunu ve işlem aşamasını belirleme.",
    "audience": "İkamet, vize, aile birleşimi veya vatandaşlık sorunu olanlar.",
    "preparation": [
      "İlgili ülke, makam, işlem türü ve karar aşamasını ayırın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "İltica, idarî gözetim ve sınır dışı için özel yetki ve acil insan incelemesi gerekir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "uluslararasi-insan-haklari",
    "title": "Uluslararası insan hakları",
    "summary": "AİHM ve BM başvuru mekanizmalarını işlem türüne göre ayırt etme.",
    "audience": "Uluslararası hak arama yollarını araştıranlar.",
    "preparation": [
      "İlgili ülkeyi ve iç hukukta başvurulan makam türlerini listeleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Kabul edilebilirlik, süre ve temsil koşulları ayrı uzman incelemesi gerektirir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "avrupa-ici-islemler",
    "title": "Avrupa ülkeleri arası işlemler",
    "summary": "Türkiye bağlantısı gerekmeyen sınır ötesi işlem ve uyuşmazlık hazırlığı.",
    "audience": "İki veya daha çok Avrupa ülkesiyle bağlantısı bulunanlar.",
    "preparation": [
      "İlgili ülkeleri, kurumları ve belge ihtiyacını ayrı ayrı yazın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Bir ülkedeki meslekî yetki başka ülkede otomatik uygulanmaz.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "calisma-hayati",
    "title": "Çalışma hayatı",
    "summary": "Ücret, sözleşme, fesih ve işyeri uyuşmazlığını ayırma.",
    "audience": "Çalışan ve işverenler.",
    "preparation": [
      "Çalışılan ülke, taraf rolü, sözleşme ve yazışmaları sıralayın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "İşçi/işveren çıkarları farklıdır; ülkeye özgü yasal süreler doğrulanmalıdır.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "sirket-ticaret",
    "title": "Şirket kuruluşu ve ticaret",
    "summary": "Kuruluş, ticari sözleşme ve uyum işlemlerinin ön hazırlığı.",
    "audience": "Girişimci, KOBİ ve işletmeler.",
    "preparation": [
      "Faaliyet ülkesi, işletme türü, kurucu rolü ve vergi konularını ayırın.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Ticaret kaydı düzenlenmiş meslek yetkisi vermez; noter ve vergi uzmanı gerekebilir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "uluslararasi-istihdam",
    "title": "Uluslararası istihdam",
    "summary": "Personel görevlendirme, aracılık ve çalışma izinlerini ayırma.",
    "audience": "Sınır ötesi istihdam planlayan çalışan ve işletmeler.",
    "preparation": [
      "İstihdam, ikamet, işveren ve çalışma ülkelerini belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Personel temini ve işe yerleştirme farklı kayıt ve izin koşullarına tabidir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "belge-apostil-tercume",
    "title": "Belge, apostil ve tercüme",
    "summary": "Belgenin ülkelere göre kullanım ve doğrulama şartlarının ön hazırlığı.",
    "audience": "Resmî belgeyi başka ülke veya kurumda kullanacaklar.",
    "preparation": [
      "Belgeyi veren ülke/kurum ile kabul edecek ülke/kurumu belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Apostil veya yeminli tercüme gerekliliği işlemin türüne bağlıdır.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  },
  {
    "slug": "egitim-diploma",
    "title": "Eğitim, diploma ve denklik",
    "summary": "Akademik değerlendirme ile düzenlenmiş mesleğe kabul farkını belirleme.",
    "audience": "Öğrenci, mezun ve meslekî tanınma arayanlar.",
    "preparation": [
      "Diploma ülkesi, hedef ülke, eğitim düzeyi ve kullanım amacını belirleyin.",
      "Varsa karar ve bildirim türünü kendi güvenli kayıtlarınızda not edin.",
      "Resmî makamın işlem şartlarını güncel kaynağından doğrulayın."
    ],
    "checks": [
      "Diploma değerlendirmesi meslekî ruhsat veya çalışma hakkı değildir.",
      "AVOfis bu aşamada kuruluş öncesi bir projedir; bu sayfa ücretli hizmet teklifi veya dosya kabulü değildir.",
      "Kişisel bilgi ve gizli belgelerinizi bu kamu sayfasına göndermeyin."
    ]
  }
];

export function findService(slug: unknown): ServiceInfo | undefined {
  if (typeof slug !== "string" || slug.length > 100) return undefined;
  return SERVICES.find((service) => service.slug === slug);
}
