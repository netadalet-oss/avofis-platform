# LarenLex Android L1 — bütün 14 modül yatay geliştirme kontrol noktası

**Kullanıcı L0 → L1 geçişini açıkça onayladı.** 1 Kasım 2026 itibarıyla L1 kapsam döngüsü gerçekleştirilmiştir. L1 → L2 için **ayrı kullanıcı onayı gereklidir**.

## L1 bütün-uygulama kapsamı
- Özgün özel talimatname kaynak sayımları: 14 LX sistemi, 69 alt grup, 453 A2 işlev ID'si ve 102 API tasarım kimliği.
- Her sistem için veri nesnesi önerisi, risk/sınıflandırma, tenant/matter/owner bağlantıları, müşteri/atanmış personel + MFA erişim kuralları.
- L1 etkileşimli tam-ürün önizlemesi: `larenlex-android/preview/whole-app-l1.html`. Bütün A2 işlevleri, 16 personel alanı ve sentetik rol simülatörü bulunmaktadır; APK veya gerçek sunucu değildir.
- GitHub kayıtları: `l1/contracts/all_module_data_contracts.json`, `l1/sql/001_disposable_pg_rls_deny_all_draft.sql`, `l1/sql/002_synthetic_sqlite_baseline.sql` ve `l1/tests/`. PostgreSQL taslağı **motor üzerinde yürütülmemiştir** ve varsayılan erişim reddi uygular.
- Bağımsız yerel teslim paketinde tam `src/l1_store.py` sentetik SQLite bellek uygulaması, 39 yerel test, tarayıcı doğrulaması, kanıt, iz ve önizleme bulunur. Kaynak kodun tamamı GitHub'da aynı HEAD üzerinde 39 testle doğrulanmış **sayılmaz**.
- GitHub'daki `l1/src/l1_store.py` tam yerel referans kodu da ayrıca eklenmiştir; bu kodun referans şema/testleriyle birleşik GitHub CI başarısı henüz kanıtlanmadı.

## Test kanıt sınıfları
1. Yerel test ortamı: **39/39 Python unittest PASS**; Python -O modunda da 39/39 PASS. 22'si SQLite veri/yetki davranışları; 10'u model/PG SQL statik kontrolleri; 7'si önizleme/kapsam kontrolleri.
2. Yerel Chromium Playwright: mobil 390 px görünümde 14 L1 kartı, JavaScript hata yok, yatay taşma yok; müşteri ret/personel sentetik izin senaryosu çalıştı. `file://` ilk giriş tarayıcı yönetimi tarafından reddedildi, `page.set_content` ile yeniden test edildi.
3. GitHub `l1/tests/` ayrı statik sözleşme/SQL denemeleri içerir. GitHub Actions tanımının bulunması **başarılı workflow run-id kanıtı değildir**.
4. Gerçek Android kaynak HEAD, APK, ADB, Gradle, PostgreSQL gerçek motor, canlı Auth/JWT ve bağımsız teknik/hukukî kabul **yok/erişilebilir değil**.

## L0 borçları L1'de yeniden denendi
A5.18 bağımsız Git bundle; A5.14 handoff; Android SDK/Gradle/ADB; izole PostgreSQL; özel kaynak erişimi için **her başlıkta iki yeni salt-okunur deneme** yapıldı. Kaynak yoksa tamamlandı ilan edilmedi. L2'de aynı açık maddeler tekrar en az iki kez denenir; tüm modüllerin yatay ilerlemesine engel sayılmaz.

## Özellikle açık kalan sözleşmeler
- Onaylı A4 tasarımında **52 nesne / 13 rol profili** bulunduğu biliniyor; bu ZIP'te isimleri ve gerçek A4 entity registry bulunmadığından bunların her biri kodlanmış veya eşleşmiş gösterilmeyecek.
- 15 yüksek-riskli A4 API işlemi ve 12 dış adaptör tasarım düzeyinde kapalı; hiçbir gerçek resmî gönderim veya ödeme başlatılmadı.
- PostgreSQL RLS onayı, gerçek uygulama JWT/IdP, belge dosya barındırma ve hukukî inceleme ayrı kabul koşullarıdır.

## Güvenlik ve sonraki geçiş
Public `avofis-platform` dalına özel token, gerçek kişi verisi, müşteri belgesi, imzalama anahtarı veya gizli bağımsız Android Git bundle yüklenmedi. AVOfis `main` değişmedi. L1 kapsam döngüsünün tamamlanması **bağımsız L1 teknik kabulü değildir**. L2'ye kullanıcı onayı olmadan başlanmayacaktır.
