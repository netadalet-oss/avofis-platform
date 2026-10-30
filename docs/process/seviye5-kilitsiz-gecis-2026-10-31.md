# AVOfis — Seviye 5 açık kullanıcı onayıyla başlatıldı

**Güncel onay (31 Ekim 2026):**
> AVOfis projesinde Seviye 4'ten Seviye 5'e geçişi açıkça onaylıyorum. Açık ve başarısız işleri koruyarak Seviye 5 çalışmalarını başlat. Her sonraki seviye geçişinden önce yeniden onayımı iste.

## Operasyonel durum
- **Seviye 4 → 5 geçişi: ONAYLANDI ve yürürlüğe alındı.**
- **Seviye 5: OPERASYONEL AKTİF**; Seviye 4 tarihsel olarak tamamlandı denmez. Seviye 4'ün gerçek yüzdesi bilinmiyor.
- **Seviye 6: YETKİ VERİLMEDİ.** 5→6 dahil **HER** sonraki seviye geçişinden önce ayrıca yeni ve açık kullanıcı onayı alınması zorunludur. “Devam et” tek başına geçiş izni değildir.
- %80 hesabı geçişi **kilitlemez**, fakat geçiş kullanıcı onayı gerektirir. İlerleme yüzdesi ancak özgün iş/kabul kanıtlarıyla hesaplanabilir.
- Her tekil iş için **bir seviyede en fazla iki gerçek icra denemesi** yapılır; tur artışı bu limiti sıfırlamaz. Başarısızlık veya kanıtlanmış blokaj halinde bir sonraki seviyeye geçiş için iş **aday olarak** korunur; gerçek geçiş ancak açık onayla yapılır.
- Yedi RLS güvenlik bulgusu Seviye 5'e **AÇIK** devredildi; gerçek düzeltme **0/7**, eski seviyede kanıtlı gerçek deneme **0**. Devri, üretim güvenlik sorununun çözüldüğü veya gerçekten iki kez denendiği anlamına gelmez.
- GDPR ve DSA kapsam incelemeleri Seviye 5'in doğrulanabilir **hazırlık/analiz** işleridir. Hukukî uygunluk, kullanıcı verisi işleme sözleşmesi veya denetim kabulü otomatik sağlanmış sayılmaz.
- 63 alt program, 63 modül, 973 iş, 973 teknik sözleşme, 154 akış ve 18 çözülmemiş karar korunur. Eski Seviye 4/5 özgün görev kimliklerine eşleştirme yapılmadı.
- Business.gov.nl'den türetilmiş 24 koşullu Hollanda/AB kontrolü ilgili olan bütün çalışmalarda sürer.
- Ana dala birleşim, canlı RLS/DDL, üretime dağıtım, iş sözleşmesi, hukukî tescil veya mali işlem için ayrı yetki ve doğrulama kapıları vardır.

## Tarihsel düzeltme izi
- İlk Seviye 5 “aktif” beyanı kullanıcı ön onayı alınmadan yapılmış ve geri çekilmişti.
- **Bu kez açık kullanıcı onayı alındı; işlem bu yeni kanıta dayanılarak yürütüldü.** Önceki izinsiz beyan geriye dönük onaya dönüştürülmedi.
- GitHub PR #7 bir **taslak değişiklik inceleme kaydı** olarak açık kalır; operasyonel Seviye 5'in onayı PR birleştirme onayı değildir.

## Sonraki seviye için zorunlu onay sorusu
Seviye 5'teki işler ve açık/devreden konular özetlenecek; **“Seviye 6'ya geçişi onaylıyor musunuz?”** sorusuna açık olumlu yanıt gelmeden Seviye 6 açılmayacak.
