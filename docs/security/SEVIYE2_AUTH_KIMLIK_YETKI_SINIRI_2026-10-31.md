# AVOfis S2 — G1/R-527/R-587 giriş yönlendirme ve meslekî yetki talebi sınırı

## Eski kodda gözlenen
- Kamu ve admin /auth/login sayfaları kullanıcı kontrollü next değerini Next.js router.replace içine doğrudan alıyordu. Mutlak, protokol-göreli ve özel şema URL'leri için güvenlik kapısı yoktu.
- /auth/register kullanıcıya genel kullanıcı, avukat, stajyer veya ofis seçtirip bu tercihi Supabase auth.user_metadata.role içine ve ayrıca profiles.role alanına yazmaya çalışıyordu.
- Canlı public.profiles tablosunun salt okunur şemasında email sütunu bulunmadığından eski profiles.upsert({email,...}) yolunun başarıyla çalıştığı kanıtlanmamıştır. Ayrıca mevcut profiles RLS'de kullanıcı INSERT yetkisi doğrulanmamıştı.

## S2 fail-closed çözüm
- İki login ekranının yönlendirmeleri yalnız doğrulanmış iç path kullanır. Dış/protokol-göreli, çift encode, şema ve kaçış karakterleri reddedilir. Sırasıyla /dashboard ve /cms yedek yoluna döner.
- İstekte seçilen meslekî hedef sadece user_metadata.requested_role (doğrulanmamış talep) olur. Kullanıcıdan doğrulanmış profiles rolü oluşturacak doğrudan upsert kaldırılır.
- Kayıt mesajı unvan/şirket/avukatlık yetkisinin verilmediğini açıkça söyler. Dashboard istemcinin düzenleyebildiği role alanını doğrulanmış meslekî statü gibi sunmaz.

## Kabul edilmemiş kapsam
- Bu çalışma server authorization, doğrulanmış profile-provisioning, e-posta doğrulaması, gerçek Supabase JWT, uzmanlık kaydı ve devlet yetkisi sağlamaz.
- Gerçek kullanıcı rolünün atanması için ayrı sunucu tarafı doğrulama, hukukî ve meslekî belge, G1–G4, MFA ve görev bazlı yetki tasarımı gerekir.
- 594 özgün R-ID, B01–B18, 64 kuruluş meselesi korunur; bağımsız kabul ve üretim kabul 0/594.
- Main, canlı Supabase, üretim, gerçek para, gerçek müşteri ve resmî işlemler için ayrıca açık kullanıcı onayı gerekir.
