# L0 — 2026-11-01 ara karar, gerçek kanıt ve çelişki kaydı

**Ürün:** LarenLex Android (nl.larenlex.app)
**Çalışma dalı:** work/larenlex-android (AVOfis monorepo main'den oluşturulmuştur; bağımsız Android develop geçmişi değildir).
**Seviye:** L0 açık; L1'e geçiş yapılmadı.

## Kaynak otoritesi ve sınır
- LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md: bağlayıcı özel kaynak.
- Birleşik ZIP: yalnız geçmiş/yardımcı referans.
- Gerçek Git commit, kaynak kod, CI, cihaz, PostgreSQL ve kabul delili ayrı doğrulanır.
- Özgün talimatname içeriği değiştirilmedi; tarihli çelişki açıklaması bu sürümlü belgede tutuldu.

## Bu çalışma sırasında doğrulananlar
- LarenLex ZIP SHA-256: 8049e3359b7822c458cb678431412e3f48e0d0f7dea1834a709859b7f4d5ff8c (14/14); birleşik ZIP SHA-256: 51c672b5276a1acfd65a524921d6fd7095f85593d561084144db44d03757036c (21/21). Eski SHA256SUMS.txt birleşik arşiv manifestinin açık istisnasıdır.
- 62 LX, 453 A2 (14 sistem, 69 grup), 102 API; 594 R yalnız başka üründen gelen konu referansıdır.
- A5.18 tarihî kapsam: 87 RAM sentetik, bunun içinde 37 SQLite sentetik, 15 kapalı, gerçek üretim backend 0, RLS 0, cihaz 0, bağımsız kabul 0. Sayılar güncel uygulama testi değildir.
- Yüklenen iki ZIP'in iç içe ZIP katmanlarında Git .bundle/.git ve Android Gradle kaynak ağacı bulunmadı.
- Ayrı iz matrisi üreticisi ve 4 yerel negatif/entegrasyon testi başarılı; 13 mevcut kaynak/bundle testi de kaynak ZIP'lerle başarılı. Bu sonuçlar GitHub Actions CI başarısı sayılmaz.
- GitHub LarenLex dalı şu anda AVOfis main'den türemiştir; talimatnamede geçen gerçek Android develop 46338372045277e6856a488c9c01ff5749b3522b burada ispatlanmış değildir.

## Sürüm çelişkisi: LX-006 / SQLite sayısı
LX-006 bölümünde eski 24 SQLite işlemi yazılıdır. Aynı ana belgenin I.3 bölümünde ve A5_18_102_API_COVERAGE.json ile A5_18_GELISTIRME_TEST_VE_ENGELLER.md kaynaklarında güncel tarihî A5.18 alt küme sayısı 37'dir. A5.18 raporu 24'ü eski A5.13 katmanına bağlar. Özgün LX-006 hükmü silinmez: 24=A5.13 tarihî alt sürüm, 37=A5.18 tarihî alt sürüm; ikisi de üretim/Android bağımsız kabulü değildir.

## Açık L0 engelleri
| ID | Mevcut kanıt | Sonraki güvenli doğrulama |
| --- | --- | --- |
| L0-SOURCE-BUNDLE | A5.18 .bundle mevcut paketlerin hiçbirinde yok | Gerçek Android bundle/remote, git bundle verify, HEAD/main/ancestry/fsck, hash verifier |
| L0-A514-HANDOFF | A5.14 devir ve onaylı A1–A4 mimari kaynakları yok | Tarihî kaynakların manifest ve bütünlük doğrulaması |
| L0-BUILD-DEVICE | Yerel adb, Gradle, Android SDK 35 yok | İzole gerçek Android kaynak ağacında Gradle/ADB/test |
| L0-POSTGRES-RLS | Yerel psql, postgres, initdb, pg_ctl yok | Yalnız bağımsız disposable PostgreSQL instance; gerçek L1 izni/kabulü ayrı |
| L0-CI | GitHub Actions başarı run-id doğrulanmadı; Vercel portal/admin build-rate-limit statüleri başarısız | Aynı HEAD için iş akışı run-id ve gerçek job logu |
| L0-PUBLIC-REPO | netadalet-oss/avofis-platform bağlantılı GitHub hesabında public | Gerçek kişi verisi, gizli token ve üretim imza anahtarı yüklenmez; hassas bağımsız Android kaynakları için özel erişim kararı |

## Araçlar ve kabul disiplini
- tools/verify_l0.py: çift ZIP bütünlük ve iz denetimi.
- tools/build_l0_trace.py: tam 62/453/102/594 iz kaydı. Delilsiz A2–R–API bağları bilinçli olarak boş; doğrulanmış işlev veya hukukî kabul anlamına gelmez.
- tools/preflight_android_bundle.sh: gerçek bağımsız Android kaynağı geldikten sonra çalışma.
- Her hata ilk deneme + en çok iki tekrar, zaman/exit code/stderr kayıtlı; tarihî testler current-pass yapılmaz.
- AVOfis üretim sistemleri ve main dalı LarenLex test/staging hedefi değildir; otomatik merge yapılmaz.
- L0 şartları gerçek kanıt olmadan kapatılmayacaktır. Yeni seviyeye yalnız kullanıcı onayıyla geçilir.
