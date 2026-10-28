// Administrator-only task templates. No customer-facing rendering and no automatic data writes.
// An authorised administrator can explicitly create real private task records from this checklist.
import {phaseForOriginalTask,coordinationTaskSeeds,type PhaseKey} from "./avofis-roadmap";
export type InternalTaskSeed={group_key:string;title:string;notes:string;priority:"normal"|"high"|"critical";phase_key:PhaseKey};
type BaseTask=Omit<InternalTaskSeed,"phase_key">;
const originalTasks:BaseTask[]=[
 {group_key:"services",title:"İş modeli ve gelir kanallarını kesinleştir",notes:"Bireysel dosya, kurumsal paket, belge organizasyonu ve bağımsız uzman koordinasyonunun hizmet kapsamı ile fiyatlama mantığını ayrı tanımla.",priority:"high"},
 {group_key:"marketing",title:"Hedef kitleleri ve ülke ihtiyaçlarını doğrula",notes:"Hollanda ve Almanya ağırlıklı Türkiyeliler, göçmenler, öğrenciler, çalışanlar ve Türkiye–Avrupa işletmeleri için gerçek kullanım senaryolarını değerlendir.",priority:"high"},
 {group_key:"services",title:"Dokuz faaliyet kategorisi için yetki matrisi hazırla",notes:"Her alt işin yapılacağı ülke, işi yürütebilecek kişi, gereken izin, sorumluluk ve alternatif yetkili uzman ayrı kaydedilsin.",priority:"critical"},
 {group_key:"company",title:"Ortaklık, pay sahipliği ve yönetim modelini yaz",notes:"Öngörülen eşit ortaklık, sermaye, temsil ve imza yetkileri ile fiilî görevleri ayrı düzenle; çalışma izniyle bağlantısını doğrula.",priority:"critical"},
 {group_key:"company",title:"Ortaklar sözleşmesi ve karar kilitlenmesi mekanizmasını hazırla",notes:"Sermaye katkısı, kâr dağıtımı, ayrılma, pay devri, masraf ve uyuşmazlık çözümünü notere sunulabilir bir çerçevede düzenle.",priority:"high"},
 {group_key:"legal",title:"Ortakların fiilî çalışma ve yöneticilik yetkilerini doğrula",notes:"Hollanda'daki oturum, çalışma, yönetim ve ücret alma koşulları için kişiye özgü uzman görüşü al. Pay sahipliğini çalışma izni sayma.",priority:"critical"},
 {group_key:"company",title:"BV, noter, KVK ve UBO sürecini tamamla",notes:"Noter teklifleri, ana sözleşme, kuruluş adresi, paylar, yönetim ve kayıt evrakını mevzuata uygun sırayla tamamla.",priority:"critical"},
 {group_key:"marketing",title:"Marka, alan adı ve kurumsal kimliği kesinleştir",notes:"AVOfis adını ticaret ve marka kayıtlarında araştır; gold-lacivert kimliği logo, teklif, fatura ve portala uygula.",priority:"normal"},
 {group_key:"company",title:"Kurumsal adres ve doğrulanmış iletişim kanalları oluştur",notes:"Uygun iş adresi, doğrulanabilir telefon ve e-postaları düzenle. Gerçekleşmeyen iletişim veya adres bilgisini kamuya yazma.",priority:"high"},
 {group_key:"finance",title:"Başlangıç sermayesi ve nakit rezervi bütçesini çıkar",notes:"Noter, hukukçu, muhasebe, yazılım, sigorta ve pazarlama maliyetlerini; üç ve altı aylık rezerv senaryolarını ayrı hesapla.",priority:"high"},
 {group_key:"finance",title:"Muhasebe, KDV, vergiler ve ortak ücretlerini değerlendir",notes:"BV vergilendirmesi, DGA şartları, bordro, Türkiye bağlantılı faturalar ve resmî harç ayrımını muhasebeciye incelet.",priority:"critical"},
 {group_key:"finance",title:"Kurumsal banka ve ödeme sağlayıcı süreçlerini tamamla",notes:"Gerçek BV evrakları, UBO ve kaynağı doğrulanmış fonlarla banka hesabı aç; Mollie üretim erişimini onay sonrası yapılandır.",priority:"high"},
 {group_key:"finance",title:"Hizmetlerin maliyet ve fiyatlandırma sistemini oluştur",notes:"Personel süresi, dış uzman gideri, resmî harç, KDV ve kâr marjı temelinde ayrı teklif şablonları hazırla.",priority:"high"},
 {group_key:"partners",title:"Hollanda, Almanya ve Türkiye uzman ağını doğrula",notes:"Avukat, noter, vergi uzmanı, gümrük uzmanı, yeminli tercüman ve insan hakları hukukçuları için yetki ve sözleşme incelemesi yap.",priority:"critical"},
 {group_key:"legal",title:"Meslekî, genel ve siber sorumluluk sigortasını değerlendir",notes:"Gerçek faaliyet ve ülke kapsamı üzerinden sigorta teklifleri al; istisnaları ve temsil/uyuşmazlık hizmetlerini kontrol et.",priority:"high"},
 {group_key:"operations",title:"Her hizmet için başvurudan kapanışa SOP oluştur",notes:"Ön inceleme, teklif, sözleşme, belge, uzman atama, durum, bildirim ve teslim kontrollerini görev ve sorumlu bazında yaz.",priority:"high"},
 {group_key:"legal",title:"Hizmet sözleşmesi ve tüketici şartlarını onaylat",notes:"Teklif, sözleşme, KDV, cayma/iptal, iade, şikâyet, sorumluluk ve üçüncü taraf masrafları için ülkeye uygun belgeler hazırla.",priority:"critical"},
 {group_key:"security",title:"GDPR, veri envanteri, saklama ve DPA belgelerini tamamla",notes:"Veri sorumlusu, yasal dayanak, erişim, saklama, silme, sağlayıcılar ve Türkiye aktarımı ile hassas dosyaların korunmasını doğrula.",priority:"critical"},
 {group_key:"security",title:"Dört dilli kurumsal portalın ve hesap sisteminin kabulünü yap",notes:"Dokuz hizmet, dokuz hedef kitle, TR/NL/DE/EN içerik, mobil hizalama, RLS ve müşteri erişimi için gerçek kabul testleri yürüt.",priority:"high"},
 {group_key:"operations",title:"Personel, dosya ve kritik süre iş akışını denetle",notes:"Yetkili personel, dosya sorumlusu, manuel doğrulanmış süre, müşteri görünürlüğü, uzman görevlendirmesi ve olay kaydı testlerini yap.",priority:"critical"},
 {group_key:"marketing",title:"Çok dilli müşteri kazanımını ve iş ortaklığı planını hazırla",notes:"Güncel resmî kaynaklı içerik, kurumsal iletişim, organik arama, topluluk ve uzman iş birlikleriyle başlanacak kanalları planla.",priority:"normal"},
 {group_key:"quality",title:"Uçtan uca senaryoları ve güvenlik testlerini geç",notes:"Başvuru, sözleşme, belge yükleme, ödeme ve iade, yetkisiz erişim, RLS, kritik süre ve bildirim senaryolarını kanıtla test et.",priority:"critical"},
 {group_key:"legal",title:"Yasal üretim açılışını ve müşteri kabulünü onayla",notes:"Çalışma hakları, BV, sigorta, uzman yetkileri, GDPR, sözleşmeler ve ödeme geçitleri doğrulanmadan kamuya açık kabulü açma.",priority:"critical"},
 {group_key:"quality",title:"İlk 90 gün performans ve iyileştirme incelemesi yap",notes:"Başvuru, dönüşüm, net gelir, tahsilat, geciken dosyalar, müşteri şikâyeti ve hizmet başına işlem süresini düzenli raporla.",priority:"normal"}
];
export const businessPlan:InternalTaskSeed[]=[
 ...originalTasks.map(task=>({...task,phase_key:phaseForOriginalTask[task.title]||"foundation"})),
 ...coordinationTaskSeeds.map(task=>({...task}))
];
