# LarenLex Android L4 — Hukukî ürün kapsamı, diller, personel, belgeler ve resmî kaynaklar

**Bağlayıcı kaynak:** `LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md` LX-040–LX-051; 14 modülün tamamı.

## Bu teslimde gerçekten oluşturulanlar

- L3'ün `nl.larenlex.app` natif Android geliştirme ağacı korunarak, yalnızca LarenLex L4 kapsamına uygun **ayrı** ekran `L4LegalFlowsActivity.java` eklendi. Kullanıcı yetkisi ve gerçek backend olmadan resmî işlem, ödeme, makbuz, kayıt veya gerçek müşteri verisi alma kapalı.
- Özgün ana talimatnameden çıkarılan **17 hizmet** için kaynak A2 ID, IV.3 slug referansı, tam kaynak tanımı; **14 kitle** için özgün tarihî referans slug; **8 IND prosedürü**, **4 G kapısı**, **16 J görevi** ve **16 personel alanı**.
- **12 sorun rotası** için özgün v18 ID/slug sağlanmadığı için **12 adet işlevsiz, açıkça kaynak bekleyen kayıt yeri** var. Aynı nedenle 16 rehber, 7 kurumsal sayfa ve 8 belgelistin gerçek başlıkları uydurulmadı. Sayacı tamamlanma sanmayın.
- Altı dilde (`tr/nl/de/en/ar/ru`) **arayüz navigasyonu taslak çevirileri** ve Arapça RTL; hukukî metinler yalnız Türkçe özgün kaynak, insan çeviri onayı hâlâ yok.
- L4 belge koşul şeması, müşteri triyaj/kontrol için sentetik durum makinesi, erişim/rol/içerik güncelliği kuralları ve IND/kurum adapterleri **varsayılan kapalı** politikaları.
- `preview/LARENLEX_L4_BUTUN_UYGULAMA_ETKILESIMLI_ONIZLEME.html`: 14 modül, 69 alt grup, 453 işlev, 17 hizmet, 14 kitle, 12 eksik özgün rota, 16 personel ve 6 taslak arayüz dili.

## Kanıt sınırı

Kaynakta yer alan hizmet/slug adları, tarihî portal rotalarına referanstır; portal kodu, bilgisi veya izinleri Android'e aktarılmamıştır. Görünen buton ve katalog nesneleri gerçek Android API, hukukî yetki, canlı uzman, güncel resmî kurum formu, APK veya çalıştırılmış PostgreSQL değildir. Hukukî, terminolojik, yerel meslekî ve erişilebilirlik kabulü kaynak/cihaz/uzman kanıtı gerektirir.

## Yeniden üretim

Yetkili yerel ortamda: `python3 tools/build_l4_catalog.py --manual /secure/LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md`, `python3 tools/build_preview.py`, `python3 tests/verify_l4.py`. Üçüncü komut, bir kere gerekli bütünlük/politika/Chromium kontrolünü yürütür. `java`, `javac`, Chromium ve Playwright burada mevcut; Android SDK/ADB/Gradle cihaz kabulü yok.

`evidence/L4_OPEN_CONDITIONS_AND_RETRIES.json` geçmiş seviyelerden devreden eksiklerin iki yeni kaynak denemesini kaydeder. Yeni seviyeye geçiş yalnız kullanıcı onayıyla; gerçek yayın/onay/para/temsil ayrıca yetkilendirme ile olur.
