# AVOfis v18 — Sayısal ilerleme standardı ve W1 güvenlik uygulaması

**Tarih:** 30 Ekim 2026 · **PR:** #5, taslak ve birleştirilmemiş.

## Kabul sayacı — tek anlam: bağımsız kabul

| Bağımsız takip kaydı | Adet | Bağımsız kabul |
| --- | ---: | ---: |
| Özgün R-001–R-594 | 594 | 0 |
| 16 personel modülü × 12 ayrı kabul denetimi | 192 | 0 |
| 18 B + 16 J + 10 P + 8 IND + 4 G + 15 IND-T + 29 kuruluş + 13 teknik | 113 | 0 |
| 17 hizmet + 14 hedef kitle + 12 sorun + 16 rehber + 7 kurumsal + 8 liste | 74 | 0 |
| **TOPLAM** | **973** | **0 / 973** |

**Birim:** Bir takip kaydıdır; temel gereksinimle ek kontrol birbirine bağlı olabilir.
973 sayısı 973 ayrı ve bağımsız ürün özelliği iddiası değildir.

- Özgün 594 madde için **41 kısmi kanıt**, **553 özgün kanıtı bulunmayan madde**; bağımsız kabul **0/594**.
- B01/B02 geçiş kodu ve gerçek PostgreSQL 17 sentetik saldırı testleri geçti; **iki B paketi için teknik sentetik kanıt**, bağımsız B kabulü **0/18**.
- B03 staging **hedef ayrılığı ve sahte URL** denetim kodu eklendi; gerçek staging erişimi ve Auth/Storage/E2E yeri başka kanıta tabidir.
- PR ile gerçek canlı Supabase, gerçek müşteri verisi, yayım, ödeme ve resmî başvuru değişmedi.
- Üretimde yedi eski public tabloda RLS kapalı; bu bulgu ortadan kalkmadan **NO-GO**.

## Her CI çalışmasında üretilen sayısal rapor

`ops/avofis-work-progress.json` delil kaydı; `portal/scripts/work-progress.mjs` denetim motoru; `portal/scripts/work-progress.test.mjs` artış ve sahte kabul negatif testleri.

Çıktı biçimi:

```text
AVOFIS_ACCEPTED=0/973
AVOFIS_REMAINING=973/973
AVOFIS_PARTIAL_REQUIREMENTS=41/594
AVOFIS_SYNTHETIC_AUXILIARY=2/113
AVOFIS_PRODUCTION=NO_GO
AVOFIS_STAGING_E2E=NOT_VERIFIED
```

Sentetik ek paket sayacı yeni doğrulanmış CI kanıtıyla ilerleyebilir; **bağımsız kabul** sayacından ayrı tutulur. Kullanıcı ara raporunda her zaman `kabul / 973` görünür.

## W1 bu oturumda yapılan kod

1. B02 `database/ops/b02_policy_readonly_postflight.sql`: gerçek PostgreSQL metadata üstünde salt okunur uygulama sonrası politika kontrolü.
2. `database/tests/b02_postflight_broad_read_expected_failure.sql`: eski admin SELECT politikası `USING(true)` ile yeniden açılırsa read-only kontrol reddeder.
3. `database/tests/b02_postflight_hold_expected_failure.sql`: RESTRICTIVE yayım yasağı PERMISSIVE yazmaya çevrilirse reddeder.
4. `database/ops/b03_staging_target_guard.mjs`: ayrı ve geçerli proje referansı + exact HTTPS Supabase host koşulları; canlı projenin staging olarak gösterilmesini reddeder.
5. `database/tests/b03_staging_target_guard.test.mjs`: üretim hedefi, URL spoofing, kullanıcı bilgisi, query, port, yanlış protokol, eksik ref negatif testleri.
6. `.github/workflows/avofis-integrated-catalog-ci.yml`: güvenlik + ilerleme testleri sürekli çalışır.

## Üretim için kalan zorunlu gerçek işlemler

Ayrı Supabase staging projesi oluşturma/yetkili erişim, gerçek JWT'li müşteri A/B, Storage signed URL ve iptal, AAL2 personel, yedek/restore, RLS pre/postflight, güvenlik uzmanı ve GDPR onayı, işletme sahibi yazılı GO, ardından kontrollü canlı migration. **Bu adımların hiçbiri env değişkeninin doğru olması veya sentetik CI'nin yeşile dönmesiyle kanıtlanmış olmaz.**

**Kaynak:** AVOfis v18 özgün 594 gereksinim matrisi ve 29 Ekim kaynak arşivi; OpenAI değil kullanıcı kaynaklı özgün madde metinleri aynen korunur.
