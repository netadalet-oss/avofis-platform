# AVOfis | Seviye 5 kademeli operasyonel geçişi
**Kaynak:** Kullanıcının 31 Ekim 2026 tarihli son talimatı.

> “Bir konuda ilerleme sağlanamıyorsa onu her seviyede en fazla iki kez dene sonra diğer sevide tekrar denenmek üzere bırak. Talimat tamamlanıncaya kadar böyle ilerle. Yani seviye geçişleri kilitlenmesin.”

## Geçerli yeni kural
- Seviye 5 **operasyonel çalışmaya açıktır**. Eski Seviye 4 eksiklikleri, özgün iş listesi veya ölçülemeyen %80 oranı bu geçişi engellemez. Seviye 4 tarihsel olarak tamamlandı denilmez.
- Aynı tekil iş, **bir seviyede toplam en fazla 2 gerçek deneme** alır. Seviye içi yeni tur açılması limiti sıfırlamaz. Daha eski “turda en fazla iki” kuralı, bu daha sıkı seviye limitine tâbidir.
- Gerçek bir icra denemesi yalnızca **iş kimliği, seviye, tur, 1/2 numarası, sonuç, kanıt ve açıklama** mevcutsa kaydedilir.
- İki başarısız denemeden sonra üçüncü deneme yapılmaz; iş kanıtıyla sonraki seviyeye devredilir. Özgün iş sözleşmesi/insan kararı/üretim izni gibi açık bir engel varsa, sıfır veya bir denemeyle de **BLOKAJ** gerekçesiyle devredilebilir. Engelin tespiti, başarısız yürütme denemesi sayılmaz.
- Sonraki seviyede tekrar en fazla 2 deneme hakkı vardır. Henüz kanıtlı başarı ve kabul yoksa, ilerleyen **her seviyede** iş tekrar gündeme alınır; kilitlenmez veya silinmez.
- Seviye genel tamamlanma %80 eşiği varsa yalnızca durum/izleme metriğidir; **geçiş önkoşulu değildir**. %80 aşıldığı kanıtlanmamış olsa da ilerleme sürer.
- İşin teknik testten geçmesi, özgün 973 işten birinin tarihsel kabulü olduğu anlamına gelmez. 63 alt program, 63 modül, 973 iş, 973 sözleşme, 154 akış ve 18 çözülmemiş karar korunur.
- Seviye geçişi, bir PR'ın ana dala birleştirilmesini, canlı DB migration'ı, ödemeyi, halka açık yayını veya hukuki tescili **yetkilendirmez**. Bu işlemler için ayrı izin ve kabul kapıları geçerlidir.
- Business.gov.nl'den türetilmiş 24 Hollanda/AB kontrolü, **ilgili olduğu ölçüde her seviyede** uygulanabilirlik/kanıt olarak izlenir. Bunlar 973 özgün işin yerine geçmez.

## Operasyonel açılış kanıtı
- **Kaynak:** 4. seviye (tarihsel tamamlanma oranı **bilinmiyor**, açık işler var).
- **Hedef:** 5. seviye (**operasyonel aktif**, tarihsel Seviye 5 özgün iş listesi elde edilmedi).
- **7 açık risk:** `RLS:public.applications`, `jobs`, `media_assets`, `office_members`, `offices`, `posts`, `topics`; önceki seviyede **0 doğrulanmış gerçek deneme**, sebep açık güvenlik/yetki politikası kararları ve canlı DB değişim izninin bulunmaması. Açık devredildi; çözülmüş değildir.
- **2 yeni operasyonel çalışma:** `UYUM:NL-11` (GDPR kapsam/kanıt analizi) ve `UYUM:NL-14` (DSA hizmet sınıflandırması). Uygulanma/uyum sonucu henüz doğrulanmamıştır.
- Kaynak destekleri: `docs/security/rls-live-baseline-2026-10-31.json`, `docs/compliance/hollanda-business-gov-tum-seviyeler-kontrolu-2026-10-31.md` ve kullanıcının geçiş talimatı.

## Önceki hükümlere üstünlük
Eski paket/README/devir talimatlarında yer alan “%80 sağlanmadan Seviye 5 açılamaz” ve “Seviye 5 için yeniden izin gerekir” ibareleri **tarihsel referanstır**. Kullanıcının daha sonraki, daha açık talimatı bu kapıları kaldırmıştır. Önceki belgeler delil bütünlüğü amacıyla değiştirilmemiştir.

**Uygulama sınırı:** Seviye 5 açmak, Seviye 4'ü tamamlandı ilan etmek veya canlı güvenlik sorunlarının giderildiğini iddia etmek değildir.
