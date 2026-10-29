# AVOfis v17 — P01–P03 Personel Çalışma Alanı / Tasarım ve Kabul İzleme
**29 Ekim 2026 — geliştirme dalı PR #5 — yalnız inceleme.** Özgün R-001..R-594 ve J01–J16 kayıtları korunur; hiçbir resmî, meslekî veya GDPR onayı varsayıldığı için otomatik olarak verilemez.

## 1. Değişiklik gerekçesi

Eski ayrı Next.js \`admin\` uygulamasında personel giriş sayfası yalnız CMS'ye gidiyordu; \`/dashboard\`, \`/cases\`, \`/roles\`, \`/audit\`, \`/statutes\`, \`/media\`, \`/settings\`, \`/notifications\` ve \`/analytics\` kullanılabilir modüller yerine \`/cms\` yönlendirmesinden ibaretti. Başlangıç şeması yalnız \`admin\` ve \`operator\` rolünü biliyordu. Kullanıcıya özel modül izni, finans ile belge arasında izin ayrımı ve merkezî personel navigasyonu yoktu.

**Yeni ilkeler:** Kullanıcı şifresi ile Supabase Auth; veritabanından doğrulanmış aktif personel kimliği; \`avofis_staff_capability_grants\` üzerinden **kişisel rol/izin**; gerçek kayıtlar için ayrıca dosya ataması + PostgreSQL RLS; özel belge/veri/ödeme ve resmî işlem kapılarının birbirinden bağımsız kalması.

## 2. Kullanılabilir ekranlar ve gerçek veri durumu

- \`admin/src/app/login/page.tsx\`: e-posta/şifre ile giriş, \`auth.getUser()\` ile kimlik, \`avofis_staff\` ile kurum hesabı doğrulama. Yetkisiz hesap içeri girmez. Gerçek personel hesabı ve MFA henüz kurulmadı.
- \`admin/src/app/dashboard/page.tsx\`: kimliğe göre menü, 16 iş alanı, duyarlı mobil düzen ve ergonomik tipografi; şablon/dilekçe kütüphanesi düzenleme, görev ve mali kayıt için iç taslak formu.
- \`admin/src/app/api/workspace/route.ts\`: istekte JWT sahibini **sunucuda** doğrular; \`avofis_staff\` rol ve \`avofis_staff_capability_grants\` iznini veritabanından kontrol eder; kendi yetkisindeki modül verisi için ancak PostgreSQL RLS'nin verdiği kayıtları döndürür. Resmî kaynak listesi ve taslak şablonları **yetki denetiminden sonra sunucudan** döner; müşteri portalında yayımlanmaz.
- \`admin/src/app/api/workspace/drafts/route.ts\`: yalnız özel staging bağlantısında JWT + modül izni + RLS; iç görev/gelir/gider taslakları \`draft\` statüsünde. Banka transferi, PSP tahsilatı, resmî başvuru veya dış mesaj üretmez. Yazma ayrı \`AVOFIS_STAFF_WORK_ITEM_WRITES_ENABLED\` bayrağına bağlıdır.
- Mevcut \`/cms\` içerik yönetimi korunur ve yalnız admin için erişim kontrolü sürer. Eski yönlendirici sayfalar, konuya uygun \`/dashboard?section=...\` adreslerine taşındı. Yeni personel hesaplarını oluşturmak, eski CMS koruma kusurlarını üretimde düzeltmek ve herkesin gerçekten kendi MFA'lı şifresiyle giriş yaptığını doğrulamak ayrıca gerekir.

### Modül envanteri / 16 bireysel izin

| İş grubu | Modül | İşlev / bugünkü düzey |
| --- | --- | --- |
| Dosya/hizmet | \`inbox\` | Başvuru metadata listesi, yalnız admin lead RLS; şimdilik yanıt/gönderim yok |
| Dosya/hizmet | \`triage\` | Ülke, tebliğ ve yetki görevleri; iç taslak |
| Dosya/hizmet | \`matters\` | Gerçek staging'de atanmış dosyaların listesi ve RLS |
| Dosya/hizmet | \`calendar\` | Süre ve görev kontrol listesi; henüz gerçek takvim/yasal süre motoru yok |
| Belge/hukuk | \`documents\` | Ayrı özel Storage/deliverable yetki kapısı; evrak iş akışı bağlantısı bekliyor |
| Belge/hukuk | \`pleadings\` | Düzenlenebilir iç dilekçe/rapor taslağı ve resmî kaynak |
| Belge/hukuk | \`research\` | Resmî mevzuat, Rechtspraak, IND, EU kaynaklı taranabilir 14 işlem rehberi |
| Belge/hukuk | \`judicial\` | Resmî yargı sistemi görevleri; gönderim ve makbuz NO-GO |
| Belge/hukuk | \`ind\` | 8 IND kategorisi, G1–G4, NOvA, iltica/bewaring ayrı |
| İletişim | \`messages\` | Yalnız dosyaya atanmış ve \`messages\` yetkili personelin metadata/mesaj okuması; dış gönderim yok |
| Finans | \`billing\` | RLS korumalı ödeme metadata okuma; iç gelir taslağı; PSP bağlantısı kapalı |
| Finans | \`payables\` | İç gider taslakları; **gerçek borç, ödeme emri, banka çıkışı veya mali defter değil** |
| Yönetim | \`reporting\` | Denetim / görev listesi, toplu gerçek raporlama entegrasyonu bekliyor |
| Yönetim | \`audit\` | GDPR/AVG ve erişim süreçleri, bağımsız kalıcı audit altyapısı bekliyor |
| Yönetim | \`people\` | Personel rolü listesi; gerçek grant/revoke yönetim UI'si ve MFA bekliyor |
| Yönetim | \`settings\` | İçerik ve yayın görevleri; gerçek yayımlama onayı kapalı |

**Düzey ayırımı:** Modülün menüde bulunması = tüm işlevlerinin tamamlanması değil. Etkin kullanıcı hesabı oluşturulmadı. Gerçek üretim kayıtlarının okunması ve yazılması bu taslakta yapılmadı.

### Kaynaklı 14 hukukî örnek iş akışı

\`admin/src/lib/legal-workflows.ts\` kullanıcı girişinden önce erişilebilen genel portal içerikleri değildir; yalnız personel yetkili API aracılığıyla döndürülür. Güncel Rechtspraak procesreglementen, bestuursrecht, reguliere vreemdelingenzaken/DPC-CIV, IND oturum/iltica/9001 resmi formu, e-Justice, KVK, Belastingdienst, Huurcommissie ve AP bağlantıları kullanıldı. Her akış işlem sırası, belge ve kişi yetkisi kontrolü ve düzenlenebilir **resmî olmayan çalışma taslağı** içerir. Kütüphane **tüm hukuk düzenlerini, tüm dilekçeleri veya tüm resmî formları kapsamaz**. Resmî formlar kendi hukukî kaynağından açılır; şablonlar resmî form olarak işaretlenmez.

Hukukî kaynak: https://www.rechtspraak.nl/voor-advocaten-en-juristen/reglementen-procedures-en-formulieren/procesreglement  
Reguliere vreemdelingenzaken: https://www.rechtspraak.nl/voor-advocaten-en-juristen/reglementen-procedures-en-formulieren/bestuursrecht/procederen-in-reguliere-vreemdelingenzaken  
IND 9001: https://ind.nl/nl/formulieren/9001.pdf  
GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj

## 3. SQL şeması ve fail-closed sınırlar

- \`database/migrations/20261029_staff_personal_capability_scope_staging_only.sql\` — \`avofis_staff_capability_grants\` için \`anon\` yok, yalnız admin bireysel grant/revoke yapabilir; operatör kendi rolünü yükseltemez. Mevcut case, message, finance, document request, deliverable ve AVOfis private Storage RLS'ine ek **restrictive** kısıtlar; müvekkilin kendi dosya erişimi ayrı korunur.
- \`database/migrations/20261029_staff_work_items_staging_only.sql\` — 16 modülde yalnız \`draft\`/\`review_requested\` iç görev listesi, gerektiğinde EUR gelir/gider tutarı metadata. Kabul edilmiş fatura, resmî gönderim, ödeme veya \`approved\` durumları şemada yok. Yazma yetkisi personel ve modül kapsamında.
- \`database/tests/staff_personal_capability_scope_synthetic.sql\` — 0 izinli operatörün dosya, mesaj, finans ve özel belgeyi görememesi; ayrı admin grant; revocation; A/B müşteri erişimi.
- \`database/tests/staff_work_items_synthetic.sql\` — taslak sahipliği, mali akış yönü, admin kaydına yatay erişim, resmî olmayan durum ve hiç yetkisiz müşteri okuma.
- \`database/tests/synthetic_restore_assertions.sql\` — yedekten dönüş sonrası personel otomatik yetkili olamaz; yeniden, açık ve kişisel grant gerekir.

Bu migrasyonlar **canlı Supabase üzerinde uygulanmadı**. Ayrı gerçek staging/Auth/JWT/Storage testi ve onaylı gerçek şifreli backup-restore gerektirir.

## 4. Tasarım ilkeleri

İç portal: sıcak beyaz arka plan, koyu lacivert/şampanya vurgusu, küçük ve okunabilir işlev başlıkları, 16 modüllü gruplanmış menü, duyarlı mobil katman, görünür form etiketleri, klavye kullanılabilirliği, sabit yetki bilgisi. Dış portal: bireyler/aileler, şirketler/kurumlar ve kamuya açık içtihat araştırması ilk ziyaret ekranında ayrıştırılır; yeni iş başlamadan önce hukukî kapsam, ücret ve görevli kişinin yetkisi açıklanır.

AVOfis'in Hollanda mahkemesi veya IND olduğu ima edilmez; “gönderildi”, “ödendi” gibi resmî/onaylı durumlar makbuz ve bağımsız hukukî kontrol olmadan açılmaz. Metinler müşteri veya kurum adına garanti niteliği taşımaz.

## 5. Zorunlu eksikler ve bitiş ölçütleri

1. P0: B01/B02 canlı \`public\` yedi tablo açık RLS/anon CRUD, B03 gerçek üretim yedek/geri yükleme, B04 bağımsız staging Auth/Storage. Bunlar kapanmadan müşteri kayıtlarını işleyen iç API canlı açılamaz.
2. P0: Personel sicili, ayrı şifre, MFA, oturum/cihaz iptal testi, bağımsız meslekî yetki, gerçek DPO/AVG dayanağı ve gizli dosyaya erişim günlüğü.
3. P0: İç yazışma gönderimi, resmî başvuru, avukatlık işlemleri ve banka/PSP payout iki kişi ve gerçek sağlayıcı makbuzu olmadan başlamaz.
4. P1: İş alanı başına canlı kaynak, görev geçişi, audit, belge sürümü, GDPR saklama/silme, resmî form versiyon takibi, ülke/usul güncelliği, 6-dil insan hukukî editörü, WCAG klavye/ekran okuyucu/RTL incelemesi.
5. P1: Tam muhasebe, gelir/gider, fatura, iade, KDV, tedarikçi, gider onayı, banka mutabakatı ve risk/çıkar çatışması kontrollerinin güvenilir sağlayıcı üzerinden uçtan uca yapılması.

**Yayın kapıları:** \`AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED\` ve \`AVOFIS_STAFF_WORK_ITEM_WRITES_ENABLED\` varsayılan kapalı; gerçek giriş, ödeme, müşteri kabulü veya resmî işlem için ayrıca açık onay gerekir. \`main\` üzerinde değişiklik veya PR birleştirme yapılmadı.

**Gözden geçirme hedefi:** Kaynaklı gerçek kullanım, rol bazında negatif test, eHerkenning/DigiD bilgisi toplama yasağı, altı dil QA ve bağımsız karar belgeleri tamamlanmadan “hazır”, “onaylı”, “canlı” statüsü verilmez.
