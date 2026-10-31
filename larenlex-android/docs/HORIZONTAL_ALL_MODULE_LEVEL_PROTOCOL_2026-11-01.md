# LarenLex Android — Bütün uygulamayı kapsayan yatay seviye geliştirme protokolü (2026-11-01)

## Kullanıcının en yeni açık kararı
Her seviye, yalnız bir teknik alt sistemle sınırlanmaz: **LarenLex'in 14 ana sisteminin tamamında** ilgili seviyenin derinliği uygulanır. İlk seviyeden son seviyeye aynı 14 sistem, 69 alt grup ve 453 A2 işlevi izlenir; her döngüde kapsam yatay olarak korunurken ispat ve uygulama derinliği artar. Mevcut L0–L6 görev adları ve 62 LX görevinin özgün kabul koşulları **silinmez**: her seviye kendi uzmanlık odağını taşır, ancak modüllerin geri kalanı o seviyede dışarıda bırakılmaz.

| Seviye | 14 sistemin tamamında ana derinlik |
| --- | --- |
| L0 | Ürün kimliği, modül envanteri, temel gezinim, kullanıcı rotaları, güven sınırları ve bütün-uygulama önizlemesi |
| L1 | Her sistemin veri nesneleri, ownership/tenant/rol erişim sınırları, RLS ve taslak yaşam döngüsü |
| L2 | Her sistemin API/kimlik/oturum sözleşmesi, sahte veriyle işlem durumları, negatif güvenlik kontrolleri |
| L3 | Her sistemin Android arayüzleri, WebView/native sınırı, Keystore hazırlığı, erişilebilir cihaz akışları |
| L4 | Her sistemin hukukî rol/ülke/kurum/doğruluk, altı dil/RTL ve belge/personel ayrıntıları |
| L5 | Her sistemde entegrasyon, veri sınırı, negatif test, kanıt ve bağımsız kabul kontrolleri |
| L6 | Her sistemde cihaz/performans/operasyon, imza ve yayın hazırlığı, eksik kabulü dürüstçe gösteren teslim |

## Önceki eksik ve başarısız işler
- Her seviye sonunda açık işler tekil kimlikle, ilk hata nedeni ve koşulu, en az **iki yeni kontrol denemesi**, sonuç, blokaj sahibi, kod SHA ve güncel durumla sonraki seviyeye taşınır.
- İki deneme aynı çevresel engel nedeniyle başarısızsa **yalnız ilgili iş HARICI_KOSUL/DOGRULANAMADI** olur; başka modüllerin ve seviyenin çalışma döngüsünü engellemez. Deneme sayısı yeni çalışma yapılmadan keyfî artırılmaz.
- Gerçek Android Git bundle, A5.14 devir, SDK/Gradle/ADB, bağımsız PostgreSQL, CI ve hukukî kabul eksikliği ayrı tutulur; sentetik işlemler gerçek üretim diye sunulmaz.
- Teknik/bilişsel kabul kapıları ilerleme kapısından farklıdır. Bütün-uygulama düzeyinin `progress_cycle_done` olması, ilgili kabul koşullarının `independently_accepted` olduğunu göstermez.
- Güvenlik, gerçek müşteri verisi, üretim DDL/DML, imzalama, mağaza yayını, gerçek ödeme ve resmî/meslekî hukuk işlemleri, hızlı devam talimatı veya seviye onayıyla otomatik yetkili hale gelmez.

## Her seviye teslimi
1. 14 ana modülün tamamını ve 16 personel alanını görünür tutan **tek bütün-uygulama önizlemesi**. Kod kaynağı yoksa dürüstçe "çevrimdışı tasarım/prototip" denir; gerçek APK denmez.
2. Modül başına `planned/implemented/tested/technical_accepted/legal_accepted/released` ayrı kanıt durumu, mevcut SHA ve varsa gerçek test ID.
3. Her modülün bir önceki seviyeye göre gerçek farkı, 62 görev/A2/API/R izine bağlıdır; boş/uydurma bağlantı kurulmaz.
4. Açık borçlar ve yeni seviyede en az iki yeniden deneme planı.
5. **Sadece seviye geçişinde** kullanıcı arayüzünden olumlu onay butonu; açık olumlu kullanıcı eylemi olmadan yeni seviyede otomatik yazma/başarı beyanı yok.

## 60 saniye sessizlik şartının teknik sınırı
Bu sohbet kullanıcı cevabı olmadan arka planda kesintisiz sürmez. **Bir dakikalık sessizliği otomatik onay olarak algılayıp yeni seviye başlatma teknik olarak sağlanamaz.** Onay butonu yeni bir kullanıcı mesajı ile sonraki seviye çalışmasını başlatır; sessizlik kendiliğinden Git commit veya yayına dönüşmez.

## L0 mevcut kanıt durumu
Kaynak ZIP'teki 14 sistem, 69 alt grup, 453 A2 kimliği / 102 API envanteri esas alınmıştır. Yerel tüm modülleri gösteren, 16 personel alanı ve temel güvenli kullanım rotası içeren etkileşimli HTML önizleme hazırlanmıştır. Bu **tasarım/iz kanıtıdır**, gerçek Android source HEAD ve APK olmadığı için bağımsız teknik kabul yoktur. L0 içindeki çözülmemiş doğrulamalar yeni seviyede yinelenir.
