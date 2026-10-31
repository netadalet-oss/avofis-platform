# AVOfis v17 — B01–B04 kontrollü engel kaldırma ve geri alma kılavuzu
**Tarih:** 2026-10-29 · **Kapsam:** geliştirme dalı PR #5, `main` ve canlı Supabase değiştirilmez.

## 1. İnceleme ile kanıtlanan başlangıç durumu

- Bağlı Supabase `avofis` projesi `akigckpsktdxudumiwvm` mevcut, sağlıklı görünüyor; bu durum **veri güvenliği onayı değildir**. Bağlı hesaplarda ayrı staging projesi veya Supabase branch görünmedi.
- `public.offices`, `office_members`, `topics`, `posts`, `jobs`, `applications`, `media_assets`: 7/7 `relrowsecurity=false`. `anon` için SELECT/INSERT/UPDATE/DELETE etkin. `pg_policies` bu yedi tabloda başlangıçta boş.
- `public.pages` ve `public.site_settings`: RLS var, fakat her `authenticated` role açık PERMISSIVE SELECT politikası admin-only politikalarla OR birleşiyor.
- `public.avofis_cases` ve `public.avofis_case_clearances` yok. `avofis-private` Storage bucket'ı yok. Migration history listesi boş; bu tarihsel nedenin kesin kanıtı değil.
- Supabase Security Advisors: `rls_disabled_in_public` ERROR (7), `auth_leaked_password_protection` WARN (1). Bu iki bulgu **canlıda kapatılmadı**.
- Yalnızca okumaya izin verilen `database/ops/legacy_rls_readonly_preflight.sql` gerçek bağlı projede çalıştırıldı: 7 `BLOCKED_RLS_OFF`, 2 `BLOCKED_BROAD_SELECT_POLICY`, 3 şema/bucket yokluğu. Veri içeriği okunmadı.
- Vercel portal/admin önizlemeleri READY ancak proje SSO korumalı; erişim başarısızlığını gidermek için SSO'yu kapatmak gerekli değildir.

## 2. Neden mevcut migration doğrudan canlıda çalıştırılmaz?

`database/migrations/20261029_legacy_public_rls_hardening.sql` yedi tabloyu `ENABLE ROW LEVEL SECURITY` ile kapatır ve eski anon/authenticated CRUD haklarını kaldırır. Bu, **amaçlanan güvenlik varsayımıdır**, fakat eski forum, iş ilanı, başvuru ve CMS kodunun erişimini kesebilir. Özellikle moderasyon/yayımlanma durumu bulunmayan `topics`, `posts` ve `jobs` için kamusal SELECT erişimi geri verilmemiştir.

Canlıya uygulamak; müşteri/çalışan kayıtlarını etkileyebilir, açık API istemcilerini bozabilir veya eski paneli kilitleyebilir. RLS'yi yeniden kapatmak **güvenli geri alma stratejisi değildir**.

## 3. B01/B02 staging uygulama planı (insan onaylı yapılacak işlem)

**Giriş kapısı:** bağlantılı canlı veritabanından bağımsız bir staging Supabase projesi ya da güvenli veritabanı dalı, gerçekçi fakat anonimleştirilmiş şema/fixture ve ayrı kimlik bilgileri hazır değilse DUR.

1. Üretim bağlantısı ve servislerin envanteri: kullanılan tablo/sütun, API, cron, forum, CMS, e-posta, Storage, portal; testlerini ve servis sahibini kaydet. Bütün veri sorumluları ve mevzuat saklama süreleri doğrulanmalı.
2. Yetkili operatör tarafından şifreli **gerçek yedek**, geri yükleme izni, doğrulanmış kontrol toplamı, geri yükleme denemesi, saklama/erişim planı hazırlanmalı. GitHub CI'daki `pg_dump/pg_restore` testinin üretim yedeği olmadığı unutulmamalı.
3. Staging ortamında `database/ops/legacy_rls_readonly_preflight.sql` çalıştır; `BLOCKED_*` sonuçlarını referans olarak sakla. Dosya yalnızca SELECT içerir.
4. Staging üzerinde `database/migrations/20261029_legacy_public_rls_hardening.sql` **tek kontrollü ve sürüm kayıtlı migration** olarak çalıştır. Operatör, dönüşümün bütün eski uygulama erişimlerini değiştirebileceğini önceden kabul etmiş olmalı.
5. `database/ops/legacy_rls_readonly_postflight.sql` çalıştır: tam koruma sağlanmamışsa **hata ile durur**; READ ONLY işlemde çalışır. Aynı zamanda `legacy_rls_hardening.sql` sentetik A/B/anon/admin kontrolünü sağlar.
6. **Gerçek staging Auth/JWT/REST/Storage denemesi:** anonim GET/POST/PATCH/DELETE engelli; A yalnızca kendi `applications` ve `office_members` satırını görür; B A'yı göremez; admin `pages`/`site_settings` erişimi sınırlandırılır; normal kullanıcının bu sayfaları görmesi engellenir.
7. Önemli eski işlevler için UI/API uçtan uca testleri, farklı ülke/dil, stale JWT, rol düşürme, oturum iptali, imzalı URL ve erişim denetimleri tamamlanmadıkça uygulama kapısı kapalı kalır.

**Staging çıkış ölçütü:** 7/7 RLS açık, anon CRUD yok; iki geniş SELECT politikası yok; A/B yatay erişim denemeleri geçiyor; güvenlik danışmanı bulguları yeniden taranıyor; eski işlev kesintisi kayıt altına alınıyor; gerçek yedek geri döndürülebiliyor.

## 4. Canlı değişiklik öncesi ayrı yetki

Aşağıdaki unsurlar **ayrı ve açık bir değişiklik onayı olmadan başlatılmayacak**:

- Yetkilendirilmiş üretim operatörü ve bağımsız gözden geçiren; etkilenen servisler, bakım penceresi, riskli müşteri işlevleri, iletişim/incident planı.
- Staging sonuçları, sürüm hash'i, canlı snapshot/restore kanıtı, geri alma kararı ve üretim bağlantısının doğrulanması.
- Mevcut kodda kaldığı doğrulanan kritik B01/B02 açıklarının giderilmesine ilişkin ayrı canlı SQL / grant / RLS izni.

**Canlı operasyonda başarısızlık:** yeni müşteri kabulü açılmaz. Erişim olayları saklanır; rollback için öncelikle servis trafiğini ve kimlik yetkilerini güvenli modda tutarak forward-fix veya kontrollü restore hazırlanır; RLS'yi kaldırıp anonim erişimi geri getirmek otomatik geri alma olarak kullanılmaz.

## 5. B03/B04: şema, Storage ve gerçek kimlik testleri

- Mevcut `avofis_*` migration zinciri **bağlı canlı projede uygulanmış değil**. Kurulum sırası, Supabase Auth tabloları, Storage migration ve `auth.uid()` helper'larının kontrollü staging uyumluluğu test edilmeden hizmete açılmaz.
- `avofis-private` bucket henüz yok: oluşturmak kullanıcı belgelerini kabul etmek anlamına gelmez. Bucket'ta herkese açık erişim kapalı, RLS sahiplik/atama belirli, dosya türü/boyutu/AV tarama, signed URL süre/iptal, personel görevden alınması ve gerçek kullanıcı A/B senaryosu doğrulanmalı.
- `auth_leaked_password_protection` uyarısının plan/ayar desteği ayrıca kontrol edilmeli; kullanıcı hesaplarında MFA, oturum yönetimi, parola sıfırlama, rol değişim testleri yapılmalı.
- GDPR Madde 13, veri sorumlusu adı/adresi, DPA/DSAR/saklama, hukukî meslek ve temsil izinleri, sigorta, gerçek sözleşme ve altı dilin hukukî QA'sı yalnızca **insan/kurum belgeleri** ile kapanabilir. Kod bu belgeleri icat edemez.

## 6. Bütün engelleri öncelik sırasıyla kapatma tablosu

| Öncelik | Engel | Doğrudan teknik hareket | Kapanış için eksik bağımsız kanıt |
| --- | --- | --- | --- |
| P0 | B01/B02 eski anon CRUD/RLS | Read-only preflight + staging migration + fail-closed postflight | Canlıya ayrı yetki, gerçek staging Auth/API doğrulaması |
| P0 | B03 yedek/geri yükleme | CI'da sentetik dump/restore var | Gerçek şifreli backup ve restore testi |
| P0 | B04 Auth/JWT/Storage | Sentetik tenant/assignment testleri var | Ayrı staging, gerçek kullanıcılar, Storage URL/iptal |
| P0 | B05/B07 resmî yetki/temsil | G1–G4 teknik kapıları var | Meslekî izin, bağımsız avukat/hukukçu, yazılı kapsamlı vekâlet |
| P0 | B06 GDPR ve aktarım | Veri minimizasyonu ve yayın kilitleri var | Gerçek veri envanteri, Madde 13, DPA, DSAR ve aktarım incelemesi |
| P1 | B08 ödeme/tüketici | Kapalı ödeme API'si ve sentetik iş akışı var | Gerçek tüketici metinleri, KDV/harç/iptal/iade, PSP sandbox |
| P1 | B09 içerik/dil | 6-dil katalog, RTL örneği var | Resmî kaynaklar, insan redaksiyonu, ülke/dil QA |
| P1 | B12/B13/B14 uçtan uca | CI/sentetik testler mevcut | Mobil, WCAG 2.2 AA, MFA/session ve erişim denetimleri |
| P1 | B18 bağımsız denetim | Bazı olay kayıtları var | Tam, değiştirilemez ve bağımsız olarak incelenen onay/erişim logları |

Bu tablo bir tarihli **gerçek kabul belgesi değildir**. Teknik test sonucu yalnızca kendi denediği şeyi doğrular.

## 7. Güvenli yollar ve belge bağlantıları

- `database/ops/legacy_rls_readonly_preflight.sql` — canlıya SELECT olarak uygulanabilir envanter, **değişiklik yapmaz**.
- `database/migrations/20261029_legacy_public_rls_hardening.sql` — **yalnızca ayrı onaylı staging** güvenlik migrasyonu.
- `database/ops/legacy_rls_readonly_postflight.sql` — READ ONLY güvenlik kabul geçidi, şartlar sağlanmazsa hata üretir.
- `database/tests/legacy_rls_hardening.sql` — sentetik A/B/anon ve migration idempotence, preflight transaction read-only.
- `.github/workflows/avofis-integrated-catalog-ci.yml` — gerçek canlı kullanıcılara bağlanmayan CI.

Resmî teknik kaynak: https://supabase.com/docs/guides/api/securing-your-api

**Değişiklik ilkesi:** PR #5 draft kalır, `main` birleştirilmez. Canlı SQL/Auth/Storage, müşteri kabulü, ödeme veya resmî IND işlemi ayrı açık onay olmadan yapılmaz.
