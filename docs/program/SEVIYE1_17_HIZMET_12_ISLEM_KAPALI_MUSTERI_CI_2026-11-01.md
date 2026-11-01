# AVOfis Seviye 1 — 17 hizmet / 12 işlem / müşteri-IND kapıları gerçek HTTP kanıtı (01.11.2026)

**Kapsam:** AVOfis Portal, yalnız geliştirme dalı `work/avofis-portal-s1-20261031`; taslak PR #14. Kullanıcının güncel talimatı gereği Seviye 1 **bütün** modül ailelerinin en üst işlev düzeyini kapsar; daha sonraki her seviyede aynı kapsam ayrıntılandırılır.

## A0–A6 kapsam ve son değişiklikler

| İş alanı | Kod izi / gerçek davranış | Güvenlik ve kabul sınırı |
|---|---|---|
| A0 kaynak ve kalite | `portal/src/lib/whole-product-levels.ts`, `docs/program/AVOFIS_STAGE1_WHOLE_PRODUCT_CONTRACT_2026-11-01.json`, `/ilerleme`, `/seviye-1-onizleme` | 101 AV / 594 R kayıtlı olması bağımsız kabul değildir |
| A1 güvenlik, Auth, veri | `client-workspace-release.ts`; `/musteri`, `/yonetim`, `/auth/update-password`, `/auth/forgot-password` negatif testler | Yalnız `NEXT_PUBLIC_*` bayrağı müşteri/personel CRM, parola güncelleme, belge okuma/yazma veya IND aktivasyonunu açamaz |
| A2 katalog ve diller | 17 gerçek `/hizmetler/[slug]` sayfasının tamamında yerel işaretlenebilir hazırlık listesi, `ServicePreparationChecklist`, `robots:noindex` | İşaretleme hukukî hazır olma veya kurum kabulü değildir; altı dil insan incelemesi açık |
| A3 kişisel verisiz yolculuk | `WholeProductExplorer`: 17 hizmet ve 12 işlem arasında yerel seçim/gezinme; `/baslangic`, `/islemler`, `/belge-hazirlik` | PII, hesap, başvuru, gerçek dosya ve ödeme yok; açık yönlendirme/redirection yok |
| A4 personel ve CRM | `/yonetim` yönetici/staff sorguları yayın kapısında reddedilir; daha önceki 16 personel kapsamı portal ana görünümünde listelenir | Gerçek personel işlevi uygulama/admin dalında sentetik olarak geliştirilir; Supabase staff otoritesi doğrulanmadı |
| A5 resmî kurum/IND | `/yonetim/ind-inceleme` artık iki public env bayrağı **ve ayrıca** kodda owner release seal gerektirir; `load` ve `save` kapalı; `/yargi-baglantilari` bilgilendirme | IND dosya temini, mahkeme bağlantısı, temsil ve ödeme izni yok |
| A6 CI ve yayın | Next build/HTTP, güvenlik ve kanonik kapsam testleri. İlerleme sayfasındaki eski `856ea77d` “son doğrulama” ibaresi kaldırıldı | `main` merge, bağımsız staging, meslekî/hukukî onay ve canlı yayına geçiş yok |

## Son kodun gerçek CI / HTTP sonuçları

- Güvenlik, kamu hesap/CMS, katalog ve portal Next + **17 hizmetin tamamında gerçek yerel HTTP** kontrolü: Kod ve test HEAD `a4bffd93c3b00a4eea8d4a1a590cf73f85f647bb`.
- [Portal Next build + bütün 17 katalog hizmet sayfasında gerçek HTTP #41256065609](https://github.com/netadalet-oss/avofis-platform/actions/runs/41256065609) **SUCCESS**.
- [Kamu hesap/CMS ret testleri #41256065620](https://github.com/netadalet-oss/avofis-platform/actions/runs/41256065620) **SUCCESS**.
- [17 hizmet içeriği CI #41256065653](https://github.com/netadalet-oss/avofis-platform/actions/runs/41256065653) **SUCCESS**.
- [API, admin, portal negatif regresyonları #41256065657](https://github.com/netadalet-oss/avofis-platform/actions/runs/41256065657) **SUCCESS**.
- Önceki CI aynı kod ailesinde, eski metin SHA'sını zorlayan `public-footer-security.test.cjs` yüzünden [#41255979478](https://github.com/netadalet-oss/avofis-platform/actions/runs/41255979478) **FAIL** olmuştu. Test güncel kanıt ilkesine göre düzeltildi; yukarıda **SUCCESS**. Önceki hata silinmedi ve uygulama tarafı devir defterinde yer aldı.
- İki ayrı dalda `AVOFIS_STAGE1_WHOLE_PRODUCT_CONTRACT_2026-11-01.json` için Git blob **`f95c284902fb5ad33201ee0ef20114fec35434c4`** aynı doğrulandı. Gerçek portal ve uygulama CI, kodla sözleşmenin uyuştuğunu ayrı ayrı kontrol eder.

## Sınır ve dürüst önizleme

- Gerçek, derlenebilen portal yolları `/seviye-1-onizleme`, `/hizmetler/[slug]`, `/baslangic`, `/islemler`, `/uyum`, `/ilerleme` ve diğer modüllerdir. GitHub CI testinde `localhost:3000` HTTP ile erişim kanıtlandı. Bu, internette herkese açılmış ve ayrı staging ile doğrulanmış Vercel URL'si değildir.
- Bağımsız Supabase staging henüz kanıtlanmadı; 7 canlı public RLS güvenlik hatası ve bir Auth uyarısı; gerçek kurucu/meslekî yetki, DPO/GDPR, sözleşme, ücret, altı dilin hukukî insan onayı açık.
- `main`, production Vercel, üretim Supabase, gerçek ödeme ve resmî kurum gönderimi değiştirilmedi.
- **Seviye 1: IN_PROGRESS; bağımsız R kabul 0/594, canlı R kabul 0/594.** Bu dosya tüm modüllerin son ayrıntılarına ulaşıldığı veya Seviye 2 geçiş onayı verildiği anlamına gelmez.
