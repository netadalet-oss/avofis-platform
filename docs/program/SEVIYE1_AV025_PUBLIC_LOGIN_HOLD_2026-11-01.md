# AVOfis Seviye 1 — kamu oturumu kapatma ve test kanıtı (01.11.2026)

**Yalnız AVOfis Portal**. Özgün talimatnamenin `DENETIM/AVOFIS_PORTAL_TALIMAT_KANONIK_IZ_DIZINI.json` kaynak çizgisi ve SHA-256 değeri korundu. **Statü: KUSURLU_KISMI_DUZELT / güvenlik kontrolü; bağımsız ürün kabulü değil.**

## Kanonik madde / alt koşul / gerçek kod izi

| Madde | Özgün kaynak satır SHA-256 | Gerçek düzeltme | Durum |
|---|---|---|---|
| AV-025 | `e1da85ff9f71a35a1f1e35194b2fb2f72d522142338f3e188eeecd50a085293e` | `PUBLIC_ACCOUNT_LOGIN_ENABLED=false` kaynak sabiti; `portal/src/app/auth/login/page.tsx` artık server-render edilen veri istemeyen kapalı bilgi ekranı, `signInWithPassword` çağrısı yok | KISMİ, kamu giriş kapısı kod/CI |
| AV-052 | `b912c7969b1b7b28acfbe434945047f0cf75739907f9871125ddac385bd4ca64` | `/auth/login` mevcut ve yeni kullanıcı hesaplarına oturum açtırmaz; sonraki bağımsız staging IdP kabulü beklenir | HARİCİ KOŞUL |
| R-523 | `f4a86a09582acbb525891d58c1209a87a40425d63cf8ce039bf0bed53233248d` | Oturum açma şimdi kamu ekranından kapalı; gerçek MFA/kimlik teyidi yetkili staging'de ayrıca gerekir | KISMİ ret testi |
| R-527 | `53c016b8a8fa2be871d3518c82585443ccd39b7320cf4671bb46ea4495554efd` | Statik istemci sayfası sunucu Auth/RLS yetki kanıtı oluşturmaz; ilgili sunucu erişimi ayrıca doğrulanmalı | HARİCİ KOŞUL |

## Negatif ve pozitif CI / HTTP

- Kod ve workflow HEAD `a8f0d5e9cf0563f7953d0f56e13075a618f383d3`: [Public account/CMS güvenlik CI #41252930678](https://github.com/netadalet-oss/avofis-platform/actions/runs/41252930678) **SUCCESS**; [Portal Next build ve HTTP #41252930630](https://github.com/netadalet-oss/avofis-platform/actions/runs/41252930630) **SUCCESS**; [API/admin/portal regresyon CI #41252930698](https://github.com/netadalet-oss/avofis-platform/actions/runs/41252930698) **SUCCESS**.
- `portal/tests/public-account-safety.test.mjs` kapalı kayıt/giriş kaynak kodunu ve ortam değişkeniyle açılamayan sabiti sınar.
- `portal/tests/login-redirect-safety.test.cjs` eski zararlı URL regresyon yardımcısını korur, giriş sayfasının form/auth/router API'si çağırmadığını doğrular.
- Next sunucusunda gerçek yerel HTTP `/auth/login` negatif kontrolü; sayfa başlığı, `noindex`, parola veya form alanının bulunmaması. Bu gerçek kullanıcı, provider veya staging uçtan uca testi değildir.

## Açık ret / hukukî koşullar

- Sunucu/Auth/Storage servislerine bağımsız gerçek staging A/B erişim ve MFA kabulü yapılmadı. Yedi canlı public RLS bulgusu ve broad SELECT policy riskleri devam ediyor.
- Parola güncelleme/kurtarma mevcut oturumlar için ayrı erişim/rol hukuku ve olası eski hesap risk envanteri kapsamında incelenmeli; bu kod farkı o ekranın güvenlik onayı değildir.
- Bu değişiklik mevcut/yeni kullanıcıların gerçek Supabase Auth işlemleri için tüm olası yolakların kapandığını kanıtlamaz. Yalnız `/auth/login` sayfasının kendi veri toplama ve login işlemi kapandı.
- Hukukî temsil, ödeme, belge, gerçek müşteri, üretim, `main` merge **açılmadı**. Bağımsız R kabul **0/594**, canlı kabul **0/594**.
