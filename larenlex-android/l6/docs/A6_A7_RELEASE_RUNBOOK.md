# LarenLex Android — A6/A7 insan onaylı cihaz ve yayın şartnamesi

Kanonik dayanak: LX-059–LX-062. Paket kimliği `nl.larenlex.app`. Seviye L6 geliştirme izni gerçek A6 cihaz kabulü veya A7 mağaza yayınlama yetkisi değildir.

## A6 (henüz yürütülmeyen gerçek cihaz matrisi)
- Android API 26, 29, 33, 35 emülatör/fiziksel cihaz; kurulum, güncelleme, uygulama yaşam döngüsü, çevrimdışı/çevrimiçi geri dönüş.
- Kullanıcı seçimiyle DOCX/PDF, hatalı dosya yolu, izin iptali, kayıp Android Keystore anahtarı, yeniden yetkilendirme, oturum ve başka tenant veri reddi.
- TalkBack, 320 dp, %200 yazı, odak sırası, en az 48 dp dokunma hedefi; TR/NL/DE/EN/AR/RU arayüzü ve Arapça RTL. Hukukî çeviriler ayrıca insan tarafından onaylanır.
- Soğuk açılış 2.000 ms, ilk görünüm 1.000 ms, yerel gezinim p95 250 ms, bellek 256 MiB yalnız hedef; cihazda **ölçülmedi**.
- Gerçek kabul için cihaz modeli, API, aynı kaynak HEAD, APK SHA-256, test zamanı, testçi ve negatif/pozitif sonucu kanıtlandır; başarısız/yürütülemeyen testleri 'PASS' sayma.

## A7 (ayrı eylem bazlı yetki)
- Production signing key, key alias, parola, keystore yedeği/rotasyonu ve mağaza hesabı kullanıcıda kalır; sohbet/public Git/ZIP'e eklenmez.
- Build hazırlığı, **gerçek imzalama**, **mağaza yüklemesi** birbirinden ayrı eylem onayına tabidir. İmzalı release, gerçek Play Console rollout veya kamu URL'si burada gerçekleştirilmedi.
- Gerçek Auth, PSP, IND, mahkeme ve diğer resmî kuruma bağlanmak ayrıca profesyonel hukuk yetkisi, veri sorumlusu, tedarikçi/kurum ve ürün sahibi izni, G1–G4 ile bağımsız backend kontrolleri gerektirir.

## Doğrulanmış yerel kapsam ve açık durum
L6 yerel kaynak denetimi: 8 Python testi, 8 saf-Java politika koşulu, 14 Android statik denetim; mobil/masaüstü çevrimdışı önizleme. 10 geçmiş engel grubunda ikişer yeni sınırlı kontrol yapılmıştır. **Gerçek APK, Android SDK/ADB, cihaz sonuçları, gerçek PostgreSQL/IdP ve hukukî kabul yoktur.**

Tam kaynak, testler, iz ve doğrulanmış ZIP/SHA-256 manifesti sohbet teslim paketindedir. GitHub L6 dizinindeki Android projesi önceki L5 kaynak bloblarını özgün SHA'larıyla yeniden kullanır.
