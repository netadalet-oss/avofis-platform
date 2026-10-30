# Seviye 5 — İlk Hollanda/AB uyum kapsam incelemesi (31.10.2026)

**Durum:** Kanıtlı ön değerlendirme; hukuki uyumluluk veya tarihsel iş tamamlanması değildir.

## UYUM:NL-11 — AVG/GDPR
Kaynak: https://business.gov.nl/regulations/protection-personal-data/

- `admin/src/lib/supabase.ts` ve `portal/src/lib/supabase.ts` Supabase Auth istemcileri, canlı `public.profiles` kişisel profil sütunları ve `public.applications` `user_id/cv_url` alanları kişisel veri içerebilen gerçek ürün tasarımını gösteriyor. Önceki canlı şema denetiminde `applications` için sıfır kayıt vardı; veri işlemenin gerçek kapsamı/ülkesi ve operatörü bundan türetilemez.
- Yedi tablodaki RLS açıklığı giderilmiş sayılmıyor. Ön yüzde CMS rol denetimi tek başına veritabanı yetkilendirmesi değildir.
- **Uygulanabilirlik: koşullu, hukuki kabul: AÇIK.** Veri sorumlusu/işleyen tanımı, kişisel veri kayıtları, hukuki dayanaklar, saklama/aktarım, hak talepleri, gerektiğinde DPIA ve negatif güvenlik testleri gereklidir.

## UYUM:NL-14 — DSA
Kaynak: https://business.gov.nl/regulations/digital-services-act/

- `api/src/modules/forum/forum.router.ts`, `careers.router.ts` ve `messaging.router.ts` dosyaları, eldeki kaynakta yalnızca GET `/` eylem listesi döndürüyor. Bu iskeletler gerçek içerik paylaşımı veya hosting hizmetinin çalıştığını kanıtlamıyor.
- AB erişimi, kullanıcı üretimi içeriğin saklanması/kamusal görünürlüğü, hizmetin ekonomik ağırlığı ve aracılık türü belli değil; dolayısıyla `mere conduit/hosting/online platform/marketplace` sınıfı belirlenmemeli.
- **Uygulanabilirlik: koşullu, hukuki kabul: AÇIK.** Gerçek akış, kullanıcı şikâyet/ihbar, moderasyon, şartlar, iletişim noktası ve gerekli ek görevler somut kanıtla değerlendirilmeli.

Bu iki analiz, **gerçek icra denemesi veya başarı kaydı oluşturmaz**. Kapsam kararı olmadığı için diğer işlerin ilerlemesi durdurulmaz. Seviye başına azami iki gerçek deneme ve sonraki seviyeye kanıtlı devir ilkesi geçerlidir.

İlgili kullanıcı resmî başlangıç kontrol listesi: https://business.gov.nl/starting-your-business/preparations/to-do-list-start-a-company-in-the-netherlands/?_0=1&_1=2,8&_3=1&_4=1&_7=4&_9=1&_q=0&_c=2,4&_d=0&_e=0&_g=1&_l=a
