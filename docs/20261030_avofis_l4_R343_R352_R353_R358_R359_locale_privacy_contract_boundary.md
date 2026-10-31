# AVOfis v18 — L4 source-backed implementation batch 3, R-343 / R-352 / R-353 / R-358 / R-359
**30 Ekim 2026** · **Draft PR #5** · **L0–L3 onaylı; L4 çalışması devam; L5 kilitli**

## Source-of-truth original R instructions

- **R-343:** “İlk ekranda kullanıcının dilini, bulunduğu ülkeyi ve sorunun yaşandığı ülkeyi sor.”
- **R-352:** “Gizlilik metnini form başlangıcından erişilebilir kıl ve gerekli bildirimleri ayrı sun.”
- **R-353:** “Ücretli hizmet sözleşmesini henüz kurulmamışken ‘başvuru gönderildi = kabul edildi’ gibi göstermeyi önle.”
- **R-358:** “Sorun bilinmiyorsa ‘emin değilim’ yolundan insan değerlendirmesine aktar.”
- **R-359:** “Oturumsuz ön başvuru ile kayıt gerektiren güvenli belge yüklemeyi ayır.”

Özgün kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, 20. bölüm. Her birinde **yalnız güvenli, oturumsuz kamu triyajı alt kapsamı** kodlandı; tam R gereksiniminin bağımsız kabulü iddia edilmez.

## Gerçek değişiklikler

- `portal/src/lib/public-triage.ts`: `preferredLanguages` (TR/NL/DE/EN/AR/RU/bilinmiyor), `residenceCountry` ve `country` (sorunun ülkesi) ayrı, sadece kategorik ve kaydedilmeyen seçimlerdir. Bilinmeyen ve çapraz-ülke durumları uzman incelemesine gider. Arapça RTL, altı hukukî dil yayını veya gerçek çeviri hizmeti **kanıtlanmış değildir**.
- Aynı dosya: bilinmeyen konu için `UNSURE_HUMAN_REVIEW_REQUIRED`; bilinmeyen oturum ülkesi ve dil tercihi için ayrı inceleme kodları eklendi. Dosya açma, ödeme, resmî kurum işlemi, kişisel veri veya belge yükleme yetkileri her senaryoda `false` kalır.
- `portal/src/app/triyaj/page.tsx`: TR/NL/EN arayüzünde ilk seçimlerden *önce* `/gizlilik` bağlantısı ve açıklaması; dil, ikamet edilen ülke ve sorunun ülkesi üç ayrı seçim; sözleşme/ödeme kabulü oluşmayacağı ve anonim akıştan özel belge yüklenemeyeceği açıklamaları.
- `portal/scripts/public-triage.test.mjs`: altı dil kategorisi ve üç konum bağımsızlığı, bilinemeyen/çapraz ülke riski, bilinmeyen konu için insan inceleme, PII sürpriz alan reddi, gizlilik bağlantısının seçimlerden önce olması, dosya yükleme/otomatik sözleşme yokluğu.

## İddia edilmeyen ve açık tutulan işler

1. Bu görüntü **kamu triyajı**, gerçek müşteri onboarding değildir; kullanıcı kimliği, açık rıza, gerçek Auth/Storage/staging, GDPR Madde 13/DPO ve müşteriye özel sözleşme açılmadı.
2. Kayıt kimlikleri **973/973** değişmez. L4 kodu ile sentetik doğrulanan alt kapsam ID sayısı **10/973**; güncel R kısmi teknik kanıtı **51/594**, B yardımcı sentetik **4/113**; gerçek bağımsız kabul **0/973**.
3. **18/18 L3 açık karar halen AÇIK**, üretim kapısı **NO-GO**, **L5 KİLİTLİ**. Ayrı profesyonel, müşteri, staging, güvenlik ve yayın onayı olmadan resmi işlem/PSP, canlı SQL veya deploy yapılmaz.
4. Kaynak kodu ve test izleri: `ops/avofis-l4-implementation-evidence.json`; önceki 5 kod kanıtı ve bu 5 kod kanıtı ayrıdır. Başarılı sentetik CI: https://github.com/netadalet-oss/avofis-platform/actions/runs/41082197906.

Bu dosya kaynaklı bir iş uygulama tutanağıdır; 973 işin tamamlandığını veya E2E insan kabulü yapıldığını iddia etmez.
