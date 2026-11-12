# LarenLex S16 — Gerçek veritabanı ve alan adı geçiş sicili

Tarih: 12 Kasım 2026. Bu dal **S16 çalışma dalıdır**; tarihî `archive/larenlex-transfer-2026-11-12` dalına veya eski Avofis kaynaklarının özgün hâline müdahale etmez.

## Doğrulanmış uygulama

- Yeni bağımsız Supabase projesi: `larenlex` (`lsqfczxxziavhspngbwd`), `eu-west-1`, kuruluş `swwcialrngghveprduvi`. Sağlayıcının proje oluşturma anında bildirdiği bedel 0 USD/ay.
- 12 yeni `public.ll_*` tablosu oluşturuldu. Tümünde RLS açık. Başvuru, vaka, dosya, görevli, hukukî kaynak, işveren, profesyonel, ilan ve teklif alanları birbirinden ayrıldı.
- 554 özgün hizmet kaydı, `netadalet-oss/avofis-platform` deposunun `979073d87a136c34d584d633c5d2dd7f8f4ff271` sürümündeki `larenlex-web/data/services-v86.tsv` kaynağından kimlikleri ve 64 karakterlik kaynak SHA-256 değerleriyle aktarıldı. **Tamamı internal / legally_approved=false; kamuya yayımlanmış hukukî kart yoktur.**
- 554 hizmet, SHA-256 doğrulanmış S14.1 HTML kaynağındaki 17 kullanıcı hizmet grubuyla eşleştirildi. Orijinal 18 iç kategori `legacy_category` alanında saklandı.
- Eski Avofis projesindeki 1 ana sayfa ve 3 ayar kaydı sadece `larenlex_private.legacy_import` içerisinde saklandı; LarenLex tasarımının üzerine yazılmadı.
- Eski 2 kimlik kaydı, yalnız kimlik referansı ve geçiş durumu olarak `larenlex_private.legacy_user_transfer` siciline alındı. **Parola hash'i veya e-posta kopyalanmadı, yeni kullanıcı yaratılmadı.** Her iki hesap için güvenli yeniden kayıt/kimlik doğrulama gerekir.
- Özel `larenlex-case-documents` storage bucket'ı oluşturuldu: public=false, 25 MiB limit, PDF/PNG/JPEG. Kullanıcı upload/select politikası açılmadı; belge doğrulama, kötü amaçlı dosya taraması ve dosya–sahiplik tutarlılığı kabulü bekleniyor.
- Eski `avofis` projesindeki yedi boş public tabloda RLS açıldı ve `pages`/`site_settings` için iki geniş oturumlu kullanıcı okuma politikası kaldırıldı. Eski projede iki gerçek Auth hesabı hâlen korunuyor.
- `avofis.com` alanında S14.1'in değişmemiş kaynak ZIP'iyle üretim hedefli teknik yayın **READY** oldu; haricî HTTP denetiminde LarenLex başlığı ve HTTP 200 doğrulandı. **`www.avofis.com` hâlâ eski Avofis portalında.**

## Güvenlik ilkeleri

- Roller `ll_operator_roles` ile yönetilir; kamu istemcisi yönetici/hukukçu yetkisi atayamaz.
- Taslak `ll_cases` sahibi tarafından görülebilir; görevlendirilen kişi ve yönetici görünürlüğü ayrı RLS kurallarıyla sınırlandırılır.
- İlan `published` ve `employer_verified` olmadan kamuya çıkmaz.
- Mevzuat, içtihat ve hukuk kartları, `review_status='approved'` ve `public_release=true` şartları karşılanmadan kamuya açılmaz.
- `larenlex_private` şemasının `anon` ve `authenticated` erişimleri yoktur.
- Canlı veritabanı şemasıyla üretilen TypeScript tipleri: `supabase/database.types.ts`.

## Açık işler ve kabul sınırı

1. Yeni veritabanında henüz gerçek kullanıcı yok; iki eski hesabın kimliği/parolası aktarılmış sayılmaz.
2. Tarayıcı tarafında Supabase Auth, gerçek başvuru gönderimi ve dosya yükleme henüz entegrasyon testinden geçmedi.
3. 554 hizmetin kamuya yayımlanması için içerik/ülke/form/mevzuat/ECLI incelemesi ve yetkili hukukî yayın kararı gerekiyor.
4. S14.1 statik portalın `avofis.com` üzerinde teknik yayınlanması nihai ürün/uyum kabulü değildir.
5. `www.avofis.com` alanının eski Vercel projesinden taşınması ve Cloudflare yönlendirmesi ayrıca tamamlanmalı.
6. Eski Avofis veritabanı **silinmemeli/durdurulmamalıdır**: iki eski kullanıcı hesabının yeni kimlik sistemi üzerinden doğrulanması, yedek ve geri dönüş kontrolü henüz yapılmadı.
7. Bu şema, gerçek iki ayrı kullanıcıyla çapraz erişim, oturum sonlanması ve idare rolü testlerinden sonra S16 K3 kabulüne sunulacak.

Kaynak sürümü ve geçmiş belgeler ayrı arşivde korunmaktadır. Bu belge herhangi bir hukukî onay veya güvenlik sertifikası değildir.
