# LAREN MVP – kurulum ve kabul kriterleri

Bu dal AvOfis portalına `/laren` müşteri başvurusu ve personel iş akışını ekler.
**Pilot sürümdür. Henüz canlı Supabase projesine kurulmuş veya prod güvenlik denetiminden geçirilmiş değildir.**

## Önkoşullar

- Node.js 20, npm, Next.js portal ve Supabase projesi
- `portal/.env.local` ve `admin/.env.local` dosyalarında kendi Supabase `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerleriniz
- Bu alanlar public client konfigürasyonudur; `service_role` anahtarı hiçbir zaman frontend'de kullanılmamalıdır.
- Yedek alın. Var olan veritabanında tablo/policy çatışması olup olmadığını kontrol edin.

## Kurulum

1. Bu daldaki kodu ayrı bir test ortamına alın.
2. Supabase SQL Editor'de sırasıyla `database/migrations/20261025_laren_mvp.sql` ve `database/migrations/20261026_laren_messages.sql` içeriklerini yetkili veritabanı hesabıyla çalıştırın.
3. Supabase Auth üzerinden bir kullanıcı kaydedin (`/auth/register`). Bu kullanıcı müşteridir.
4. Personel yapmak istediğiniz **ayrı** hesabın `auth.users.id` değerini güvenli şekilde doğrulayın.
5. Yalnızca veritabanı yöneticisi olarak şu SQL'i çalıştırın (UUID'yi gerçek hesap ID'siyle değiştirin):
   ```sql
   insert into public.laren_staff(user_id, role)
   values ('00000000-0000-0000-0000-000000000000', 'manager')
   on conflict (user_id) do update set role = excluded.role;
   ```
6. `npm install`, sonra `npm run build:portal` ve `npm run dev:portal` çalıştırın.
7. `/laren` ana sayfasından başvuru açın; `/laren/my` üzerinden kontrol edin; personel hesabıyla `/laren/staff` üzerinden filtreleyip `/laren/staff/[id]` ayrıntı ekranını açın; durumu güncelleyin.
8. Test dosyası yükleyip personel panelinden açın. Yalnızca PDF/JPG/PNG, en fazla 10 MB desteklenir.
9. Müşteri ve personel hesaplarından aynı dosya üzerinden mesajlaşmayı test edin; başka müşteri mesajları okuyamamalı.

## Test ve doğrulama (yayın öncesi zorunlu)

- Kullanıcı A yalnızca kendisine ait `laren_requests` satırlarını okuyabilmeli.
- Kullanıcı B'nin dosya ID'si ile `/laren/my/[id]` ve doğrudan Supabase sorgusu A'ya veri döndürmemeli.
- Herhangi bir müşteri `laren_staff` tablosuna kendisini ekleyememeli.
- Herhangi bir müşteri `laren_set_status` RPC'sini çalıştıramamalı.
- Personel üyesi, durum değiştirince `laren_request_events` atomik olarak yazılmalı.
- Yeni başvuru oluştuğunda `laren_request_events` tablosuna bir başlangıç kaydı eklenmeli.
- Herkesin mesaj gönderebildiği genel bir sohbet yoktur: yalnızca dosya sahibi ve LAREN personeli mesajlaşabilir.
- Dosya `closed` olduğunda yeni mesaj eklemek API/RLS tarafından reddedilmeli.
- PDF/JPG/PNG dışındaki dosyalar ve 10 MB üzeri dosyalar reddedilmeli.
- Özel dosyaların herkese açık URL'si olmamalı.
- Farklı kimlikle aynı depolama yoluna ulaşılmamalı.
- Gerçek müvekkil dosyaları kullanılmadan önce RLS, storage ve denetim kayıtları bağımsız denetlenmeli.

## Kapsam / kapsam dışı

**Mevcut:** Giriş üzerinden müşteri talebi, müşteri dosyaları, durum geçmişi, özel belge yükleme, personel kuyruğu ve durum güncellemesi, müşteri-personel dosya mesajlaşması, personel filtre/arama ve personelin belge açabildiği detay ekranı.

**Henüz yok:** Bağımsız avukat daveti, teklif pazaryeri, abonelik ödeme entegrasyonu, işlem sözleşmelerinin e-imzası, e-posta/SMS bildirimleri, GDPR/KVKK belge ve aktarım yönetiminin bütünü, tam çoklu kiracı izolasyonu ve prod saldırı testi.

Özellikle Türk avukatlık hizmetlerini komisyon ya da ücretli dosya erişimiyle pazarlayan özellikler bilinçli olarak eklenmemiştir. Türkiye'de avukatın kendi müvekkiliyle bağımsız sözleşme yapması ve yetkilendirilmiş iletişim kurulması gereklidir.

## Kritik teknik notlar

- LAREN tablolarında RLS ve yetkili personel kontrolü bulunur. Eski AvOfis CMS tablolarının RLS politikaları bu migrasyonda değiştirilmez; **ayrıca denetim zorunludur**.
- CMS istemci tarafı yönetici göstergesi `user_metadata` yerine yalnızca sunucu tarafında düzenlenebilen `app_metadata` kullanır. Yetki göstergesi veritabanı politikalarının yerini tutmaz.
- Var olan `database/schema.sql` ile gerçek Supabase şemasının uyumu başka bir iş kalemi olarak kalır.
- Güncelleme almayan dosya yüklemeleri için arşivleme/silme ve saklama süreleri henüz tasarlanmadı.
- İlk sürüm Türkçe arayüze sahiptir; Hollandaca yerelleştirme tamamlanmadı.

## Mobil öncelikli web portalı

LAREN bir native iOS/Android uygulaması değildir. Mevcut AvOfis Next.js portalı içinde mobil öncelikli bir responsive web uygulamasıdır.

- LAREN sayfalarında AvOfis üst menüsü yerine ayrı LAREN marka başlığı gösterilir.
- Telefon ekranlarında alt bölümde sabit gezinme: Ana sayfa / Başvuru / Dosyalarım. Yetkili personele Yönetim bağlantısı eklenir.
- iPhone safe-area boşlukları dikkate alınır; form kontrolleri en az 16px yazı ve yaklaşık 48px dokunma hedefleri kullanır.
- Dar ekranlarda başvuru alanları tek sütundur, butonlar tam genişliktedir; geniş ekranda kartlar ve alanlar çok sütunlu olur.
- Telefonun sanal klavyesi ile çakışmalar ve 320px, 375px, 390px, 430px, 768px ve 1280px genişliklerinde yatay taşma ayrıca tarayıcıda test edilmelidir.
- Portalın masaüstü görünümü korunur; mobil web bağlantısı uygulama mağazası gerektirmez.

Mobil test henüz fiziksel cihazlarda ve tarayıcı otomasyonunda tamamlanmamıştır. GitHub Actions yalnızca derleme doğrulaması yapmaktadır.
