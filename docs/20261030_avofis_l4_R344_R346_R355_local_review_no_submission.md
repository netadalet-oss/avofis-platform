# AVOfis v18 — Seviye 4 uygulama dilimi 4: R-344 / R-346 / R-355

**Tarih:** 30 Ekim 2026. **Durum:** Seviye 4 devam, Seviye 5 KİLİTLİ. PR #5 taslak, canlı sistem NO-GO.

## Özgün kullanıcı talimatına birebir kaynak bağlantısı

- **R-344:** “Sorunun kategori seçimini serbest metinle destekle ama seçilen yolu kullanıcıya doğrulat.”
- **R-346:** “Resmî yazı/karar alınıp alınmadığını ve alınma tarihini sor.”
- **R-355:** “Başvuru özeti ve kullanıcının beyanlarını gönderimden önce denetlet.”

Kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, 20. bölüm.

## Kodlanan dar L4 teknik alt kapsamı

1. `portal/src/lib/public-triage-review.ts`: tarihi kullanıcı beyanı olarak tutan ve gerçek takvim gününü kontrol eden, hukukî süre veya tebligat geçerliliği hesaplamayan `isValidCalendarDate` ve `buildLocalTriageReview` fonksiyonları. Geçersiz tarih çıktı alanına taşınmaz; bir başvuru/dosya/reference oluşturulmaz.
2. `portal/src/app/triyaj/page.tsx`: yalnız `notice_received` seçilince görünen isteğe bağlı tarih alanı. Tarih yalnız React yerel durumunda tutulur ve resmî kurumla, gerçek CRM ile veya ödeme/IND kanalıyla paylaşılmaz.
3. Aynı ekran: isteğe bağlı, en çok 160 karakterlik kısa anonim açıklama. Kullanıcı isim, telefon, adres, kimlik, dosya numarası ve hassas olgu yazmaması için uyarılır. Açıklama otomatik konu sınıflandırmasına katılmaz; konu kategorisi ayrı görünür ve özetle kullanıcının incelemesine sunulur.
4. Seçim özeti ve `Seçimlerimi kontrol ettim` kutusu yalnız yerel kontrol durumudur. Seçim veya açıklama değiştiğinde önceki onay geçersiz olur. Hiçbir `submit`, kaydetme, API isteği, hukuki danışmanlık, dosya oluşturma, ödeme veya başvuru makbuzu oluşturulmaz.
5. `portal/scripts/public-triage-review.test.mjs`: gerçek takvim tarihleri/artık yıl ayrımı, geçersiz/boş beyanların reddi, 160 karakter sınırı, konu seçiminden bağımsız açıklama ve gönderilmeyen kontrol alanı için olumlu/olumsuz Node testleri. Mevcut `public-triage.test.mjs` korunur.

## Doğrulanan / doğrulanmayan

- Kod ve sentetik test: [GitHub CI #41085787119](https://github.com/netadalet-oss/avofis-platform/actions/runs/41085787119), **6/6 iş başarı** (L4 yardımcısının koştuğu sürüm).
- R-344/346/355, yalnız bu yerel ve kimliksiz kamu triyajı parçalarında **KISMİ TEKNİK KANIT**. Tam ve gerçek başvuru sistemine ilişkin asıl R gereksinimi için meslekî/insan onayı, istemci izolasyonu ve gerçek E2E kanıtı yoktur.
- 973 özgün iş kimliği korunur; **13/973 yeni L4 kod kapsamı kayıtlı, 54/594 R kısmi, 4/113 sentetik ek teknik, 0/973 bağımsız kabul**.
- **18/18 L3 kararı açık**, 7 canlı RLS güvenlik sorunu ve Auth WARN çözülmüş sayılmıyor. `ops/avofis-l4-implementation-evidence.json`, `ops/avofis-work-progress.json` ve L0–L3 regression kontrolleri ile iş kimliği kanıtı korunur.
- Kullanıcı “Bir seviyeyi tamamlamadan diğer seviyeye geçme ve bekleme çalış” diyerek mevcut L4 çalışmasına devamı teyit etmiştir; bu komut **L5 veya canlı ortam izni değildir**.

Bu tutanak, tasarım ve kod kanıtını bağımsız ürün kabulünden kesin biçimde ayırır.
