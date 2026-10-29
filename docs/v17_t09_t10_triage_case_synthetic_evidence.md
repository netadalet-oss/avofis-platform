# AVOfis v17 — T09/T10 kapalı triyaj ve sentetik müşteri dosyası kanıtı
**Tarih:** 29 Ekim 2026. **Kaynak:** v17 ana talimatname §11, §14 T09–T10; EK A R-ID'leri.  
**Yetki:** Draft PR #5; canlıya SQL/merge, gerçek müşteri kabulü, ödeme, IND/mahkeme başvurusu YOK.

## T09 — ülke/rol/süre bilgisine dayalı güvenli genel triyaj

- `portal/src/lib/public-triage.ts`: yalnızca sınırlı seçenekler: ülke NL/DE/TR/diğer/bilinmiyor, işlem kategorisi, kimin adına genel bilgi arandığı, tebliğ alınıp alınmadığı, **kişinin bildirdiği** süre yakınlığı ve acil risk işaretleri. Ad-soyad, telefon, e-posta, tam tarih, karar içeriği, kimlik, dosya veya serbest açıklama alanı yok.
- `portal/src/app/triyaj/page.tsx`: tarayıcı içi durum; veri gönderen form, localStorage, çerez, dosya yükleme veya ağ çağrısı yok. Seçenekler yalnızca genel resmî bilgi veya bağımsız uzmana **kullanıcının kendisinin** güvenilir kanaldan başvurmasına ilişkin uyarı üretir.
- Kural: ciddi/hızlı zarar bildirimi, gözetim/sınır dışı veya 48 saatten az **öz bildirimi** → `URGENT_SPECIALIST`. Dava, iltica, idari itiraz, belirsiz ülke/rol/tebliğ → `SPECIALIST_REVIEW`. Belirsiz ülke için Hollanda yetkisi/işlem yolu **asla varsayılmaz**.
- `mayCreateClientRecord=false`, `maySubmitOfficialAction=false`, `deadlineCalculated=false` tüm test evreninde zorunlu. Kullanıcının kendi tahmin ettiği yakınlık **resmî süre hesabı değildir**; gerçek karar/tebliğ tarihi, usul ve geçiş hukuku uzman tarafından kontrol edilmelidir. Acil yönlendirme gerçek bir uzman ataması veya yanıt süresi taahhüdü değildir.
- `portal/scripts/public-triage.test.mjs`: ülke×konu×tebliğ varyantları ile sınırlı veri/ret, ayrıca rol, kritik süre, IND iltica ve ülke belirsizliği negatif testleri.
- **Kabulün açık sınırı:** İlk gizlilik bildirimi, gerçek kimlik/rol doğrulama, ülke ve kurum bazında resmî URL revizyonu, hukukçuyla gerçek acil sevk anlaşması, CRM'e kabul/red/sevk gerekçesi işleme ve kişisel veri işleyen gerçek başvuru akışı **yok**. R-146 gibi tebliğ **tarihi gerektiren** R-ID bu genel anonim triyaj ile tamamlanmış sayılmaz.

## T10 — altı duraklı sentetik müşteri dosyası

- `database/tests/client_case_workflow_synthetic.sql`: izole PG17’de yeni A dosyası, teklif/sözleşme taslağı, gerçek elektronik imza olmayan sentetik kabul, admin C taslağı/admin E ikinci G1–G4 kontrolü, atanmış operatörün belge talebi ve mesajı, A'nın özel Storage yoluna sentetik dosya kaydı, B'nin erişememesi, ödenmemiş dosya için `completed` reddi, **veritabanı sahibince taklit edilen** `paid`, `completed→closed` ve 5 durum olayı. `ROLLBACK` ile fixture temizlenir ve önceki PG dump/restore testini etkilemez.
- `portal/src/app/ornek-dosya/page.tsx`: altı aşamalı **hiçbir backend çağrısı veya gerçek ödeme içermeyen** interaktif görsel senaryo. Bu bir gerçek müşteri dosyası değildir.
- `.github/workflows/avofis-integrated-catalog-ci.yml`: ayrı T09 Node testleri ve T10 SQL akışını mevcut güvenlik işleriyle birlikte çalıştırır; `portal/scripts/smoke-routes.mjs` yeni iki route için HTTP 200 ve kayıt formu olmaması kontrolünü yapar.
- **Gerçek uçtan uca kabulün açık sınırı:** Ayrı Supabase staging Auth/JWT/Storage, signed-URL ve eski oturum iptali, gerçek ödeme PSP sandbox ve iade, dosya taraması/karantina, gerçek e-imza/contract, DPA/DPIA, veri erişim/silme (DSAR), 6-dil + WCAG 2.2 AA testleri **yok**. Sentetik 'paid' güncellemesi bankadan doğrulanmış bir ödeme kanıtı değildir.

## Kanıt / R-ID eşleştirmesi

| Gereksinim | Düzey | Kesin sınır |
|---|---|---|
| R-141, R-151, R-186, R-450 | Kısmi kod ve sentetik negatif test | Kullanıcı bildirimine göre acil uyarı; gerçek süre/karar/hukukî sevk yok |
| R-154, R-167, R-509 | Kısmi privacy-by-design | Bu özel T09 ekranında kişisel veri/kimlik istenmiyor; bütün ürün için veri minimizasyonu kabulü yok |
| R-478, R-479 | Kısmi uzman/yönlendirme | Gerçek ret kararı, uzman kimliği, hizmet ve ücret anlaşması yok |
| R-541, R-546 | Taslak/sentetik akış | CRM'de kayıtlı kabul-red-sevk gerekçesi yok; kamu triyajı kayıt almıyor |
| R-415, R-417, R-421 | Kısmi görsel demonstrasyon | Gerçek kişi dosyası veya tam panel değil |
| R-524, R-586 | Sentetik PostgreSQL kanıtı | Gerçek Supabase Auth/Storage URL E2E yok |
| R-585, R-588 | Node + PG sentetik test | Ödeme sandbox ve müşteri kabulü hâlâ NO-GO |

## Kontrol ve devreye alma kararı

Bu teslimat **T09 ve T10'un tam bağımsız kabulü değildir**. Yalnızca yeni güvenli geliştirme kodu ve sentetik test kanıtıdır. Canlı Supabase'in yedi eski `public` tablosunda RLS/anon CRUD sorunu (B01/B02) önceki salt okunur kontrolde devam ediyor. Ayrı staging projesi, hukuki meslek/yetki belgesi, gerçek GDPR m.13, tüketici sözleşmesi, ödeme onayı ve proje sahibinin imzalı Go kararı olmadan **NO-GO**.

Geri alma: PR #5 değişikliklerini kullanmadan, bu dalı ana dala birleştirmemek; migration/gerçek veri değişikliği olmadığı için bu turda canlı veritabanı rollback'i yok. Özellik bayrakları zaten kapalı.

## T09/T10 ilave negatif güvenlik regresyonu — 29.10.2026

- **T09**: aile üyesi, işveren, kurum ve temsilci rolü, yazılı ve meslekî yetki doğrulanmadan artık "doğrulanmış kendi dosyası" gibi sınıflandırılmaz; `ROLE_OR_MANDATE_REQUIRES_REVIEW` ile uzman incelemesi uyarısı verir.
- **Veri minimizasyonu:** `public-triage.ts` çıktısına ayrıca `mayAcceptPayment=false`, `mayUploadDocuments=false`, `mayShareWithExpert=false`, `mayCollectPersonalData=false` sabitleri eklendi. Çoklu ülke/konu/rol/bildirim kombinasyonlarında Node testleri bu sınırı doğrular. Sadece TR/NL/EN kamu triyajı mevcut; bütün formların ülke/dil hukukî QA'sı değildir.
- **Resmî başlangıç bağlantısı:** NL iltica, oturum ve gözetim/sınır dışı konularında genel mahkeme sitesi yerine `ind.nl` başlangıç sayfası gösterilir. Bu bağlantı **güncel süre, doğru dava yolu veya resmî başvuru kanalı onayı değildir**; insan doğrulaması şart.
- **T10**: `client_case_workflow_synthetic.sql` artık A müşterisinin farklı gönderen kimliği taklidini reddeder; `pending`, `authorized`, `failed`, `refunded`, `charged_back` sentetik ödeme durumlarının hiçbirinin ücretli dosyayı `completed` yapamadığını sınar. `closed` dosyaya müşteri dosya yüklemesi ve atanmış operatör belge talebi de reddedilir. Hiçbir Mollie/PSP işlemi yapılmaz.
- **Ek test sonucu:** [CI #40902190174](https://github.com/netadalet-oss/avofis-platform/actions/runs/40902190174) **4/4 başarılı**; `T09` senaryo testi, `T10` sentetik PostgreSQL, diğer IND, legacy RLS, yedekten geri yükleme ve portal derleme işlerini kapsar. Gerçek Supabase staging, özel URL iptali, Auth/MFA/erişim günlüğü, banka sandbox/iade ve GDPR/hukukî kabul **BEKLİYOR**.
- **Canlı karar:** NO-GO; PR #5 draft, `main` birleştirilmedi, canlı Supabase değiştirilmedi, müşteri kabulü/ödeme açılmadı.
