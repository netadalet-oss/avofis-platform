# LarenLex L6 — Şifreli yerel taslakta eski revizyonun reddi

**Tarih:** 2026-11-01. **Kaynak kapsam:** özgün LarenLex tekil ana talimatı LX-035 (eski sürüm, çökme/kurtarma), LX-032 (Android Keystore), LX-05/LX-06/LX-07 ve LX-12. Üretim veya bağımsız A6 kabulü değildir.

## Kaynakta gözlenen hata

Mevcut `SecureDraftVault.save()` metodu hesap bazında ayrılmış şifreli dosya adına yazarken `revision` değerinin yalnızca pozitif olmasını istiyordu. Aynı taslak için revizyon 5 mevcutken revizyon 4 veya yine 5 gönderilmesi yeni ciphertext oluşturup eski dosyayı değiştirebilirdi. Önceki hesap ayırma düzeltmesi bu **revizyon/ezilme** sorununu kendi başına kapatmıyordu.

## Kaynak düzeltmesi

- Yeni saf Java `DraftRevisionPolicy` ilk taslak için **revizyon 1**, sonraki kayıtlar için yalnızca **mevcut+1** bekler; bozuk, kısa, gereğinden büyük, yanlış `LLX3`/GCM-IV başlığına sahip eski dosyada kaydetmeyi reddeder.
- Var olan dosyanın başlığı güvenilir kabul edilmez; değiştirilmeden **önce** `SecureDraftVault.read()` ile mevcut ciphertext ve önceki AAD/revizyon AES-GCM altında doğrulanır. Eski anahtar geçersizse otomatik sıfırlama/migrasyon yoktur.
- Aynı uygulama işlemi içindeki taslak kaydetmeleri ortak kilitle sıralanır; ciphertext dosyası benzersiz `.pending` dosyasına yazılır ve `ATOMIC_MOVE` (desteklenmiyorsa başarısızlık) ile değiştirilir. Eski, kapsamlandırılmamış tarihî dosyalar silinmez veya kimliği tahmin edilerek taşınmaz.
- Yeniden okuma, yeni dosyanın beklenen revizyonla GCM doğrulamasından geçtiğini kontrol eder.

**Kısıtlar:** Bu, uygulama süreci içi tutarlılık kuralıdır; Android çoklu süreç, güç kesintisi, dosya sistemi garantileri ve donanım Keystore davranışı için gerçek cihaz doğrulaması yoktur. `save()` henüz canlı oturum, gerçek kullanıcı yetkisi ve sunucu revizyon kontrolüne bağlanmamıştır. `.pending` kazaları için kimliği doğrulanmış kurtarma ve gerçek Android cihaz regresyonu ayrıca gerekir.

## Çalıştırılan denetim

- `python3 -m unittest discover -s tests -v`: **17/17**, yerel Python + saf JDK testleri; yeni iki Python testi ve Java'da 14 koşul.
- `javac` ile gerçek `SecureDraftVault.java`, `DraftRevisionPolicy.java` ve `DraftFileNamespace.java` dosyaları yalnız geçici **Android API taklitlerine karşı** kaynak düzeyinde derlendi; bu gerçek `assembleDebug` değildir.
- Android SDK, Gradle ve ADB bu ortamda bulunmadığından **APK ve A6 12 cihaz senaryosu 0/12**.
- 14 modül/69 grup/453 kaynak işlevin, 102 tarihî A4 kimliğinin ve 594 AVOfis R referansının kanonik kapsamı değiştirilmedi; **453 bağımsız işlev kabulü 0/453**.

## İz / açık koşullar

`LX-035`, `LX-032`, `LX-06.G02.F02`, `LX-07.G04.F01`, `LX-12.G04.F03`. İşlemler hiçbir gerçek kişi verisini, üretim anahtarını, ödeme/mahkeme/IND servisini ve `main` dalını kullanmaz. A5.18 özgün bağımsız Git geçmişi ve A6/A7 bağlayıcı kanıt gereksinimleri değişmez.
