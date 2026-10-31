# AVOfis — her seviyede en az 10 yüzde puan doğrulanabilir portal gelişimi

**Bağlayıcı yeni kullanıcı talimatı (31.10.2026):**
> Daha kapsamlı ve daha hızlı çalış, bir seviye tüm portalı en az yüzde 10 ileri taşımalıdır ve bir sonraki seviyeye kadar durmadan çalışmalısın. İlerlemeyi böyle ayarla.

## Uygulama ilkesi
1. Her seviyede **gerçek kullanıcı akışları** geliştirilecek; teknik güvenlik, süreç kayıtları ve CI test sayısı tek başına **ürün ilerlemesi** olarak sayılmayacak.
2. Her seviyenin başlangıcında hem yeni işlevlerin **sabitleştirilmiş kabul senaryoları**, hem eski eksikler kayda geçecek. Bir iş başarısız/engelli ise aynı seviyede en fazla **iki gerçek icra denemesi** yapılır ve sonraki seviyeye **açık** devredilir.
3. Tüm portalın özgün 973 işe eşlenmiş tarihsel iş listesi henüz erişilebilir olmadığı için **gerçek tamamlanma yüzdesi BİLİNMİYOR**. Bu boşluk rakamla doldurulamaz. İlerlemeyi ölçmek için şimdilik 12 kullanıcı alanı × 5 davranış = **değiştirilemez 60 kullanıcı senaryosu referans kapsamı** kullanılır. Referans kapsamın tam 63-modül kapsamı ile aynı olduğu **iddia edilmez**.
4. Referans kapsamda her yeni, farklı ve kanıtlı kullanıcı davranışı 1/60 = 1,67 yüzde puan **kaynak-kod + otomatik test düzeyinde ilerleme** olarak kaydedilir. Her seviyenin **hedefi en az 6 yeni senaryo = 10,00 yüzde puandır**. Bu, **tüm portalın gerçek tamamlanma yüzdesi** olarak sunulamaz.
5. Her senaryo ayrı durum taşır: `UNKNOWN_OR_NOT_VERIFIED` → `NEW_CODE_WITH_TESTS_PENDING_LIVE_ACCEPTANCE` → `STAGING_BROWSER_ACCEPTED` → `PRODUCTION_ACCEPTED`. Sadece test veya UI ekranı, son iki kabulün yerine geçmez. Kayıtlar yaşanmış test kanıtı olmadan ilerletilemez.
6. Seviyenin hedefi **kod açısından** 10 puana ulaştığında bile canlı/staging kabulü ayrıca açıklanır. Asıl tarihsel Seviye Tamamlanması için özgün iş kabulü gerekir; o yoksa **tamamlanma yüzdesi null** kalır.
7. Aynı eski işte iki deneme dolmuşsa orada durulur ve sıradaki işte ilerlenir; **bir sonraki seviyeye geçmek için kullanıcı açık onayı zorunludur**. %80 eski eşik ilerlemeyi durdurmaz. Yeni %10 işlev hedefi raporlanır, ancak hiçbir yetki kontrolü veya güvenlik riski geriye dönük kapatılmaz.
8. **Seviye 7 aktif. Seviye 8 onaysız.** Otomatik arka planda aralıksız çalışma yetkisi veya otomatik seviye açılışı yoktur; kullanıcıdan yeni mesaj geldiğinde iş kalanı üzerinde daha kapsamlı yürütme sürdürülür. Seviye 8 açılmadan önce yine açık onay alınır.
9. Canlıya dağıtım, DB değişimi ve birleştirme ayrı izin gerektirir. Hollanda/AB Business.gov.nl kontrol listesi koşullu gözetilir.

## Seviye 7 ilk ölçüm
Referans: `docs/process/seviye7-portal-60-kullanici-senaryosu-ilerleme.json`.

- 60 kullanıcı senaryosunun 13'ü bu turdaki yeni araştırma/çalışma alanı koduyla ve otomatik birim testleriyle **kod düzeyinde** sağlandı: **13/60 = %21,67 referans kapsamı**. Önceden var olan başka işlevlerin durumları `UNKNOWN`; dolayısıyla buradan toplam %21,67 tamamlanma veya tüm portalın %21,67 artması sonucuna gidilmez.
- İçtihat (4): kullanıcı metni ekle, ara, tamamını incele, sil.
- Mevzuat (4): kullanıcı metni ekle, ara, tamamını incele, sil.
- Çalışma alanı (5): görev ekle, tamamlandı durumunu değiştir, filtrele, sil, not ekle. Not silme de geliştirildi, ancak referans kapsamda ayrıca puanlanmıyor.
- Bütün yeni akışlar **yalnızca tarayıcı sayfasının anlık belleğinde çalışır**; hesapta saklanmaz. Canlı hukuk verisi veya AI analizi değildir. Gerçek kullanıcı tarayıcı/staging kabulü yapılmadı: **0/60**.
- Üst menüdeki kullanıcı metaverisi yönetici rolü ve doğrulanmamış UPSERT riski ayrıca düzeltilip test edildi; güvenlik düzeltmesi **işlevsel ilerleme payına sayılmadı**.
- Mevcut repo için herhangi bir **tam portal ilerleme yüzdesi doğrulanmadı**. Bu nedenle **Seviye 7 teslim onayı henüz önerilmemektedir**.

## Sonraki çalışmalar
Seviye 7'de kalan kullanıcı senaryolarının gerçek tarayıcı kabulü için staging ortamı/izinleri, hesap–veri kalıcılığı ve 7 açık RLS sorunu ayrıca değerlendirilmelidir. Birden çok bağımsız modül aynı turda geliştirilebilir; sahte teslim/yüzde kabulü veya onaysız Seviye 8 geçişi yapılamaz.
