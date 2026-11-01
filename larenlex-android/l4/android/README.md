# LarenLex Android L4 — Kaynak iskeleti

Bu klasör, yalnız `nl.larenlex.app` için geliştirilmiş Android Studio projesidir. Ana ekranda 14 modül / 69 alt grup / 453 işlev; `L4LegalFlowsActivity` ekranında 17 hizmet, 14 hedef kitle, 12 *kaynak kaydı eksik* sorun yeri, 16 personel, 8 IND, G1–G4, J01–J16 ve altı taslak arayüz dili gösterilir.

`l4_legal_catalog.json` kanonik özel talimatnameden hazırlanmış çevrimdışı veri kaydıdır. Hizmetler hukukî onay, meslekî yetki, ücret, kaynak güncelliği ve ülke doğrulaması tamamlanmadığı için kapalıdır; gerçek müşteri verisi alınmaz. Dış API için `INTERNET` izni yoktur. Ekranlar ve `L4ProcessGate`, `L4CaseWorkflow`, `L4SourceFreshness` yalnız uygulama hazırlığıdır.

Tam Android derlemesi/cihaz testi bu ortamda yapılamadı: Gradle wrapper, SDK API 35, ADB ve gerçek A5.18 bağımsız Android kaynak geçmişi doğrulanmadı. Bu dosyaların mevcudiyeti APK veya bağımsız ürün kabulü değildir. `main` dalına/üretime birleştirme yapılmamıştır.
