# AVOfis — 594 gereksinim kanıt eşleştirmesi ve bağımsız kabul eşiği

**Tarih 31.10.2026. Kanıt snapshot SHA:** `3d9e2e31747903fd868cff6ff6cf794f8adcd59f`. Bu kaynak bir **satır bazlı R-ID eşleme envanteri**dir; tek başına kabul kararı değildir.

## Kaynak bütünlüğü ve hesap
- Özgün kullanıcının Seviye 1 XLSX'i: **R-001–R-594**, 33 bölüm; 324 P0, 270 P1; 41 tarihî kısmi, 553 önce madde bazında kanıtlanmamış.
- **118** güncel doğrudan kod ve geçen CI ile ilişkilendirilmiş *kısmi* R;
- **7** öncelikli sentetik PG17 ve CI ile ilişkilendirilmiş *kısmi* R (canlı güvenlik değildir);
- **70** kod/derleme izi bulunan ama gereksinimi ayrı E2E test edilmemiş R;
- **10** yalnız tarihî kısmi iz;
- **389** bu denetimde yeni maddeye özgü kanıt eşleştirilememiş R.
- **195** güncel teknik izli R; **0/594 bağımsız yazılı kabul**, **0/594 canlı kabul**; B01–B18 açık, yedi canlı RLS bulgusu kapanmadı.

## Tam kayıtlar
- `docs/program/r594-kanit-esleme-2026-10-31.csv`: **594 eşsiz satır**, kanıt grubu, durum ve kabul değerleri. Aşağıdaki JSON aynı eşleşme grupları ve CI kimliklerini doğrular.
- `docs/program/r594-kanit-esleme-katalogu-2026-10-31.json`: 25 kanıt grubu, kod HEAD ve başarılı CI'lar.
- Kullanıcıya verilen Excel (`AVOfis_594_GEREKSINIM_KANIT_ESLEME_VE_KABUL_MATRISI_2026-10-31.xlsx`) özgün 594 metnin tamamını, tarihî E/F kanıtlarını, **her R için kod+test+CI URL ve eksik koşulunu** ayrıca içerir. GitHub'daki makine-eşleme CSV'si, kişisel veri veya tam metin yeniden üretmez.

## Kanıt sınıfı ≠ kabul kararı
1. Kod/test sınıfı yalnız **ilgili alt bileşenin** bulunduğunu kanıtlar; otomatik olarak tüm gereksinim karşılandı denmez.
2. Sentetik PG konteyneri **canlı Supabase ACL/RLS politikası veya Auth/Storage E2E** değildir.
3. Derlenen dosya, bağımsız davranış testi ve insan hukukî/dilsel incelemesinin yerini tutmaz.
4. R-065 gibi URL testi güçlü satırlarda bile orijinal J sütununun istediği yazılı bağımsız kabul bulunmadığından H sütunu **HAYIR** kalır.
5. Kabul için maddede aranan bütün alt koşullar, sorumlu ve testçi, hukuk/dil/rol ve gerekli gerçek ortam kanıtı ile **ayrı tarihli yazılı imza/kayıt** gereklidir. Önceden yapılmış iş silinmez; sahte kabul eklenmez.

**Yetki:** Tarihî S1 aşama kilidi sonraki kullanıcı kararıyla kaldırılmıştır; `main` birleştirmesi, canlı Supabase veri/politika değişikliği, üretim/ödeme/resmî temsil ayrıca açık eylem izni olmadan yapılamaz.
