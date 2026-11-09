# LarenLex 554 hizmetli portal — Java 21 geliştirme, 9 Kasım 2026

554 v86 hizmet kimliği / 17 hizmet alanı / 1.016 form / 1.101 kontrol eki / 550 tarihsel plan sayıları korunur. Tekil hizmetler müşteriye işler olarak görünür; 25 teknik modül yalnız dahili yapıdır.

**Java 21 yerel doğrulamalar:** CaseEngineSelfTest 31, PublicationSelfTest 17, PublicServicesSelfTest 9. Bunlar veritabanı, kimlik sağlayıcı veya Vaadin gerçek derlemesi değildir. Web önizlemesi Chromium set_content üzerinden 46 etkileşim testini geçti.

**Kamusal önizleme:** bağımsız Vercel statik proje `larenlex-554-hizmet-onizleme`; 554 hizmete ait yalnız kamuya uygun metaveri yüklenir. Gerçek başvuru kabulü, ödeme, hukukî kartların tam metninin yayını, resmî kuruma başvuru ve kimlik doğrulaması YOKTUR.

Java business domain çekirdeği tenant/owner/role, imzalı olmayan şart kabulü, belge/teslim, teklif, fatura taslağı ve ücretsiz ret kuralını doğrular; dışa istek/ödeme yapmaz. Flyway V3 yalnız *taslak* güvenlik migrasyonu olup PostgreSQL üzerinde çalıştırılmamıştır. RLS varsayılan kapalı (hiç politika yok), çalışma rolüne grant verilmez.

**Duyarlılık:** `admin/.env.local` repository geçmişinde hâlâ izlenmektedir; rotasyon ve silme baştan güvenlik kabul şartıdır. Yalnız PR #17, main korunur. W1_DONE=HAYIR, WEB_GO=HAYIR, W2/MOBIL başlamadı.
