# AVOfis v18 — Seviye 4 (L4) uygulama tutanağı: İlk doğrulanmış kod dilimi

**30 Ekim 2026. Durum: L4 DEVAM EDİYOR; L5 KİLİTLİ; üretim NO-GO.**

## Onay zinciri ve kapsam
- L0 sekiz ana kol: kullanıcı onaylı.
- L1 63 alt program: kullanıcı onaylı.
- L2 63 modül + 142 iç akış + 12 çapraz yolculuk: kullanıcı onaylı.
- L3 973 tekil teknik sözleşme + 18 açık tasarım kararı: kullanıcı onaylı. Kullanıcı ayrıca **açık kararları çözülmüş saymamayı ve L5'e onaysız geçmemeyi** talep etti.
- L4 uygulamaya açıldı; **973 işin hepsi uygulanmış değildir**. Bu teslim yalnız R-347 ve R-348'e bağlı kod değişiklikleri, bunların sentetik testleri ve 973-ID uygulama kanıt denetleyicisidir.

## Gerçek kod değişiklikleri
1. `portal/src/lib/public-triage.ts` — kullanıcının **kendi tahmini** `within_7d` süresini `SPECIALIST_REVIEW` kategorisine yönlendirir ve `SELF_REPORTED_NEAR_TERM_REQUIRES_HUMAN_REVIEW` işaretini üretir. 48 saat ihtimali, ciddi zarar ve gözetim/sınır dışı durumları `URGENT_SPECIALIST` kalır. Hukukî süre hesaplanmaz.
2. `portal/src/app/triyaj/page.tsx` — erken uyarıyı ayrı erişilebilir bir `fieldset` içinde gösterir; TR/NL/EN ekranında bu modülün **hesaplama, dosya açma, resmî gönderim veya süreyi durdurma** işlevi olmadığı açıktır. Altı dilin hukukî/ana dil kalite kabulü **yapılmadı**.
3. `portal/scripts/public-triage.test.mjs` — ülke ayrımı yapılmadan 7 günlük olası yakınlık, ciddi riskin yükseltilmesi ve tüm yönlerde PII/intake/upload/payment/official-filing kapılarının kapalı kalması için otomatik test.
4. `ops/avofis-l4-implementation-evidence.json` ve `portal/scripts/l4-evidence-audit.mjs` — 973 kaynak ID'den herhangi birinin silinmesini/taşınmasını, sahte kod/test dosyası kanıtını, 18 karardan herhangi birinin sessizce kapatılmasını, L5 kilidinin açılmasını ve CI'nin bağımsız insan kabulü yerine geçirilmesini reddeder.
5. `portal/scripts/l4-evidence-audit.test.mjs` ve `.github/workflows/avofis-integrated-catalog-ci.yml` — ters senaryolu kimlik/kapsam/karar/kanıt testleri ana CI'nin `portal-validation` işine bağlıdır.

## Kanıt
**6/6 başarılı CI:** https://github.com/netadalet-oss/avofis-platform/actions/runs/41078985634

İlk kod/test doğrulaması: https://github.com/netadalet-oss/avofis-platform/actions/runs/41078423203

Bu testler gerçek Auth, Storage, sentetik olmayan hukukî insan incelemesi, Hollanda/IND/yargı kurumu işlemi, ödeme veya fizikî cihaz/erişilebilirlik E2E'si değildir.

## İlerleme (bağımsız kabul ile karıştırılmaz)
| Ölçü | Sonuç |
|---|---:|
| L0 iskelet / L1 / L2 / L3 teknik kapsam | 8/8; 63/63; 63/63; 973/973 tasarım |
| Bu tur yeni teknik kod kanıtlı R-ID | **2/973** takip kaydı (R-347 ve R-348); bu bir bitiş oranı değildir |
| Bu turda yeni uygulama kanıtı olmayan diğer ID'ler | **971/973** |
| R-ID kısmi teknik kanıtı (toplam) | **43/594** |
| B01–B04 sentetik yardımcı iş kanıtı | **4/113** |
| **Bağımsız onaylı/tamamlanmış iş** | **0/973** |
| Açık L3 tasarım kararı | **18/18 AÇIK** |
| B01–B18 bağımsız prod engeli kapanışı | **0/18** |
| Gerçek ayrı Supabase staging Auth/Storage E2E | Doğrulanmadı |
| Canlı karar | **NO-GO** |

**Süreç kuralı:** Kullanıcı L4 sonuçlarını ayrıca onaylamadan L5'e **geçilmez**; PR #5 taslak kalır. Canlı SQL, main'e merge, prod deploy, IND/yargı filing, gerçek ödeme veya müşteri kabulü için ayrıca operasyonel yetki gerekir.

## Özellikle kapanmayan açık kararlar
- L3-DEC-01 / R-398: DOCX yükleme gereksinimi ile mevcut B04 MIME sınırı çelişiyor; DOCX açılmadı.
- L3-DEC-02: sekiz kontrol listesinin arşiv kaynak adı/slug'u bulunmadı; uydurulmadı.
- L3-DEC-03–15, 17–18: gerçek staging, RLS/Auth, belge-özel consent/revoke, imzalı URL, yetki, GDPR, ödeme, altı dil, WCAG, gerçek AAL2, bağımsız hukuk/operasyon kabulü ve fizikî API/SQL doğrulaması bekliyor.
- L3-DEC-16: L3→L4 çalışma izni **alındı**, ancak kaynak karar satırı insan/operasyonel sınırlar bakımından **AÇIK kalır**. Kullanıcının talimatı gereği hiçbir açık karar otomatik çözülmüş olarak işaretlenmedi.

## Ana kaynaklar
- `ops/avofis-work-progress.json`: 0/973 bağımsız kabul, 43/594 kısmi R, 4/113 sentetik ek.
- `ops/avofis-l4-implementation-evidence.json`: uygulanan/kanıtsız ayrımı ve 18 açık karar.
- `ops/avofis-l3-open-decisions.json`: 18 açık karar ve canlı değişiklik yok.
- `portal/scripts/l4-evidence-audit.mjs`: kod kanıtı ve scope doğrulaması.
- `AVOfis_v18_L4_973_Tekil_Kod_Kanit_18_Acik_Karar_L5_Kilitli_2026-10-30.xlsx`: 973 orijinal ID, bu tur kod kanıtları ve 18 açık kararın ayrı çalışma sayfaları (yerel teslim).
