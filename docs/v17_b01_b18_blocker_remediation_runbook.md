# AVOfis v17 — engel giderme ve B01–B18 güvenli yayına hazırlık (29 Ekim 2026)

**Geliştirme durumu:** Draft PR #5; canlı veritabanı DDL/UPDATE/DELETE/INSERT, PR merge, müşteri kabulü, ücret tahsilatı ve resmî IND/mahkeme işlemleri için **ayrı, açık, işlem kapsamlı yetki** gereklidir. Bu dosya bir GO kararı veya yetki belgesi değildir.

## Gerçek sistemde *salt okunur* gözlemler

Kaynak: bağlı Supabase projesi `akigckpsktdxudumiwvm`, Supabase Security Advisor, GitHub draft PR #5 ve Vercel project metadata. Hiçbir kullanıcı veri satırı bu rapora aktarılmadı.

1. `public.offices`, `office_members`, `topics`, `posts`, `jobs`, `applications`, `media_assets`: yedisinde de **RLS disabled**, `anon` için SELECT/INSERT/UPDATE/DELETE ayrı ayrı **true**. Sıfır satırlı tablo güvenli tablo anlamına gelmez.
2. `public.pages` ve `site_settings` üzerinde PERMISSIVE `auth.role()='authenticated'` SELECT politikaları, daha dar admin politikalarıyla **OR** birleşir; okunması gereken ve gerekmeyen veri ayrımı kaybolur.
3. `avofis_%` tabloları ve `avofis-private` bucket bağlı projede henüz görünmüyor. `supabase_migrations` tabloları/bağlantının migration listesi boş. Bu, staging migrasyonlarının canlıya uygulanmadığına ilişkin güçlü teknik göstergedir; başka sağlayıcılardaki ortamlar ayrıca incelenmelidir.
4. Bağlı Supabase hesaplarında yalnızca bu proje görüldü, development branch listesi boş. Ayrı Supabase staging Auth/Storage ortamı **kanıtlanmadı**.
5. Supabase Security Advisors: 7× `rls_disabled_in_public` **ERROR**; `auth_leaked_password_protection` **WARN**. Plan/özellik erişimi ve Auth MFA ayrıca doğrulanmalıdır.
6. Vercel portal/admin deployment SHA doğrulanabilir ve `READY`, fakat `ssoProtection.enabled=true` ve `deploymentType=all_except_custom_domains`. Preview giriş zorunluluğu **bilinçli güvenlik ayarıdır**, kapatılması varsayılan çözüm değildir.

## Aşama A — değişiklikten önce güvenli envanter (YAPILABİLİR)

- `database/ops/legacy_rls_readonly_preflight.sql`: yalnızca üç `SELECT` içerir; 7 eski tabloyu izin/RLS, iki broad politika ve mevcut AVOfis/Storage şemasını değerlendirir. Yalnızca katalog/izin/varlık bilgisi; içerik veya kişisel veri satırı dökümü YOK.
- `database/migrations/20261029_legacy_public_rls_hardening.sql`: **üretime uygulanmadı**; 7 tabloya RLS açmayı ve anon/auth geniş erişimi kaldırmayı önerir. İki broad admin SELECT politikasını kaldırır; üye/başvuru sahibinin kendi satırını görebilmesi dışında yayın hakları açılmaz.
- `database/tests/legacy_rls_hardening.sql`: geçici PG17 veritabanında preflight (önce), migration, A/B/anon/admin testleri, idempotence, preflight (sonra). Buradaki Auth/Storage yalnızca simülasyondur.
- Uygulama sahibine **önceden** hangi eski UI sorgularının (forum, ofis listesi, iş ilanı, CMS) bozulacağını gösterin. Düzeltilmeyen bileşenler varsa eski anonim erişimi yeniden açmak yerine UI'yi bilgi/kapalı moda alın.

## Aşama B — gerçek ayrı staging (HENÜZ YOK)

1. Gerçek Auth/JWT ve Storage çalıştıran, **ayrı projekt kimliğine sahip** Supabase staging ortamı: üretimden gizli/token, müşteri verisi ve webhook taşınmaz. Kurulum/ücret gerektiriyorsa proje sahibinin ayrı onayı gerekir.
2. Staging'e önce eski şemayı **kişisel veri içermeyen**, üretim sütun tipleri ve bağımlılıklarını temsil eden fixture ile kurun. Auth anon, kullanıcı A, B, operator, reviewer admin ve independent approver için ayrı gerçek session kullanın.
3. B01/B02 migration'ını bu staging şemasında deneyin; bütün API read/write response kodlarını, PDF/CV/metadata URL erişimini, admin CMS, webhook ve kullanıcı hesap işlemlerini doğrulayın. Sadece PG role simulation kabul değildir.
4. Gerçek Storage bucket `avofis-private` için public=false, A/B dosya ayrımı, 403/404, expired signed URL ve revoke/logout senaryoları. Dosya taraması, karantina, hash ve indirme denetimi ayrıca.
5. Dosya atamasını kaldırma, operator rol revocation ve rehire; önceki JWT, bağlantı ve cache ile erişim hâlâ var mı? Başarısızlık durumunda NO-GO.
6. Üretim verisi için şifreli yedek saklama süresi, kopyanın erişim yetkisi ve **gerçek geri yükleme testi** kaydı olmadan geçiş yok.

## Aşama C — **yalnızca ayrıca onaylanacak** canlı güvenlik değişikliği

- İnsan değişiklik bileti: **hangi proje**, tam migration SHA, öncesi ve sonrası SQL sonuçları, kontrol saati, sorumlu, iş etkisi, encrypted backup/restore kanıtı, müşteri ve profesyonel onaylarının sınırları.
- Uygulama yetkisi verilirse bile `BEGIN/COMMIT` içindeki migration'ın her tablo/grant/policy değişikliği atomik olarak uygulanmalı; SQL hatası halinde transaction rollback gerekir.
- Değişiklik **öncesi ve sonrası** `database/ops/legacy_rls_readonly_preflight.sql`, `pg_policies`, grants, Supabase advisor ve gerçek anon/A/B HTTP kontrolleri kayıt altına alınır.
- **Önemli geri alma sınırı:** Kullanıcı veri erişimi etkilenirse başlangıçtaki `RLS=false + anon CRUD` durumunu yeniden açan otomatik rollback YASAK. Güvenliği koruyan app fallback / izinli istemciye dar kapsamlı düzeltme migrasyonu / hizmeti geçici durdurma yolu tercih edilir. Eski açık izinlere dönmek başlı başına ayrı, yüksek riskli insan güvenlik kararıdır.
- Bu çalışmada **canlıya SQL uygulanmadı**.

## Aşama D — teknik blokajla çözülemeyecek insan kararları (HÂLÂ BEKLİYOR)

| Başlık | Kanıt ve onay sahibi | GO öncesi koşul |
|---|---|---|
| BV/KVK, UBO, yetkili yönetici ve çalışma hakkı | Gerçek sicil/noter/kurucu yetkilisi | Doğrulanmış, tarihli belge |
| Jurist/advocaat/uzman rolü ve işlem kapsamı | NL yetkili hukukçu, ilgili ülkelerin bağımsız uzmanları | Her hizmete özgü yetki, çıkar çatışması |
| IND tarih/mandat/G1–G4 | Bağımsız yetkili insan ve resmî kaynak | İşlem kapsamlı yetki + gerçek kişi/iki göz |
| GDPR madde 13/30, DPA, DPIA, DSAR ve aktarım | DPO + veri sorumlusu | Gerçek envanter, yaşam döngüsü, kontakt ve retansiyon |
| Altı dil ve erişilebilirlik | Ülke/hukuk editörü + WCAG denetçisi | Onaylı dil sürümleri, RTL/klavye/ekran okuyucu |
| Sözleşme, KDV, resmî harç, tüketici cayma/iade | NL ticaret/tüketici hukuku danışmanı + şirket sahibi | İmzalı metin ve teknik test |
| Gerçek PSP sandbox, webhook, iade ve uzlaşma | Banka/ödeme sağlayıcı + finans sorumlusu | Tam ödenmiş/ödenmemiş/chargeback senaryoları |
| Son açılış ve operasyon sorumluluğu | Proje sahibi, güvenlik ve hukuk yetkilisi | Ayrı GO; `main`, SQL, intake, payment için kapsamlı onay |

**Değerlendirme:** Aşağıdaki CI işlemleri ve dokümantasyon yalnızca teknik hazırlık düzeyini ilerletir; 594 gereksinimden herhangi birine bağımsız "tamamlandı" hükmü vermez. Vercel SSO / security revocation / veri gizliliği **korunmalıdır**; "engelleri kaldırmak" güvenlik bariyerlerini kaldırmak değildir.

Yararlı kaynaklar: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [RLS disabled lint](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public), [Password security](https://supabase.com/docs/guides/auth/password-security).
