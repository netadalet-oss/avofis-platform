# AVOfis v18 — FORM-03 / 17 hizmette bağlamsal belge oluşturma

**Uygulama:** `portal/src/lib/service-document-forms.ts`, `portal/src/lib/document-preparation.ts`, `portal/src/app/belge-hazirla/page.tsx`; `database/migrations/20261030_form03_contextual_service_schemas.sql`.
**Özgün gereksinim envanteri:** R-001–R-594 / 33 bölüm × 18, 324 P0, 270 P1. Hiçbir R-ID silinmez, yeniden yazılmaz. FORM-03 bunlara **bağlı alt iştir**, 17/594 kabul edildiği anlamına gelmez.

## Gerçek veriyle çalışan belge hazırlığı — 17 orijinal hizmet

| Özgün hizmet slug | Bağlamsal alanlar (genel belgenin dışında) |
| --- | --- |
| hukuki-danismanlik | olay tarihi, karşı taraf, karar referansı, talep edilen sonuç |
| mahkeme-temsil | dosya numarası, kararın/tebligatın gelişi, mahkeme, talep |
| avrupa-turkiye-hukuki-uzman-koordinasyonu | kurum, karar referansı, belgenin kaynağı, talep |
| alacak-takibi | tahmini EUR tutarı, sözleşme tarihi, karşı taraf, talep |
| sozlesmeler-uyusmazliklar | sözleşme tarihi, karşı taraf, sözleşme türü, talep |
| konut-kira-sigorta | sözleşme tarihi, muhatap, olay tarihi, talep |
| ceza-sikayet-trafik | olay tarihi, kurum, karar referansı, talep |
| resmi-basvuru-itiraz | karar tebliğ tarihi, karar referansı, kurum, talep |
| sosyal-guvenlik-vergi | tebliğ tarihi, karar referansı, yardım/vergi türü, talep |
| vize-oturum-vatandaslik | belge bitişi, karar referansı, kurum, talep |
| uluslararasi-insan-haklari | tebliğ tarihi, kurum, karar referansı, talep |
| avrupa-ici-islemler | belgenin menşei, karar referansı, kurum, talep |
| calisma-hayati | işveren, sözleşme tarihi, tebliğ tarihi, talep |
| sirket-ticaret | şirket, sözleşme türü, belge menşei, talep |
| uluslararasi-istihdam | işveren, çalışma/görev türü, sözleşme tarihi, talep |
| belge-apostil-tercume | belgenin menşei, randevu/işlem tarihi, kurum, talep |
| egitim-diploma | diploma/yeterlilik, menşe, karar referansı, talep |

Alan başlıkları **TR/NL/DE/EN/AR/RU** için insan tarafından ayrıca hukukî redaksiyon görmesi gereken ürün metinleridir. Arapça form ve DOCX'te sağdan sola düzen; özgün kurum/ECLI numaraları korunur. Kullanıcı bilinmeyen tarihi boş bırakabilir; tarih gerçek takvim günüyse kabul edilir, otomatik **yasal süre** hesaplanmaz. Tutarlar EUR olarak beyan niteliğindedir.

## Veri ve denetim sözleşmesi

- **v1 korunur:** eski FORM-01 JSON taslakları, DOCX indirmeleri ve mevcut v1 hesap taslakları yüklenebilir; içerik zorla geriye dönük değiştirilmez.
- **v2:** `version:2`, `schemaRevision:1`, `answers`. Tam alan anahtar kümesi ve hizmete özel allowed-key listesi hem TypeScript hem PostgreSQL 17 check/fonksiyon kuralında uygulanır.
- **Kısmi kayıt:** tüm alanlar doldurulmadan kullanıcı hesabına özel taslak kaydedilebilir ve sürüm +1 ile devam edilebilir.
- **İnceleme devri:** ülke, amaç, en az kısa kronoloji ve talep edilen sonuç yoksa `review_requested` veritabanı ve API tarafından reddedilir.
- **Personel görünürlüğü:** önceki FORM-02 kuralları sürer; gerçek Supabase Auth JWT, dosyaya atama, `documents` + `pleadings` bireysel yetkileri, AAL2, müşteri açık rızası.
- **Sürüm, geri çekme, A/B izolasyonu:** mevcut FORM-02 append-only sürümler, personel notları, izin geri çekme ve müşteri A/B RLS korunur.
- **DOCX:** hizmete özgü cevaplar da Unicode, XML-escape ve AR bidi ile gerçek indirilebilir dosyanın içine yazılır; PDF hâlâ tarayıcı yazdırma yoludur.
- **Yapılmayan:** resmî IND, mahkeme, Huurcommissie veya noter formunun doğrulanmış birebir zorunlu alanları ve güncel sürümü; ülke/usul bazında tam hukuki dal kuralları; 17 hizmetin hukukçu tarafından onaylanmış resmî şablonu; gerçek staging Auth/Storage E2E; kesin süre hesabı, resmî gönderim, yetkili imzası. Bu işler başka FORM/CONTENT alt işlerinde sürecek.

## Özgün R-ID bağlantısı (madde bazlı kabul iddiası YOK)

| R-ID | Bu alt işin kanıt sınırı | Eksik kabul |
| --- | --- | --- |
| R-303 | Hizmet/katalogdan ilgili hazırlık sayfasına geçiş (FORM-01 ve FORM-03) | 16 rehberin tamamında kaynak ve içerik QA |
| R-325, R-328, R-332 | Kaydedilebilir özelleştirilmiş taslak, dosyaya devir, DOCX/PDF basım | Ayrı resmi şablon, uzman onayı ve önizleme QA |
| R-333, R-341 | `schemaRevision` teknik sürümü, 6-dil alan başlıkları | Mevzuat, hukukçu kontrol tarihi, dil eşdeğerliği için bağımsız insan onayı |
| R-343, R-346, R-375, R-377 | Ülke, tebliğ/olay tarihi ve belge listesi; bilinmeyen tarih için alan isteğe bağlı | Ayrıntılı durum dalları, acil risk ve karşı taraf rolü |
| R-361–R-378 | İş/konut/borç hizmetlerinde konuya uygun bazı alanlar | 18 özgün maddenin tamamına karşılık gelen ayrı formlar ve risk yönlendirme |
| R-379, R-380, R-388, R-392, R-395 | Göç/idarî referanslar, belge menşei ve kendi talebini yazma | IND türleri ve resmî kanallar, aile/sponsor, başvuru yetkisi |
| R-410 | Belge taslaklarında sürüm geçmişi | Yüklenen orijinal dosyaların hash'i ve kopya sınıflandırması |
| R-487, R-488, R-496, R-497, R-501 | 6 dilde soru başlığı, dil değişiminde taslağı koruma, tarih/EUR/RTL | Hukuki terminoloji kontrolü, hreflang, dil/ülke E2E |
| R-581, R-585, R-586 | Şema alan tipi, 17 hizmete göre varyantlar, tarih/geçersiz anahtar testleri, sentetik A/B RLS | Tam koşullu hukuki şemalar, gerçek iki müşteri JWT E2E, insan kabulü |

**B01–B18, J01–J16, P01–P10, IND 8 sınıf/G1–G4**, 14 hedef kitle, 12 sorun rotası, 16 rehber, 7 kurum sayfası ve 8 belge listesi kapsamdan çıkarılmadı. Yeni FORM-03 bu işlerin yerine geçmez. Ana 594'te mevcut 0 bağımsız, 41 kısmi, 553 kanıtsız dağılımı otomatik değiştirilmedi.

## Teknik doğrulama

- Portal: `node --experimental-strip-types --test scripts/service-document-forms.test.mjs`
- Eski DOCX/v1: `scripts/document-preparation.test.mjs`
- Yeni API: `scripts/document-draft-contract.test.mjs`
- Gerçek SQL parser/RLS: `database/tests/form03_contextual_drafts_synthetic.sql` (PostgreSQL 17 üzerinde, CI zincirinden sonra).
- GitHub Actions `.github/workflows/avofis-integrated-catalog-ci.yml`: altı ana CI işinden biri PORTAL, biri disposable PG17. RLS testinin gerçek müşteri verisiyle çalıştırıldığı iddia edilmez.
