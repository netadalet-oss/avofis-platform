# AVOfis v18 — Seviye 4, kaynaklı kod dilimi: R-345 / R-349 / R-350
**Tarih:** 30.10.2026 · **Dal:** `feature/avofis-v17-two-person-clearance-20261029` · PR #5 DRAFT.

## Yetki ve kapı
Kullanıcının son “Onaylıyorum devam et” ifadesi **L4 içinde ilerleme** olarak işlenmiştir: L0–L3 kullanıcı onaylı; L4 kod/test sürer, **L5 KİLİTLİ**. Hiçbir canlı Supabase, Auth/Storage, Vercel production, ödeme, IND/mahkeme filing, main merge veya gerçek müşteriye açılış yapılmamıştır.

## Doğrudan 594 özgün kaynaktan dayanak
- **R-345**: “Karşı taraf türünü kişi, işveren, kurum, şirket veya diğer olarak sınıflandır.”
- **R-349**: “Başvuru tipini genel bilgi, kısa görüşme, belge inceleme ve ayrıntılı dosya analizi olarak sun.”
- **R-350**: “İlk başvuruda zorunlu kişisel veri alanlarını en aza indir.”

Kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, özgün 20. bölüm. Başvuru motorunun tamamı uygulanmış değildir: bu **oturumsuz, kimlik ve dosya almayan kamu triyajı** alt kapsamıdır.

## Fiilen uygulanan kod
1. `portal/src/lib/public-triage.ts`: `counterpartyTypes` (kişi/işveren/kamu kurumu/şirket/diğer/bilinmiyor) ve `requestTypes` (genel bilgi/kısa görüşme/belge inceleme/ayrıntılı analiz/bilinmiyor) whitelist'leri eklendi.
2. Üç kişiselleştirilmiş görüşme/belge/dosya talebi bir müşteri dosyası açmak veya ödeme kabul etmek yerine `SPECIALIST_REVIEW` verir; `PAID_OR_PERSONALISED_SERVICE_REQUIRES_SEPARATE_HUMAN_CONTRACT_REVIEW` uyarısı üretir.
3. Belirsiz `unknown` ya da `other` karşı taraf için ayrı `COUNTERPARTY_CATEGORY_REQUIRES_REVIEW`, belirsiz talep türü için `REQUEST_TYPE_REQUIRES_REVIEW` üretilir.
4. Çalışma zamanında **sadece dokuz ayrık/boolean alan** kabul eden kontrol eklenmiştir; `name`, `email`, `phone`, `caseNumber`, `noticeDate`, `opposingPartyName`, serbest metin ve diğer sürpriz kişisel alanlar, herhangi bir kayıt veya tekrar yansıtma olmadan `INVALID_OR_UNKNOWN_INPUT` ile fail-closed olur.
5. `portal/src/app/triyaj/page.tsx`: TR/NL/EN kamu arayüzünde iki seçici eklendi; isim girilmemesi ve seçimlerin rezervasyon/sözleşme/dosya açılışı olmadığı açıklandı. Mevcut ayrı hak kaybı ve süre uyarısı (R-347/R-348) korunuyor.

## Testler ve gerçek delil sınırı
`portal/scripts/public-triage.test.mjs`: çoklu ülke, bütün türler, kişiselleştirilmiş talepler, bilinmiyor, karşı taraf, PII enjeksiyonları, sahte enumlar, UI seçicilerinin varlığı ve ödeme/kayıt/yetki yasağını kontrol eder.
- Kaynak kod/test değişikliğinde başarılı sentetik GitHub CI: [#41080322793](https://github.com/netadalet-oss/avofis-platform/actions/runs/41080322793), ilgili SHA `a848f0d11ef34431908eb95893f6e3e53dfba5fb`.
- `ops/avofis-l4-implementation-evidence.json`: üç R-ID için kod/test izi, gerçek CI linki ve `independentAcceptance:false`.
- `ops/avofis-work-progress.json`: toplam **46/594** kısmi R teknik kanıtı (önceki 43 + yeni 3), **0/973** bağımsız kabul, **4/113** sentetik ek paket, **NO-GO**.

**Eksik:** Gerçek kullanıcı/Auth, güvenli kişisel form, telefon/e-posta tercihi, resmî bildirim tarihi, çıkar çatışması, sözleşme/kabul/ödeme, altı dilin tam hukukî QA’sı, gerçek staging E2E ve bağımsız insan onayı. R-350’nin tamamen bittiği iddia edilmez; yalnız ilk, kişisel olmayan triyaj için veri minimizasyonu doğrulanmıştır. Bu kod hukukî süre hesaplamaz ve başvuruya ilişkin resmî makbuz üretmez.

## Kararlar ve aşama sınırı
`ops/avofis-l3-open-decisions.json`: özgün **18 L3 kararının 18’i de OPEN**; `L3-DEC-01` DOCX/AV, `02` özgün CHK başlıkları, `03` gerçek staging, `04` canlı RLS/Auth, `05–06` özel belge rızası/signed URL, `07–15` hukuk/finans/erişim, `16–18` operasyon ve kanıt. Hiçbiri bu kod dilimiyle kapanmadı. **L5 kullanıcı onayı alınmadı ve açılmadı.**
