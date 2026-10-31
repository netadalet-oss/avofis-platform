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

## 01.11.2026 — Yönetim girişinde güvenli dönüş yolu

**Eski uygulama dalı HEAD:** `82f7050d9db96ebe174cbd0690c1c6cfb3c4be23`. **Yeni kod + CI HEAD:** `4f3f3fb6cc1b24df9b4d2fb7da7fd7c5dd660552`.

- Bulgusu: `admin/src/app/auth/login/page.tsx` mevcut oturum ve yeni giriş dallarında doğrulanmamış `?next` değerini `router.replace` fonksiyonuna iletiyordu. Resmî Next.js API referansı güvenilmeyen URL yönlendirmelerinin XSS tehlikesini bildirir: `https://nextjs.org/docs/app/api-reference/functions/use-router`.
- Düzeltme: `admin/src/lib/safe-admin-redirect.ts` yeni, sadece mevcut ve izinli yönetim yollarını kabul eden fonksiyon. Giriş sayfasının **her iki** `router.replace` çağrısı doğrulayıcıya bağlandı. Dış URI, script URI, protocol-relative URL, dot traversal, encoded slash, query/fragment, tekrarlı next ve uzun değerler güvenli `/cms` varsayılanına döner.
- Test: `admin/tests/safe-admin-redirect.test.cjs` yeni (olumlu, olumsuz ve kaynak bağlantı testi).
- [GitHub Actions #41251442218](https://github.com/netadalet-oss/avofis-platform/actions/runs/41251442218): **SUCCESS**; TypeScript API build, gerçek Express HTTP ve admin testleri, admin/portal typecheck ve mevcut güvenlik regresyonları bu kod SHA'sında başarılı.
- Vercel portal/admin preview kontrollerinde build rate-limit bağlantısı bildirildi; **yayın/gerçek tarayıcı kabulü değildir**.
- Kanonik kimlik notu: Özel talimatnamede `AV-019` için `R-541–558` ve `AV-052` için `R-451–468` bağlantıları, özgün R metinlerinin konusuyla örtüşmemektedir. Kod izinde `R-523` ve `R-527` ile konusal ilişki ayrıca tutulur; **özgün tanımlar değişmez, R kabulü sayılmaz**.

**Kalanlar:** server Auth, session revocation, MFA, rate limit, tenant ve Storage A/B, gerçek staging ve hukukî/bağımsız kabul. `main`, canlı Supabase, production, müşteri verisi veya ödeme değiştirilmedi. B01–B18 ve 7 canlı RLS riski açık.

## 01.11.2026 — AV-023 / R-540 izlenen kimlik dosyası riski

- Yalnız Git **ağaç metaverisi** okundu, içerik/anahtar/credential okunmadı. `admin/.env.local` blob SHA `1e003665f6c3b3135e9dc1173f0924b922872777` ve boyutu 305 bayt: `main` (`c97d03d...`), entegrasyon (`56697cdf...`) ve bu çalışma dalının önceki halinde izleniyordu. Dosyanın gerçek gizli anahtar içerdiği **belirlenmedi**.
- İzin verilen development çalışma dalında Git takibinden çıkarıldı: commit `13c213e96a69522e0725b4bb8880396dcd95f0be`; `main` veya production değiştirilmedi. **Geçmiş commitlerdeki kopyalar kalır.**
- `.gitignore` yerel keystore ve sertifika anahtarı türleri için genişletildi.
- `tools/security/tracked-file-gate.cjs` ve `tracked-file-gate.test.cjs` eklendi; izlenen dosya adları için fail-closed CI: ortam dosyaları ve özel anahtar biçimleri yasak, `.env.example` / sentetik kaynak dosyası izinli. Gerçek sır içeriği **taranmaz**.
- Bu kod HEAD `651d6cff4ee20215557022ceec827bc8a41e09f5` üzerinde Git ağacında eşleşen izlenen ortam/anahtar dosyası kalmadığı kontrol edildi. [GitHub Actions 41251621674](https://github.com/netadalet-oss/avofis-platform/actions/runs/41251621674) **SUCCESS**: dosya adları geçidi, unit testler, API/admin/portal güvenlik regresyonu.
- **Açık haricî koşul:** Yetkili proje sahibi önceki dosyanın içeriğinde gerçek kimlik bilgisi bulunup bulunmadığını yalnız gizli yönetim kanalında belirlemeli; varsa ilgili servis kimliğini iptal/rotate etmeli, kullanım logları ve Git geçmişinin temizlenmesi için ayrıca güvenli prosedür yürütmelidir. Test kodu geçmiş sızıntı riskini gidermez; gerçek credential değeri Git/sohbet/CI çıktısına **konulmaz**.
- Portal çalışma dalı aynı entegrasyon tabanından ayrıldığı için bu temizliği otomatik devralmamıştır; iki dalın birleşmesinde dosya takibi ve güvenlik kapısı ayrıca denetlenmelidir.

**Durum:** AV-023/R-540 için kısmi kod+CI kanıtı, tam güvenlik/bağımsız kabul veya sır rotasyonu **YOK**. Seviye 1 sürüyor; B01–B18, 7 canlı RLS, bağımsız staging ve hukukî kabul açık.

## 01.11.2026 — Kanonik 594 R kayıt testleri, son staging durumu

- `tools/process/r594-ledger-integrity.test.cjs` geliştirme testine eklendi: `R-001..R-594` benzersiz, 33 × 18 bölümlenme, eski statü sayacı 389/118/70/10/7 ve kabul `HAYIR` tutarlılığı. `docs/program/r594-kanit-esleme-2026-10-31.csv` özgün 594 şartın yerine geçen kabul belgesi değildir.
- `.github/workflows/api-verification.yml` üzerinde gerçek test koşusu yeni commit'e bağlandı. [CI 41252276628](https://github.com/netadalet-oss/avofis-platform/actions/runs/41252276628): **SUCCESS**, kod+workflow HEAD `a7bb3cfdc5b6b406b2a2519b265f8029dd2af9d1`.
- Bu 594 test **kaynak/eşleme bütünlüğünü** ispatlar; her gereksinimin gerçek ürün, hukuk, kullanıcı veya bağımsız denetim kabulünü ispatlamaz. **0/594 bağımsız, 0/594 canlı kabul**.
- 01.11.2026 Supabase salt okunur management: mevcut `avofis` projesinde development branch listesi **boş**; Security Advisor **7 açık public RLS ERROR, 1 leaked-password-protection WARN**. Ücretli yeni dal kurulmadı. Bunlar `docs/security/AVOFIS_S1_STAGING_KAPISI_GUNCEL_2026-11-01.md` dosyasında hedef/izin/bağımsız Auth–Storage–A/B kabul sırasına bağlandı.
- Mevcut repo için `package-lock.json` bulunmadığından tam deterministik npm kurulumu henüz ispatlanmadı (AV-006). Kaynak CI `npm install --ignore-scripts` kullanır; bu işlem bir sürüm kilidi değildir. İşletim ortamı yerel `npm view` denemesini `EAI_AGAIN` ağ/DNS hatasıyla reddetti. Kilit dosyası yapılmış/üretime alınmış sayılmıyor.
