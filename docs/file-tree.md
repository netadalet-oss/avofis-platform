# AvOfis Dosya Ağacı

## Root
- `portal/` public portal ve kullanıcıya dönük arayüz
- `admin/` admin panel, CMS, moderasyon ve sistem yönetimi
- `api/` REST API katmanı
- `database/` PostgreSQL şeması ve seed verileri
- `docs/` proje dökümantasyonu
- `infrastructure/` deploy ve environment örnekleri

## Portal
- `src/app/page.tsx` final görünüm hedefli ana sayfa
- `src/app/auth/*` login, register ve password reset ekranları
- `src/app/cases` içtihat ekranı
- `src/app/statutes` mevzuat ekranı
- `src/app/forum` topluluk ekranı
- `src/app/careers` kariyer ekranı
- `src/app/offices` ofis profilleri
- `src/app/workspace` profesyonel çalışma alanı
- `src/components/*` tekrar kullanılabilir UI blokları
- `src/lib/site.ts` ana navigasyon ve içerik verileri

## Admin
- `src/app/page.tsx` CMS odaklı admin dashboard
- `src/app/cms` sayfa ve blok yönetimi
- `src/app/menus` menü yönetimi
- `src/app/media` görsel ve dosya kütüphanesi
- `src/app/forum` moderasyon
- `src/app/users`, `roles`, `audit`, `settings` yönetim alanları

## API
- `src/server.ts` uygulama giriş noktası
- `src/modules/cms` menü, blok ve sayfa içeriklerini web üzerinden düzenlemeye temel
- diğer modüller: auth, cases, statutes, forum, careers, offices, workspace, notifications, messaging, connect, analytics, support, admin

## Database
- `schema.sql` tüm ana tablo yapıları
- `seeds/cms-homepage.json` ana sayfa örnek içerik
