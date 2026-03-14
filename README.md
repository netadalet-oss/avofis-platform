# AvOfis Platform

AvOfis; hukuk araştırması, analiz, belge üretimi, topluluk, kariyer ve ofis işbirliğini tek bir platformda birleştiren monorepo yapısıdır.

## Monorepo
- `portal/` public portal + member-facing UI
- `admin/` admin + CMS + moderation UI
- `api/` REST API scaffold
- `database/` PostgreSQL schema + seeds
- `docs/` teknik plan ve dosya ağacı
- `infrastructure/` deployment ve environment örnekleri

## Not
Bu paket, tüm modül ve fonksiyonların üretim seviyesinde mimari iskeletini ve temel UI/UX yapısını içerir.
Tam canlı sistem için veritabanı, auth sağlayıcısı, dosya storage, e-posta/SMS, arama indeksi ve AI servis bağlantılarının ayrıca yapılandırılması gerekir.
