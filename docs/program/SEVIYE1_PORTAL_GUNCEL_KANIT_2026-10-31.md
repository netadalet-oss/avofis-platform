# AVOfis Seviye 1 — Portal güvenlik ve şeffaflık kanıt kaydı (31.10.2026)

**Ürün:** yalnız AVOfis web portalı. **Çalışma dalı:** `work/avofis-portal-s1-20261031`. Başlangıç `56697cdf19618c552373718840e2ae088bbc66ae`. Denetlenen son **kod/CI hedef commit**: `a536dfad17393a194cf7cae8b0ff1f33e68efaf7`. Taslak [PR #14](https://github.com/netadalet-oss/avofis-platform/pull/14), `main` değişmedi.

## Teknik eylem / ret matrisi

| Kimlik | Yapılan kod ve negatif ret davranışı | Kod ve test izi | Teknik sınır |
|---|---|---|---|
| AV-018 / B02 | Kamu footer'ında `user_metadata.role` ile yönetici sayma, `site_settings.footer` verisini onaysız okuma ve doğrudan `upsert` kaldırıldı | `portal/src/components/site-footer.tsx`; `portal/tests/public-footer-security.test.cjs` | Gerçek Supabase RLS ve CMS personel/yayın protokolü henüz düzeltilmedi |
| AV-097 | `/ilerleme` için tarihli dört başlıklı, düşük iddialı sayfa; kullanıcı verisi ve form yok | `portal/src/app/ilerleme/page.tsx`; footer bağlantısı; HTTP Next build testi | Bu bir yayına/insan onayına denk değildir; yalnız TR taslak |
| AV-025 / AV-090 | Ödeme webhook girişinde aynı imzalı `paymentsReleased()` kapısı ilk adım oldu; kapalıyken body, dış sağlayıcı ve DB erişimi yok | `portal/src/app/api/payments/webhook/route.ts`; `portal/tests/payment-webhook-closed.test.cjs` | Gerçek ödeme, iade, chargeback, webhook replay, sağlayıcı kabulü açık değil |
| AV-056 / AV-025 | Üretim belge taslağı için doğru production URL ve ortam bayrağı artık yeterli değil; `decideRelease` + `activeReleaseEvidence` + sabit kamu işlemi yetki kapısı gerekli | `portal/src/lib/document-draft-contract.ts`; `portal/scripts/document-draft-contract.test.mjs` | Staging Auth/Storage/RLS ve DOCX/PDF/hukukî kabul açık |

## CI / test ayrımı

- Güncel commit'e ait [API-admin-portal güvenlik doğrulama run 41250366944](https://github.com/netadalet-oss/avofis-platform/actions/runs/41250366944): **SUCCESS**.
- Aynı commit'e ait [portal build, kaynak güvenliği, document gate ve HTTP sayfa koşusu 41250366887](https://github.com/netadalet-oss/avofis-platform/actions/runs/41250366887): **SUCCESS**. Next.js build, sentetik güvenlik/document gate testleri ve gerçek yerel HTTP `/ilerleme` kontrolleri başarılı; yalnız bu kod HEAD ve CI test kapsamı için geçerlidir.
- `node --test portal/scripts/document-draft-contract.test.mjs` ve `npm run test --workspace portal` sentetik birim/HTTP kapılarını kontrol eder. Gerçek customer staging kabulü değildir.

## Haricî koşullar ve seviye statüsü

- Bağlı canlı Supabase'de tarihli salt okunur incelemeye göre 7 tabloda RLS kapalı ve `anon` CRUD yetkileri vardır. Canlı politika düzeltmesi **yapılmadı**; B01/B02 kapanmadı.
- B01–B18 ile gerçek Auth/Storage/tenant A-B, içerik sahipliği, personel MFA, 6 dilde editör/hukuk kontrolü, şirket ve meslekî yetki, bağımsız kabul **açıktır**.
- Başlangıç kabul sayacı: **0/594 bağımsız**, **0/594 canlı**; bu küçük teknik düzeltmeler sayaca eklenmez.
- `main` merge, production Vercel, canlı Supabase DDL/DML/RLS, gerçek müşteri/personel verisi, ödeme ve kurum başvurusu için ayrıca açık eylem onayı gerekir.
- Geri alma: değişiklikler henüz birleşmemiş ve yayınlanmamış PR #14 üzerindedir; Git revert/cherry-pick yalnız reviewer kontrolüyle yapılır.

## Devam eden Seviye 1 kuyruğu

1. B01/B02 için yetki modeli ve sentetik PostgreSQL ile gerçek bağımsız staging karşılaştırması.
2. Doküman/staff/Auth/Storage, role/owner/tenant politikalarının A/B negatif testleri.
3. Kişisel veri gerektirmeyen ilk hizmetin tarayıcı-E2E ve içerik/hukuk/dil insan incelemesi.
4. Tüm `R-001–R-594` satırları için ayrı teknik, test, hukuk, staging ve prod kabul izleri; kriter dolmadan seviye kapanış beyanı yok.
