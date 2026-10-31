# AVOfis Seviye 2 — B01/B02 Storage kapsamı ve izole A/B testi

31.10.2026 kullanıcının Seviye 2 güvenlik geliştirmesi onayı. R-524, R-527, R-586, R-587 ile ilişkili **B01 ve B02 halen AÇIKTIR**. 594 özgün R, 64 kuruluş konusu ve 18 açık engel korunur. Bağımsız kabul: 0/594; canlı kabul: 0/594.

## Güncel canlı gözlem, yalnız salt okunur metaveri

31.10.2026 bağlı AVOfis Supabase projesinde storage.buckets tablo gruplaması boş sonuç verdi; kayıtlı bucket bulunmadı. pg_catalog.pg_policies üzerinden storage.objects ve storage.buckets için politika bulunmadı. profiles.id -> auth.users.id gerçek yabancı anahtarı görüldü. Bu sorgular belge içeriği veya müvekkil satırı okumadı ve canlı yapıyı değiştirmedi. Bulgular yalnız sorgu anına aittir.

## Üretime uygun olmayan sentetik hipotez

GitHub CI postgres:17 geçici servisinde sadece **avofis_s2_storage_test** veritabanı oluşturulur. auth.uid fonksiyonu sentetik kimlik ayarını okur: gerçek Supabase Auth JWT imzası, oturum iptali veya Storage HTTP endpoint'i test edilmez. storage.objects ve storage.buckets, Supabase Storage şemasının yalnız asgari bir test alt kümesini taklit eder.

Sentetik A ve B için yalnız **özel** bucket ve hem owner_id hem ilk klasör UUID'si aynı olan kayıt SELECT edilebilir. Başka kullanıcı, başka bucket, sahipsiz nesne, sahiplik/yol uyuşmazlığı ve boş oturumda SELECT yoktur. Anonim okuma, yazma, silme, değiştirme ve bucket listeleme reddedilir. Kullanıcı tarafından düzenlenebilir role metadata yetki oluşturmaz.

Dosyalar: database/staging/s2_storage_fixture.sql, s2_storage_rls_proposal.sql, s2_storage_ab_test.sql, tools/security/stage2-storage-policy.test.mjs ve .github/workflows/seviye2-storage-rls.yml. SQL dosyaları yanlış veritabanı adında RAISE EXCEPTION ile durur. **Bu SQL hiçbir şekilde canlı Supabase migration dosyası değildir.**

## Kesin kabul sınırı

Gerçek Supabase Auth imzalı JWT, MFA, signed URL süre/erişim iptali, Storage HTTP upload/download, service-role bypass, personel yetki matrisi, hukuk ve GDPR, bağımsız tarayıcı kabulü, yedek/geri dönüş ve canlı politika doğrulaması yapılmadı. Bunlar B01/B02 ile ilgili devam koşullarıdır. Onay olmadan main/üretim/canlı Supabase/gerçek para/resmî işlem yoktur.

Resmî referans: https://supabase.com/docs/guides/storage/security/access-control
