// Private operational programme. NEVER import this module into public portal pages.
// The fifth focus runs across all four phases; it is NOT a fifth launch date.
export type PhaseKey="foundation"|"launch"|"digital"|"expansion"|"coordination";
export type RoadmapSection={id:PhaseKey;number?:number;title:string;subtitle:string;objective:string;deliverables:string[];exitCriteria:string[]};
export const launchPhases:RoadmapSection[]=[
 {id:"foundation",number:1,title:"Kuruluş",subtitle:"Kurumsal kimlik ve hizmet sınırları",
 objective:"Hukuken kurulmuş, çalışma hakları incelenmiş ve açıkça tanımlanmış bir işletme modeli.",
 deliverables:[
 "BV statüsü, pay/temsil modeli, noter, KVK ve UBO kayıtlarının doğrulanması",
 "Her ortağın fiilî çalışma, yöneticilik ve ücret alma hakkı için kişiye özgü hukukî görüş",
 "Hizmet ve ülke bazında danışmanlık, temsil, tahsilat, noter ve uzman yetkisi matrisi",
 "Doğrulanmış meslekî tanıtım, marka/iletişim kimliği ve kapsamı karşılayan sigorta",
 "Hizmet sözleşmeleri, tüketici hakları, gizlilik bildirimi, veri envanteri ve GDPR yükümlülükleri",
 "İlk satışa açılacak dar, gerçekten sunulabilir ve kontrol edilebilir hizmet paketi"
 ],
 exitCriteria:[
 "KVK/BV ve gereken kişi/kurum yetkileri gerçek belgelerle teyit edildi",
 "Çalışma hakkı ve meslekî kapsam teyit edilmeden ücretli hizmet açılmıyor",
 "Sözleşme, gizlilik ve sigorta incelemeleri imza/onay kayıtlarıyla kapatıldı",
 "İlk hizmetlerin fiyatı, sorumlusu, uzman ihtiyacı ve sınırı yazılı"
 ]},
 {id:"launch",number:2,title:"İlk Yayın",subtitle:"Profesyonel kurumsal portal",
 objective:"Türkçe–Hollandaca kaliteli ve dürüst bir kamuya açık kurumsal sunum.",
 deliverables:[
 "Türkçe ve Hollandaca ana sayfalar ve hedef kitle–hizmet sayfaları; Hollandaca ana dil kalite kontrolü",
 "Hukuk rehberi, hukukî yetki açıklamaları, kaynaklar ve örnek kontrol listeleri",
 "Gerçek hizmet kapsamına göre doğrulanmış ücret bilgisi, teklifle fiyatlanan işler için açıklama",
 "Randevu ihtiyacı için kontrollü talep akışı ve doğrulanmış iletişim kanalları",
 "Güvenli ön başvuru; hukuk, GDPR, erişim ve işlem kontrolleri tamamlanmadan kişisel veri toplanmaması",
 "Telefon, tablet ve masaüstünde profesyonel görünüm, erişilebilirlik ve arama görünürlüğü"
 ],
 exitCriteria:[
 "TR/NL metinlerin ve hukukî meslek tanımlarının insan kalite kontrolü tamamlandı",
 "Hizmetler, fiyatlama yöntemi, iletişim ve gizlilik doğru ve güncel",
 "Randevu ve başvuru ancak veritabanı, kimlik ve hukukî kontrollerden sonra etkin",
 "Mobil/masaüstü testleri ve güvenlik kontrolleri geçti"
 ]},
 {id:"digital",number:3,title:"Dijital Hizmet",subtitle:"Müşteri dosyası ve belge sistemi",
 objective:"Gerçek müşteri dosyasının başvuru, sözleşme, işlem ve kapanış aşamalarını güvenli yönetmek.",
 deliverables:[
 "Kullanıcı hesabı, kimlik doğrulama, rol ve dosya sahipliği kontrolleri",
 "Dosya durumu, insan tarafından doğrulanan kritik süreler ve müşteri görevleri",
 "Güvenli belge yükleme, erişim kayıtları ve veri saklama–silme süreci",
 "Dosya bazlı mesajlaşma ve gerektiğinde bağımsız uzmanla kontrollü paylaşım",
 "Teklif, onaylanmış hizmet sözleşmesi, fatura, ödeme/iade ve sağlayıcı doğrulaması",
 "Yalnızca yetki, kalite ve şablon onayı bulunan belirli belge hazırlama işlevleri"
 ],
 exitCriteria:[
 "Anonim, müşteri A/B, personel ve yönetici RLS matrisi bağımsız test edildi",
 "Gizli belge ve mesajlar başka müşteri hesabından erişilemiyor",
 "Dosya aktivasyonu hukukî inceleme ve imzalı sözleşmeye bağlı",
 "Test ödemeleri ve webhook doğrulaması kanıtlandı; gerçek ödeme ayrı açılış onayı bekliyor"
 ]},
 {id:"expansion",number:4,title:"Genişleme",subtitle:"Uzman ağı ve yeni uzmanlıklar",
 objective:"İlk hizmetler güvenli ve ölçülebilir yürüdükten sonra uzmanlıkları ve pazarları büyütmek.",
 deliverables:[
 "Hollanda, Almanya ve gerektiğinde Türkiye'de yetkinliği doğrulanmış bağımsız uzmanlar",
 "Avrupa içi işlemler ile Avrupa–Türkiye karmaşık dosyaları için farklı çalışma protokolleri",
 "İşletmeler için kapsamı ve sorumlusu belirli kurumsal hizmet paketleri",
 "Hukukî bilgilendirme, eğitim merkezi, seminer ve örnek belge kütüphanesi",
 "Yeni hukuk alanlarında ülke bazlı izin, sigorta, işlem maliyeti ve kapasite değerlendirmesi",
 "İlk 90 günün müşteri, kalite, süre ve nakit verileriyle kademeli genişleme"
 ],
 exitCriteria:[
 "Önerilen her yeni hizmetin yetkisi, uzmanı, masrafı ve sigortası doğrulandı",
 "Bağımsız uzman anlaşmaları ve şeffaf müşteri bilgilendirmesi hazır",
 "Gerçek dosya kalitesi ve nakit akışı büyümeyi destekliyor",
 "Yeni ülke ve meslek alanı için ayrı açılış kararı alınmış"
 ]}
];
export const coordinationFocus:RoadmapSection={
 id:"coordination",title:"Beşinci Odak",subtitle:"Hollandalı ve Türk profesyoneller arasında hukukî hizmet koordinasyonu",
 objective:"Hollanda'da advocaat gerektiren veya özel düzenlemeye tabi işlemleri ve iki ülkeli karmaşık uyuşmazlıkları şeffaf bir rol paylaşımıyla bağımsız yetkili profesyonellere yönlendirmek; Avrupa içi uzman bağlantılarını da dışlamamak.",
 deliverables:[
 "Hollandalı advocaat ve ilgili Türk meslek mensuplarının kayıt, uzmanlık ve faaliyet yetkilerinin bağımsız doğrulanması",
 "Müşteriye kimin hizmet verdiğini, kiminle sözleştiğini, ücreti, olası yönlendirme ilişkisini ve sorumluluğu açıkça bildiren iş birliği modeli",
 "Çıkar çatışması, sır saklama, müşteri talimatı ve açık veri paylaşımı yetkisi kontrolleri",
 "Sınır ötesi uyuşmazlıklar için ülke, yetkili mahkeme, başvuru süresi, dil, tercüme ve belge transferi matrisi",
 "Doğrulanmamış iş ortaklarını veya ruhsatları reklamda göstermeden kontrollü örnek dosya ve kalite değerlendirmesi"
 ],
 exitCriteria:[
 "Her bağımsız uzmanın kaydı, yetkisi ve sözleşme ilişkisi kontrol edildi",
 "Gizlilik, aktarım ve vekâlet koşulları ülke ve dosya bazında onaylandı",
 "Müşteriye şeffaf fiyat, rol ve sorumluluk bilgisi yazılı veriliyor",
 "Karmaşık dosyalarda kabul/ret ve uzman atama kararı izlenebilir"
 ]
};
// Seeded project tasks are mapped by stable original title for backwards compatibility.
export const phaseForOriginalTask:Record<string,PhaseKey>={
 "İş modeli ve gelir kanallarını kesinleştir":"foundation",
 "Hedef kitleleri ve ülke ihtiyaçlarını doğrula":"foundation",
 "Dokuz faaliyet kategorisi için yetki matrisi hazırla":"foundation",
 "Ortaklık, pay sahipliği ve yönetim modelini yaz":"foundation",
 "Ortaklar sözleşmesi ve karar kilitlenmesi mekanizmasını hazırla":"foundation",
 "Ortakların fiilî çalışma ve yöneticilik yetkilerini doğrula":"foundation",
 "BV, noter, KVK ve UBO sürecini tamamla":"foundation",
 "Marka, alan adı ve kurumsal kimliği kesinleştir":"foundation",
 "Kurumsal adres ve doğrulanmış iletişim kanalları oluştur":"foundation",
 "Başlangıç sermayesi ve nakit rezervi bütçesini çıkar":"foundation",
 "Muhasebe, KDV, vergiler ve ortak ücretlerini değerlendir":"foundation",
 "Kurumsal banka ve ödeme sağlayıcı süreçlerini tamamla":"digital",
 "Hizmetlerin maliyet ve fiyatlandırma sistemini oluştur":"launch",
 "Hollanda, Almanya ve Türkiye uzman ağını doğrula":"expansion",
 "Meslekî, genel ve siber sorumluluk sigortasını değerlendir":"foundation",
 "Her hizmet için başvurudan kapanışa SOP oluştur":"digital",
 "Hizmet sözleşmesi ve tüketici şartlarını onaylat":"foundation",
 "GDPR, veri envanteri, saklama ve DPA belgelerini tamamla":"foundation",
 "Dört dilli kurumsal portalın ve hesap sisteminin kabulünü yap":"launch",
 "Personel, dosya ve kritik süre iş akışını denetle":"digital",
 "Çok dilli müşteri kazanımını ve iş ortaklığı planını hazırla":"launch",
 "Uçtan uca senaryoları ve güvenlik testlerini geç":"digital",
 "Yasal üretim açılışını ve müşteri kabulünü onayla":"launch",
 "İlk 90 gün performans ve iyileştirme incelemesi yap":"expansion"
};
export const coordinationTaskSeeds=[
 {group_key:"partners",phase_key:"coordination",title:"Hollandalı ve Türk hukuk uzmanlarının meslekî kayıtlarını doğrula",priority:"critical",notes:"Bağımsız advocaat, Türkiye'deki ilgili baroya kayıtlı meslek mensubu ve diğer düzenlenmiş uzmanların yetkisini doğrulayıp iç kayıt oluştur; doğrulanmadan kamuya isim veya iş birliği iddiası koyma."},
 {group_key:"legal",phase_key:"coordination",title:"Sınır ötesi uzman iş birliği ve sorumluluk sözleşmelerini hazırla",priority:"critical",notes:"İş kapsamı, yönlendirme ve ücretin açıklanması, meslekî bağımsızlık, çıkar çatışması, sigorta, dosya sahipliği ve müşteriyle doğrudan sözleşme konularını yetkili hukukçulara onaylat."},
 {group_key:"security",phase_key:"coordination",title:"Hollanda–Türkiye uzmanlar arası veri ve dosya paylaşımını güvenceye al",priority:"critical",notes:"Müşteri onayı ve uygun GDPR hukukî dayanağı, uluslararası aktarım mekanizması, yetkiye dayalı erişim, şifreleme, kayıt ve saklama kurallarını doğrula."},
 {group_key:"operations",phase_key:"coordination",title:"Karmaşık iki ülkeli dosyalar için görev ve son tarih protokolü oluştur",priority:"high",notes:"Hangi ülke hukuku, hangi mahkeme/kurum, kimin imza ve temsil yetkisi var, süre ve tercüme kontrolünü kim üstleniyor: her dosyada belgeyle."},
 {group_key:"quality",phase_key:"coordination",title:"Uzman koordinasyonunu sentetik dosyalarla uçtan uca test et",priority:"high",notes:"Örnek Hollanda–Türkiye uyuşmazlığı ve Avrupa içi çok ülkeli dosyada yönlendirme, çıkar çatışması, veri paylaşımı, teklif, sözleşme ve teslimi test et."}
] as const;
