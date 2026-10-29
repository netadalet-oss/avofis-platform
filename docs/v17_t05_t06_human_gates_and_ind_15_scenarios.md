# AVOfis v17 · T05/T06 güvenlik ve hukukî kabul kaydı (29.10.2026)

**Dayanak:** v17 ana talimatname §11–16 ve **EK B §D–I**. Bu dosya kaynak yerine geçmez. PR #5 hâlâ taslaktır; `main`/canlı Supabase/başvuru/ödeme açılışı için yetki vermez.

## T05 · Kurucu, işveren ve meslekî yetki (insan kararı — BEKLİYOR)

| Kanıt/karar | Gerekli insan kontrolü | Mevcut durum |
|---|---|---|
| Tescil/BV/KVK/UBO ve kurucu rolü | Gerçek sicil/noter belgeleri ve yetkili doğrulayan | **BELGE YOK / BEKLİYOR** |
| Kurucu ve temsilcilerin fiilî çalışma/yönetim hakkı | Hollanda oturum/çalışma koşulları, meslekî kapsam | **BELGE YOK / BEKLİYOR** |
| Avukat, jurist, noter, tercüman ve bağımsız uzmanların sıfatı | Her prosedürde gerçek kişi/meslekî yetki ve çıkar çatışması kontrolü | **DOĞRULANMADI** |
| Hukukî hizmet kapsamı/sözleşme, ticaret unvanı ve temsil yetkisi | Hollanda hukukçusu ve proje sahibinin tarihli onayı | **ONAY YOK** |
| Gizlilik, veri sorumlusu, GDPR/DPIA, üçüncü ülke aktarımı | DPO/bağımsız yetkili incelemesi | **ONAY YOK** |
| Sigorta, şikâyet, banka/PSP, ücret/vergi/harç ayrımı | Gerçek belgeler ve operasyon sorumlusu | **ONAY YOK** |

**Teknik karşılık:** `AVOFIS_LEGAL_READY=false`, `AVOFIS_INTAKE_ENABLED=false`, `AVOFIS_PAYMENT_ENABLED=false` ile CI portal kontrolleri geçer; gerçek üretim bayrak ve veri saklama kontrolleri ayrıca doğrulanmalıdır. İnsanların yerine sahte karar, sicil veya lisans kaydı oluşturulmaz.

## T06 · EK B'nin tam 15 IND senaryosuna karşı kanıt / açık boşluk

Kanıt seviyeleri: **sentetik-birim**, **sentetik-SQL**, **kısmi (yalnızca bir koşul)**, **BEKLİYOR (E2E/hukukî)**. Bir IND-T testinin burada listelenmesi, hukuken yetkili temsil veya gerçek staging testinin geçtiği anlamına gelmez.

| ID | Kullanıcı kaynağındaki hedef | Koda bağlı kanıt ve sınır |
|---|---|---|
| IND-T01 | İmzalı yetki var ama çalışma hakkı yok → ACTIVE yok | **Sentetik-birim + SQL kısmi:** `PERSON_UNVERIFIED`; gerçek çalışma belgesi incelenmedi |
| IND-T02 | Dosya temini kapsamındaki yetkiyle bezwaar gönderimi → ret | **BEKLİYOR:** temsil belgesi işlem kapsamı makinece karşılaştırılmıyor; sadece var/yok |
| IND-T03 | Müşteri A, müşteri B'nin IND dosya URL'sine erişiyor → ret + audit | **Sentetik-SQL kısmi:** genel A/B case/Storage RLS; gerçek IND URL, HTTP statüsü, görüntüleme auditi yok |
| IND-T04 | 11.06.2026 ve 12.06.2026 iltica başlangıçları aynı süre şablonuna düşmez | **BEKLİYOR:** tarih-odaklı rejim sınıflandırması ve uzman kaynak onayı henüz modellenmedi; mevcut bool yeterli değil |
| IND-T05 | Hoger beroep, süre dayanağı yok → HOLD_DEADLINE | **Sentetik-birim kısmi:** `DEADLINE_UNREVIEWED`; uzman gerekliliği `SPECIALIST_REQUIRED`; resmî süre hesabı yapılmadı |
| IND-T06 | İlk iltica kişisel başvurusu imzalı belgeyle devredilemez | **Kısmi:** `filingNotAuthorisedByThisCheck=true` bayrağı var, gerçek IND işlem API/E2E yok |
| IND-T07 | Jurist avukat portalına gönderilmez | **BEKLİYOR:** gerçek portal yönlendirme/NOvA yetki testi yok; varsayılan açık temsil rotası kurulmamalı |
| IND-T08 | AEA dışı uzman aktarımında GDPR Bölüm V kontrolü olmadan paylaşım yok | **Kısmi:** G4 privacy/retention/domain ret testi var; bağımsız Chapter V transfer kapısı yok |
| IND-T09 | Uzmanla sözleşme/ücret/sorumluluk belirsiz → ACTIVE yok | **BEKLİYOR:** insan onaylı uzman-sözleşme/ücret/sorumluluk alanları yok |
| IND-T10 | Bewaring/uitzetting acil uzman sevki | **Sentetik-birim kısmi:** `SPECIALIST_REQUIRED` kapısı var; acil sevk SLA/uyarı işi yok |
| IND-T11 | IND dosya talebinde ayrı resmî form zorunlu | **Sentetik-birim + SQL:** `IND_FORM_UNREVIEWED` / `ind_form_reviewed` doğrulaması; gerçek form kanıtı yok |
| IND-T12 | Müşteri/personel kritik G1/G2 alanlarını değiştiremez | **Sentetik-SQL kısmi:** `avofis_case_clearances` admin-only RLS/trigger, bağımsız ikinci admin; gerçek JWT/REST yok |
| IND-T13 | Oturum iptalinden sonra dosya URL erişimi yok | **BEKLİYOR:** gerçek Supabase Auth oturum iptali, cached JWT, signed URL ömrü doğrulanmadı |
| IND-T14 | Sınırsız/şirket geneli vekâletname üretilmez | **BEKLİYOR:** kontrollü şablon/insan hukukî onayı veya red E2E kanıtı yok |
| IND-T15 | Kapalı form kişisel veri/ödeme kaydı oluşturmaz | **Kısmi:** CI'da feature flag ve HTTP smoke, gerçek kayıt yapılmadığının staging/API ispatı yok |

### Teknik farkların önemi

- Postgres sentetik `auth.uid()` sahte JWT değil; gerçek kimlik doğrulaması yapılmış sayılmaz.
- Storage `storage.objects` sentetik RLS testi, **signed URL** erişimini veya dosya içerik güvenliğini test etmez.
- `avofis_assignment_events` atama değişikliği olaylarını tutar; tüm dosya **görüntüleme/indirme/açma** erişimlerinin değişmez kaydını tutmaz.
- Çalışma izni, gerçek temsil yetkisi, IND/mahkeme prosedürü, geçiş hukuku, GDPR Bölüm V ve uzman sorumluluğu için **insan ve resmî kaynak** doğrulaması olmadan hiçbir T06 senaryosu production legal acceptance alamaz.
- Geçerli belirli bir şahıs/kurum adına başvuru, ödeme, resmi hesap veya avukat portalı otomasyonuna izin yok.

## T06 sonraki zorunlu teknik paket

Tarih-temelli iltica `IND-T04`, işlem kapsamlı vekâlet `IND-T02`, AEA dışına aktarım kararı `IND-T08`, gerçek Auth/Storage oturum/URL iptali `IND-T03/T13` ve işlem açma kapısına bağlı hukukî sorumluluk `IND-T09` henüz açık. Önce ayrı staging Supabase proje/hesap ve insan belge doğrulaması gerekir; canlı SQL uygulanmaz.
