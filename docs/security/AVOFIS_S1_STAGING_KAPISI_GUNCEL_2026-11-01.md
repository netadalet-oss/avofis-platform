# AVOfis Seviye 1 — B01/B02/B03 staging ve canlı güvenlik kapısı (01.11.2026)

**Statü:** `HARICI_KOSUL / CANLI_RLS_ACIK`. Bu belge bir migrasyon, üretim düzeltmesi, bağımsız kabul veya staging kurulum kaydı **değildir**.

## 1. Gerçek bağlı kaynağın yeni salt-okunur teyidi

- Bağlı Supabase hesabı: `avofis` / `akigckpsktdxudumiwvm`.
- 01.11.2026 salt okunur Supabase yönetim sorgusu: mevcut **geliştirme/staging branch sayısı 0** (`list_branches`). Sıfır dal, geliştirmenin imkânsız olduğunu değil, **bağımsız branch bulunduğu kanıtlanmadığını** ifade eder.
- Aynı güvenlik danışmanı kontrolü: `rls_disabled_in_public` **7 ERROR**; `auth_leaked_password_protection` **1 WARN**.
- RLS danışmanı kaynak ve düzeltme açıklaması: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- Parola uyarısı açıklaması: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- 31.10.2026 bağımsız metadata SELECT teyidi: `public.offices`, `office_members`, `topics`, `posts`, `jobs`, `applications`, `media_assets` tablolarının her birinde RLS `false`, `anon` için SELECT/INSERT/UPDATE/DELETE GRANT mevcuttu. `pages` ve `site_settings` için geniş `authenticated` SELECT policy ayrıca açıktı. Tekrarlanan Security Advisor sonucunda yedi `ERROR` devam ediyor; yeni tekil SQL yetki matrisi bu tarihte tekrar çalıştırılmadı.
- **Veri satırı okunmadı.** Bu denetim yalnız katalog ve yönetim durumudur; olası fiilî veri sızıntısını kanıtlamaz.

## 2. Neden güvenlik migrasyonu henüz uygulanmadı?

- Mevcut `database/migrations/20261029_legacy_public_rls_hardening.sql` izinler ve RLS için **yalnız staging/dry-run adayıdır**; kodda no-publish ve sınırlı sahiplik kuralları vardır. Testin geçmesi uygulama ve canlı DB ile uyumluluk garantisi vermez.
- `database/ops/b03_staging_target_guard.mjs` yalnız URL/project ref biçimini sınar; gerçek ayrı staging projesi varlığını kanıtlamaz.
- Supabase'de yeni branch yaratılması ücret doğurabilir. Ücret ve haricî kaynak işlemi için eylem-bazlı kullanıcı yetkisi gerekir. Proje branch'i **oluşturulmadı**; harici ödeme **başlatılmadı**.
- Mevcut üretim DB'ye ALTER/REVOKE/RLS/DML/Storage yazılması için tekil, ayrı yetki ve geri dönüş/etki analizi gerekir. **Canlı sorgu yazma yapılmadı.**

## 3. Staging hazır olduğunda yapılacak asgari bağımsız test

1. Gerçek üretim ile ayrı staging proje referansı + bağımsız erişim/anahtar + test kimliklerini metaveriden eşleştir; üretim referansıyla aynılığı **RET**.
2. Anonimleştirilmiş fixture, doğrulanmış şema ve izolasyon; gerçek müşteri/çalışan dosyası kullanılmaz.
3. SQL migration preflight / kontrollü uygulama / postflight; her aşamada SQL SHA ve DDL/GRANT/RLS farkı.
4. Anon ve oturumlu A/B kimliklerinde her yedi tablo için GET/POST/PATCH/DELETE negatif test; `pages/site_settings` yalnız admin SELECT; erişimi iptal edilen personel ve yanlış tenant negatifleri.
5. Storage URL, signed URL iptali, session/MFA ve service-role sınırı, uygulama/UI etki testi.
6. Bağımsız güvenlik uzmanı, GDPR/hukuk, veri sorumlusu ve gerçek onaylı rol matrisi; gerçek şifreli backup/restore.
7. Üretim için ayrı proje sahibi GO kararı; bakım penceresi, etki/rollback, olay yönetimi ve postflight. **Güvenli geri alma RLS'yi kör biçimde kapatmak değildir.**

## 4. Kanıt ve statü

- GitHub kaynak: `docs/security/rls-7-table-access-matrix-2026-10-31.md`, `docs/v17_B01_B04_staging_release_runbook_20261029.md`, `.github/workflows/avofis-b01-b02-synthetic.yml`.
- CI sentetik PostgreSQL 17 testi geçmiş olabilir ancak **gerçek staging Auth/Storage, yetkili production veya bağımsız hukukî kabul değildir**.
- B01/B02/B03, B01–B18 genel açık kararları, yedi canlı RLS bulgusu; **0/594 yazılı bağımsız ve 0/594 canlı kabul**.
