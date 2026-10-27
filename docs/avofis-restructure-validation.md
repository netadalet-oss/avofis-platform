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

## Müşteri hedefleri ile gerçek işlem eşlemesi
Dokuz işlem rotası `portal/src/lib/journeys.ts` ve `portal/src/app/islemler/page.tsx` içinde tanımlıdır. Türkiye belgesinin Hollanda'da, Hollanda belgesinin Türkiye'de kullanımı; apostil/tercüme; Hollanda belediye; diploma; şirket; belge aktarımı ve bağımsız uzman gereksinimi ayrı ayrı ele alınır. Her rota işlem bazlı sorulara sahip olup formun gönderimi sunucu tarafında `validateJourneyDetails` ile kontrol edilir. `avofis_leads.journey_key` ve `intake_details` alanları için `20261027_customer_journeys.sql` uygulanır.

Müşteri hesabı doğrulandığında, personelin başvuruyu doğrudan dosyaya dönüştürmesi için `20261027_lead_to_case.sql` ile `avofis_open_case_from_lead` yordamı eklenir. Doğrudan kullanıcı UUID girişi yerine doğrulanmış hesap e-postası eşleştirilir. Durum geçişi denetimi için `20261027_case_transition_guard.sql` uygulanır. Yalnızca gerçek sözleşme ve sağlayıcı kayıtlarıyla ilerleme sağlanır.

Düzenleyici makam bağlantıları `portal/src/lib/journey-sources.ts` içinde tutulur. Şartlar kurum ve belge türüne bağlıdır; örneğin bazı çok dilli Türkiye medeni hâl belgeleri Hollanda'da tercüme veya apostil gerektirmeyebilir. Müşteri sürecinde sabit belge listesi, otomatik onay veya garantili sonuç iddiası yer almaz.

**Ek migration sırası:** temel MVP, müşteri senaryoları, başvurudan dosya açma, dosya olayları, durum geçiş guard'ı, belge talepleri, sonuç dosyaları. `20261027_case_tracking.sql` hem olayları hem belge taleplerini kurar; sonrasında `20261027_staff_deliverables.sql` uygulanır. Hiçbiri gerçek Supabase projesine bu PR ile otomatik uygulanmaz.
