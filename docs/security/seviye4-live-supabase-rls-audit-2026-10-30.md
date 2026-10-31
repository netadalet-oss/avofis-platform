# AVOfis — Seviye 4 gerçek Supabase şeması ve yetkilendirme denetimi

**Tarih:** 30 Ekim 2026. **Durum:** Kaynaklarla doğrulanmış bulgular + uygulanmamış güvenlik düzeltme planı. **Canlı veritabanına hiçbir yazma/DDL yapılmadı.**

## Birincil kanıt ve kapsam
- Bağlı Supabase projesi: `avofis` (proje referansı `akigckpsktdxudumiwvm`), erişilebilir/healthy. Bu doküman kullanıcı verisi veya parola içermez.
- Canlı sistemden yalnızca `list_tables`, `get_advisors(type=security)` ve PostgreSQL sistem kataloğuna yönelik salt-okunur sorgular kullanıldı.
- Kaynak kodu: `admin/src/app/cms/page.tsx`, `admin/src/lib/supabase.ts`, `api/src/modules/cms/cms.router.ts`, `database/schema.sql`; PR #6 geliştirme dalı.
- Canlı `public` şemasında **10 tablo** bulunuyor. Depodaki `database/schema.sql` dosyasında **40 CREATE TABLE** ifadesi var: aynı şema olarak ele alınamaz.

## Doğrulanmış yüksek öncelikli bulgular

| Tablo | Canlı RLS | `anon` yetkileri | `authenticated` yetkileri | Denetim |
|---|---|---|---|---|
| `public.applications` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.jobs` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.media_assets` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.office_members` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.offices` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.posts` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |
| `public.topics` | Kapalı | S/I/U/D | S/I/U/D | RLS_DISABLED |

**S/I/U/D:** `SELECT/INSERT/UPDATE/DELETE` tablo izinleri. RLS kapalı ve tablo izinleri geniş olduğundan, Data API'de tabloların yayımlı olduğu varsayılan durumda yetkisiz erişim riski doğar. **Bu, kayıtlara gerçekten erişildiği veya ihlal gerçekleştiği kanıtı değildir.** Mevcut API erişim ayarları, uygulama akışları ve audit/log kayıtları ayrıca incelenmeli.

## Mevcut RLS ve CMS erişim uyumsuzluğu
- `profiles`, `pages`, `site_settings` için RLS açık.
- `profiles` üzerinde yalnızca `auth.uid() = id` SELECT politikası görüldü; kullanıcıya açık UPDATE politikası görünmedi.
- `pages` ve `site_settings` SELECT için, yöneticiye özgü politikaya ek olarak `auth.role() = 'authenticated'` koşullu **PERMISSIVE** politikalar var. Politikalar OR ile birleştiğinden bu SELECT erişimini yöneticilere daraltmaz.
- İki tablonun UPDATE politikası `profiles.role` admin/super_admin değerini arıyor; ancak başka politika ve yeni rol düzeni ayrıca doğrulanmalı.
- Yönetici CMS sayfasında önceden `session.user.user_metadata.role` yetki yükseltme kaynağıydı. PR #6'da bu yol kaldırıldı; yalnızca canlıda da mevcut olan `profiles.role` okunuyor. **Bu yalnızca arayüz korumasıdır; RLS'nin yerine geçmez.**
- CMS `api/src/modules/cms/cms.router.ts`, veritabanına bağlanmayan statik okuma ve kalıcılık sağlamayan yazma uç noktası içeriyor. Canlı `pages/site_settings` ile depo `cms_pages/cms_settings` şemaları birleştirilmeden kalıcı yazma servisi varmış gibi davranılamaz.

## Güvenli düzeltme sırasi (henüz uygulanmadı)
1. **Acil:** Canlı uygulamadaki gerekli okuma/yazma akışlarını ve API exposure/grant ayarlarını belirle. `applications`, `office_members`, `media_assets` gibi veri alanları için en az yetki matrisi ve geri dönüş planı çıkar.
2. Geliştirme/önizleme veritabanında **her tablo için özgün erişim modelini** belirleyen RLS + `USING`/`WITH CHECK` politikalarını hazırlayıp negatif/pozitif testleri çalıştır. `authenticated` tek başına yetki değil.
3. Politikaları doğruladıktan sonra canlı sistemde önce API erişimini daraltma, sonrasında RLS'yi etkinleştirme işlemlerini bakım/geri alma planıyla yürüt. Geliştirme onayı canlıda politika uygulama onayı anlamına gelmez.
4. `pages/site_settings` geniş SELECT politikalarının gerçekten gerekli olup olmadığını kamuya açık CMS içerik gereksinimiyle karşılaştır.
5. Veri kalıcılığı için **canlı şema mı, depo taslağı mı** asıl kaynak olarak kullanılacak, özgün teknik sözleşmelerden doğrula. Veri modelini ve API kontratını kaynak olmadan yeniden tasarlama.
6. Supabase güvenlik danışmanı uyarısı: sızmış parola koruması kapalı (1 WARN). Bu ayrı yapılandırma işidir.

## Kaynak ve teslim kapısı
- Supabase RLS danışman uyarısı: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
- Supabase güvenli Data API: https://supabase.com/docs/guides/api/securing-your-api
- Kod PR'ı: https://github.com/netadalet-oss/avofis-platform/pull/6
- **18 özgün açık kararın hiçbirini kapatmaz**; 973 iş/973 sözleşmenin özgün kimliklerine eşleştirme mümkün değildir.
- **Seviye 4'ün tarihsel %80 eşiği bu denetimden hesaplanamaz; Seviye 5 açılmaz.**
