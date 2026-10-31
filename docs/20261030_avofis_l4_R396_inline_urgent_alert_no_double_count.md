# AVOfis v18 — L4 R-396: risk uyarısını doğru sorunun içinde gösterme

**30 Ekim 2026** · **PR #5: DRAFT** · **L4 uygulaması sürüyor; L5 KİLİTLİ**

**Özgün kaynak R-396:** “Acil güvenlik veya hukuki süre uyarılarını form sonunda değil, ilgili soruda tetikle.”
Kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, bölüm 22.

### Somut kod
- `portal/src/app/triyaj/page.tsx`: Süre ve geri döndürülemez zarar alanının *içinde*, kullanıcı 48 saat, yedi gün, resmî bildirim veya ciddi zarar riski bildirdiğinde semantik `role="alert"`, `aria-live="assertive"` ile üç dilde (TR/NL/EN) insan/uzman uyarısı gösterilir.
- `portal/src/lib/public-triage.ts`: Acil bilgi rotası mevcut konsolide triyaj mantığıyla uyumludur. Uyarı hiçbir tarih hesaplamaz, yasal süreyi durdurmaz, müşteriye danışmanlık veya temsil yükümlülüğü kurmaz.
- `portal/scripts/public-triage.test.mjs`: beş risk senaryosunda escalation/no-filing ve uyarının doğru `fieldset` içinde gösterimini denetler.
- **Sentetik CI:** https://github.com/netadalet-oss/avofis-platform/actions/runs/41086492838 — altı iş başarı.

### Kimlik/kanıt sayımında dürüstlük
R-396 özgün 594 kayıt içinde **önceden zaten kısmi teknik kanıtlı** idi. Bu değişiklik R-396'nın mevcut kaydını güçlendirir, **ikinci kez 1 iş olarak sayılmaz**. L4 kaynak-kod kanıtı `14/973`; R kısmi teknik kanıt `54/594`; bağımsız kabul `0/973`; ek sentetik B kanıtı `4/113`.

**18/18 açık karar devam ediyor; gerçek Auth/Storage staging, hukukî ve erişilebilirlik QA eksik; canlı üretim NO-GO, L5 KİLİTLİ.**
