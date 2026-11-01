# AVOfis Seviye 1 — bütün yönetim modülleri / 13 eski bölüm ve ortak kapsam kontrolü (01.11.2026)

**Ürün:** yalnız AVOfis uygulama, admin ve API. **Kabul türü:** kod/CI alt koşulu; hukukî, bağımsız, gerçek veri veya canlı kabul değildir. **Çalışma dalı:** `work/avofis-uygulama-s1-20261031`; taslak PR #15.

## Bu turda gerçek kod çalışmaları

1. 16 personel modülünün her birindeki önceki üç adımlı **sentetik ama çalışan** yerel Next.js örnek akışları korundu: `/personel/[module]`, `StaffSyntheticDemonstration`. Bu alanlara gerçek kullanıcı veya dosya bilgisi gitmez.
2. Başlangıçta sadece “Admin bölümü” yazan 13 eski route (analytics, audit, careers, cases, dashboard, forum, media, menus, notifications, roles, settings, statutes, users) `AdminSectionBridge.tsx` ile ilgili gerçek personel modülü önizlemesine bağlandı. Böylece bağlantılar artık kullanılabilir ama gerçek müşteri CRUD'u açılmaz.
3. Admin `src/app/layout.tsx` seviyesinde bütün yönetim sayfalarına `robots: { index:false, follow:false }` eklendi.
4. `api/src/modules/program/program.router.ts`: 14 API modülünün çalışır HTTP durum bildirimi; 12 API iskeletinde `enabledActions:[]` ve `plannedActions` ayrımı korunur.
5. `docs/program/AVOFIS_STAGE1_WHOLE_PRODUCT_CONTRACT_2026-11-01.json` dosyası portal dalıyla **birebir aynı** kapsamı ifade eder: 7 A, 101 AV, 594 R, 17 hizmet, 14 kitle, 12 rota, 16 staff, 14 API, 8 IND, 16 J, 10 P, 18 B, 13 T, altı dil, 12 seviye. `tools/process/whole-product-cross-branch-contract.test.cjs` bu JSON'u gerçek personel ve API kaynaklarıyla karşılaştırır; sahte ürün/kabul sayacı giremez.

## Doğrulanmış test tanıkları

- 13 önceki boş bölümün tümü için `admin/tests/admin-legacy-bridge.test.cjs` ve gerçek Next HTTP denemesi. Kod/CI SHA `fdd9fa72cfd7aea5a6715dd1d7d04dd5695c9f0c`: [Admin Next build + 16 staff + 13 bölüm HTTP CI #41255652830](https://github.com/netadalet-oss/avofis-platform/actions/runs/41255652830) **SUCCESS**, [API/admin/portal CI #41255652852](https://github.com/netadalet-oss/avofis-platform/actions/runs/41255652852) **SUCCESS**.
- Aynı gerçek sayfalar + ortak kapsam JSON CI SHA `8c3aa888f7848bbdcc6010765ff8e5b95c735c33`: [API + kanonik kontrat CI #41255854193](https://github.com/netadalet-oss/avofis-platform/actions/runs/41255854193) **SUCCESS**, [Admin build/HTTP #41255854200](https://github.com/netadalet-oss/avofis-platform/actions/runs/41255854200) **SUCCESS**.
- Önceki [16 yerel örnek/14 API geliştirme kanıtı](SEVIYE1_ETKILESIMLI_16_PERSONEL_14_API_KANIT_2026-11-01.md), [iki yeni deneme yükümlülüğü defteri](SEVIYE1_YATAY_DEVIR_RISK_DENEME_DEFTERI_2026-11-01.json), [12 seviyeli yatay yöntem](SEVIYE_01_12_YATAY_DERINLESME_VE_DEVIR_2026-11-01.md) yürürlüktedir.

## Kapatılmayan yetki ve kalite sınırları

- Gerçek personel kimliği, AAL2, sunucu tarafı iş emri/tenant ataması, CRM RLS, imza ve denetim kayıtları kanıtlanmadı. Yukarıdaki sayfalar kamuya açılmış personel CRUD veya güvenlik sertifikası sayılmaz.
- Bağımsız Supabase staging mevcut değil; canlı Security Advisor'da yedi RLS ERROR + bir Auth uyarısı açık. Üretim veritabanına hiçbir DDL/DML uygulanmadı.
- Son kodun Vercel'de güvenli *ayrı staging* dış preview URL'si doğrulanmadı; bunlar **gerçek localhost Next HTTP** denemeleridir.
- `main` değişmedi, PR #15 taslak/açık, Vercel production ve gerçek ödeme/resmî kurum işlemi açılmadı.
- **Seviye 1: IN_PROGRESS. Bağımsız R kabulü 0/594, canlı R kabulü 0/594.** Bu dosya bir sonraki seviyeye geçiş onayı veya seviye tamamlanma kararı değildir.
