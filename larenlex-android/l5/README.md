# LarenLex Android — L5 entegrasyon ve kanıt (bağımsız yerel çalışma)

## Kaynak ve seviye
- Bağlayıcı ana kaynak: `LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md`, LX-052–LX-058; L0–L4'ün açık maddeleri taşınmıştır.
- Uygulama kimliği: `nl.larenlex.app`. AVOfis Portal ve diğer ürünlerle kimlik, müşteri verisi, veritabanı ve API paylaşımı yoktur.
- L5 yatay kapsam: 14 ana sistem, 69 alt grup, 453 kaynak A2 işlev kimliği, 102 A4 tarihî operasyon.
- Android kaynak iskeleti L4'ün yalnız LarenLex için geçerli kaynaklarından türetilmiştir. Talimat dışı eski portal ekranları/sunucuları alınmamıştır.

## Gerçekte uygulananlar
- `server/l5_loopback.py`: dış ağa açılmayan `127.0.0.1` üstünde, geçici sentetik SQLite verili HTTP/WGSI bütünleşme testi. 14 modülde 453 sentetik kayıt oluşturma ve her biri için farklı-tenant erişim reddi sınanır. **453 farklı gerçek işlev uygulandı denmez**; A2 kimlikleri örnek kayıtlarda test veri referansıdır.
- `server/l2_api.py`: mevcut sentetik API'yi gerçek WSGI giriş akışı için düzelttik. `Content-Length+1` okuma hatası ağda takılıyordu; tam belirtilen boy okunur. Gerçek backend/JWT/Auth, PostgreSQL ve diğer kurum servisleri yoktur.
- `android/app/src/debug`: `10.0.2.2` emülatör adresine yalnız **debug** derleme için ayrı kaynak seti ve İnternet izni; native GET istemcisi redirect, cache, endpoint, MIME, boyut, 401 koşullarında fail-closed. Kullanıcı veya üretim jetonu kullanılmaz. Bu kod henüz Android SDK'da derlenmedi veya cihazda çalıştırılmadı.
- `android/app/src/main`: release ağ izni yok; 14 modüllü L5 yerel kanıt ekranı gerçek kabul ile yerel sentetik testleri açıkça ayırır. Gerçek WebView köprüsü ve token aktarımı eklenmedi.
- `preview/`: L4'ün kanonik hukukî katalog, belgeler, personel ve altı dil içeriği korunarak L5 14-modül entegrasyon/güvenlik panosu eklendi; önizleme tümüyle çevrimdışı.
- `evidence/L5_A2_A4_TRACE.json`: 453 sentetik pozitif/negatif test tasarım ID'si, 102 tarihî A4 kayıt ve **0** gerçek bağımsız kabul. LX-055 +46 eşiği sağlanmadı; sayı uydurulmadı.

## Tek kapsamlı doğrulama

```bash
python3 -m unittest discover -s tests -v
# Android SDK varsa ayrıca: cd android && gradle assembleDebug
```

Testler localhost gerçek HTTP soketi üzerinden çalışır; dış ağ, üretim kullanıcıları ve anahtarları yoktur. Android SDK/Gradle/ADB, PostgreSQL RLS, gerçek Auth ve hukukî onay testleri çalıştırılmadı. `evidence/L5_PREVIOUS_BLOCKERS.json`, önceki L4 kapanış listesindeki **10 grup için ikişer yeni sınırlı kontrolü** kaydeder. Bu kontroller sonuçsuz kalınca bağımsız kabulü yanlış biçimde yükseltmez.

## L5 kapanış/teslim
`evidence/L5_ACCEPTANCE_REGISTER.json` LX-052–LX-058'i ayrı işler. Yatay L5 **geliştirme döngüsü** tamamlanmış olabilir; **+46 gerçek işlev kabulü, L5 teknik kabulü, APK veya yayın** tamamlanmış değildir. L6 geliştirme seviyesine geçiş kullanıcı onayı ister. Bu repo ZIP ve Git bundle yeni oluşturulmuş **L5 sentetik kaynak snapshot**'ıdır; talimatnamedeki A5.18 bağımsız Git bundle'ı olduğu iddia edilmez.
