# AVOfis v18 — Seviye 4 R-375 ve R-376 kaynaklı teknik ilerleme

**30.10.2026** · PR #5 taslak · **Seviye 4 hâlen devam ediyor; Seviye 5 KİLİTLİ**

## Özgün talimatname
- **R-375:** “Her formda kanıtların neler olduğunu sor; ilk aşamada hepsini zorunlu yükletme.”
- **R-376:** “Kullanıcıya verdiği bilginin doğruluğunu gönderimden önce özet ekranında göster.”

Kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, 21. bölüm.

## Gerçekten kodlanan güvenli alt kapsam
- `portal/src/lib/public-triage.ts`: delil/kanıt türleri yalnız `none/official_decision/contract/correspondence/other/unknown` kategorileri; gerçek belge veya tanımlayıcı veri toplanmaz. Belirsiz tür insan kontrolüne gider.
- `portal/src/app/triyaj/page.tsx`: ilgili alan seçilebilir, **hiçbir dosya yükleme veya hizmet kabulü yoktur**. Kişinin 12 genel kategori/risk seçimi, varsa cihaz içi kısa açıklama ve kendi bildirdiği tarih okunabilir yerel özette gösterilir.
- Kullanıcı birinci kutuyla özetini okuduğunu, ikinci ayrı kutuyla verdiği genel bilgilerin doğruluğunu kontrol ettiğini işaretleyebilir. Bunlar ne elektronik imza ne hukukî kabul ne de resmî başvuru sayılır; giriş değişirse kontrol işaretleri geçersiz olur.
- `portal/scripts/public-triage.test.mjs` ve `portal/scripts/public-triage-review.test.mjs`: altı kanıt türü, geçersiz/potansiyel kişisel alanların reddi, yükleme yokluğu ve ayrı doğruluk kontrolünü denetler.
- **Geçen CI:** https://github.com/netadalet-oss/avofis-platform/actions/runs/41087341496 (6/6).

## Kapsam ve sayım sınırları
- **R-375 zaten kısmi teknik kanıtlıydı**; bu uygulama yeni tam iş sayısı doğurmaz.
- **R-376 yeni kısmi teknik kanıt** olarak tekil iş defterine eklenmiştir.
- Güncel 973 kapsamı: **16/973 yeni L4 kod kanıtı**, **55/594 R kısmi teknik kanıt**, **4/113 ek sentetik kanıt**, **0/973 bağımsız kabul**.
- 18 L3 kararı AÇIK, gerçek Auth/Storage staging E2E doğrulanmadı, canlı RLS ve Auth güvenlik uyarıları çözülmüş kabul edilmedi. `L5=LOCKED`, `productionStatus=NO_GO`.

Bunlar tüm özel konu başvuru formlarının uygulanması, bütün delil kabul süreçlerinin açılması veya gerçek müşteri beyanının hukuken doğrulanması değildir.
