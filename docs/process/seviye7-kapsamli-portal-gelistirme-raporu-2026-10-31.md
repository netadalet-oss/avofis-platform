# AVOfis — Seviye 7 kapsamlı portal işlev geliştirme raporu
**Tarih:** 31 Ekim 2026. **Durum:** Seviye 7 operasyonel aktif; Seviye 8 açık ön onaysız. **Kaynak:** GitHub taslak PR #9.

## Bu çalışma turunda gerçekten geliştirilen alanlar
1. **Belge Hazırlama:** `/documents` rotası. Kullanıcının girdiği başlık, taraflar, olaylar, talepler, deliller ile taslak görüntüleme, metin üzerinde yeniden çalışma, sayfa belleğinde 12 sürüm ve kullanıcı tarayıcısında TXT indirme. Otomatik hukuki görüş, doğrulanmış kaynak, gerçek DOCX/PDF üretimi veya bulutta sürüm saklama değildir.
2. **Staj/Kariyer:** `/careers` rotasında yalnızca kullanıcının **kendi girdiği** kurum/pozisyon/URL bilgilerini listede arama, manuel başvuru durumunu işaretleme, filtreleme ve silme. Gerçek ilan arama, ilan sahibi doğrulama, başvuruyu gönderme veya işe alım değildir.
3. **Forum:** `/forum` rotasında yalnızca kullanıcıya ait geçici konu, açıklama, yanıt taslağı, arama ve silme. Başka kullanıcıya yayın/cevap, moderasyon veya bildirim yoktur.
4. **Modüller menüsü:** `/modules` artık mevcut altı çalışma alanını bağlantılar ve dürüst işlev açıklamalarıyla listeler.
5. **Doğrulanmamış rakamlar:** `portal/src/lib/site.ts` içindeki doğrulanamayan 120K, 18K vb. varsayılan metrikler kaldırıldı; `portal/src/app/page.tsx` artık CMS'de kalmış olsa dahi doğrulanmamış istatistikleri canlı rakam olarak sunmaz. Varsayılan forum başlık sayıları da gizlendi.

## Teknik doğrulama, güvenlik sınırları
- `portal/tests/local-expanded-modules.test.cjs` içinde 32 yeni birim/kaynak testi.
- Genişletme işi **1. deneme FAIL**: [CI #41177814816](https://github.com/netadalet-oss/avofis-platform/actions/runs/41177814816) — Forum gizlilik metni testinde beklenen kelime uyuşmazlığı (portal testleri 106 PASS, 1 FAIL).
- **2. deneme PASS**: [CI #41177872703](https://github.com/netadalet-oss/avofis-platform/actions/runs/41177872703) — **307/307** test, API build/admin/portal TS PASS. Bu iş için Seviye 7'de üçüncü icra denemesi yapılmaz.
- Son devir/ölçüm kabul kontrolleri: [CI #41178021872](https://github.com/netadalet-oss/avofis-platform/actions/runs/41178021872) **314/314** test, 0 fail. Bu denetim geçmişteki iki kod uygulama denemesinin sayısını artırmaz.
- `tools/process/stage7-gate.cjs` ve testleri: 14 devreden açık iş, 7 yeni Seviye 7 iş akışı, geçmiş başarısız denemeler, `stage8_approved=false`, canlı RLS/üretim kabulünün kanıtsız değiştirilmesini reddeder.

## 10 yüzde puan kuralının yorumu
- **Referans ölçüsü:** 12 portal alanı × 5 kullanıcı senaryosu = 60 sabit tanım.
- **Seviye 7'de yeni kaynak/test karşılığı olan senaryolar:** ilk 13 + dört yeni belge davranışı = **17/60 = 28,33 yüzde puan**. Bu, referans kod kapsamına ilişkin bir gösterge olup tüm portalın gerçek tamamlanmasının %28,33 arttığı ispatı değildir.
- **Staging/gerçek tarayıcı kabulü:** **0/60**. Özgün 973 işten kaçının tarihsel kabul edildiğinin ve portalın tüm işlevlerinin gerçek paydasının kaydı mevcut değildir; **genel tamamlanma oranı: bilinmiyor**.
- **Kariyer'in gerçek ilan ve başvuru senaryoları, Forum'un herkese açık yayın senaryoları puanlanmadı**; geçici kişisel araçlar olarak ayrı izlenir.

## Açık teslim ve güvenlik sınırları
- 7 canlı Supabase `public` tablosunda RLS güvenlik sorunu hâlâ açıktır. Bu yeni çalışma canlı DB'yi düzeltmez.
- Kişisel/gizli müvekkil verisi için kalıcı güvenli saklama veya hukuken kabul edilmiş işleme akışı sunulmamıştır. Geçici sayfalardaki uyarılar bu nedenle önemlidir.
- Kullanıcı kimlik doğrulaması, gerçek browser/staging, erişilebilirlik/UX kabulü, kalıcılık ve sunucu entegrasyonu ayrıca test edilmelidir.
- Hollanda/AB Business.gov.nl uyum matrisi ilgili işlemler için koşullu izlenir. DSA/GDPR uyumu kabul edilmedi.
- `main` dalına merge, canlı veritabanı DML/DDL, production deploy, tarihsel 973 iş kabulü **yapılmadı**.
- **Seviye 7 aktif; Seviye 8 geçişi ancak kullanıcının ayrıca vereceği açık ön onayla mümkündür.**

## Başlıca kaynaklar
- Taslak PR: https://github.com/netadalet-oss/avofis-platform/pull/9
- Sabit ölçüm: `docs/process/seviye7-portal-60-kullanici-senaryosu-ilerleme.json`
- Kullanıcı onayı ve açık işler: `docs/process/seviye7-onayli-devredilen-isler.json`
- Test ve kayıt CI: https://github.com/netadalet-oss/avofis-platform/actions/runs/41178021872
