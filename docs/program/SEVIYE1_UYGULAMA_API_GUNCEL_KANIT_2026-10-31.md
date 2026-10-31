# AVOfis Seviye 1 — Uygulama/API kanıt kaydı (31.10.2026)

**Ürün:** yalnız AVOfis web uygulaması/API. **Statü:** `KUSURLU_KISMI_DUZELT`, üretim veya bağımsız R kabulü değildir.

## Kaynak ve ayrım
- Depo: `netadalet-oss/avofis-platform`.
- Çalışma dalı: `work/avofis-uygulama-s1-20261031`.
- Taban: entegrasyon dalı `56697cdf19618c552373718840e2ae088bbc66ae`; `main` değiştirilmedi.
- Önceden doğrulanan PR #13 kodu, **fast-forward** ile kayıpsız devralındı: `06391f9f1baedd556fb2bed1adbca016bdf8c5ce`.
- Bu dalın kod denetim anlık görüntüsü: `2dd4ca51027855c3576201af6df1123e3c03e5af`.
- Uygulama taslak PR: [#15](https://github.com/netadalet-oss/avofis-platform/pull/15). PR #13 ve #15'in ortak commitleri **iki kez merge edilmemelidir**.

## Teknik eşleme

| Kimlik | Alt koşul ve yapılan gerçek iş | Kanıt | Açık kabul |
|---|---|---|---|
| AV-019 | API geneli JSON işleme 64 KiB; allowlist CORS; credentials kapalı; Express imza başlığı kapalı, nosniff | `api/src/security/http-hardening.ts`, `api/src/server.ts`, `api/tests/http-security.test.cjs` | Cookie oturumu/CSRF, dağıtık rate limit, gerçek staging negatif saldırı testi |
| AV-025 | Kamu Auth API açıklamasındaki hayalî etkin register/login eylemleri 503 fail-closed olarak düzeltilmiştir | `api/src/modules/auth/auth.router.ts`, `api/tests/auth-unavailable.test.cjs` | Gerçek Auth/Storage, yetki ve kimlik onayları; hiçbir kayıt açılmadı |

## Bağımsız CI kanıtı

- GitHub Actions [41250208886](https://github.com/netadalet-oss/avofis-platform/actions/runs/41250208886): **SUCCESS**; kod HEAD `2dd4ca51027855c3576201af6df1123e3c03e5af`. TypeScript/API build, gerçek localhost HTTP testleri, portal/admin regresyon adımları başarılı.
- Bu koşu yalnız sentetik kaynak ve testtir; staging DB, gerçek tarayıcı kullanıcı oturumu, hukuk/dil veya üretim kabulü sayılmaz.

## Açık güvenlik ve hukuk koşulları

- Bağlı üretim Supabase'de `offices, office_members, topics, posts, jobs, applications, media_assets` için RLS kapalı ve anonim CRUD izinleri vardır (31.10.2026 salt okunur metaveri incelemesi); **0/7 canlı düzeltme**.
- `pages` ve `site_settings` SELECT rol politikaları ayrıca yeniden tasarlanmalıdır.
- B01/B02 ve kaynak B01–B18 kapalı sayılmaz; **0/594 bağımsız R kabul**, **0/594 canlı R kabul**.
- Canlı Supabase DDL/DML/RLS, Vercel production, `main` merge, müşteri verisi, ödeme ve resmî işlem için ayrı eylem bazlı yetki gerekir.
- Geri alma: yeni uygulama dalındaki değişiklikler `main`e aktarılmadı; PR #15 taslak/merge edilmemiştir.

## Sonraki uygulama güvenlik kuyruğu

1. Kapsam/rol/personel onaylı gerçek staging ve izole Auth/Storage kurulumu (AV-012/015/016).
2. Onaylı RLS sahiplik modeli, anon/A-B/tenant negatif SQL + HTTP kabulü (AV-014).
3. Hassas oturumlarda CSRF, rate limit, replay ve MFA/AAL2 kanıtı (AV-017/019).
4. B01–B18 için yazılı bağımsız kabul ve kullanıcıdan ayrı production onayı.
