# CMS ve Web Üzerinden Düzenleme

Bu mimari, admin kullanıcısının dosya transferi yapmadan doğrudan web arayüzünden:
- menü ekleme / silme / sıralama
- başlık ve metin düzenleme
- blok ekleme / kaldırma / sıralama
- görsel yükleme
- footer ve genel ayarlar düzenleme
- sayfayı taslak / yayında tutma

işlemlerini yapabilmesi için tasarlanmıştır.

## Gerekli teknik bağlar
1. `admin/` ekranları
2. `api/src/modules/cms/*`
3. `database/schema.sql` içindeki `cms_*` tabloları
4. medya yükleme için storage sağlayıcısı
5. auth ve role-based access control

Bu zip içindeki yapı, bu sistemin temelini kurar; storage ve auth bağlantıları ayrıca etkinleştirilmelidir.
