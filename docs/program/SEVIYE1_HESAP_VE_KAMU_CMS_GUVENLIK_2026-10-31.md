# AVOfis Seviye 1 — Kamu kayıt ve CMS yetki sınırı

Tarih: 31 Ekim 2026. Amaç: v18 özgün R-003, R-416, R-470, R-523, R-524, R-527 ve tarihî B02/B05 kapsamında ilk savunma katmanını güvenli duruma almak.

## İlk durum
Eski kamu kayıt sayfası, başvuranın "avukat" ve "ofis" rolü seçmesine ve bu rolün hem auth kullanıcı metaverisine hem de profiles tablosuna yazılmasına izin veren istemci kodunu içeriyordu. Kamu ana sayfası ve menüsü ayrıca user_metadata.role değerini "admin" kabul ederek CMS düzenleme arayüzü açıyordu. Bu kullanıcı tarafından düzenlenebilen metadata güvenilir yetki kaynağı değildir.

## Yeni Seviye 1 taslak davranışı
- Kamuya açık hesap kayıt formu kaldırıldı; /auth/register sayfası açıkça kayıt kapalı bilgisini verir ve kişisel veri istemez.
- Kamu ana sayfası ve menü yönetiminin düzenleme görünümü kapalı; bunların CMS yazma işlevleri ek olarak varsayılan kapalı kapıdan geri döner.
- Hesap/profesyonel kimlik/meslekî statü şirket, ülke, insan onayı ve server/RLS ile kanıtlanmadan kullanıcı beyanından türetilmez.
- Kapı çevresel değişkenlerle otomatik açılmaz; ayrı kod ve kabul kararı gerektirir.

## Kesin güvenlik sınırları
Bu değişiklik **gerçek Supabase RLS / GRANT / profiles.role yazma yetkisi / eski public tablo izinleri / doğrudan REST API** için bir düzeltme DEĞİLDİR. Bu eksikler B01/B02 ve gerçek Auth/Storage A-B staging negatif testi ile açık kalır. Bir tarayıcı arayüzünü kapatmak, sunucudaki veritabanı iznini teknik olarak iptal etmez. Gerçek müşteri kaydı veya çalışan yetkisi canlı yayında açılmaz.

## Kod ve ölçüm
- Kod: portal/src/app/auth/register/page.tsx; portal/src/components/site-header.tsx; portal/src/app/page.tsx; portal/src/lib/launch-gates.ts
- Negatif test: portal/tests/public-account-safety.test.mjs
- İş akışı: .github/workflows/seviye1-public-account-safety.yml
- Kanıt seviyesi: taslak kod + CI (sonuç ayrıca doğrulanmalı), **bağımsız R kabulü 0/594**.
- Seviye 2 yalnız ayrı açık kullanıcı onayıyla mümkündür.
