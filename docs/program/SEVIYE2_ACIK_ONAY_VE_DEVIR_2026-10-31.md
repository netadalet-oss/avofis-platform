# AVOfis — Seviye 2 açık kullanıcı onayı, kayıpsız devir ve ilk iş

Karar tarihi: 31 Ekim 2026. Aktif çalışma seviyesi: Seviye 2.

**Yeni kullanıcı kararı (aynen):**
“AVOfis projesinde Seviye 2'ye geçişe açık onay veriyorum. Seviye 1'in tamamlanmamış gereksinimlerini ve açık engellerini koru; bunları tamamlanmış sayma. Main, üretim, canlı Supabase, gerçek para ve resmî işlemler için ayrıca onayımı al.”

Bu karar, 31.10.2026 tarihli daha eski “Seviye 2 henüz onaylanmadı” kaydının **sadece geçiş yetkisi** bakımından yerini alır. Tarihî talimatname, 594 özgün R-ID içeriği, 64 kuruluş fizibilite konusu ve B01–B18 açık engeller geriye dönük değiştirilmez. Seviye 1'in kapandığı ya da kabul edildiği iddia edilmez. Seviye 2 ayrı bir **taslak geliştirme dalı** olarak başlatılır.

- Seviye 1 kaynak dalı: seviye1-yeniden-baslangic-20261031.
- Seviye 1 son doğrulanan HEAD: 225a95fc56a35a69ebb685ffe3707dcecbe0126e; PR #10 taslak ve birleştirilmemiştir.
- Seviye 2 dalı: seviye2-guvenlik-devam-20261031; Seviye 1 HEAD'den türetilir.
- Özgün gereksinimler: 594/594 (324 P0, 270 P1); bağımsız kabul 0/594; canlı kabul 0/594. Tarihî 41 kısmi / 553 madde düzeyinde kanıt yok.
- B01–B18: 18 açık; canlı RLS/GRANT düzeltmesi 0; kuruluş/meslekî yetki henüz doğrulanmış değil.
- Canlı değişiklik yetkisi: YOK. main merge, production deploy, canlı Supabase DDL/DML/RLS/GRANT/Storage, gerçek müşteri veya personel verisi, banka/PSP, IND veya mahkeme işlemi ayrı açık onay gerektirir.

## İlk teknik iş: B01/B02, R-524/R-527/R-586/R-587/R-594

Bağlı AVOfis Supabase projesinde **yalnız pg_catalog.pg_class, pg_catalog.pg_namespace ve pg_catalog.pg_policies okuyan** denetimle 31.10.2026 tarihinde şu güncel bulgular doğrulandı:

1. applications, jobs, media_assets, office_members, offices, posts, topics: **7/7 RLS kapalı**, anon ve authenticated rollerinde SELECT/INSERT/UPDATE/DELETE için katalog yetkileri var.
2. pages, site_settings: RLS açık; auth.role()='authenticated' koşullu geniş SELECT politika kayıtları bulunuyor. Daha sınırlayıcı ayrıca bulunan politikalar bu izin verici politikaların etkisini kendiliğinden kaldırmaz.
3. Katalog denetimi özel satır verisi okumadı. Veritabanı API yüzeyindeki gerçek erişilebilirlik, iki kullanıcıyla satır/Storage izolasyonu, yedek ve geri dönüş henüz sınanmadı.

**Teslimat:** Yukarıdaki güncel gözlemlerin veri içermeyen JSON özeti, tekrar çalıştırılabilir yalnız-okunur SQL, risk kapatmayı sahte göstermeyen Node denetleyicisi ve olumsuz senaryo testleri. CI sentetik denetim yapar, canlı projeye bağlanmaz. --fail-on-open-risk açık riski çıkış kodu 2 ile belirtir.

**Sıradaki kararlar:** (1) tam rol × CRUD × kayıt sahibi matrisi ve şema kararları, (2) izole Supabase staging + gerçek A/B JWT/Storage erişim negatif testleri, (3) ancak bu kanıtlardan ve ayrıca canlı değişiklik onayından sonra üretim planı. Bu belge güvenlik düzeltmesinin yapıldığına ilişkin kabul değildir.
