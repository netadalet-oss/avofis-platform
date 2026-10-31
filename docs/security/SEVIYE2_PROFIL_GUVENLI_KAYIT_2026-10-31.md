# AVOfis — Seviye 2 / R-524, R-527, R-586, R-587 güvenli profil hazırlama

31 Ekim 2026. Yalnız **ayrı GitHub geliştirme dalı ve sentetik PostgreSQL 17**. Canlı Supabase, gerçek hesap, `main`, üretim, finans ve resmî işlem izni verilmedi.

## Kanıta dayalı mevcut durum

Canlı Supabase'e salt okunur katalog sorgusunda `public.profiles` alanları `id`, `full_name`, `avatar_url`, `role`, `created_at` olarak görüldü. `role` varsayılanı `user`. `profiles.id`, `auth.users(id)` alanına `ON DELETE CASCADE` FK. Tek profil RLS kuralı, kullanıcının kendi profilini okumasına izin veriyor. `auth.users` üzerinde uygulama tetikleyicisi bulunmadı. `anon` ve `authenticated` için geniş katalog GRANT'ları mevcut; tek okuma RLS politikası, bunların fiilen yazma izni olduğu anlamına gelmiyor.

Portal kayıt ekranı artık yalnız `raw_user_meta_data.requested_role` beyanını saklamaya çalışıyor; profili kendisi yaratmıyor. **Gerçek Auth kullanıcısı için profil otomatik oluşturma henüz yapılmadı.**

## Güvenlik taslağı ve sınır

- Tüm SQL dosyalarında `current_database() = 'avofis_s2_profile_test'` kapısı vardır. GitHub CI bir PostgreSQL 17 konteynerinde boş DB kurar.
- `anon` profil okuyamaz/yazamaz; `authenticated` kendi satırını yalnız okur. Profil INSERT yalnız **NOLOGIN**, istemciye üyelik verilmeyen `avofis_s2_profile_provisioner` test rolüne bırakılır. UPDATE/DELETE kapalıdır.
- Yetkili test işlemcisi yalnız Auth ID alanını okuyabilir; `user_metadata.role` ve `requested_role` yetki olarak kullanılamaz. Yeni profil `role = 'user'` olur. RLS, yetkili işleyicinin bile başka bir rol oluşturmasını engeller.
- Sentetik A, B ve henüz profili oluşturulmamış C; sahte `super_admin`/avukatlık talebi; A/B izolasyonu; anonim erişim; NULL oturum; rol yükseltme; istemci yazma ve silme olumsuz testleri.

## Ayrı doğrulama kapıları

Bu paket **gerçek Supabase Auth doğrulaması, güvenilir backend event / Auth trigger kurulumu, signup sonrası otomatik profil yaratılması, personel/meslekî onay, JWT imzası, MFA, revocation ve canlı veri yedeği** sağlamaz. Bu konularda gerçek izole Supabase staging ve ayrı bağımsız kabul gereklidir. `SECURITY DEFINER` veya genel `public` trigger'ı güvenlik incelemesi olmadan eklenmemiştir.

594 orijinal R-ID (324 P0, 270 P1), 64 kuruluş konusu, B01–B18 = 18 AÇIK; bağımsız kabul 0/594 ve canlı kabul 0/594. `main`, üretim ve canlı Supabase değişikliği için ayrıca açık kullanıcı onayı şarttır.

Supabase kaynak: https://supabase.com/docs/guides/auth/managing-user-data
