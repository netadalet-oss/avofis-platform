# AVOfis v18 — Seviye 4: R-361–R-374 iş/kira/tüketici form hazırlık dilimi

**Tarih:** 30 Ekim 2026 · **Durum:** L4 KOD KISMİ KANIT; 973 iş ve kaynak metni değişmedi · **L5 KİLİTLİ** · **PR #5 taslak**.

## Özgün gereksinime dayalı on dört ayrı form

| Kaynak ID | Özgün istek | Kodlanmış yalnız yerel kategorik/durumsal hazırlık |
|---|---|---|
| R-361 | İşten çıkarma: sözleşme türü, işe giriş, bildirim ve karar tarihleri | Dört ayrı alan, tarih beyanı |
| R-362 | VSO: imza durumu ve son yanıt tarihi | İmza durumu, kullanıcı beyanı tarih |
| R-363 | Ödenmeyen ücret: dönem, yaklaşık miktar, bordro ve yazışma | Dört alan, sınırlı tutar biçimi |
| R-364 | İşveren: çalışan sayısı, istenen belge, karşı taraf rolü | Sayı ve kategoriler |
| R-365 | Ayrımcılık: hassas bilgi gönüllü ve korumalı | Yalnız paylaşım tercihi; **hassas iddia/içerik ALINMIYOR** |
| R-366 | Kira: kiracı/ev sahibi, konut/ticari | Rol ve taşınmaz türü |
| R-367 | Depozito: bitiş, tutar, son yazışma | İki tarih ve yaklaşık EUR tutarı |
| R-368 | Bakım: sorun, bildirim, fotoğraf | Kategoriler ve fotoğraf var/yok; **dosya yüklemesi YOK** |
| R-369 | Tahliye: resmî belge ve son tarih öne alınsın | Belge var/yok ve tarih beyanı; öncelikli insan inceleme |
| R-370 | Kira artışı: yazılı bildirim, yeni tutar, yürürlük | Üç ayrı alan |
| R-371 | Tüketici: ürün/hizmet, alım kanalı, teslim | Kategori ve tarih |
| R-372 | Ayıplı ürün: satıcıya bildirim, cevap | İki ayrı durum |
| R-373 | Abonelik feshi: başlangıç, fesih, ücret ihtilafı | Tarih ve iki durum |
| R-374 | Borç itiraz: alacaklı, tahsilat aşaması, tebliğ tarihi | **Alacaklı türü** (adı değil), aşama ve tarih; öncelikli insan inceleme |

**Kaynak:** `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, bölüm 21, R-361–R-374; özgün 594 R ve 973 iş indeksleri aynen korunmuştur.

## Teknik teslim
- `portal/src/lib/sector-intake-preview.ts`: 14 özgün kaynak ID'sine bağlı şema, tüm alanlar isteğe bağlı, belirsiz bilgi için `unknown`; gerçek takvim tarihi, tutar, sayısal ve seçenek sınırı; tanımsız alanla kişisel veri eklemeyi reddetme. Ayrımcılık hassas kanalı ve alacaklı kimliği anonim akışta kapalıdır.
- `portal/src/app/form-hazirlik/page.tsx`: açık form hazırlığı sayfası, konu seçimi, alanlar ve gönderimsiz yerel özet. Özellikle altı hukukî dilde yayımlanmış form olduğu **iddia edilmez**; yalnız TR taslak.
- `portal/src/app/triyaj/page.tsx`: 14 yerel taslağa doğrudan bağlantı, dil sınırlaması uyarısıyla.
- `portal/scripts/sector-intake-preview.test.mjs`: 14 ID'nin tekilliği ve alan kapsamı, bilinmeyen tarih seçenekleri, örnek kötü girişlerin reddi, yüksek riskli işlerin insan incelemesi, hiçbir API/Storage/PSP/otomatik başvuru oluşmaması.
- CI: https://github.com/netadalet-oss/avofis-platform/actions/runs/41093157446 — **6/6 başarılı, sentetik Node/TypeScript testleri**.

## Aşama ve kabul sınırları

14 forma ait teknik alt kapsam **kısmi**; tam R gereksinimi **bağımsız kabul edilmiş değildir**. Gerçek müşteri kimliği, kişisel ihtilaf kayıtları, kimlik karşılaştırma, GDPR rızası, güvenli belge yükleme, tenant izolasyonu, Auth+Storage E2E, hukukî süre hesaplama, meslekî yetki ve resmî mahkeme/IND kanalı bu uygulamada **yoktur**.

Kaynak bazlı kod testi: **30/973** (önceki 16 + bu 14). Kısmi R teknik kanıtı: **69/594**. Bağımsız kabul: **0/973**. L3 tasarım kararları: **18/18 açık**. Üretim: **NO-GO**. **Seviye 5 açılmadı**.

İlerleme sayılarını L0–L3 kaynak takip ve `ops/avofis-l4-implementation-evidence.json` ayrı tutar; kod/test başarısı insan/hukukî onayı veya gerçek ortam kabulü yerine geçmez.
