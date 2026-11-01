# LarenLex Android L6 — A6/A7 hazırlık ve kanıt sınırı

**Seviye:** L6 geliştirme döngüsü. **Ürün:** nl.larenlex.app. **Bağlayıcı:** özel LarenLex talimatnamesi, LX-059–LX-062.

Bu dizin L6'nın GitHub'a işlendiği **değişiklik ve karar kaydıdır**; tam ve tekrar üretilebilir bağımsız kaynak paketi kullanıcıya teslim edilen L6 ZIP'indedir. Android SDK, gerçek APK, fiziksel cihaz, PostgreSQL RLS, gerçek IdP, hukukî kabul, üretim imzası ve mağaza yayını kanıtlanmış değildir.

A6: 14 modül / 69 alt grup / 453 A2 kimliği; 12 cihaz-erişilebilirlik senaryosu **NOT_RUN**. Test tasarımları API 26/29/33/35, offline, güncelleme, Keystore, dosya/erişilebilirlik, altı dil/RTL ve APK bütünlüğünü içerir.

A7: kullanıcıya ait üretim anahtarları, yayın hesabı ve ayrı eylem onayı olmadan **hiçbir gerçek imzalama/mağaza yüklemesi** yapılmadı. G1–G4, gerçek Auth/PSP/kurum erişimi ve müşteri verisi için ayrı yetki gerekir.

Yerelde: Python 8 test, Java 8 politika koşulu, 14 statik yapı denetimi başarılı; Chromium mobil/masaüstü 14 modül/12 senaryo görünür. Bu testler **A6 cihaz kabulü yerine geçmez**.

Bütün-uygulama HTML prototipi, tam Android kaynak kodu, kanıtlar, SHA256SUMS ve L6 geliştirme snapshot Git bundle'ı indirilebilir ZIP tesliminde bulunmaktadır.
