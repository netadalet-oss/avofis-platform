# AVOfis Seviye 1 — bütün ürün yatay kapsam ve gerçek önizleme kanıtı (01.11.2026)

**Kullanıcı uygulama kuralı:** Her bir seviye AVOfis'in tüm alt sistemlerini yeniden içerir. Bu kayıt yalnız Seviye 1'de oluşturulmuş ana yüzeyleri ve güvenli sınırları listeler; önceki ürün özgün şartlarını değiştirmez.

## Tek ürünün yedi yatay alanı

| Alan | AV görevleri | Birinci seviye fiilî ekran/kod izi | Somut sınır |
|---|---|---|---|
| A0 — kaynak/program/teknik mimari | AV-001–010 | `/ilerleme`, `/seviye-1-onizleme`, `tools/process/whole-product-levels.cjs` | 101 AV ve 594 R kabul edilmiş değildir |
| A1 — kimlik/güvenlik/staging | AV-011–025 | `/uyum`, kayıt/giriş kapalı portal, staff AAL2 UI ön kontrolü, API güvenlik testleri | Canlı RLS 7 açık, ayrı staging yok |
| A2 — katalog/kitle/hukuk/dil | AV-026–051 | `/katalog`, `/hizmetler/[slug]`, `/islemler`, `/bilgi` | 17 hizmet, 14 kitle, 12 rota, altı dil; insan onayı yok |
| A3 — müşteri/dosya/belge | AV-052–061 | `/baslangic`, `/belge-hazirlik`, `/modules`, kapalı kamu login | Gerçek müşteri, veri yükleme, ödeme kapalı |
| A4 — 16 personel/yönetim modülü | AV-062–077 | Admin `/seviye-1-onizleme`, `/personel/[module]` üzerinden **16 ayrı Next.js sayfası**, kimlik ön kapısı | Statik ana işlev ve çıktı; canlı CRUD/atama yok |
| A5 — IND/yargı/finans | AV-078–092 | `/yargi-baglantilari`, IND 8, J01–J16 ve G1–G4 bilgilendirme; staff billing/payables ana ekranı | Resmî işlem/temsil/tahsilat kesinlikle açılmadı |
| A6 — kalite/yayın/işletim | AV-093–101 | CI, kaynak hash'li R izleri, insan onayı açıklaması ve `/uyum` | B01–B18, 0/594 bağımsız/canlı kabul |

## Teknik önizleme teslimi (gerçek kod, simülasyon çizimi değil)

- **Portal:** `portal/src/app/seviye-1-onizleme/page.tsx`, kaynak `portal/src/lib/whole-product-levels.ts`. Next ile render edilen gerçek route: `/seviye-1-onizleme`; kamu `/ilerleme` sayfasından bağlantısı bulunur. 33 R bölümü, 7 A, 17 hizmet, 14 kitle, 12 işlem, 16 personel, IND sekiz, J/P/T/B/G ve altı dili ayrı gösterir.
- **Admin:** `admin/src/app/seviye-1-onizleme/page.tsx`, ayrıca `admin/src/app/personel/[module]/page.tsx` ve `admin/src/lib/staff-module-directory.ts`; 16 modülün her biri ayrı, statik, veri toplamayan route. Bilinmeyen slug `404`.
- **API:** `api/src/modules/program/program.router.ts` ve `api/src/server.ts`: yalnız `GET /api/program/overview` teknik durum yanıtı; 14 modülün yetkili CRUD'u yok, `POST/PUT/PATCH/DELETE` reddedilir.
- Bunlar **development branch kaynaklarıdır**. Vercel'de aynı kod SHA'sı ile erişilebilir yeni bir dış preview deployment doğrulanmadan “canlı önizleme URL'si” verilmez.

## Kod ve CI delilleri (tam olarak denenen SHA)

- Portal bütün ürün ek kapsam kod+test HEAD `6e0c3593eede000320459ceab5cea27e2492d17d`: [Portal Next build + gerçek HTTP CI #41254060423](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254060423), [Public account/CMS CI #41254060451](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254060451), [API/admin regression CI #41254060434](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254060434): **3/3 SUCCESS**.
- Admin 16 modül + API ana iskeleti kod/test HEAD `d18a52ca0e2fe1daab7e204ccd7499d018804c6b`: [Gerçek admin Next build, 16 HTTP sayfası/404 #41254228132](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254228132), [API TypeScript + gerçek Express + 16 personel route testleri #41254228117](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254228117): **2/2 SUCCESS**.
- Tarihî başarısız gerçek alt denemeler: portal ilk SSR visible-text [#41253677665](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253677665) **FAIL**, admin Next.js geçersiz page export [#41253814753](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253814753) **FAIL**, admin ilk görünür metin [#41253905512](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253905512) **FAIL**, 16 modül başlığı küçük/büyük harf test [#41254150584](https://github.com/netadalet-oss/avofis-platform/actions/runs/41254150584) **FAIL**. Düzeltilmiş CI başarılı olsa da önceki hata geçmişi silinmez; sonraki seviyede iki yeni regresyon denemesi kuralı geçerlidir.

## Her seviyede tüm kapsamı işletme modeli

- `tools/process/whole-product-levels.cjs` ve testleri 1–12 tüm seviyelerde 101 AV, 594 R, 7 A, 17 hizmet, 14 kitle, 12 rota, 16 personel, 8 IND, 16 J, 10 P, 18 B, 13 T, altı dil sayısını korur.
- Devreden başarısız her özgün iş sonraki her seviye için **iki ayrı yeni test/deneme** yükümlülüğü alır. Gerçekte yapılmayanı denendi diye kaydetmez.
- Seviye 1'e ait ana route bulunması **modüllerin bütün işlevlerinin kabul edildiği anlamına gelmez**. Seviye çıkışı için modül ana işlevinin ve ret sınırının kod/gerçek UI kanıtı; dış imza/production için ayrı kanıt gerekir.
- Her seviye sonunda gerçek portal ve admin önizlemeleri **güncel SHA/CI** ile teslim edilir. Onay butonu yalnız tamamlanmış seviye sonu değerlendirmesinde sunulacak.

## Açık zorunlu ret koşulları

- Proje özel Supabase canlı **7 RLS ERROR** ve bir Auth parola uyarısı; ayrı staging branch sayısı son kontrol `0`. Gerçek veriyle deneme/DDL/DML yapılmadı.
- Tarihî `.env.local` sırrı olup olmadığı ve gerekiyorsa rotasyon; Git `main` branch protection; deterministik lockfile; 64 kurumsal/finans/meslekî karar; resmî kurum yetkisi, tercüme/hukuk insan incelemesi ve cihazlar arası E2E açık.
- Bu kayıt **Seviye 1 son onayı değildir**; başlangıç kabul `0/594` bağımsız ve canlıdır. `main`, PR birleştirme, üretim Vercel veya üretim Supabase değişmedi.
