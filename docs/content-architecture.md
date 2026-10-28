# AVOfis içerik ve arayüz düzeni — 27 Ekim 2026

## İçerik hiyerarşisi
**Ana sayfa:** Gerçekte hazırlığı yapılan hizmetin açık tanımı; kısa kapsam listesi; somut hizmet kartları; başvuru aşamaları; meslekî sınırlar; kuruluş bilgisi.
**Hizmetler:** Altı hizmetin kapsamı, sınırları ve yetkili uzman gereksinimi. Ana sayfa ile aynı dil ve hizmet sözlüğü kullanılır.
**Bilgi merkezi:** İlgili devlet kurumlarına doğrulanabilir bağlantılar; hizmet satışıyla karıştırılmaz.
**Gizlilik:** Nihai GDPR bildirimi olmadığı açıkça belirtilen hazırlık metni.
**Başvuru:** Şirket faaliyete geçmeden kapalı, asgari veri ilkesine uygun form.
**Müşteri alanı:** Yetkilendirilmiş dosya, sözleşme, belge, mesaj ve ödeme akışı.
**Yönetim:** Yetkili personel dosya yönetimi. Kodun varlığı canlı kullanıma onay değildir.

## İçerik ilkeleri
- İnsanların ne alacağı anlaşılsın: gerçek belge listesi, kapsam ve ücret; soyut slogan, kanıtsız başarı iddiası ve uydurma istatistik yok.
- Avukatlık, noterlik, yeminli tercüme ve temsil yetkileri şirketin kendi yetkisi olarak sunulmaz.
- Dil geçişinde başlık ve açıklamaların anlamı eşdeğerdir.
- Tipografi: H1 30–44px; H2 26–36px; kart başlığı ~16px; gövde ~13–15px; 3 eşit kolon ve 44px dokunma alanları.
- Gold #dfbf59; parlak gold #f0d56d; üç lacivert #030A22, #04102C, #071738; kart gradyanı kullanıcının belirlediği değerlerdir.
- Legacy araştırma/kariyer/forum sayfaları silinmez, ancak halka açık hizmet menüsünde yanlış işlev algısı yaratmamak için modül yolu bilgi merkezine; eski dashboard müşteri alanına yönlenir.

## Lansman öncesi
Ön başvuru, dosya, ödeme ve sözleşme işlevlerinin canlıya alınması kuruluş/çalışma hakkı, meslekî yetki, veri sorumlusu bilgileri, bilgi güvenliği, GDPR ve tüketici sözleşmesi onaylarına bağlıdır.

Test planı: CI build ve TypeScript lint; Playwright ile 320,375,390,768,1024,1440px ekranlarda menü, overflow, başlık, ikon hizası; anonim/müşteri/personel RLS testleri.
