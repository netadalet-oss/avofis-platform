# AVOfis — B04 müşteri özel dosya nesneleri: erişim, yükleme ve gerçek sınırlar

**30 Ekim 2026 · W1 / B04 · yalnızca taslak PR #5.** Bu değişiklik **canlı Supabase ortamına uygulanmadı**. Kod, ayrı staging'de gözden geçirilecek SQL ve PostgreSQL 17 sentetik veri/rol denetimlerinden ibarettir.

## Bulgular ve güvenlik kararı

1. Önceki MVP ve personel yetki migration'larında `storage.objects` için özel `avofis-private` kovasına atanan operatörün dosyadaki bütün nesneleri okuyabilmesi mümkündü. `documents` yetkisi, atama ve AAL2 mevcut olsa dahi, *belirli nesne için* açık müşteri paylaşım izni sorgulanmıyordu. Müşteri belge taslağına yönelik FORM-02 izin akışı, Storage nesnesi için otomatik paylaşım izni değildir.
2. Eski politikalar kullanıcı kontrolündeki path üzerinde `(storage.foldername(name))[1]::uuid` dönüşümü içeriyordu. Bozuk nesne yollarında sorgu hatası ve liste erişiminde belirsiz davranış riski nedeniyle yeni migration doğrudan **UUID metin karşılaştırması** kullanıyor.
3. **Geçici ve muhafazakâr yetki kararı:** `avofis-private` özel dosya nesnelerini yalnız ilgili dosyanın **gerçek sahibi** okuyabilir; personel ve admin hiçbir nesneye sadece rol/grant ile erişemez. Staff dosya incelemesi, FORM-02/FORM-03 müşteri onaylı *taslak metin* akışında ayrı devam eder. Nesne bazlı açık müşteri izni, sorumlu personel, kapsam ve geri çekme/audit için yeni bir model onaylanana dek Storage paylaşımı **kapalıdır**.
4. Müşteri yüklemesi yalnız `open` durumundaki, sözleşme imzalı, o kişiye ait dosyada, kendi kullanıcı UUID dizini ve kanonik rastgele UUID dosya adı için açılır. İzin verilen türler: PDF/PNG/JPEG/WebP; bucket 10 MiB üst sınırı. Kötü niyetli MIME içeriği taraması ve gerçek Storage HTTP henüz test edilmedi.
5. Kullanıcı veya personel `avofis-private` içindeki nesneyi UPDATE (upsert, rename, overwrite) veya DELETE yapamaz. İnceleme ve veri saklama hizmeti için ayrı yetki tasarlanmalıdır. Yeni `RESTRICTIVE TO public` kurallar, başka bir politika `USING(true)` ile eklense bile özel kovadaki veriyi dışa açmayı reddeder.
6. **Önemli signed URL açığı/ürün kısıtı:** Supabase Storage, önceden üretilen imzalı bağlantının JWT iptaliyle geçersizleşmediğini; bağlantının kendi geçerlilik süresine kadar çalışabileceğini açıklar. Bu nedenle nesne düzeyi iptal, TTL, yetki ve indirme denetimi gerçek staging'de çözülmeden hassas evrak için imzalı URL paylaşımı **kabul edilemez**. SQL RLS tek başına önceden verilmiş bağlantıyı iptal ettiğini kanıtlamaz.

## Gerçek geliştirme kanıtı

- `database/migrations/20261030_b04_private_storage_owner_hold_staging_only.sql`: ilgili Storage bucket RLS/boyut/tür guard'ı, AVOfis eski politika kaldırma, sahip `SELECT`/`INSERT` izni, dört RESTRICTIVE sınırlama. Dört eski politika adı, başka bucket/ürün RLS'sine dokunmadan kaldırılır.
- `database/tests/b04_storage_case_owner_synthetic.sql`: gerçek PG17 `storage.objects` fixture'ında müşteri A/B izolasyonu, yalnız açık/imzalı dosyaya yükleme, ataması ve kişisel yetkisi bulunan AAL2 operatörün de bloklanması, admin bloklama, bozuk ad, traversal, uzantı/kişi taklidi, değişmez kayıt ve sonradan `USING(true)` ile eklenen politika için olumsuz test. Migration tekrar çalıştırılabilirliği de sınanır.
- `.github/workflows/avofis-integrated-catalog-ci.yml`: bu test önceki T02–T10/P01–P09/FORM-02/FORM-03 migration zincirinden sonra gerçek izole PostgreSQL 17 üzerinde yürütülür.
- Canlı bağlı tek Supabase projesi `akigckpsktdxudumiwvm` için yedi eski public tabloda RLS kapalı; ayrı staging ve gerçek `avofis-private` bucket henüz doğrulanmadı.

## Bağımsız kabul (henüz **0/973**)

B04'ün kapatılması için ayrı staging Supabase üzerinde, gerçek iki Auth kullanıcısı, geçerli JWT/MFA, Storage upload/download, ACL spoofing, istemci API geçişleri, dosya tarama, kullanıcı iptali, personel sharing/revoke, kısa TTL ve signed URL olayı, izleme/audit ve sorumlu insan onayı şarttır. Bu işteki **sentetik SQL testi B04 teknik kanıtı** sayılır; B04'ün veya bir R-ID'nin bağımsız tamamlanması değildir.

**Resmî kaynaklar:** [Supabase Storage private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [signed URL geçerlilik ve revokasyon sınırı](https://supabase.com/docs/guides/storage/serving/downloads).
