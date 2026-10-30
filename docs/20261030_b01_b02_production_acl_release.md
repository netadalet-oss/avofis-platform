# AVOfis — B01/B02: üretim güvenliği için rol, CMS ve varsayılan ACL geçişi

**Tarih:** 30 Ekim 2026  
**Kapsam:** Gerçek kullanıcıların çalışacağı AVOfis üretim veritabanı ve API güvenliği.  
**Durum:** Uygulama kodu ve gerçek PostgreSQL 17 izin denetimleri geliştirildi; **canlı SQL henüz uygulanmadı**. Yetkili yayın geçişi ve ayrı işletim onayı gerekir.

## Canlıya dayalı bulgular (sadece READ ONLY)

- Supabase projesi: `akigckpsktdxudumiwvm`.
- Supabase Security Advisor 7 **ERROR**: `public.media_assets`, `offices`, `office_members`, `topics`, `posts`, `jobs`, `applications` tablolarında RLS kapalı.
- Buna karşılık `anon` hesap türü yedi tablonun tamamında SELECT / INSERT / UPDATE / DELETE iznine sahip. Mevcut satır içerikleri sorgulanmadı.
- `public.pages` ve `site_settings` RLS açık olmakla beraber `Allow admin read` / `Allow admin read settings` adlı genel authenticated SELECT politikaları hâlâ etkin. Sadece yetkili admin politikasının varlığı bu geniş permissive politikaları etkisiz kılmıyor.
- `public.profiles` RLS açık ve kullanıcı kendi profilini okuyabiliyor; ancak `anon` ve `authenticated` için gereksiz tablo seviyesinde geniş izinler var. `profiles.role` rol atanması yönünden hassastır.
- `pg_default_acl` envanterinde **iki bağımsız sahip** `postgres` ve `supabase_admin` için `public` şemasında yeni **tablo**, **dizi** ve **fonksiyon** erişimlerini otomatik açan izinler mevcut.
- Mevcut SQL bağlantısında `current_user = postgres` ve `pg_has_role(postgres, supabase_admin, MEMBER) = false`. Bundan dolayı `supabase_admin` için geleceğe yönelik varsayılan ayrıcalıklar postgres oturumundan düzenlenemez.
- Auth Security Advisor 1 **WARN**: sızdırılmış parola kontrolü kapalı. Bu ayar insan yöneticinin Supabase Auth tarafında inceleyip etkinleştirmesini gerektiriyor.
- Security Advisor referansı: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

## Migration sırası ve atomik kapılar

Aşağıdaki sıra yalnız **ayrı Auth/Storage destekli staging** ortamında, gözden geçirilmiş şema ve geri yüklemesi sınanmış yedekten sonra denenmelidir. Canlıya geçiş **ayrı açık onaylı** yapılır. Başarısızlık durumunda `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` ile eski açıklık geri getirilmez.

1. `database/ops/legacy_rls_readonly_preflight.sql`: yedi tablo, iki CMS policy ve şema/bucket envanteri; **salt okunur**.
2. `database/migrations/20261029_legacy_public_rls_hardening.sql`: yedi legacy tablonun RLS ve rol izinlerinin daraltılması, eski geniş CMS okuma politikalarının kaldırılması. Beklenmeyen politika varsa işlemi durdurur.
3. `database/migrations/20261029_legacy_cms_publication_hold_staging_only.sql`: gerçek editör/onay servisi sağlanana kadar doğrudan CMS değişikliklerini kilitler.
4. `database/migrations/20261030_identity_cms_profile_acl_hardening.sql`: `profiles`, `pages`, `site_settings` için `anon` haklarını kaldırır, normal `authenticated` hesabı yalnızca kapsamı RLS'yle sınırlandırılan SELECT kullanabilir. Beklenmeyen profil/CMS policy drift'inde fail-closed.
5. `database/migrations/20261030_postgres_public_future_default_acl.sql`: **gelecekte postgres tarafından oluşturulan** `public` tablo/dizi nesnelerinde `anon`/`authenticated` otomatik izinlerini kaldırır. Mevcut nesnelere dokunmaz. Fonksiyonlarda ayrıca PostgreSQL genel `PUBLIC EXECUTE` varsayılanı bulunabilir; bunlar ayrıca denetlenmelidir.
6. **Ayrı sahip adımı:** `database/ops/supabase_admin_public_default_acl_OWNER_ACTION.sql` yalnız `current_user = supabase_admin` durumunda çalışır. Bağlı `postgres` hesabı bunu yapamaz. İşi yapabilecek platform rolü/operatörü ayrıca belirlenmelidir; `postgres` için kontrolsüz rol yükseltmesi çözüm değildir.
7. `database/ops/legacy_rls_readonly_postflight.sql` ve `database/ops/identity_cms_future_acl_readonly_postflight.sql`: salt okunur güvenlik geçitleri. Sonuncusu **her iki sahip** için var olan profil/CMS erişimini ve gelecekteki `public` tablo/dizi erişimlerini değerlendirir; yalnız postgres adımı yapılırsa **bilerek başarısız olur**.

## Gerçek işlemler için zorunlu kabul

- Aynı şema sürümünde gerçekçi **ayrı staging**; iki bağımsız müşteri ve ayrı personel Auth hesabıyla, JWT süresi/iptal, RLS, Storage, Data API GET/POST/PATCH/DELETE ve AAL1/AAL2 testi.
- Eski forum/ilan/CMS tüketicilerinin yeni kısıtlardan etkilenmesi teknik olarak beklenir: gerçek geçişte UI servis sahibi, bakım penceresi, iletişim ve geri alma kararı net olmalı.
- `profiles.role` ve `avofis_staff` gibi yetki taşıyan tablolar için ayrı rol yükseltme saldırı testleri.
- `anon` ile profil/CMS SELECT/CRUD tamamı reddedilmeli; normal `authenticated` kendi profilini okuyabilmeli fakat kendi rolünü değiştirememeli; CMS yalnızca yetkili admin tarafından okunabilmeli, doğrudan yayımlama kapalı olmalı.
- `postgres` ve `supabase_admin` tarafından ayrı ayrı oluşturulan yeni `public` tablolar/diziler anonim veya tüm authenticated kullanıcılara otomatik açık olmamalı. **Fonksiyon EXECUTE global PUBLIC varsayılanı için ayrı fonksiyon maruziyeti kontrolü şarttır.**
- Yayın öncesi gerçek şifreli yedek + erişim kontrollü geri yükleme, audit log, Auth ayarı ve ilgili hukukî veri işleme/meslekî yetki kanıtı.

## Bağımsız teknik kanıt ile üretim durumu ayrımı

- `database/tests/legacy_rls_hardening.sql`: eski yedi tablo, kişi A/B, eski sayfa politikaları ve migration tekrar edilebilirlik.
- `database/tests/legacy_cms_publication_hold.sql`: CMS yazma kilidi.
- `database/tests/identity_cms_profile_acl_hardening.sql`: profil rol yükseltme ve CMS yetki kontrolleri.
- `database/tests/future_public_default_acl_owner_synthetic.sql`: iki ayrı nesne sahibi oluşturma rolüyle önce-sonra izin testi, mevcut veriye dokunmama ve tekrar edilebilirlik.
- GitHub Actions 6 bağımsız iş; bu sentetik PostgreSQL 17 testleri gerçek production Auth/Storage deneyinin yerine geçmez.

**Gereksinim ve kabul:** 594 özgün R-ID değiştirilmez. Bu B01/B02 alt adımları tek başına bağımsız müşteri kabulü, hukuki yetki veya canlı güvenlik onayı oluşturmaz. PR #5 `main` ile birleştirilmeden taslak tutulur; üretim SQL/deploy işlemleri ayrıca yetkilendirilir.

Resmî kaynaklar:
- Supabase Data API, grants ve RLS: https://supabase.com/docs/guides/api/securing-your-api
- PostgreSQL varsayılan ayrıcalık ve role üyeliği sınırı: https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html
