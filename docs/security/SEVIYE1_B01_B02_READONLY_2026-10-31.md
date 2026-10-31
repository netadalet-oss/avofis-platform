# AVOfis Seviye 1: B01/B02 salt-okunur güvenlik incelemesi

Tarih: 31 Ekim 2026. Kaynak: Supabase proje akigckpsktdxudumiwvm, metadata SELECT ve Security Advisor. Gerçek müvekkil satırı okunmadı; canlı şema/politika/GRANT değiştirilmedi.

## Güncel bulgular
- B01: offices, office_members, topics, posts, jobs, applications, media_assets tablolarının yedisinde de RLS kapalı; anon SELECT/INSERT/UPDATE/DELETE ayrıcalıkları mevcut; 0 tablo RLS politikası. 7/7 yeniden doğrulandı.
- B02: pages ve site_settings üzerinde RLS açık; ancak bütün authenticated kullanıcıların SELECT yetkisini genişleten permissive politikalar mevcut. Ayrı bir admin SELECT politikası, permissive OR davranışı nedeniyle geniş politikayı daraltmaz.
- Supabase Security Advisor: 7 RLS_DISABLED_IN_PUBLIC (ERROR) ve 1 sızdırılmış parola koruması uyarısı (WARN).
- Bu bulgular izin riskini doğrular; somut bir veri sızıntısını veya saldırıyı ispatlamaz.

## Hazırlanan denetim aracı
tools/security/rls-preflight.mjs, canlı veritabanına bağlanmadan yalnızca önceden hazırlanmış kimliksiz metadata JSON dosyasını denetler. Beklenen dokuz tablonun varlığını, RLS durumunu, anonim yazma ayrıcalıklarını ve CMS seçme politikalarını inceler. Eksik metadata varsa güvenli sonucu vermez. Node testleri yalnız sentetik örnekler üzerindedir; CI geçmesi canlı ortamı kabul etmez.

## Gerçek çözüm için kapılar
1. Kamuya açık içerik ile kişisel/kurum içi kayıtların amaç ve rol sınıflandırması.
2. GRANT ve RLS modelinin güvenli staging ortamında hazırlanması, gerçek A/B kullanıcılarla yetki, iptal, Storage, view ve RPC negatif testleri.
3. Yedek, geri alma ve bağımlılık kontrolü; canlı değişiklik için ayrıca açık kullanıcı onayı; sonrasında canlı salt-okunur teyit.

Yeni bağımsız kabul: 0/594. B01 ve B02 açık; B01-B18 sayısı 18 olarak korunuyor. Seviye 2 izinsiz değil. Bu çalışma main, üretim ve canlı SQL üzerinde hiçbir değişiklik yapmaz.

Kaynak: https://supabase.com/docs/guides/api/securing-your-api
