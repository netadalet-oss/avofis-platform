# AVOfis v18 — Seviye 2: 973 işin modül ve iş akışı ana iskeleti

**30 Ekim 2026** · **L0 onaylı; L1 onaylı; L2 onay bekliyor; L3–L5 kilitli.**

Bu belge kullanıcı tarafından onaylanan 63 alt program için hazırlanan **L2 tasarım önerisidir**. Yeni canlı veritabanı, hukukî yetki, ürün ekranı veya resmî kurum işlem kabulü yaratmaz. L3 ayrıntılarına geçilmez.

## Kapsam ve gerçek ilerleme

| İzlenen katman | Kapsam | Bağımsız kabul |
|---|---:|---:|
| L2 modüller | 63 / 63 | — |
| Modül içi akışlar | 142 / 142 | — |
| Çapraz yolculuklar | 12 / 12 | — |
| Özgün iş → modül / esas akış / kabul akışı | 973 / 973 | 0 / 973 |
| 594 R-ID (324 P0, 270 P1) | 594 / 594 | 0 / 594 (41 kısmi teknik) |
| Personel 16×12 | 192 / 192 | 0 / 192 |
| B/J/P/IND/G/T ek işler | 113 / 113 | 0 / 113 (4 sentetik teknik) |
| 66 içerik + 8 kontrol listesi | 74 / 74 | 0 / 74 |

**142 + 12 = 154 akış gösterimi; bunlar 973 iş paydasına eklenmez.**

## 63 modül: her birinin L1 kaynağı ve iş sayısı

| L2 modül | Kaynak L1 | İş | Çalışma alanı |
|---|---|---:|---|
| `L2-M-R01` | `L1-R01` | 18 | İş modeli, hizmet kapsamı ve meslekî sınırlar |
| `L2-M-R02` | `L1-R02` | 18 | Hedef kitle ve kullanıcı senaryoları |
| `L2-M-R03` | `L1-R03` | 18 | Marka, adlandırma ve görsel kimlik |
| `L2-M-R04` | `L1-R04` | 18 | Üst menü, bilgi mimarisi ve site haritası |
| `L2-M-R05` | `L1-R05` | 18 | Ana sayfa ve dönüşüm akışı |
| `L2-M-R06` | `L1-R06` | 18 | Hakkımızda, uzman profilleri ve güven |
| `L2-M-R07` | `L1-R07` | 18 | Hizmet kataloğu ve paket tanımları |
| `L2-M-R08` | `L1-R08` | 18 | İş hukuku ve çalışma yaşamı |
| `L2-M-R09` | `L1-R09` | 18 | Göç, oturum ve vatandaşlık |
| `L2-M-R10` | `L1-R10` | 18 | Aile, çocuk ve kişi hukuku |
| `L2-M-R11` | `L1-R11` | 18 | Kira, konut ve taşınmaz |
| `L2-M-R12` | `L1-R12` | 18 | Tüketici, sözleşme ve borç uyuşmazlıkları |
| `L2-M-R13` | `L1-R13` | 18 | Şirketler, girişimcilik ve ticaret |
| `L2-M-R14` | `L1-R14` | 18 | İdarî işlemler, sosyal haklar ve kamu kurumları |
| `L2-M-R15` | `L1-R15` | 18 | Türkiye–Hollanda sınır aşan hukukî işlemler |
| `L2-M-R16` | `L1-R16` | 18 | Dosya inceleme, delil ve uyuşmazlık analizi |
| `L2-M-R17` | `L1-R17` | 18 | Bilgi bankası, rehberler ve hukuk sözlüğü |
| `L2-M-R18` | `L1-R18` | 18 | Haber, yorum, analiz ve bültenler |
| `L2-M-R19` | `L1-R19` | 18 | Belge kütüphanesi, şablonlar ve üretim |
| `L2-M-R20` | `L1-R20` | 18 | Başvuru sihirbazı ve ilk triyaj |
| `L2-M-R21` | `L1-R21` | 18 | İş, kira ve tüketici başvuru formları |
| `L2-M-R22` | `L1-R22` | 18 | Göç, aile, idarî ve uluslararası başvuru formları |
| `L2-M-R23` | `L1-R23` | 18 | Güvenli belge yükleme ve dijital dosya |
| `L2-M-R24` | `L1-R24` | 18 | Müşteri hesabı, panel ve dosya durumu |
| `L2-M-R25` | `L1-R25` | 18 | Görüşme, randevu, mesajlaşma ve bildirim |
| `L2-M-R26` | `L1-R26` | 18 | Ücretler, sözleşme, ödeme ve tüketici hakları |
| `L2-M-R27` | `L1-R27` | 18 | Uzman ağı, iş ortakları ve yönlendirme |
| `L2-M-R28` | `L1-R28` | 18 | Çok dillilik, hukukî çeviri ve yerelleştirme |
| `L2-M-R29` | `L1-R29` | 18 | AVG/GDPR, gizlilik ve veri yönetimi |
| `L2-M-R30` | `L1-R30` | 18 | Siber güvenlik, kimlik ve operasyonel dayanıklılık |
| `L2-M-R31` | `L1-R31` | 18 | İç yönetim paneli, CRM ve otomasyon |
| `L2-M-R32` | `L1-R32` | 18 | Erişilebilirlik, arama, SEO ve kullanıcı deneyimi |
| `L2-M-R33` | `L1-R33` | 18 | Teknik mimari, kalite güvencesi ve yayına geçiş |
| `L2-M-ST-inbox` | `L1-ST-inbox` | 12 | Başvuru masası (inbox) |
| `L2-M-ST-triage` | `L1-ST-triage` | 12 | Ön inceleme (triage) |
| `L2-M-ST-matters` | `L1-ST-matters` | 12 | Dosyalar (matters) |
| `L2-M-ST-calendar` | `L1-ST-calendar` | 12 | Takvim/görev (calendar) |
| `L2-M-ST-documents` | `L1-ST-documents` | 12 | Belgeler (documents) |
| `L2-M-ST-pleadings` | `L1-ST-pleadings` | 12 | Dilekçe ve taslak (pleadings) |
| `L2-M-ST-research` | `L1-ST-research` | 12 | Mevzuat/içtihat (research) |
| `L2-M-ST-judicial` | `L1-ST-judicial` | 12 | Mahkeme bağlantıları (judicial) |
| `L2-M-ST-ind` | `L1-ST-ind` | 12 | IND işlemleri (ind) |
| `L2-M-ST-messages` | `L1-ST-messages` | 12 | Yazışmalar (messages) |
| `L2-M-ST-billing` | `L1-ST-billing` | 12 | Gelir/fatura (billing) |
| `L2-M-ST-payables` | `L1-ST-payables` | 12 | Gider/para çıkışı (payables) |
| `L2-M-ST-reporting` | `L1-ST-reporting` | 12 | Raporlama (reporting) |
| `L2-M-ST-audit` | `L1-ST-audit` | 12 | Denetim (audit) |
| `L2-M-ST-people` | `L1-ST-people` | 12 | Personel (people) |
| `L2-M-ST-settings` | `L1-ST-settings` | 12 | Ayarlar/yayın (settings) |
| `L2-M-B` | `L1-B` | 18 | B01–B18 üretim güvenlik/uyum engelleri |
| `L2-M-J` | `L1-J` | 16 | J01–J16 Hollanda yargı entegrasyonları |
| `L2-M-P` | `L1-P` | 10 | P01–P10 personel operasyon ve güvenlik işleri |
| `L2-M-IND` | `L1-IND` | 8 | IND-01–08 usul/süreç bölümleri |
| `L2-M-INDG` | `L1-INDG` | 4 | IND-G1–G4 insan yetki ve onay kapıları |
| `L2-M-INDT` | `L1-INDT` | 15 | IND-T01–15 ayrı usul/itiraz senaryoları |
| `L2-M-G` | `L1-G` | 29 | Kuruluş G-01–24 ve yatay Y-01–05 |
| `L2-M-T` | `L1-T` | 13 | T01–T13 teknik işletim/test kayıtları |
| `L2-M-SRV` | `L1-SRV` | 17 | Hizmet sayfaları |
| `L2-M-AUD` | `L1-AUD` | 14 | Hedef kitle sayfaları |
| `L2-M-SOR` | `L1-SOR` | 12 | Sorun bazlı kullanıcı rotaları |
| `L2-M-GUIDE` | `L1-GUIDE` | 16 | Kaynaklı hukuk rehberleri |
| `L2-M-CORP` | `L1-CORP` | 7 | Kurumsal bilgi sayfaları |
| `L2-M-CHK` | `L1-CHK` | 8 | Belge kontrol listeleri (özgün başlık/slug teyidi bekliyor) |

Her modülde **esas iş akışı** ve **ayrı kaynak/hukuk/güvenlik kabul akışı** bulunur. On altı personel modülünde üçüncü **kişisel yetki, AAL2, atama ve geri çekme** akışı vardır: 63 esas + 63 kabul + 16 yetki = **142**.

## 12 çapraz uçtan uca yolculuk

| Kimlik | Yolculuk | Modül | Kritik kontrol |
|---|---|---:|---|
| `L2-CJ01` | Kamu ziyaretçisi → hedef kitle → hizmet | 7 | B05/B09/B10 |
| `L2-CJ02` | İlk başvuru → triyaj → müşteri dosyası | 8 | B01/B04/B06 |
| `L2-CJ03` | Belge hazırlama → inceleme → saklama | 7 | B04/B07/B17 |
| `L2-CJ04` | IND usul ayrımı → G1–G4 → hukukî inceleme | 7 | B07/B15 |
| `L2-CJ05` | Hollanda yargı bilgisi → yargı uzmanı → resmi kanal | 5 | B07/B18 |
| `L2-CJ06` | Teklif/sözleşme → ödeme doğrulama → mutabakat | 5 | B08/B18 |
| `L2-CJ07` | GDPR/DSAR → belge izni → denetim | 6 | B06/B13 |
| `L2-CJ08` | Hukukî içerik → dil QA → erişilebilir yayın | 7 | B09/B14/B16 |
| `L2-CJ09` | Kuruluş/yetki → uzman ağı → kamu profil beyanı | 5 | B05/B07/B15 |
| `L2-CJ10` | Güvenlik RLS → staging/restore → yayın kararı | 6 | B01/B02/B03/B04/B18 |
| `L2-CJ11` | Müşteri paneli → görüşme/mesaj → kayıt | 5 | B04/B13 |
| `L2-CJ12` | Personel yetki → modül çalışması → bağımsız audit | 6 | B04/B13/B18 |

Her 973 kaynak kimliği `ops/avofis-l2-workflow-index.json` içinde değişmez L0, L1, L2 modül, **birincil iş akışı** ve **zorunlu bağımsız kabul akışı** bağlantısıyla kaydedilmiştir. Kaynak R metinleri değiştirilmemiştir. L2 akış adımları özgün talimatlar üzerine önerilmiş süreç tasarımıdır; onaylanmış gerçek uygulama veya özgün birebir alıntı değildir.

## Açık sınırlar ve insan onayı

**L2 kullanıcı onayı henüz yoktur.** L3 ayrıntılı ekran/alan/API/SQL sözleşmeleri, otomatik testin atomik iş tanımı ve alttaki daha ince parçalar bu turda oluşturulmamıştır. L2 onayından sonra ayrıca sunulacaktır.

**CHK-01–CHK-08** kayıtları korunmuştur; özgün kontrol listesi başlıkları ve slug'ları yeterince doğrulanmadığı için uydurulmamıştır. İlgili kaynak doğrulama işi açık kalır.

Canlı güvenlik durumu **NO-GO**: 7 public tabloda RLS kapalı (ERROR), 1 Auth parola güvenliği WARN, gerçek ayrı Auth/Storage staging E2E yok; B01–B18 için 0/18 bağımsız kapanış. PR #5 taslak, canlı SQL/PSP/IND/yargı filing/production deploy yapılmadı. Bunlar ayrıca operasyonel izin gerektirir.

## Kaynak zinciri

- `ops/avofis-master-skeleton-l0.json` — kullanıcı onaylı L0, 8 kol.
- `ops/avofis-master-subprograms-l1.json` — kullanıcı onaylı L1, 63 program.
- `ops/avofis-master-modules-workflows-l2.json` — bu 63 modül, 142 iş akışı, 12 çapraz yolculuk.
- `ops/avofis-l2-workflow-index.json` — 973 eşleme ve onay kilitleri.
- `portal/scripts/master-modules-workflows-l2.test.mjs` — CI kapsam regresyonu.
- `AVOfis_v18_SEVIYE2_973_Is_63_Modul_154_Akis_Onay_Bekliyor_2026-10-30.xlsx` — kaynak metni koruyan 973 satırlık Excel.

**Kullanıcının bir sonraki kararı:** Seviye 2'nin tamamını topluca onaylamak veya revizyon istemek. Kullanıcı L2'yi onaylamadan L3'e geçilmez.
