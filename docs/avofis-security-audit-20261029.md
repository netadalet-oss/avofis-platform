# AVOfis — doğrulanmış güvenlik denetimi ve test kapıları (29 Ekim 2026)

**Kapsam:** Supabase projesi `akigckpsktdxudumiwvm` ve GitHub PR #4. Bu, denetim kayıt dokümanıdır; **DB migration veya politika değişikliği uygulanmamıştır.**

## Kritik: public şemada RLS kapalı ve anonim CRUD izinleri açık

Supabase `list_tables`, Postgres `has_table_privilege` sorgusu ve Supabase Security Advisors ile ayrıca doğrulandı:

| Tablo | RLS | anon SELECT | anon INSERT | anon UPDATE | anon DELETE |
| --- | --- | --- | --- | --- | --- |
| public.offices | kapalı | evet | evet | evet | evet |
| public.office_members | kapalı | evet | evet | evet | evet |
| public.topics | kapalı | evet | evet | evet | evet |
| public.posts | kapalı | evet | evet | evet | evet |
| public.jobs | kapalı | evet | evet | evet | evet |
| public.applications | kapalı | evet | evet | evet | evet |
| public.media_assets | kapalı | evet | evet | evet | evet |

Bu izinler, ilgili tablolar PostgREST Data API tarafından dışarı açılmışsa anonim istemciler için veri okuma/yazma/silme riski oluşturur. Gözlenen satır sayısının sıfır olması güvenlik denetimi yerine geçmez. Supabase linter sonucu: `rls_disabled_in_public` — **ERROR**, 7 bulgu.

**Otomatik çalıştırılmaması gereken öneri:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` tek başına mevcut yönetim/portal davranışını bozabilir. Önce şema ve uygulama sorguları belgelenmeli; yetki matrisi tasarlanmalı; ardından ayrı staging veritabanında test edilmeli. Kullanıcının açık veritabanı müdahale onayı olmadan canlı projede uygulanmayacak.

### RLS kapalı yedi tablo için önerilen yetki inceleme matrisi

| Veri | Varsayılan asgari güvenlik beklentisi | Açık tasarım kararı |
| --- | --- | --- |
| offices | Kamusal, doğrulanmış kayıtlar salt okunur; yazma yetkili yönetici | Hangi alanlar kamusal? |
| office_members | Üyelik/rol bilgisi anonim erişime kapalı | Ofis üyeleri kimleri görebilir? |
| topics | Yayımlanmış başlıklar kamusal salt okunur | Taslak/yayımlanmış durum alanı var mı? |
| posts | Yayımlanmış iletiler salt okunur; yazma kimlik+moderatör rolüne bağlı | Moderasyon ve silme prosedürü |
| jobs | Yayımlanmış ilanlar salt okunur | İşveren/onay rolü |
| applications | Başvuru yalnızca sahibi ve yetkili personelce okunur | Aday ve işletme erişimi |
| media_assets | Özel dosya yolları yalnızca sahip/atandığı dosya yetkisiyle | Bucket, storage path, ownership |

**Not:** Bu tablo beklenen yetki modeli önerisidir; mevcut alanların şeması ve iş mantığı incelenmeden SQL politikası olarak uygulanmaz.

## Kritik: RLS açık ama fazla geniş SELECT politikaları

`pg_policies` sorgusunda `public.pages` ve `public.site_settings` üzerinde şu PERMISSIVE SELECT politikaları doğrulandı:

- `Allow admin read`: `auth.role() = 'authenticated'` (**tüm authenticated rolüne izin**)
- `Only admins can read pages` veya `Only admins can read settings`: `profiles` tablosundaki admin/super_admin rolünü gerektiriyor.

PostgreSQL'de PERMISSIVE politikaları **OR** ile birleşir. Bu nedenle ikinci, daraltıcı politika ilk geniş politikayı sınırlandırmaz; normal authenticated kullanıcılar da SELECT politikasını geçebilir. Bu tablolarda gizli içerik/ayarlar varsa veri sızıntısı riski vardır. Yöneticiye özel amaçlandıkları doğrulanırsa geniş politika ayrıca kaldırılmalıdır.

**Çalıştırılmadı — değerlendirilecek SQL:**

```sql
-- Önce uygulama beklentileri ve kullanıcı profili rol güvenliği kontrol edilmeli.
DROP POLICY IF EXISTS "Allow admin read" ON public.pages;
DROP POLICY IF EXISTS "Allow admin read settings" ON public.site_settings;
-- Yalnızca gerçekten gerekli yönetici SELECT politikasının kaldığını test edin.
```

Üçüncü bulgu: Supabase Auth üzerinde `auth_leaked_password_protection` uyarısı. Özellik ve plan destek durumunu panelden doğrulayıp mümkünse etkinleştirin.

Resmî rehberler:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Üretime çıkışı engelleyen kontroller

1. Mevcut 10 tablonun `pg_class`, grants, PK/FK, politikaları ve dış API yolunu dokümante et.
2. İki ayrı açık geliştirme dalının kapsam ve migration zincirini karşılaştır; otomatik birleştirme yapma.
3. Orijinal Supabase projesine **hiçbir migration uygulanmadan** ayrı staging alanında yedekli deneme yap.
4. RLS için anonim SELECT/INSERT/UPDATE/DELETE ve kimlikli kullanıcı A/B izolasyonunu sentetik hesaplarla test et.
5. Personel admin/operator işlevlerini sunucu tarafında denetle. `user_metadata` veya istemci seçimiyle rol yükseltme yok.
6. IND dosyalarında işlem türü, 12 Haziran 2026 öncesi/sonrası geçiş rejimi, gerçek kişi ve meslekî yetki, süre, özel yetki belgesi, sözleşme ve güvenli paylaşım **G1–G4** sağlanmadan aktif işlem yok.
7. GDPR Madde 13, tüketici sözleşmesi, ücret/harç, Mollie webhook ve e-posta doğrulamasını ayrı onayla.
8. AVOfis internet sitesinde Arapça/Rusça hukukî ayrıntılar, insan dil ve hukuk editörü onayı olmadan yayımlanmaz.

## 29 Ekim teknik çalışmasının kanıt seviyesi

PR #4 (taslak) yalnızca `/katalog` için 17 hizmetin dört dilde açıklamalarını birleştirir, Arapça/Rusçada detayları kapalı tutar ve yol smoke testini kapsar. CI ve Vercel statüleri ayrıca doğrulanmadan **build/çalışıyor/production hazır** denemez. Hiçbir canlı DB, Auth, Storage, ödeme ve müşteri verisi değiştirilmedi.

PR: https://github.com/netadalet-oss/avofis-platform/pull/4
