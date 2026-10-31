# AVOfis Seviye 1 — iki çalışma dalı diff/kapsam karşılaştırması (01.11.2026)

**Kaynak:** GitHub compare API, güncel development HEAD'leri. **Amaç:** kod kapsamını ve muhtemel ortak dosya çakışmalarını önceden sınıflandırmak; `main` / production merge değildir.

## Gerçek GitHub karşılaştırma sonucu

| Dal | Karşılaştırma tabanı | HEAD (bu denetim) | Tabanı geçen commit | Değişen dosya |
|---|---|---|---:|---:|
| Portal, PR #14 | `integration/avofis-birlesik-seviyeler-20261031` | `7cc0d0e4cbb5708117d39a077eb2eb03ae90cca4` | 26 | 16 |
| Uygulama, PR #15 | aynı | `9a595ac95e37c736195d32844106e04783abfd69` | 20 | 16 |

GitHub compare statüsü her iki dalda `ahead`; bu, `main`e birleştirme yetkisi veya kabulü değildir.

### Her iki dalda değişen sadece iki ortak dosya

1. `.gitignore` — `*.p8`, `*.p12`, `*.pfx`, `*.jks`, `*.keystore` özel dosya dışlamalarının eşdeğer olup olmadığı birleşme öncesi incelenecek.
2. `admin/.env.local` — **her iki çalışma dalında da Git takibinden çıkarıldı**. Önceki commit ve `main` geçmişi ayrıca geçerli risk olarak tutulacak. Dosya içeriği kesinlikle raporlanmadı.

Diğer 14'er dosya değişikliği konu bakımından ayrıdır (portal `portal/**` ve kendi kanıt dosyası / CI; uygulama `api/**`, `admin/**`, güvenlik/kanıt/CI). **Bu GitHub diff metaverisi dosyaların semantik olarak sorunsuz birleşeceğini tek başına kanıtlamaz**; gerçek merge dry-run/CI, yetki ve insan incelemesi gerekir.

### İzin ve gerçek kapanış

- PR #12, #14, #15 draft/merge edilmemiş. `main`, canlı Supabase, canlı Vercel veya gerçek kişi verisi üzerinde işlem yapılmadı.
- İki PR'ın tabanı aynı entegrasyon commit'i `56697cdf19618c552373718840e2ae088bbc66ae`. İleride merge yetkisi çıkarsa önce son HEAD ve bağımsız CI, ardından kod diff, ortak iki dosya, eski `.env.local` geçmişi ve sunucu/portal güvenlik modeli tekrar doğrulanacak.
- **B01–B18, 7 canlı RLS, staging Auth/Storage, hukukî ve üretim onayı eksik; 0/594 bağımsız/canlı kabul.**
