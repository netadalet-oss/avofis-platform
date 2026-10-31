# AVOfis — 594 R-ID kanıt eşleştirmesi: iki farklı eşik için uzlaşma denetimi

**31.10.2026; kod snapshot:** `3d9e2e31747903fd868cff6ff6cf794f8adcd59f`; GitHub geniş eşleme commit'i: `2dec06e6f9a5758de8833cb248667bd307eb395a`; **PR #12 draft**.

## Neden iki farklı sayı var?
Özgün Seviye 1 `594 Gereksinim` + v18 `01 Gereksinim 594` sayfaları **594/594**, 33 bölüm × 18, **324 P0 + 270 P1** ve geçmiş **41 kısmi** kanıtı korur. İki ayrı eşleme eşiği aynı son kod üzerinde karşılaştırılmıştır:

| Doğrulama sınıfı | R-ID | İspat sınırı |
| --- | ---: | --- |
| **R-ID bazında doğrudan dosya/test izi** | **119** | Her satırda güncel kod yolu, varsa test yolu, CI türü ve kalan kabul koşulu yazılı; gereksinim tümü değildir |
| Bunlardan aynı HEAD'de CI bağlantılı | 27 | İlgili alt kapsam CI başarılı; hukukî insan kabulü değildir |
| Bunlardan yalnız tarihî CI bağlantılı | 46 | Kod ve test dosyaları güncel ağaçta var, betikler son birleşik CI'da tekrar koşulmadı |
| Bunlardan kod + test izi olup güncel CI'si olmayan | 23 | Test dosyası var, aynı HEAD için çalıştığına ilişkin kanıt yok |
| Bunlardan yalnız kod/rapor izi | 23 | Bağımsız davranış testi henüz eşleştirilmedi |
| **Yalnız GitHub'un geniş EV01–EV25 grup ön eşlemesinde görülen** | **112** | Grupların R-ID'ye bire bir kod/test/CI bağı henüz teyit edilmedi; **ADAY** statüsü |
| Her iki incelemede ortak | **83** | 195'lik geniş listeyle 119'luk doğrudan eşlemenin kesişimi |
| Yalnız doğrudan R-ID incelemesinde bulunan | **36** | Mevcut geniş EV grup listesi bunları yeni teknik eşleme saymıyor veya tarihî-only görüyor |
| İki incelemede de yeni teknik iz eşleşmeyen | **363** | Bu, kodun hiç yazılmadığına ilişkin hüküm değildir |
| **Tekil doğrudan + geniş aday R-ID** | **231** | İlerleme takibi / incelenecek eşleşme; kabul veya tamamlanma yüzdesi değildir |
| **Bağımsız yazılı R kabulü** | **0/594** | Gereksinim tümü, bağımsız inceleyen, hukuk/dil/rol/iş ortamı ve tarihli karar yok |
| **Canlı kullanım kabulü** | **0/594** | 7 canlı RLS riski, B01–B18 ve gerçek staging/Auth/Storage kabulü açık |

**Aritmetik:** 119 doğrudan + 112 geniş-yalnız aday + 363 iz yok = 594. GitHub geniş liste 195 = 83 ortak + 112 geniş-yalnız; 119 doğrudan = 83 ortak + 36 doğrudan-yalnız. 41 tarihî kısmi hiçbirinde silinmez ya da bağımsız kabul sayılmaz.

## Özellikle geniş katalogda eksik kalan doğrudan izler

36 kimlik: `R-246, R-351, R-352, R-361, R-362, R-363, R-364, R-366, R-367, R-368, R-369, R-370, R-371, R-372, R-373, R-374, R-376, R-383, R-385, R-387, R-389, R-391, R-394, R-456, R-479, R-488, R-494, R-496, R-497, R-503, R-506, R-515, R-531, R-533, R-578, R-591`.

Özellikle `R-361–R-374` alt alanları, `portal/src/lib/sector-intake-preview.ts` ve `portal/scripts/sector-intake-preview.test.mjs` üzerinde tarihî R-ID bazlı kaynaklı form önizlemesi olarak bulunur; söz konusu işlerin tam hukukî başvuru formu olduğu iddia edilmez.

## Doğrulanabilir kaynak zinciri
- Geniş envanter (594 satır): `docs/program/r594-kanit-esleme-2026-10-31.csv`.
- 25 EV kanıt grubunun R-ID üyelikleri: `docs/program/r594-kanit-esleme-katalogu-2026-10-31.json`. Bu katalog tek başına R başına kesin kod/test URL'si barındırmaz; bu yüzden sadece **grup adayı** eşiğindedir.
- Sıkı satır bazlı dosya/test ve kabul ölçütleri: kullanıcıya sunulan güncellenmiş `AVOfis_594_R_Kanit_Eslestirme_Kabul_Matrisi_2026-10-31.xlsx` (594 özgün metin, 64 kuruluş konusu, B01–B18 ve 33 bölüm özetini korur). GitHub'da fizikî XLSX'in ayrıca depolandığı **iddia edilmez**.
- Güncel CI: `https://github.com/netadalet-oss/avofis-platform/actions/runs/41230287115` (unified), `.../41230287110` (API/admin), `.../41230287143` (17 hizmet), `.../41230287101` (12 sorun), `.../41230287114` (public gate), `.../41230287148` (sentetik PG17).
- Tarihî L4 R-ID izleri: `ops/avofis-l4-implementation-evidence.json`. Eski CI sonucu son HEAD'de yeniden koşulmadıysa aynı kapsamda kabul sayılamaz.

## Kapalı işletim sınırları
Daha sonraki aşamalara geçiş için ayrı izin gerekmese de **main/production merge, canlı Supabase SQL/RLS/Storage, gerçek kişisel veri, para tahsilatı ve IND/mahkeme resmî işlemleri ayrı açık eylem izni olmadan yapılmaz**. 18 engel açık; 7 canlı RLS riskinin sentetik CI sayesinde kapandığı iddia edilemez. Bütün R-ID'lerde yeni bağımsız ve canlı kabul **HAYIR** tutulmuştur.

**Bir sonraki iş:** 112 grup adayı için R bazında tam kod + test + CI kaynağı göstererek 'doğrudan iz'e yükseltmek; 363 henüz eşlenmeyen maddeyi bölüm bazında araştırmak; ardından gerçekten kapsamı tamamlananları bağımsız, tarihli kabul prosedürüne sokmak.
