# AVOfis — Seviye 1 / 594 özgün gereksinimin mevcut kodla ilk karşılaştırması

**Tarih:** 31.10.2026. **Kod tabanı:** `netadalet-oss/avofis-platform`; yeni başlangıç HEAD `b8b4824456e03960f9e2fa85ac299c6ddb9e1971`. Tarihî PR #9 HEAD `6ebeafde51fc8680e05b30ece0b293e6bd5e3434`. Yeni branch `seviye1-yeniden-baslangic-20261031`.

**Özgün veri kaynağı:** kullanıcının 31.10.2026 kaynak paketindeki yeni `594 Gereksinim` tablosu ve v18 orijinal R metinleri. Tam 594 özgün madde, tarihî kanıt ve yeni kabul sütunları eşlenerek ayrıca CSV dosyası oluşturuldu (sohbet tesliminde).

## Denetlenen kapsam ve kabul ayrımı

- **594/594 benzersiz R-ID**; 33 bölüm × 18, **324 P0**, **270 P1**.
- **41** tarihî kısmi teknik kanıt; **553** tarihî madde bazında kanıt yok. Bu iki sayı yeni branch'te çalıştığını kanıtlamaz.
- **64/64** şirket kuruluş fizibilite konusu; 18/18 açık B engeli korunuyor.
- **Yeni bağımsız kabul 0/594**, **canlı kabul 0/594**.
- Yeni S1 dalının önceki HEAD'inde 160 GitHub ağaç girdisi ve S1 için **0** workflow koşusu görüldü. Tarihî PR #9 ağacında 226 girdi var; otomatik yeni kabul yok.
- S1 kodunda eski kamu ana sayfası, ofis/kariyer/forum/araştırma sayfaları, admin iskeleti ve SQL iskelet şeması var. Ancak 17 özgün hizmet, altı dil, 16 izinli personel işi, gerçek müşteri Auth/Storage, RLS A/B ve ülke/prosedür yetkisi üzerinden çalışan **594 madde kabulüne yeterli kanıt yok**.
- Bölüm düzeyinde aday izler: portal ana sayfa/menüler (01–07,32); genel case/statute/ofis router'ları (08,12–14,16–17,27); `database/schema.sql` taslak dosya/ödemeler (19,23,26); kullanıcı paneli ve API mesaj iskeleti (24–25); `portal/src/lib/supabase.ts` (30); `admin/src/app/dashboard/page.tsx` (31); monorepo paketleri (33). Bu izler **madde bazında test edilip kabul edilmedi**.
- Göç/IND (09), aile (10), konut (11), Avrupa sınır ötesi (15), haber (18), ülke/prosedür form akışları (20–22), altı dil/RTL (28) ve tam GDPR (29) için yeni S1 dalında doğrudan uygun uygulama kanıtı bulunmadı.
- **Somut açığı olan dosya:** `api/src/modules/cms/cms.router.ts` herkese açık yazma talebi gövdesini geri yansıtıyordu. S1'in ilk güvenlik kodu `api/src/lib/cms-write-gate.ts` ile bu talebin sunucu tarafından kapatılmasıdır. Bağ: **B02, R-524, R-527, R-580, R-587**. Teknik düzeltme bağımsız R kabulü değildir.
- **B01 halen açık:** yedi eski canlı tabloda tarihî RLS/GRANT riski; **B02 de halen canlı veri politikası yönünden açık**. B03/B04 gerçek staging ve kullanıcı A/B izolasyon kanıtı yok.

## Kabul/aktivasyon sınırı

Yeni kod yalnızca çalışma dalındadır. CMS yazma kontrolü, Supabase'in doğrudan istemci veri erişimini veya mevcut canlı RLS'yi düzeltmez; gerçek personele yetki veya yayın hakkı vermez. API kodunun yerel negatif HTTP testi ile GitHub workflow'u ayrıca ölçülür. Gerçek staging/Auth/Storage, gerçek tarayıcı, hukukî/dilsel insan onayı, üretim ve canlı Supabase değişikliği henüz kanıtlanmış değildir.

**Sonraki yüksek öncelikli işler:** B01/02 salt okunur güncel tablo ve politika envanteri; izole staging'de gerçek kimlik A/B ile olumsuz erişim ve yetki iptali testi; ilk hizmetin güvenli son kullanıcı akışı. Seviye 2 ve main/üretim için ayrıca kullanıcı onayı gerekir.
