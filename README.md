# AVOfis — Hukuk ve idarî işlemler platformu

AVOfis'in bağlayıcı kaynağı bağımsız AVOfis talimatnamesidir. Ürün kapsamı: 17 hukukî/idari hizmet, 14 hedef kitle, 12 sorun rotası, 16 kaynaklı rehber, 7 kurumsal sayfa, 8 belge kontrol listesi, 16 personel modülü; IND-01–08, J01–J16, P01–P10, B01–B18 ve T01–T13. Altı dil hedeflenir.

## Çalışma alanları
- `portal/`: kamu hizmet kataloğu, hukukî kaynaklar ve kişisel verisiz hazırlık; yetkili onay olmadan müşteri kabulü kapalı.
- `admin/`: 16 personel modülünün ana iş akışları ve kısıtlı CMS/denetim; gerçek kullanıcı erişimi bağımsız kimlik, MFA ve tenant kabulüne bağlı.
- `api/`: yalnız AVOfis işlemleri ve server-side güvenlik sözleşmesi.
- `database/`: tenant, RLS, güvenli belge ve resmî işlem kapıları; üretimde DDL/DML izinsiz uygulanmaz.
- `docs/program/`: kaynak R-001–594 eşlemesi, seviyeler ve farklı kabul kanıtları.

**Mevcut işaret:** Seviye 1 geliştirme. Kod/CI başarısı bağımsız teknik-hukukî kabul veya üretim yayını değildir. Gerçek dosya, ödeme, kurum gönderimi ve meslekî temsil, özel yetki ve güvenli staging doğrulanana dek kapalıdır.

**Dallar:** Portal ve uygulama ayrı çalışma dallarında geliştirilir. `main` birleştirme veya canlı yayın ayrıca eylem bazında onay gerektirir.
