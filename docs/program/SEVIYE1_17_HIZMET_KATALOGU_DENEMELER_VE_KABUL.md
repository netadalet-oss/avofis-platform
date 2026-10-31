# AVOfis Seviye 1 — 17 özgün hizmet bilgi sayfası / doğrulanmış teslim

**Tarih:** 31.10.2026  
**Yetki:** Seviye 1 geliştirme dalı; `main` merge, canlı Supabase, üretim dağıtımı veya hukukî hizmet açılışı yok.

## Kaynak ve amaç
Birincil metin: Kullanıcının sağladığı 29.10.2026 tarihli **v18 kesin birleşik talimatname**, özgün 17 hizmet kimliği ve 64 maddelik kuruluş/fizibilite belgesi. Mevcut ana portalda yalnız statik başlıkla geçen hizmetleri, kullanıcıya anlaşılabilir **genel bilgi + belge hazırlık adımları + yetki sınırı** sayfaları hâline getirmek.

17 kimlik v18'e göre birebir korunur: `hukuki-danismanlik`, `mahkeme-temsil`, `avrupa-turkiye-hukuki-uzman-koordinasyonu`, `alacak-takibi`, `sozlesmeler-uyusmazliklar`, `konut-kira-sigorta`, `ceza-sikayet-trafik`, `resmi-basvuru-itiraz`, `sosyal-guvenlik-vergi`, `vize-oturum-vatandaslik`, `uluslararasi-insan-haklari`, `avrupa-ici-islemler`, `calisma-hayati`, `sirket-ticaret`, `uluslararasi-istihdam`, `belge-apostil-tercume`, `egitim-diploma`.

## Gerçek kod ve kullanıcı davranışı
- `portal/src/lib/service-catalog.ts`: 17 sabit kimlik, ayrı anlaşılır özet, hedef kitle, üç hazırlık adımı, üç uyarı. Ana kaynakların tarihî kapsamını korur; mevzuatı güncel/avukat onaylı iddia etmez.
- `portal/src/app/hizmetler/page.tsx`: 17 hizmeti ayrı bağlantılarla listeler.
- `portal/src/app/hizmetler/[slug]/page.tsx`: her hizmet için içerik ve doğru URL, yanlış URL'de 404, `/baslangic` genel hazırlık aracına bağlantı.
- `portal/src/lib/site.ts`: üst menüde `/hizmetler` bağlantısı.
- `portal/tests/service-catalog.test.mjs`: 6 alan testi; numaralar, tekillik, içeriğin varlığı, sahte aktif hizmet iddiaları, yanlış slug ve route/bilgi uyarısı.
- `.github/workflows/seviye1-service-catalog.yml`: Node testleri, portal Next derlemesi ve **gerçek yerel HTTP** `/hizmetler`, `/hizmetler/resmi-basvuru-itiraz`, yanlış URL 404, ana sayfa menüsü.

## İki uygulama ve CI deneme geçmişi
1. **İlk uygulama / ilk CI: FAIL.** Kaynak SHA `cdc709ee2bad798baca22ea03952c4820b87eb5f`; run [41201962267](https://github.com/netadalet-oss/avofis-platform/actions/runs/41201962267) ve PR paralel run [41201965648](https://github.com/netadalet-oss/avofis-platform/actions/runs/41201965648). 5/6 test geçti; bir testin kişisel bilgi uyarısı için **büyük/küçük harfe duyarlı eşleştirmesi** metnin gerçek `Kişisel bilgi` ifadesini reddetti. Derleme/HTTP adımları ilk koşuda çalıştırılmadı. **Başarısızlık silinmez.**
2. **İkinci / son uygulama: PASS.** Test eşleştirmesi harf duyarsız hâle getirildi; SHA `4555870cd6df72c2857ca2ea91672ae2337715b1`. Run [41202039736](https://github.com/netadalet-oss/avofis-platform/actions/runs/41202039736): **6/6 test başarılı**, `npm run build:portal` başarılı, yerel HTTP katalog/hizmet/404/ana sayfa başarılı. Bu operasyonel iş için **Seviye 1'de üçüncü gerçek uygulama denemesi yapılamaz**.

## Kabul sınırı
- **17/17 sayfa kod/test/yerel Next HTTP düzeyinde gösterildi.** Bu, 17 ayrı hukukî hizmetin AVOfis tarafından fiilen sunulması değildir.
- **R-001..R-594 bireysel bağımsız kabul 0/594; gerçek tamamlanma artışı kanıtlanmadı.** Bu sayfalar özgün maddelere ayrı ayrı hukuki/onay ve yayın koşullarıyla eşlenmeden puanlanmaz.
- 6 dilde tam içerik, resmî ülke hukuk kaynakları/güncellik incelemesi, kişisel başvuru, sözleşme, güvenli dosya, ödeme, uzman onayı ve canlı yayın yok.
- Vercel bu yeni sayfalar için bir preview yayımlamadı/doğrulanmadı. Başarılı GitHub CI, üretimde çalıştığına veya AVOfis'in kurulmuş olduğuna kanıt değildir.
- Tarihî **7 canlı RLS/GRANT riski**, B01–B18 ve hukuki çalışma/temsil yetkisi engelleri açık kalır.
