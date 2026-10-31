# AVOfis v17 · T07/T08 kabul ve yayın kapıları — 29.10.2026

**Çalışma durumu:** draft PR #5, yalnızca güvenli geliştirme dalı. İnsan/hukuk/DPO onayları yok. Canlı şema, ödeme, müşteri kabulü ve resmî temsil kapalı.

## T07 — Altı dilde içerik ve hukukî redaksiyon

| Dil | Mevcut doğrulanabilir ürün yüzeyi | Hukukî editör ve yerel profesyonel onayı | Yayın kısıtı |
|---|---|---|---|
| TR | Ana kamusal sayfalarda TR; 17 alanlı katalog | BEKLİYOR | Ülke/işlem terimleri ve süreler meslekî kontrolden geçmedi |
| NL | Bazı çekirdek sayfalar, 17 alanlı katalog | BEKLİYOR | Bağımsız Hollandaca hukukçu redaksiyonu yok |
| DE | 17 alanlı katalog; çekirdek formlarda tam dil desteği yok | BEKLİYOR | Yalnızca genel bilgilendirme; Almanya'da faaliyet ve yetki iddiası yok |
| EN | Bazı çekirdek sayfalar, 17 alanlı katalog | BEKLİYOR | Hukukî kalite/meslekî yetki onayı yok |
| AR (RTL) | 17 başlıklı katalog; hukukî ayrıntılar onaysız açıkça belirtilir | BEKLİYOR | `dir=rtl` demo; hukukî tercüme tamamlanmış sayılmaz |
| RU | 17 başlıklı katalog; hukukî ayrıntılar onaysız açıkça belirtilir | BEKLİYOR | İnsan redaksiyonu olmadan kişisel tavsiye ve başvuru yok |

**Kod:** `portal/src/app/diller/page.tsx`, `portal/src/components/avofis/PublicNav.tsx`, mevcut `portal/src/app/katalog/page.tsx`. Altı dil *erişim menüsünde* bulunur; çekirdek form/akışların tümünün altı dilde tamamlandığı veya onaylandığı iddia edilmez. DE/AR/RU tam çeviri olmayan rotalarda eksik çeviri olduğuna dair katalog uyarısıyla yönlendirilir.

**Kabul öncesi insan işleri:** görev bazlı çevirmen ve Hollanda/hizmet ülkesi hukuk editörü atanması; TR/NL terim sözlüğü (bezwaar/beroep/advocaat/jurist vb.); 17 hizmet × 6 dil × ülke için güncel resmî kaynak/son kontrol tarihi; kritik içerik diğer dillerde eski kaldığında otomatik kapatma; AR/RU ekran okuyucu ve klavye denetimi. Mevcut test sadece link/RTL smoke; **WCAG, hreflang veya editör onayı değildir**.

## T08 — Yayımlama öncesi gerçek veri/ücret ve tüketici kontrolü

| Uyum kapısı | Gerekli insan/kurum kanıtı | Mevcut durum |
|---|---|---|
| Tescil / KVK / çalışma / yetki | Gerçek sicil ve faaliyet/meslek belgeleri | ONAY YOK |
| GDPR m. 13 | Doğru veri sorumlusu ve iletişim, amaç/dayanak, alıcılar, haklar, saklama ve uluslararası aktarım | ONAY YOK |
| Veri envanteri / DPA / DPIA | Gerçek sağlayıcı listesi, DPA, saklama/DSAR/silme/ihlal, aktarım/ülke kontrolü | ONAY YOK |
| Çerezler | Mevcut çerez ve skript envanteri; gerektiğinde önceden ayrı tracking onayı ve ret/geri çekme | DENETİM BEKLİYOR |
| Hukukî dil, kapasite | Altı dilde bağımsız dil/hukuk editörü ve prosedür ülke kontrolü | ONAY YOK |
| Tüketici ve ticaret | Gerçek şirket/iletişim/fatura/ücret/KDV/harç, sözleşme, cayma/istisna, iptal/iade/şikâyet, gerekiyorsa dijital cayma butonu | ONAY YOK |
| Teknik güvenlik | Ayrı Supabase staging, gerçek Auth/JWT/Storage A/B, RLS, yedek/geri alma, operasyonel gözlem | BEKLİYOR |
| Nihai proje sahibi | Yukarıdaki tüm kanıtların tarihli ve imzalı Go kararı | ONAY YOK |

**Kanıt yolu:** `portal/src/lib/release-authorization.ts`, `portal/src/lib/public-release-status.ts`, `portal/scripts/release-authorization.test.mjs`, `portal/src/app/api/intake/route.ts`, `portal/src/app/api/payments/checkout/route.ts`, `portal/src/app/basvuru/page.tsx`, `portal/src/app/uyum/page.tsx`, `portal/src/app/cerezler/page.tsx`.

- `activeReleaseEvidence=null` ve `publicCustomerTransactionsAuthorized=false` (iki bağımsız yazılım bariyeri).
- Sadece `AVOFIS_LEGAL_READY`, `AVOFIS_INTAKE_ENABLED`, `NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED` veya `AVOFIS_PAYMENT_ENABLED` bayrağını açmak artık başvuru/checkout yetkisi vermez. Her onay alanı dolu, owner seal ayrıca açılmış ve teknik flag ayrı açık olmalıdır.
- API cevaplarının fail-closed davranışı önceliklidir. Banka/PSP webhook'unda geçmiş ödemeleri iade/uzlaştırma ihtimali nedeniyle yeni iptal kapısı icat edilmedi; o yol ayrıca staging ve ödeme sağlayıcı E2E gerektirir.
- Buradaki `ReleaseEvidence` **sahici belge veya imza doğrulama sistemi değildir**; örnek testte uydurma imzalar yalnızca mantık testidir. Gerçek release kararı ayrıca imzalı resmî belge, DPO/hukuk onayı ve bağımsız kod incelemesi gerektirir.
- Çerez sayfası mevcut çerez/haricî JS envanterinin tamamlandığını iddia etmez ve dekoratif/onaysız consent banner oluşturmaz; izleme/analitik kullanılacaksa gerçek envanter ve rıza mekanizması gerekecektir.

## Kanıt kriterleri ve ilgili gereksinimler

| R-ID | Kanıtın ilerlediği alan | Bitiş durumu |
|---|---|---|
| R-487 | TR/NL/EN çekirdek nav; 6 dil katalog/hub bağlantısı | KISMİ: DE/AR/RU tam form dil desteği yok |
| R-493 | 6 dil için insan hukukî editör bekliyor kaydı | KISMİ İŞ AKIŞI, onay yok |
| R-494 | Diller arasında yetki ve hizmet kapasitesi abartısını önleyen uyarı | KISMİ KOD |
| R-501 | Arapça statik RTL, yön / `lang` | KISMİ KOD, A11Y gerçek test yok |
| R-503 | `lang` ve `dir` işaretleri | KISMİ TEST, ekran okuyucu yok |
| R-505/R-506 | veri işleme/Article 13 gerçek bilgiler olmadan genel başvuru kilidi | GÜVENLİK KAPISI KISMİ, GDPR ONAY YOK |
| R-515/R-516 | çerez envanteri/özgür onay ihtiyacı kamuya açıklanır | TASARIM/KISMİ, consent manager yok |
| R-456/R-457/R-458 | gerçek sözleşme/cayma/tüketici hakları açılışını insan onayına bağlama | AÇILIŞ KAPISI KISMİ; sözleşme/buton hukukî kabul yok |
| R-463/R-465 | onaysız ödeme oluşturmayı sunucu düzeyinde kapatma | KISMİ GÜVENLİK; gerçek PSP sandbox/reconciliation yok |
| R-587 | yüksek riskli yayın kilidinin env ile aşılamaması | SENTETİK BİRİM + HTTP KANITI, final sign-off yok |

## Sonraki zorunlu adımlar

1. Bağımsız gerçek Supabase staging ve iki müşteri / ayrı personel Auth/Storage/BOLA testi.
2. Veri envanteri ve Art. 13 bildiriminin gerçek veri sorumlusu ve DPO ile doldurulması; onay gerektiren tracking varsa CMP ve çerez envanter testi.
3. Ücret/sözleşme/tüketici cayması/hizmet sınırları için Hollanda hukuk müşaviri ve proje sahibinin tarihli onayı.
4. Altı dil için insan editörü, yerel hukuka uygun terim sözlüğü, AR RTL ekran okuyucu ve gerçek mobil QA.
5. Bunlar olmadan `main` merge, canlı SQL, kişisel veri kabulü, ödeme veya IND temsil yok.

Resmî referanslar:
- https://autoriteitpersoonsgegevens.nl/nl/onderwerpen/internet-telefoon-tv-en-post/cookies
- https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/heldere-en-misleidende-cookiebanners
- https://eur-lex.europa.eu/eli/reg/2016/679/oj
