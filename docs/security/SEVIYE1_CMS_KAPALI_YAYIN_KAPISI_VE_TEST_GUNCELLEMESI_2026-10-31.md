# AVOfis — CMS yayın ve okuma güvenlik kapıları (31.10.2026)

**Kaynaklar:** v18 R-524 / R-527 / R-580 / R-587, B01/B02, çok seviyeli çalışma kararı.

Tarihî Seviye 4–7 CMS arayüz testleri dört canlı kayıt eylemi ve varsayılan önizleme bekliyordu. Yeni Seviye 1'de `admin/src/app/cms/page.tsx` bilgi verme amaçlı **kapalı** ekrandır: giriş/veri formu, düzenleme ve yayınlama işlemi sunmaz. Bu nedenle tarihî testlerin yeni arayüz için beklentileri güncellendi; **eski testlerin özgün sürümleri Git geçmişinde saklanıyor**. İzin kontrolü ve atomik CMS güncelleme yardımcılarının saf ve negatif testleri korundu; ancak bu yardımcılar kapalı CMS ekranından çağrılmıyor.

Ek güvenlik daraltması: public ana sayfa ve menü artık bağımsız içerik/yetki onayından geçmemiş `pages` veya `site_settings` kayıtlarını otomatik sorgulamıyor. `PUBLIC_CMS_CONTENT_READER_ENABLED=false`, ortam değişkeninden açılamayan kod kapısıdır. Kamu kaydı ve CMS yazma yine kapalıdır.

**Dikkat:** Uygulama düzeyinde kapatma canlı Supabase tablo RLS/GRANT veya doğrudan REST erişimini **düzeltmez**. B01/B02 dahil B01–B18 açık, gerçek kullanıcı kaydı kapalı, bağımsız kabul 0/594. CI, HTTP ve staging kanıtı ayrı değerlendirilir; hukuki/dilsel insan yayın onayı verilmiş sayılmaz.

## Ek kod güvenliği — doğrudan CMS yazmalarının kaldırılması

Önceki sürümde kamu ana sayfasında iki ve menüde bir `supabase.from(...).upsert(...)` çağrısı, sabit kapının arkasında dahi kaynak kodda bulunuyordu. Bu **üç doğrudan istemci yazma çağrısı kaldırıldı**. İlgili olay işleyicileri sunucuya ulaşmadan güvenli bilgilendirme mesajı gösterir. Tarihî yardımcı işlevler ve saf atomik güncelleme testleri kodda ayrı kalır; kamu bileşenlerinden çağrılmaz. Bu önlem B01/B02 veritabanı ACL ve RLS düzeltmesi değildir.
