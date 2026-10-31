# AVOfis B01/B02 — sentetik PostgreSQL 17 güvenlik doğrulaması

**Tarih:** 31.10.2026. **Geliştirme kaydı:** PR #12, `integration/avofis-birlesik-seviyeler-20261031`.

Önceki v17 kodunda hazırlanmış, ancak yeni birleşik iş akışında otomatik çalıştırılmayan şu denemeler yalnızca GitHub Actions servis konteynerindeki **geçici ve sentetik PostgreSQL 17** veritabanına bağlandı:

- B03 hedef kimliği: Üretim Supabase proje referansı staging sanılarak kullanılmamalı.
- B01: Yedi eski tablonun RLS ve `anon` izinlerinin daraltılma adayı, A/B kullanıcı ayırımı, yinelenebilir SQL.
- B02: Yayın bekletme, yanlış/geniş `profiles` ve CMS erişimi, gelecekte oluşacak tablolar için ayrı `postgres` ve `supabase_admin` varsayılan erişimleri.
- Okuma amaçlı son güvenlik sorguları ve başarısızlıkta işi durdurma.

**Kesin sınır:** Workflow'da Supabase URL/anahtarı veya canlı kimlik bulunmaz. PostgreSQL servisinde `disposable-ci-only` test şifresi kullanılır. Hiçbir canlı Supabase tablosuna ve kişisel veriye erişilmez; gerçek staging projesi oluşturulmuş veya kurulmuş sayılmaz. Bu **sentetik migrasyon doğrulama adayının** başarılı olması, canlı RLS/GRANT veya B01/B02 kapanışı değildir. Canlı yedi RLS bulgusu ve B01–B18 kapanmadan kalır. Bağımsız kabul **0/594**.

İş akışı: `.github/workflows/avofis-b01-b02-synthetic.yml`. Gerçek sonuçlar CI run URL/commit ile ayrıca teyit edilir; başarısız denemeler silinmez.
