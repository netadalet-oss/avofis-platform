# AVOfis — Seviye 1 tüm modüllerin çalışan ana işlev denemeleri (01.11.2026)

**Gerçek kod çalışma alanı:** `work/avofis-uygulama-s1-20261031`; taslak PR #15; production, `main` ve Supabase veri kayıtları değişmedi.

## 16 personel modülü — yalnız sentetik fakat etkileşimli Seviye 1 ana yol

- `admin/src/lib/staff-module-directory.ts`: tam 16 kanonik personel modülü, her birinin ayrı amacı, ilk ana eylemi ve beklenen çıktısı.
- `admin/src/app/personel/[module]/page.tsx`: gerçek Next.js sayfaları (16 ayrı statik rota) ve `dynamicParams=false`, bilinmeyen slug `404`.
- `admin/src/lib/staff-synthetic-flow.ts`: 16 modüle **özgü**, birbirinden farklı ve gerçek veri barındırmayan yerel örnek girdisi/sonuçları.
- `admin/src/components/StaffSyntheticDemonstration.tsx`: tarayıcıda çalışır **Örnek ana adımı hazırla → Güvenlik/insan kontrolünü göster → Sıfırla** düğmeleri. İzin verilmeyen adım sırası reddedilir; hiçbir `fetch`, Supabase istemcisi, dosya/mesaj/ödeme/kurum işlemi, kullanıcı girdisi veya kalıcı kayıt yoktur.
- `admin/tests/staff-synthetic-flow.test.cjs` ve `staff-module-route.test.cjs`: 16 ayrı örnek akış, her durumda üç adım, 404, gizli veri girişinin yokluğu; CI'da Next derleme ve gerçek HTTP.
- **Kod/CI HEAD `7b6fe9152de180d4ec0ad32e176cc914d31e70c3`:** [admin build, 16 HTTP ve UI kaynak testleri #41254531890](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254531890) **SUCCESS** ve [API/admin/portal regresyonları #41254531950](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254531950) **SUCCESS**.
- Bu sentetik örnekler kişisel bilgi toplamaz ve **gerçek çalışan personel CRUD sistemi** oldukları iddia edilmez.

## 14 API modülü — asıl yetkili işlev ile hedeflenen işlev ayrımı

- `api/src/modules/program/program.router.ts`: `GET /api/program/overview`, bütün 14 modül ve yedi yatay iş alanının teknik durumu, 0/594 bağımsız/canlı kabul.
- `api/src/security/module-availability.ts` merkezî yanıt sözleşmesi: `availability:"SCAFFOLD_NOT_AUTHORIZED"`, `enabledActions:[]`, `plannedActions:[...]`. Geliştirilmemiş endpointleri fiilen açık `actions` olarak ilan etmez.
- `admin, analytics, careers, cases, connect, forum, messaging, notifications, offices, statutes, support, workspace` altındaki 12 public GET kökü değiştirildi. Bunların hiçbiri sunucu üzerinden CRUD aktifleştirmez. `auth` kökü önceki güvenlik denemesinde 503 ile kapatıldı; `cms` yalnız statik, kişiselsiz iki GET kaynağına izin verir, veri yazma kapalı.
- `api/tests/all-modules-scaffold.test.cjs`: 12 modülün her birinin gerçek Express GET sonucu ile planlanan/etkin ayrımı; bütün POST'larda 404; sentetik secret echo yok. `api/tests/program-overview.test.cjs` teknik durum 14 modülü ayrıca test eder.
- **Kod HEAD `5f0f8a93674693470f42d3249dd5c79f22441703`:** [API/admin güvenlik ve gerçek HTTP #41254666507](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254666507) **SUCCESS**, [Next admin build/HTTP #41254666280](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254666280) **SUCCESS**.

## Seviye 1'den 12'ye yatay alanlar

Bütün sonraki seviyelerde aynı 7 A, 101 AV, 594 R, 17 hizmet, 14 kitle, 12 rota, 16 personel, 8 IND, 16 J, 10 P, 18 B, 13 T ve altı dil yeniden işlenecektir. Önceki başarısız kalemler için en az iki **yeni ve ayrı delilli** deneme; gerçekte yapılmayan deneme yazılmaz. Bu sözleşme `tools/process/whole-product-levels.cjs` ve `tools/process/whole-product-ledger.test.cjs` ile CI'da sınanır.

## Bu geliştirme neden bir sonraki seviye için hazır olduğunun ispatı değildir?

- Her modülün gerçek sunucuya bağlı esas işlemi, kullanıcı kimlik/atama/tenant ve veri sahipliği, gerçek staging, ticari ve meslekî yetki hâlen yoktur.
- Yedi canlı Supabase RLS açığı, staging yokluğu, eski çevresel dosya riski, `main` dal koruma eksikliği, paket determinismi, hukukî ve altı dilli insan onayı açık.
- Vercel'de aynı son uygulama/portal HEAD'de erişilebilir bağımsız preview deployment doğrulanmadı. CI localhost `next build` + HTTP **gerçektir**, ancak dış kullanıcı URL'si yerine geçmez.
- **Seviye 1 statüsü `IN_PROGRESS`**, bağımsız 0/594 ve canlı 0/594. Teknik sentetik örnekler **kabul ve üretim yayını değildir**.
