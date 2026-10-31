# AVOfis Seviye 1 — kamuya açık ana sayfada doğrulanmamış iddiaları kaldırma

**31.10.2026 | Ayrı operasyonel iş: S1-PUBLIC-TRUST | Gerçek kod/CI denemesi 1/2, PASS**

## Sorun
Yeni Seviye 1 dalındaki eski portalın ana sayfası, AVOfis henüz kuruluş ve fizibilite aşamasındayken, gerçek kaynağı doğrulanmamış kariyer istatistiklerini (`420+` aktif ilan, `350+` ofis, `7.2K+` başvuru, `%68` eşleşme), `Canlı metrikler`, `Canlı yapı`, `Doğrulanmış Ofis` rozetini ve gerçek iş ilişkisi izlenimi yaratabilecek `Avo Legal Partners` örnek adını gösteriyordu. `portal/src/lib/site.ts` ayrıca eski `120K+` içtihat ve kullanıcı/üretim istatistiklerini taşıyordu. Bu iddialar için kaynak veya canlı kabul kanıtı yok.

## Gerçekte yapılan
- `portal/src/app/page.tsx`: İstatistikler kaldırıldı veya "Planlanan kariyer özellikleri" olarak yeniden işaretlendi; `Canlı yapı` yerine `Geliştirme örneği`, `Doğrulanmış Ofis` yerine `Temsili profil` kullanıldı. Kurgusal ofis gerçek marka olarak gösterilmedi; forum kartlarının varsayılan konu sayıları kaldırıldı. Varsayılan ana başlık ve açıklama AVOfis'in kuruluş öncesi bilgi/hazırlık hizmetini anlatır.
- `portal/src/lib/site.ts`: Kaynaksız platform metrikleri boş diziye çevrildi, boş istatistikler sekmesine menü bağlantısı kaldırıldı.
- `portal/tests/public-trust.test.mjs`: 4 test; kaynakta sahte rakamların, uydurma aktif/verified rozetlerinin olmadığına dair kontroller.
- `.github/workflows/seviye1-public-trust.yml`: testler + Next portal derlemesi + gerçek yerel HTTP ana sayfa doğrulaması, gizli/üretim credential kullanılmadan.
- **CI PASS** [#41202351024](https://github.com/netadalet-oss/avofis-platform/actions/runs/41202351024) kaynak SHA `9c41fe528c052144a72ddb2f8edc86c19001e4a6`. 4/4 yeni test PASS, Next build PASS, yerel HTTP PASS; **ilk ve tek gerçek uygulama/CI denemesi**.

## Kabul ve risk ayrımı
- İlan hizmeti veya gerçek forum açılmadı; bu değişiklik işlevsel ürün gelişimine bağımsız R-ID kabul puanı eklemez.
- CMS'de saklı başka tanıtım yazıları ayrı hukukî/editoryal gözden geçirmeye tabidir. İstemci tarafı etiket düzeltmesi gerçek veri güvenliğini veya canlı `pages/site_settings` yetkilerini düzeltmez.
- **594 özgün R-ID için bağımsız kabul 0/594;** 17 hizmet kataloğu ayrı kod/test düzeyindedir. Henüz canlı Vercel önizlemesi, staging kullanıcı kabulü ve hukukî yayın imzası yok.
- Yeni Seviye 1 çalışma dalı dışındaki `main`, canlı Supabase ve gerçek işletme/finans/resmî kurum işlemlerine müdahale edilmedi.
- 7 tarihî canlı RLS/GRANT riski ve B01–B18 açık kabul engelleri bu işlemle kapanmaz.
