# AVOfis — 12 seviyeli bütün ürün yatay derinleşme ve deneme devri (01.11.2026)

**Yeni açık kullanıcı kararı:** Her seviye AVOfis'in bütününü kapsar. Modüller farklı seviyelere bölünmez; her seviye **tüm** modüllerin bir önceki seviyeden daha ayrıntılı uygulamasıdır. İlk seviyede ana işlev/ekran, son seviyede bütün ayrıntılar, kabul ve yetkili yayın değerlendirmesi hedeflenir. Bu hüküm önceki güvenlik-ağırlıklı, modül modül bitirmeyi öne alan çalışma sırasını düzeltir.

**Ürün ayrımı:** Yalnız AVOfis Portal + AVOfis uygulama/API/admin; LarenLex Android gereksinimleri bu iş sırasına veya kabulüne aktarılmaz.

## Her seviyede değişmeden çalışılacak kapsam

| Kapsam | Sayı | Seviye 1'deki iş |
|---|---:|---|
| A0–A6 ana iş alanları | 7 | Tüm alanda ana ekran, asgari işlev/ret sınırı ve kaynak/test izi |
| AV-001–AV-101 | 101 | Her görev için en üst düzey gereksinim/kod/kabul kanıtı |
| R-001–R-594 | 594 / 33 × 18 | Özgün metinler ve kimlikler korunarak ana alt koşullar |
| Müşteri hizmetleri | 17 | Hizmet sayfası, kapsam, hazırlık, yetki sınırı |
| Hedef kitleler | 14 | Ayrı kitle/işlem yolu ve anlaşılır giriş |
| Sorun/işlem rotaları | 12 | Ülke, konunun türü, form/insan devir ayrımı |
| Personel modülleri | 16 | inbox, triage, matters, calendar, documents, pleadings, research, judicial, ind, messages, billing, payables, reporting, audit, people, settings |
| IND-01–IND-08 / G1–G4 | 8 / 4 kapı | Resmî aktarımı ve temsil yetkisini açmadan görünür iş akışı |
| J01–J16, P01–P10 | 16 / 10 | Kurum personel işlevleri ve özel kabul |
| B01–B18, T01–T13 | 18 / 13 | Engellerin bakım kaydı, kalite/milestone izlemi |
| Dil | 6 | TR/NL/DE/EN/AR RTL/RU; insan hukuk/dil onayı olmadan “tam” denmez |

**Birebir kanıt ilkesi:** Envanter satırının görünmesi veya ekranın derlenmesi bağımsız kabul değildir; ekran, işlev, izin, negatif test, gerçek staging, hukuk, dil, bağımsız kabul ve üretim kayıtları ayrı tutulur.

## Aynı ürünün 12 yatay derinleşme geçişi

| Seviye | Tüm modüllere aynı anda uygulanacak ilave derinlik |
|---|---|
| 1 | Bütün ana modül ekranları, temel işlev/ret sınırları, navigasyon ve önizleme |
| 2 | Her modülün veri alanları, kaynakları, güvenli işlem sözleşmesi |
| 3 | Ana işlemlerin izole pozitif çalışması |
| 4 | Geçersiz veri, rol/tenant, silme ve olumsuz akışlar |
| 5 | Her modülün detaylı çalışma yolları ve kullanıcı deneyimi |
| 6 | Modüller için bağımsız staging, Auth/Storage/rol-veri izolasyonu |
| 7 | Modüller arası iş akışı ve olay bütünlüğü |
| 8 | Her modülün altı dili, RTL ve erişilebilirlik ayrıntıları |
| 9 | Güvenlik/performans/geri alma/istisna dayanıklılığı |
| 10 | Finans, resmî kurum, hukuk ve uzman yetki adaptörlerinin onaylı sınırları |
| 11 | Tüm modüller için gerçek E2E, çok cihazlı ve bağımsız kalite denemeleri |
| 12 | Alt koşul ve kabul kapanışı, yetkili üretim/kurumsal yayın değerlendirmesi |

Her seviyenin güvenlik, hukuk, veri koruma ve kurum izinleri **başından itibaren** geçerlidir; bunlar “son seviyeye ertelenmiş” sayılmaz. Üstteki tablo yalnız geliştirme derinliğini gösterir.

## Devam ilkesi: blokaj bir modülü durdurur, bütün ürünü değil

1. Çalışma sırasında başarısız olan her somut iş `taskId`, `level`, `attempt`, `code SHA`, `CI run`, `environment`, `reason`, `next action`, `accepted?` ile **yazılır**; deneme yapılmamışsa sayılmaz.
2. Başarısızlık, maliyet/kimlik/dış uzman onayı gereksinimi veya en fazla birkaç denemeden sonra düzelmeyen hata ilgili **işi** `HARICI_KOSUL` / `REGRESSION` / `DOGRULANAMADI` hâline geçirir. **Başka modülde yatay geliştirmenin sürmesine engel değildir.**
3. Her **sonraki** seviyede geçmiş seviyelerden devreden her çözümsüz ya da daha önce başarısız kalmış kalem için **en az iki yeni ve birbirinden ayrı kanıtlı deneme** planlanır. Her yeni seviyede sayaç sıfırdan başlar; tarihî denemeler yeni deneme sayılamaz. Güvenli olarak yapılması mümkün değilse iki “denendi” kaydı uydurulmaz; dış koşul açık kalır, diğer işler sürer.
4. Bir seviyenin **yatay geliştirme kapsamı** ile **bağımsız R kabulü** ve **canlı üretim** ayrı metriklerdir. Yatay ana iskelet tamamlanabilir; RLS veya imza eksiği nedeniyle canlı yayın hâlâ kapalı olabilir.
5. Seviye sonu teslimi gerçek derlenmiş **portal + admin/uygulama önizleme**, modül başına en az bir görünür ana işlev/ret sonucu, tüm 101/594 kapsam kayıtları, negatif/pozitif test, CI SHA, başarısız işler, kalan dış şartlar ve güncel kabul defterini içerir. Kısmi geliştirme ekranı **seviye tamamlandı** başlığı alamaz.
6. **Onay:** Seviye tamamlanınca sohbet yanıtında açık bir **“Sonraki seviyeye geçişi onayla” butonu** sunulur. Bir sonraki seviyenin geliştirilebilir iç işleri sonraki açık kullanıcı yetkisi çerçevesinde devam edebilir; gerçek Git main/production/ödeme/kurum/müşteri işlemleri için ayrıca eylem izni gerekir.
7. **Bir dakika kuralının teknik sınırı:** Sohbet içinde kullanıcı etkileşimi yokken kod çalıştırma veya bir dakika sonra otomatik GitHub commit'i yapma garantisi veren arka plan saati yoktur. Buton ile kabul yolu uygulanır; sessizliği doğrulanmış kullanıcı tıklaması gibi kaydetmeyiz. Zamanlanmış otomasyon imkânı varsa, ayrıca onun gerçek çıktısı ve sınırlarıyla doğrulanır.

## Bağlanan uygulama kodu ve ilk kayıtlar

- `tools/process/whole-product-levels.cjs`: 12 seviyenin **her birinde** aynı 101 AV, 594 R, 7 A, 16 personel, 8 IND, 16 J, 10 P, 18 B, 13 T kapsamını üretir.
- `tools/process/whole-product-levels.test.cjs`: 12 aşamanın hepsinde kapsamı ve başarısız işin yeni seviyede ikişer kanıtlı denemesini test eder; sahte deneme/çift kanıt reddedilir.
- Portalın gerçek Next.js `/seviye-1-onizleme` rotası: 17 hizmet, 14 hedef kitle, 12 işlem ve yedi çalışma alanı dâhil tüm ürünün **şimdiki** görünümü. Admin tarafındaki eş rota 16 personel ve 14 API modül iskeletini gösterir. **Henüz son-seviye teslim değil.**
- Görülen gerçek test denemeleri: [Portal CI 41253677665](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253677665) (SSR ham HTML metin arama hatası); [admin CI 41253814753](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253814753) (Next Page'de geçersiz named export). Düzeltmeler yeni SHA'larda, yeni CI bağımsız değerlendirilecek.
- Daha önce açık yedi canlı RLS, sıfır Supabase development branch, tarihî `.env.local`, ana dal koruması, 64 kuruluş konusu, profesyonel izin/dil hukuku ve Vercel kısıtları **ayrı blokajlardır**. Önceki deneme başarıları “iki yeni deneme” yerine kullanılamaz.

**Bu kayıt seviye geçişi veya ürün kabulü değildir. Seviye 1 hâlâ `IN_PROGRESS`; bağımsız R kabulü 0/594 ve canlı kabulü 0/594.**
