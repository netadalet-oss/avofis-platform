# AVOfis — müşteri portalı yeniden yapılandırması

Bu dal, mevcut müşteri MVP dalını temel alır. Kayıt, mesaj, sözleşme, özel belge ve Mollie ödeme kodları korunmuştur.

## Yeni kaynak kodu
- Ortak ve üç dilli müşteri menüsü: Ana Sayfa, Hizmetler, Nasıl Çalışır, Bilgi Merkezi, İletişim, Müşteri Girişi; ayrı Ön Başvuru.
- Altı hizmet için belge, yürütücü, başvuru ve ücret kapsamı ayrılmış sayfalar.
- Süreç sayfasında yedi işlem aşaması; uygulanmayan aşamalar tamamlandı olarak gösterilmez.
- Personel tarafından belirlenen belge talepleri ve gerçek veritabanı olaylarına dayalı dosya geçmişi.
- Dosya talepleri ve olayları için PostgreSQL satır düzeyinde erişim kuralları.

## Veri koruma ve kurulum
1. Yedekli staging veritabanında önce database/migrations/20261027_avofis_mvp.sql, sonra database/migrations/20261027_case_tracking.sql, ardından database/migrations/20261027_staff_deliverables.sql uygulanmalıdır.
2. Personel rolü yalnızca public.avofis_staff tablosuna ayrıcalıklı yetkiyle atanır; kullanıcı profilinden atanmaz.
3. Geçiş SQL'i uygulanmazsa takip ekranı gerçek kayıt gösteremez; geçmiş olay geriye dönük üretilmez.
4. Dosya yüklemek otomatik teslim kanıtı değildir. Belgenin kabul durumunu yetkili personel günceller.
5. Hukukî ve güvenlik doğrulamaları yapılmadan başvuru, müşteri kabulü ve ödeme kapalı tutulmalıdır.

## Zorunlu doğrulamalar / eksikler
- Derleme ve içerik testleri için GitHub Actions tanımlıdır; geçtikleri görülmeden başarı bildirilmez.
- Anonim/müşteri A/müşteri B/personel ile gerçek RLS saldırı testleri, 320/375/390/430/768/1024px görünüm ve klavye testleri, ödeme/iade/webhook ve müşteri akışları staging ortamında ayrı ayrı doğrulanmalıdır.
- Hollanda şirket tescili, veri sorumlusu ve adresi, doğrulanmış iletişim kanalı, tüketici şartları, KDV/harç dökümü, ödeme hesabı ve belge saklama/silme prosedürleri mevcut kaynak koduyla doğrulanamaz.
- Müşteri/personel işlem ekranlarının tamamı henüz Hollandaca ve İngilizce değildir.
- Yeşil CI veya Vercel dağıtımı, tüm işlevlerin çalıştığı anlamına gelmez.

## Sonuç belgeleri
Personel yalnızca kabul edilmiş sözleşmeli dosyaya özel Supabase bucket üzerinden dosya yükleyebilir; dosya metadatası public.avofis_deliverables tablosunda RLS ile kayıtlıdır. Müşteri yalnızca yetkili olduğu dosyanın teslim belgelerini kısa süreli imzalı bağlantıdan indirebilir. Depolama yazımı başarılı ancak veritabanı kaydı başarısız olursa sistem bunu açık hata olarak bildirir; manuel tutarlılık denetimi gerekir. Canlıda uçtan uca doğrulanmadı.
