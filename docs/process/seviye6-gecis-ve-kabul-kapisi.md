# AVOfis Seviye 6 — 5→6 onaylı, sonraki geçişler ön onaylı

**Onay:** Kullanıcının bir önceki “Seviye 6’ya geçişten önce yeniden açık onay isteyeceğim” ifadesine cevabı: **“Onay”** (31.10.2026). Bu cevap bağlamı açık biçimde 5→6 onayını gösterir. **Seviye 6 OPERASYONEL AKTİF.**

- Seviye 5 **tarihsel olarak tamamlandı** sayılmaz; özgün iş/kabul eşleştirmeleri ve %80 oranı mevcut değildir.
- **Seviye 7 için onay YOK.** 6→7 dahil her geçişte kullanıcıdan açık ön onay gerekir. “Devam et” tek başına geçiş izni değildir.
- Bir iş/seviye için **en fazla iki gerçek icra denemesi**. Geçişte tamamlanmamış işler kendiliğinden kapanmaz; önceki tüm denemeler ve kanıtlar korunur. Kaynak eksikliğiyle devredilen işlerde sahte başarısız deneme yoktur.
- 7 canlı RLS riski, 2 koşullu GDPR/DSA kapsam incelemesi ve Seviye 5'te kod/CI başarılı ancak henüz birleştirilmemiş portal yetki düzeltmesi **açık devredildi**. Bunun üretim RLS düzeltmesi olduğu iddia edilmez.
- Seviye 6'nın **yeni operasyonel denetim işi**, `portal/src/app/page.tsx` üzerinden `public.pages` CMS kalıcılığıdır. Salt-okunur gerçek Supabase katalog sorguları `pages.slug` için **UNIQUE** kısıtı ve bir `home` kaydı doğruladı. Eski portal `upsert({slug:"home",...})` çağrısının `onConflict:"slug"` tanımlamaması, varsayılan PK çatışması denemesi üzerinden uygulama hatasına yol açabilir; gerçek HTTP sorunu henüz doğrulanmadı. Kullanıcı yazma/DDL denemesi yapılmadı.
- Teşhis ve arayüz düzeltmesi, **kabul ve canlı uygulama değil**; kaynak/CI kanıtlarıyla test edilmeli.
- 973 özgün iş, 973 teknik sözleşme, 154 akış, 63 modül, 18 tarihsel açık karar ve tüm seviyelere koşullu Hollanda/AB uyum taraması korunur.
- GitHub geliştirme PR'ı **taslak**; Seviye 6 geçiş onayı **main merge, production dağıtımı, canlı DB yazımı, KVK kaydı veya başka etkili işlem için izin değildir**.

Önceki Seviye 5 kayıtları delil bütünlüğü nedeniyle değiştirilmeyecektir. Yeni seviyeye ait kayıtlar `docs/process/seviye6-...` altında tutulur.
