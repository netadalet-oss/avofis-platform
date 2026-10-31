# LarenLex Android — L1 bütün uygulama veri/erişim geliştirme teslimi

**Tarih:** 1 Kasım 2026  
**Seviye:** L1 bütün ürün geliştirme döngüsü  
**Kapsam:** 14 ana modül, 69 alt grup, 453 kaynak A2 işlev kimliği.  
**ÖNEMLİ:** Bu paket bağımsız Android `develop` commit'i, Android APK'sı, PostgreSQL RLS canlı testi, gerçek Auth, hukukî kabul veya yayın değildir.

## Hangi kod gerçekten çalıştırıldı?

- `src/catalog.py`: özel talimatnamenin 453 A2 kimliğinden 14/69 katalog; kaynak CSV yanında GitHub'daki L0 önizleme JSON'undan da okuyabilir.
- `src/domain_registry.py` + `evidence/L1_ALL_MODULES_DOMAIN_REGISTER.json`: 14 sistemin her birine önerilen bir L1 kayıt türü, risk/sahiplik, tenant/matter/role alanları ve erişim sınırı. **Özgün 52 A4 nesnesinin kanonik isimleri değildir.**
- `sql/001_sqlite_synthetic_schema.sql` + `src/l1_store.py`: gerçek SQLite belleğinde çalıştırılmış, sentetik, şifresiz, sunucu tarafı kontrol benzetimi. Tenant+principal/matter bileşik FK, müşteri sahipliği, personel modül/dosya ataması, sentetik MFA, session generation/revoke, optimistic concurrency, soft delete, statik belge referansı, süresi dolan HMAC grant ve sentetik audit HMAC zinciri.
- `sql/002_postgresql_rls_disposable_draft.sql`: **çalıştırılmadı**, disposable DB adı korunmuş, beş tablo `FORCE RLS` ve `USING(false)`/`WITH CHECK(false)` taslak. Gerçek issuer ve denetlenmiş PostgreSQL motoru olmadan CRUD izni yoktur.
- `tests/`: gerçek yerel çalıştırılmış 39 otomatik test. Test içi rollerde kişi kimliği, hukukî yetki veya üretim bağlantısı yoktur.
- `preview/LARENLEX_ANDROID_L1_BUTUN_UYGULAMA_ONIZLEME.html`: tek HTML, çevrimdışı, 14 sistem + 69 grup + 453 işlev + 16 personel alanı; ayrıca L1 veri modeli ve sentetik erişim simülatörü. `preview/LARENLEX_ANDROID_L1_MOBIL_EKRAN.png`/`...MASAUSTU_EKRAN.png` tarayıcı görüntüleridir.
- `evidence/L1_CARRIED_L0_TWO_ATTEMPTS.json`: L0 engellerinin her birinde iki yeni salt-okunur deneme ve sonuç.

## Yerel yeniden test

```bash
cd <paket-kökü>
python3 -m unittest discover -s tests -v
python3 -O -m unittest discover -s tests -q
python3 -m compileall -q src tests
```

Yerel testler giriş/çıkış ve auth sağlayıcı çalıştırmaz; 453 işlevi API/UI olarak tek tek geliştirilmiş saymaz. Her işlev ID'si ortak kayıt sözleşmesine **sentetik test amacıyla** bağlanır. Önizleme içindeki izin/ret simülatörü de gerçek sunucu güvenliği değildir.

## GitHub sınırı

Bağlı `netadalet-oss/avofis-platform` deposundaki `work/larenlex-android` dalında L1 bütün-uygulama önizlemesi, 14 modüllük veri sözleşmesi, varsayılan-ret RLS SQL taslağı, sentetik SQLite şeması ve bağımsız çevrimdışı testler bulunmaktadır. Bu paketteki **genişletilmiş yerel Python referans modeli ve 39 testin tamamı** GitHub'daki CI ile aynı HEAD'de çalıştırılmış olarak iddia edilmez; ZIP bunların eksiksiz yerel teslimidir.

Gerçek A5.18 Android bundle'ı / A5.14 devir, Android SDK/Gradle/ADB, izole PostgreSQL cluster, gerçek Auth sağlayıcı, CI run-id, hukukî ve teknik bağımsız kabul erişilebilir değildir. L1 geliştirme döngüsü kapsam üzerinden teslim edilirken bunlar L2'ye açık borç olarak taşınır; her yeni seviyede en az iki yeni kontrol yapılır.

**Üretim verisi, gerçek müşteri bilgisi, uygulama imza anahtarı ve yayın yetkisi kullanılmadı.**