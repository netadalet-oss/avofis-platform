# LarenLex Android — L0 isolated work area

Bu dizin `netadalet-oss/avofis-platform` ortak GitHub ağacındaki **yalnız LarenLex Android** çalışma alanıdır. Portalın `portal/`, `admin/`, `api/`, `database/` ve canlı Supabase/Vercel ortamları burada uygulama backend'i/test sistemi değildir.

## Otorite ve sürüm sınırı

- Bağlayıcı kaynak: kullanıcıca sağlanan `LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip` içindeki `LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md`.
- Yardımcı referans: `TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip`. Buradaki eski/çelişen maddeler özel talimatnameye üstün değildir.
- Tarihî A5.18 Android kaynak commit'i `46338372045277e6856a488c9c01ff5749b3522b` (`develop`); tarihî Android `main` `db796003982e1447969f610efe68de5cd80df268`. **Bu GitHub dalı bunlardan oluşturulmadı**; portal deposunun `main` dalından yaratıldı. Android kaynak geçmişi burada varmış gibi kabul edilemez.
- ZIP'lerin içinde A5.18 `.bundle`, Android kaynak ağacı, Gradle projesi, cihaza ait APK kanıtı bulunmadı. L0'ın LX-001, LX-002, LX-007 ve LX-010 maddeleri bu deliller sağlanmadan kapatılamaz.

## L0 çevrimdışı kaynak denetimi

Kaynak ZIP'ler Git'e, CI'ya, loglara ve üretim sistemlerine yüklenmez. Lokal olarak:

```bash
python3 larenlex-android/tools/verify_l0.py \
  --larenlex-zip /path/to/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip \
  --combined-reference-zip /path/to/TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip \
  --output /tmp/larenlex-l0-evidence
python3 -m unittest discover -s larenlex-android/tests -v
```

Arşivlerin ikisini de sağlayan ortamda entegrasyon testleri:

```bash
LARENLEX_SOURCE_ZIP=/path/to/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip \
AVOFIS_REFERENCE_ZIP=/path/to/TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip \
python3 -m unittest discover -s larenlex-android/tests -v
```

Çıktı `PASS_SOURCE_ONLY` sadece **belge bütünlüğü ve tarihî delil** anlamına gelir; mevcut Android derlemesi, gerçek backend, cihaz testi, hukukî kabul veya yayın anlamına gelmez. 37 SQLite işlem, 87 sentetik işlemin **alt kümesidir**.

## L0 açık kapılar

1. A5.18 bağımsız Git bundle, A5.14 devir ZIP'i ve hash manifestleri gelince yalnız yalıtılmış çalışma alanında `git bundle verify`, `git fsck`, `git rev-parse`, `verify-hashes.py` çalıştırılacak.
2. O kaynakta ürün kimliği `nl.larenlex.app`, bağımsız backend, staging ve gizli bilgi erişimleri negatif kontrollerle doğrulanacak.
3. Mimari A1–A4 ve API/A2 bağları tekil kanıtlarla yeniden çalıştırılacak; Node/Python/Chromium ve Gradle testleri ayrı kaydedilecek.
4. L0 kabul ve L1 geçişi kullanıcı onayı olmadan ilan edilmeyecek.

Portal çalışmalarına veya `main` dalına otomatik merge yoktur.

## 2026-11-01 L0 iz matrisi ve kaynak karar kaydı

Bu dalda L0 iz üreticisi ve sürüm farkı kaydı vardır:

- docs/L0_DECISION_AND_BLOCKERS_2026-11-01.md
- tools/build_l0_trace.py
- tests/test_build_l0_trace.py

Özel kaynak ZIP yalnız yetkili yerel dosya sisteminde bulunuyorsa:

```bash
python3 larenlex-android/tools/build_l0_trace.py \
  --source /secure/path/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip \
  --out /tmp/larenlex-trace.json
python3 -O -m unittest discover -s larenlex-android/tests -v
```

Yukarıdaki iz matrisi, A2↔R↔API bağlantısını delilsiz otomatik doldurmaz. SHA ve temel sayım doğrulaması geçse bile, sonuç **Android APK testi veya bağımsız kabul değildir**. Birleşik kaynak ZIP'i ve özel talimat ZIP'i GitHub'a yüklenmez. GitHub Actions sadece bağımsız unit kontrolüdür; özel dosya sağlanmadıkça ZIP entegrasyonu atlanır.


## 2026-11-01 — L0 kapanış kapısı ve durum prototipi

Yeni geliştirme dosyaları:

- tools/run_l0_gate.py: kaynak ZIP kontrollerinden sonra gerçek Android bundle ve bağımsız kabul eksikse L0 kapanışını BLOCKED_NOT_COMPLETE olarak reddeder (beklenen çıkış kodu 2).
- tools/check_android_identity.py: Gradle, Kotlin, Java, kaynak yapılandırmaları, ürünler arası sabit uç noktalar, sembolik bağlantılar ve imza parolası için salt-okunur statik kontrol; gerçek backend bağımsızlığını tek başına kanıtlamaz.
- preview/status.html: telefon uyumlu, yalnız Türkçe Gelişim/Durum prototipi. Gerçek Android uygulaması veya kamuya yayımlanmış ekran değildir.
- tests/test_run_l0_gate.py ve tests/test_status_preview.py: yanlış tamamlanma ve yanlış kamu izlenimini engelleyen regresyonlar.

Örnek komut (exit 2 L0'ın açık olduğu anlamına gelir):

    python3 larenlex-android/tools/run_l0_gate.py --source /secure/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip --reference /secure/TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip --output /tmp/larenlex-l0/L0_GATE.json

ZIP dosyaları ve gerçek müşteri/üretim gizli bilgileri kamuya açık Git dalına aktarılmaz. GitHub Actions tanımı başarılı CI run-id, gerçek Android HEAD, Gradle/cihaz testi veya bağımsız kabul yerine geçmez. Bu L0 çalışması genel düzey kapanışı veya sonraki seviyeye geçiş izni değildir.
