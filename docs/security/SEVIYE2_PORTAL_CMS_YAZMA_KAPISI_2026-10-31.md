# Seviye 2 / B02: Portal CMS yazma yolunu kapatma
31 Ekim 2026 tarihli Seviye 2 açık güvenlik izni; sadece taslak GitHub dalında işlem.
Kapsam: R-527, R-580, R-587 ve B02. Bu, canlı güvenlik düzeltmesi veya bağımsız kabul değildir.

## Eski kodda doğrulanan risk
Kamu portalı ana sayfası ve üst menüsü, client-controlled user_metadata.role alanını yönetici kontrolü olarak kullanıyordu.
Ana sayfa pages tablosuna iki, üst menü site_settings tablosuna bir doğrudan Supabase upsert isteği hazırlıyordu.
Seviye 1 API CMS reddi, doğrudan Supabase istemcisini kapsamıyordu.
Ancak mevcut sunucu RLS'sinin fiilen izinsiz yazma geçirdiği, canlı verinin değiştiği veya güvenlik ihlali yaşandığı kanıtlanmamıştır.

## Kodda yapılan
Üç doğrudan browser Supabase yazma yolu kaldırıldı; herhangi bir ağ talebi oluşturmayan ret işlevi kullanıldı.
Altı düzenleme bileşeni, ana sayfa ve menü için yetki, metadata'ya değil fail-closed kapıya bağlandı.
Eski kamu CMS SELECT içerik okuması korunmuştur. Yazma/yayın ancak doğrulanmış server identity, personel/MFA, revizyon ve çift hukuk/dil onayıyla ileride açılabilir.

## Kabul eksikleri
GitHub CI: native Node olumsuz testler + Next.js portal TypeScript build.
Gerçek tarayıcı, auth JWT, storage private bucket, signed URL ve canlı RLS yetki testi henüz kabul edilmiş değil.
594 özgün gereksinim, 64 kuruluş konusu ve B01–B18 açık; bağımsız kabul 0/594, üretim kabul 0/594.
Main, üretim, canlı Supabase, para ve resmî kurum işlemleri için ayrıca açık kullanıcı onayı gereklidir.
