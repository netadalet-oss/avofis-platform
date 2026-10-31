# AVOfis v17 — Hollanda Dijital Yargı Ek Programı (J01–J16)
**Tarih:** 29 Ekim 2026. **İlke:** Özgün 594 R-ID, T01–T13, IND-T01–T15 ve mevcut PR/migration geçmişi **değişmez**. Bu takip bağımsız alt gereksinimdir, `R-001..R-594` olarak yeniden numaralandırılmaz.

## 1. Resmî erişim/yetki matrisi — güncel araştırma

| Kaynak / hukuk işlemi | Kimlik/işlem kapsamı ve sınırlamalar | AVOfis uygulama düzeyi |
|---|---|---|
| **Mijn Rechtspraak, kişi** | Belirli genel idarî, vergi ve avukatsız bazı medeni işlemlerde DigiD; kabul edilecek mahkeme/prosedür bazında güncel kontrol gerekir. Tamamen evrensel mahkeme portalı değildir. | Yalnızca resmî yönergeye dış bağlantı; kendi adımıza eylem, kişisel giriş bilgisi ve dosya sorgusu yok |
| **Mijn Rechtspraak, advocaat** | NOvA ile ilişkili gerçek **advocatenpas**, doğru BAR bilgileri, ilgili usul ve (gerekirse) mahkemeye göre dijital kanallar; bazı usuller avukat zorunludur. | AVOfis adına avukat yetkisi varsayılamaz; bağımsız avukat dosya bazında yetki kontrolü |
| **Mijn Rechtspraak, jurist / gemachtigde / kuruluş** | Profesyoneller ve tüzel kişiler için **eHerkenning düzey 3 + 'Digitaal Procederen' yetkilendirmesi**; kuruluş adına işlem eHerkenning tek başına hukukî temsil yetkisi vermez. | Yetki belgesi, kişi/kurum ve prosedür ayrı insan doğrulaması olmadan resmî işlem yok |
| **İdarî yargı** | Rechtspraak 2026 dijitalleşme sayfası: genel idarî yargıda Limburg (01.06), Zeeland-West-Brabant, Overijssel, Amsterdam (01.10); ekonomik idare CBb (01.04) ve Rotterdam (01.10); vergide geniş kapsam. **Kapsam dinamik**, işlem ve mahkeme bazında kontrol şart. | Genel navigasyon, hiçbir yetki/term otomatik çıkarımı yok |
| **Medeni / ticaret / aile** | Rechtspraak duyurularında avukatlar için 2026-10-12 itibarıyla ticaret dagvaarding ve belirli hoger beroep; aile, kanton ve diğer bölgelerde farklı başlangıç ve taraf kategorileri. | Prosedür ve mahkeme ayrı kayıt, avukatlık zorunluluğu değerlendirmesi |
| **İltica / idarî gözetim** | Avukatlara özel asiel/bewaring kanalları, zorunlu dijital işlem; **genel Aansluitpunt kapsamı dışında**. | IND G1–G4, 8 kategorinin ayrımı ve geçiş hukukunun bağımsız uzman incelemesi KORUNUR |
| **Aansluitpunt Rechtspraak** | 13 Ekim 2026 duyurusuyla teknik deneme sonrasında diğer yazılım sağlayıcılarına açık başvuru. Destek: bestuursrecht, handelsrecht ve familie/jeugd, yalnız Mijn Rechtspraak'ın desteklediği süreçler; **asiel, bewaring, toezicht HARİÇ**. Sağlayıcı kabulü, ayrı teknik şartlar, berichtenboek ve ketentest/compliance gerektirir. | `officialCourtConnectionEnabled=false`, `providerAccepted=false`, **gerçek API yok**; sağlayıcı bilgi talebi taslağı var, gönderilmedi |
| **Rechtspraak Open Data / ECLI** | Kamuya açık, anonimleştirilmiş/pseudonimleştirilmiş kararlar; XML Atom `/uitspraken/zoeken` ve XML `/uitspraken/content?id=ECLI`. Herkese açık, **en fazla 10 çağrı/saniye**. | Altı dilde kaynaklı UI, sunucu doğrulayıcı/parser ve endpoint kodu var; gerçek yayına ancak **global dağıtılmış limit ve bağımsız onay** ile izin verilebilir |
| **IND Portaal Zakelijk** | 2026-10-01 IND sayfası: yalnız **erkend referent** ve zincir yetki verilmiş aracı; EH3+, `ketenmachtiging` 2024-11-04'ten beri zorunlu. Bu genel IND/iltica temsil erişimi değildir. | Sadece doğrulanmış resmî bilgi linki, IND portalı entegrasyonu yok |
| **IND belge yükleme** | IND başvuru sahibi, uygun referent veya izinli temsilcinin belirli prosedürlerde belge yüklemesine izin verir; özel dosya ve e-DigiD yetki sınırlaması sürer. | AVOfis kullanıcı parolası almaz, üçüncü taraf adına kendiliğinden yükleme yapmaz |
| **İltica 12.06.2026** | IND yeni kuralları ve 12 Haziran'dan önceki başvuruların farklı ele alınmasını açıklıyor. **Geçiş hukuku yalnız tarihe indirgenemez; bazı ulusal usul hükümleri mevcut dosyalara da uygulanabilir.** | IND-T04 sentetik 11/12 Haziran ayrımı korunur, gerçek dosyada bağımsız uzman hukuku inceler, otomatik süre verilmez |

### Resmî kaynaklar ve doğrudan adresler (29.10.2026 erişim araştırması)

1. https://www.rechtspraak.nl/organisatie-en-contact/rechtspraak-in-nederland/digitalisering-rechtspraak
2. https://www.rechtspraak.nl/onderhoud-en-storingen/inloggen-en-machtigen
3. https://www.rechtspraak.nl/voor-advocaten-en-juristen/aansluitpunt-rechtspraak
4. https://www.rechtspraak.nl/organisatie-en-contact/organisatie/raad-voor-de-rechtspraak/nieuws/2026/10/praktijkproef-afgerond-aansluitpunt-rechtspraak-breed-opengesteld
5. https://www.rechtspraak.nl/uitspraken/open-data
6. https://www.rechtspraak.nl/SiteCollectionDocuments/Technische-documentatie-Open-Data-van-de-Rechtspraak.pdf (v1.15, 2019; 2026 sayfasında hâlâ bağlantısı var)
7. https://ind.nl/nl/portaal-zakelijk
8. https://ind.nl/nl/documenten-uploaden
9. https://ind.nl/nl/asiel-en-nareis-het-migratiepact-en-andere-ontwikkelingen/nieuwe-wetten-en-regels-asiel-en-nareis
10. https://ind.nl/nl/asiel-en-nareis-het-migratiepact-en-andere-ontwikkelingen/asiel-aangevraagd-voor-12-juni-2026

**Açık kaynak uyarısı:** Sağlayıcının ayrıntılı `berichtenboek` spesifikasyonu veya özel kabul/test kimlikleri AVOfis'e verilmiş değil; sahte endpoint ya da başarı makbuzu yazılamaz. IND veya Rechtspraak açılışında gerçek hizmet yetkisi onaylanmış değildir.

## 2. J01–J16 ek gereksinim / izleme

| ID | Milestone | Kabul koşulu | Şimdiki düzey |
|---|---|---|---|
| J01 | Araştırma | Resmî mahkeme/prosedür/rol matrisi + tarihli kaynak | KOD DIŞI ARAŞTIRMA / güncel kaynaklar |
| J02 | Araştırma | Açık ECLI dizin parametre ve 10/s limiti | KAYNAK DOĞRULANDI |
| J03 | Açık içtihat | ECLI/mahkeme/tarih/law/procedure/keyword UI, 6 dil/RTL | KODLANDI / insan dil editörü henüz yok |
| J04 | Açık içtihat | Resmî XML Atom parser; değişen ECLI, silinen doc, bozuk XML | SENTETİK TEST, canlı XML bağlantısı doğrulanmadı |
| J05 | Açık içtihat | Global 10/s koordinasyon + cache + erişim süresi/gözlem | KISMİ cache + local limiter; **global kanıt yok, proxy kapalı** |
| J06 | Açık içtihat | Gerçek yayımlanmış ECLI kaynak doğrulaması | 3 resmî karar örneği web üzerinden doğrulandı; uygulama API denemesi yapılamadı |
| J07 | Dava dosyası | Statü, mahkeme, prosedür, ECLI, manuel belgesel iz | TASARIM, canlı şema yok |
| J08 | Dava dosyası | A/B tenant/staff/specialist RLS, Storage signed URL gerçek staging | ESKİ SENTETİK test var; staging YOK |
| J09 | Dava dosyası | Resmî tebliğ/süre ve insan doğrulanmış işlem tarihi | KAPALI, otomatik hesaplama YOK |
| J10 | Dava dosyası | Gönderim makbuzu yokken 'submitted' reddi | SAF KURAL/KOD, gerçek sağlayıcı yok |
| J11 | Mijn Rechtspraak | Resmî güvenli dış bağlantı + rol bildirimi | KODLANDI, resmî login AVOfis'te yapılmaz |
| J12 | Aansluitpunt | Sağlayıcı bilgisi ve başvuru prosedürü + e-posta taslağı | TASLAK, kuruma hiçbir mesaj gönderilmedi |
| J13 | Aansluitpunt | Gerçek onay/berichtenboek/acceptatie test ve güvenli broker | **BEKLİYOR** |
| J14 | IND | Sekiz kategori ve G1–G4; 12.06 geçiş; NOvA | MEVCUT TASLAK KORUNDU |
| J15 | GDPR | GDPR 6/9/13/28/32, rol, DPIA, ayrı alıcı/aktarım kontrolü | İNSAN/DPO/teknik test **BEKLİYOR** |
| J16 | Yayın | 594 orijinal R-ID, CI, portal önizleme, imzalı GO | KISMİ, **NO-GO** |

## 3. XML sözleşmesi ve uygulama sınırı

- Resmî `zoeken` filtreleri: `creator` (URI), `type`, `date` (1/2 ISO tarihler), `subject` (URI), `modified`, `return=DOC`, `max` (en fazla 1000), `from`, `sort`.
- ECLI ile karar `content?id=ECLI...&return=META`; resmi kaynak açılışı `https://uitspraken.rechtspraak.nl/details?id=ECLI...`.
- **Serbest metin filtre parametresi resmî bu webserviste belgelenmiyor**. Mahkeme alanı için değerin kaynakta `creator` URI olması, hukuk dalında `subject` URI olması gerektiğinden, mevcut endpoint sahte/dinamik URI oluşturmaz. UI'daki mahkeme/anahtar kelime/hukuk dalı/prosedür filtreleri **yalnız getirilen ilk 20 Atom entry üzerinde** yereldir; corpus full-text index değildir. Sıralama `modified` esaslıdır.
- En fazla 20 sonuç, 31 günlük aralık, metadata/ECLI doğrulama, en fazla 250K karakter XML, sunucu-side allowlist; haricî REST içerik HTML olarak basılmaz. Silinmiş kayıtlar `deleted` niteliklerinden çıkarılır.
- Cache aynı kullanıcı filtresi ile 5 dakika ve local 2s throttle, **dağıtık Vercel ortamında 10/s global garanti değildir**. Bu yüzden `LIVE_PUBLIC_API_ENABLED=false` sabit (ayrıca ENV) ve `/api/rechtspraak` HTTP 503 verir. **Bu, gerçek açık veri API entegrasyonunun çalıştığına dair E2E kanıt sayılmaz.**
- İşlevsel erişim sorunları: `data.rechtspraak.nl` XML endpoint doğrudan sistem araçlarınca okunamadı; resmî HTML sayfası üzerinden ECLI örnekleri doğrulandı. Sıfır sahte 'API başarısı'.
- Otomatik özet, hukukî mütalaa, tam karar içerik kopyalama, kişisel case ID, dava yönetimi veya temsil yetkisi burada yok.

## 4. Resmî gönderim makbuzu ve manuel işlem modeli

`portal/src/lib/official-justice-gates.ts`: `officialCourtConnectionEnabled=false`, `providerAccepted=false`, `indConnected=false`; hiçbir dosya `canTransmit` / `canMarkSubmitted` olamaz, sentetik testlerde bunlar sabit `false`. İltica, bewaring, IND objection/residence ve belirsiz işlem türü Aansluitpunt dışındadır.

Planlanan **staging veritabanı** alanları: ilgili `avofis_cases.id` UUID, gerçek usul/mahkeme kodu, ECLI, yalnız kişisel yetkili erişime açık resmî dosya numarası, tebliğ kaynağı/tarihi, sorumlu gerçek uzman, yazılı vekâlet sürümü/hash, iki ayrı onay, yerel işlem tarihi, resmî teslim mekanizması, doğrulanmış makbuzun kimliği ve güvenli depolama yolu. Bu dosya alanları olmadan "gönderildi" statüsü üretilemez.

**Yalnız genel bilgi UI'si:** `/ictihat` ve `/yargi-baglantilari`. `/api/rechtspraak` kapalı açık veri proxy; resmî dava eylemi endpoint'i oluşturulmadı. Kişisel dosya/kurumsal portal erişimine bağlanmıyor.

## 5. Sıralama / devam eden 594 ve B01–B18

1. B01/B02 canlı RLS açığı, B03 gerçek yedek, B04 ayrı Supabase Auth/Storage staging **bloklayıcıdır**. Önceki salt okunur pre/postflight ve sentetik testler olduğu gibi kullanılacak; izin almadan canlı SQL çalıştırılmayacak.
2. GDPR 6/9/13/28/32, meslekî yetki, Aansluitpunt sağlayıcı kabulü, NOvA ve IND ayrı onayları insan/DPO tarafından sağlanacak.
3. Açık içtihat için gerçek XML testi + **merkezî/global 10/s limiter** + cache invalidation + UI 6-dil/A11Y QA ve veri kaynağı değişim denetimi olmadan proxy açılmayacak.
4. Yetki/denetim olayları, personel ataması, gizli belgeler ve ECLI bağlantısının müşteri davasına bağlanması yalnız gerçek staging RLS/Auth testinden sonra.
5. Her iki teknik kilometre taşı için portal preview + doküman ve kanıt, main merge/payments/filing ve dışarı mesaj ayrı açık onayla.

## 6. Aansluitpunt Rechtspraak teknik bilgi talebi — GÖNDERİLMEMİŞ TASLAK

**To:** aansluitpunt@rechtspraak.nl  
**Subject:** Informatieaanvraag Aansluitpunt Rechtspraak – voorwaarden voor aansluiting softwareleverancier

Geachte heer/mevrouw,

Wij verkennen voor een in ontwikkeling zijnd dossiermanagementplatform de mogelijkheid om als softwareleverancier in de toekomst op het Aansluitpunt Rechtspraak aan te sluiten. Het platform is op dit moment niet aangesloten en verricht geen geautomatiseerde indieningen.

Kunt u ons informeren over de actuele voorwaarden voor aanmelding, de beschikbare technische documentatie en ondersteunde versies van het berichtenboek, eisen voor beveiliging en autorisatie, de toelating tot een acceptatie- of ketentestomgeving, het vereiste contactpunt voor technische begeleiding en eventuele certificerings- of operationele voorwaarden?

Wij begrijpen dat de aansluiting alleen beschikbaar is voor daarvoor ondersteunde civiel- en bestuursrechtelijke procedures en niet voor asiel-, bewarings- en toezichtzaken. Wij vragen geen toegang tot persoonlijke dossiers of productiegegevens.

Met vriendelijke groet,  
AVOfis – ontwikkelproject (afzender en rechtsvorm nog niet gevalideerd)

**Gönderim olmadı.** Gerçek şirket unvanı, yetkili imzacı, iletişim bilgileri ve temsil kapasitesi onaylanmadan kurum adına gönderilmez.

## 7. J07/J10 staging-yalnız metaveri ve negatif güvenlik testleri — 29.10.2026

- `database/migrations/20261029_judicial_metadata_staging_only.sql`: Mevcut `avofis_cases` UUID'sine FK ile bağlı **iç metaveri** (`country`, `court_code`, `procedure_family`, resmî numara, ECLI, tebliğ ve insan inceleme bazlı tarih). Genel yargı tablosunda `asylum`, `detention`, `ind` türleri **CHECK ile yasaklı**. Sahip veya yetkiyle atanmış personel, yalnız kendi dosyasını SELECT edebilir; yeni kayıt veya değişiklik yalnız doğrulanmış admin politikalarıyla yapılabilir.
- `public.avofis_judicial_local_events`: yalnız `draft_prepared`, `official_portal_opened`, `document_prepared`, `unverified_receipt_reported` olay tipleri; **`submitted`, `delivered`, `accepted` tipleri şemada yok**. UPDATE/DELETE yetkisi yok; yalnız admin ve `recorded_by=auth.uid()` insert. Bu, bağımsız değiştirilemez haricî audit veya doğrulanmış mahkeme makbuzu değildir.
- `database/tests/judicial_metadata_synthetic.sql`: disposable PostgreSQL17, admin C/A/B iki dosya, A/B satır izolasyonu, müşteri olay üretiminin reddi, `submitted` sahte kayıt reddi, iltica türü reddi, insan inceleme gerekçesi olmadan kesin deadline işaretleme reddi. İşlem sonunda `ROLLBACK`; **canlı veri yazımı yok**.
- `portal/src/lib/court-case-tracker.ts` ve `/ornek-yargi-dosyasi`: sentetik vaka/olay görünümü; gerçek makbuz olmasa bile kullanıcı simulasyonunun "gönderildi" durumuna dönmemesi test ediliyor.
- Gerçek Supabase staging Auth/JWT/Storage, RLS tenant/role, gerçek belgeler ve imzalı iki kişi onayı **halen zorunlu**. Buradaki migration **canlıya uygulanmadı**.

## 8. J05/J06 — atomik global limit, resmî Atom XML ve çalıştırma sınırı (29.10.2026)

**Kaynak/sözleşme:** [Rechtspraak Open Data](https://www.rechtspraak.nl/uitspraken/open-data) API çağrılarını **en çok 10/s** ile sınırlar. Sayfadaki [resmî v1.15 teknik PDF](https://www.rechtspraak.nl/SiteCollectionDocuments/Technische-documentatie-Open-Data-van-de-Rechtspraak.pdf) §§4.3 ve 5.1, `zoeken` için **iki `date` parametresi = kapsayıcı tarih aralığı**, `return=DOC`, `max` ve Atom `entry/id` yapısını doğrular. Bunlar resmî 2019 sürümü şartlarıdır; sağlayıcının güncel API değişim takibi gerekir.

**Kod:**
- `portal/src/lib/rechtspraak-shared-rate-limit.ts`: Redis `TIME` kullanan atomik `EVAL`, `ZREMRANGEBYSCORE` + `ZCARD` + `ZADD` ile **her kayan 1000 ms pencerede en fazla 8** resmî kaynak isteği; kapasite sınırının altında güvenlik payı bırakır. Aynı URL/token/Redis namespace **tüm Vercel dağıtımlarınca ortak** kullanılmalıdır; yerel tarayıcı/sunucu sayacı yeterli değildir.
- Bu Redis anahtarı ECLI, IP, ad, belge veya kullanıcı verisi almaz; sadece sabit `avofis:rechtspraak:upstream:global:v1` ve otomatik sıra numarası. Standart Redis erişim anahtarı yalnız sunucu gizli ortam değişkenindedir. Sunucu HTTPS `*.upstash.io` adresi dışında Redis hedefi kabul etmez.
- `portal/src/app/api/rechtspraak/route.ts`: mevcut 5 dk instance cache + local 2s ikincil sınır ve kaynak `fetch` öncesinde paylaşımlı rezervasyon; eksik Redis, HTTP hata, yanlış JSON veya kapasite aşımıyla **fail-closed**; yinelenen arama parametreleri reddedilir.
- **ÇOK ÖNEMLİ:** `LIVE_PUBLIC_API_ENABLED=false` ve varsayılan ENV kapalı. Bu teknik test kamu aramasını etkinleştirmez. Üretim Redis provision edilmedi; gerçek Upstash REST E2E, Redis sağlayıcı DPA/GDPR ve token rotation yetkilendirmesi yapılmadı.

**İşletim ve kabul kontrolü:** Sağlayıcının güvenli tek bölgeli Redis erişimi / sunucuların ortak namespace'i / servis kesintisinde 503 / Redis token ve bağlantı başına beklenmeyen maliyet/limit / gerçek Vercel çok-instance/çok-region stres testi / kaynak değişikliği ve indeks silinme yönetimi / erişim loglarında kişisel veri sızıntısı gözlemi ve GDPR incelemesi **BEKLİYOR**. Redis testinin başarıyla çalışması tek başına insan/yayın GO kararı değildir.

**Kanıt:** [Actions #40932745725](https://github.com/netadalet-oss/avofis-platform/actions/runs/40932745725) **5/5 SUCCESS**.
- Disposable Redis 7: ilk 8 istek ALLOW, 9. istek DENY; 32 paralel istemcide **8 ALLOW, 24 DENY**; 1100 ms sonra pencere yeniden izin verdi (`portal/scripts/rechtspraak-redis-atomic-ci.mjs`).
- Sunucu REST istemcisi sentetik HTTP birim testleri: geçersiz HTTPS/host, credential eksikliği, kullanıcı verisi taşımayan EVAL gövdesi, Redis 0/1 JSON, 500, bozuk JSON, timeout ve immutable namespace (`portal/scripts/rechtspraak-shared-rate-limit.test.mjs`).
- Resmî Rechtspraak XML: `content?id=ECLI:NL:HR:2026:1684&return=META` metaverisi **PASS**, 1.2 s arayla `zoeken?date=2026-10-16&date=2026-10-16&return=DOC&max=20&sort=DESC` isteği **PASS, 20 gerçek Atom entry** (`portal/scripts/rechtspraak-live-xml-probe.mjs`). Bu **resmî açık veri erişim kanıtıdır**, gerçek müşterinin dosyasına veya resmî yargı portalına erişim değildir.
- Portal CI: 18 IND + 12 triyaj + 4 release + 12 judicial + 4 Redis REST = **50/50 Node test**. B01/B02 eski PostgreSQL sentetik sertleştirme ve gerçek bağlı Supabase'deki RLS açığı hâlâ birbirinden ayrılır.

**İki kilometre taşı sonrası inceleme:** `/ictihat` mevcut kapalı API durumunu açıkça gösterir. Çevrimdışı etkileşimli HTML inceleme dosyası sadece üç resmi ECLI bağlantısını *tarayıcı içinde yerel olarak filtreler*, hiçbir ağ isteği yapmaz; dolayısıyla canlı veri entegrasyonu veya tam arşiv araması gibi gösterilemez.
