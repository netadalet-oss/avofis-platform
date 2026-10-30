# AVOfis v17 — P04–P06 İç İnceleme, Personel İzinleri ve Denetim Kanıtı
**29 Ekim 2026 · PR #5 · Geliştirme/staging-only.** Ana talimatnamedeki **R-001…R-594**, T01–T13, IND G1–G4 ve Hollanda J01–J16 ek programı değiştirilmedi.

## İhtiyaç ve tasarım
P01–P03'te personel hesabı/16 modül ve iç görev taslakları kuruldu; bu pakette **önceden hazırlanmış kaydın sessizce değiştirilmesi**, **personel izni değişikliğinin iz bırakmaması** ve **yönetici incelemesinin görünür iş akışı olmaması** kapatılıyor. Finans ve adlî işlemler için gerçek kurum/meslekî yetki kanıtı oluşmamıştır.

### P04 — İç taslak kilidi ve olay izi
- **SQL** `database/migrations/20261029_staff_review_and_audit_staging_only.sql`: `avofis_staff_work_item_events` için `created`, `updated`, `review_requested` kayıtları; `avofis_staff_capability_events` için `granted`, `revoked` kayıtları.
- Veritabanı **BEFORE UPDATE** koruması: `review_requested` durumundaki taslak değiştirilmez, `id`/`staff_user_id`/`module`/`case_id`/`flow`/`created_at` sabittir. Orijinal çalışma notu korunur; düzeltme için yeni taslak gerekebilir.
- Olay tablolarında `anon` erişimi yoktur, `authenticated` rolü için **yalnızca RLS'ye bağlı SELECT** bulunur; UPDATE/DELETE/INSERT doğrudan açık değildir. Veritabanı tetikleyicileri sınırlı SECURITY DEFINER kullanır, `search_path=''` ve EXECUTE yetkileri `PUBLIC/anon/authenticated` rollerinden geri alınır. Bu **haricî WORM veya bağımsız değiştirilemez olay kasası değildir**.

### P05 — Bağımsız iç inceleme
- `avofis_staff_work_item_signoffs` (PK `work_item_id`,`reviewer_user_id`), durumlar yalnız `reviewed_internal` veya `changes_requested`.
- RLS: inceleyen kişi aktif, doğrulanmış `avofis_staff.role='admin'`; kaydı hazırlayan **olamaz**; kayıt önceden `review_requested` olmalıdır. Tek yönetici tekrar kayıt oluşturamaz.
- İki farklı yöneticiyle iç inceleme, ödeme, muhasebe defteri mutabakatı, mahkemeye/IND'ye başvuru, avukatlık/meslekî hukuk yetkisi veya müşteri dosyası teslimi **değildir**. Bu durumlar için haricî kaynaklı bağımsız kanıt ve ayrı canlı iş akışı gerekir.
- `admin/src/app/api/workspace/reviews/route.ts`: erişim, Supabase JWT `getUser()` + veritabanından `avofis_staff` admin kontrolü + RLS ile doğrulanır. GET inceleme kuyruğu, POST yalnız ayrı staging bayrağı ve denetim kurallarıyla iç kayıt oluşturur.
- `admin/src/components/staff-review-queue.tsx`: yönetici ekranı, inceleme kuyruğu, kendi kaydına izin verilmemesi, iki farklı yöneticinin iç kaydının görünmesi.
- `admin/src/app/api/workspace/drafts/route.ts` PATCH: yalnız hazırlayan kişinin `draft → review_requested` iç geçişine izin verilir; kaynak taslak değiştirme kilidi veritabanında sürer.

### P06 — Yetki sicili
- `admin/src/app/api/workspace/grants/route.ts`: GET personel/izin/son 40 olay, POST bireysel izin ver, DELETE iptal et; gerçek JWT + admin kontrolü + RLS. `staff_user_id` ve 16 izin kodu doğrulanır. Personelin kendine yetki vermesi kabul edilmez; veritabanı yalnız operatörlere admin tarafından yetki verilmesine izin verir.
- `admin/src/components/staff-grant-manager.tsx`: çalışan hesabı seçimi, 16 izin seçeneği, izin verme/geri alma ve audit görünümü. Yalnız yönetim alanında sunulur; salt istemci taraması bir güvenlik garantisi değildir, sunucu/RLS ayrıca doğrular.

## Test kanıtı
- [GitHub Actions #40941294088](https://github.com/netadalet-oss/avofis-platform/actions/runs/40941294088) — **6/6 SUCCESS** (sentetik PostgreSQL 17, admin build/TypeScript, müşteri/IND, legacy RLS, Redis).
- `database/tests/staff_review_audit_synthetic.sql` — gerçek geçici PostgreSQL 17: personel D'nin gelir/gider taslağı, C ve E adlı iki ayrı sentetik yöneticinin bağımsız iç incelemesi, öz-inceleme ve sahte imzacı reddi, olay kayıtlarının UPDATE/DELETE ile değiştirilememesi, erişim iptalinin hemen uygulanması. Kontrol işlemi **ROLLBACK** ile sonlanır.
- Üç ayrı hata sınıfı (veri kısıtı/RLS/izin) test edilir. 5 admin çalışma alanı Node testi ve 50 portal Node testi de hâlâ geçer.
- **Test sınırı:** Şifre/MFA gerçek staging oturumları, gerçek mahkeme/IND, bankalar, PSP, DPA, gerçek customer PII ve canlı RLS burada test edilmedi.

## Bilinçli kapalı bayraklar / dağıtım
- `AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED=false` (varsayılan): bütün korumalı API'ler 503 döndürür; gerçek personel ortamı kurulmadı.
- `AVOFIS_STAFF_WORK_ITEM_WRITES_ENABLED=false` (varsayılan): iç görev taslağı yazımı ve inceleme talebi kapalı.
- `AVOFIS_STAFF_INTERNAL_REVIEW_ENABLED=false` (varsayılan): bağımsız inceleme POST kapalı.
- `AVOFIS_STAFF_GRANTS_ENABLED=false` (varsayılan): bireysel izin yazımı/iptali kapalı.
- Bunlar **yalnız onaylı bağımsız staging ortamında**, gerçek Auth/JWT/RLS/Storage ve denetim incelemesi yapıldıktan sonra ayrı aşamalarla denenebilir. Bayrakları tek tek açmak **hukukî temsil veya resmî işlem onayı vermez**.

## Açık engeller ve sonraki somut iş
1. B01/B02: yedi canlı Supabase `public` tablo RLS kapalı, anonim CRUD mevcut; hiçbir üretim SQL değişikliği yapılmadı.
2. B03/B04: gerçek yedek/restore ve bağımsız staging Auth/JWT/Storage testleri yok.
3. B05–B09 ve J13: gerçek şirket/avukat/temsil yetkisi, GDPR 6/9/13/28/32/DPIA, IND G1–G4, Aansluitpunt sağlayıcı kabulü ve resmî işlem makbuzları eksik.
4. Personel rol yönetimi için **MFA ve oturum iptali**, görevden alınan çalışan JWT'nin etkisizleşmesi, 16 alanın tamamında gerçek form iş akışı/yalnız kaydedilebilir iş girdileri, iki ayrı yöneticinin kararına ilişkin bildirimler, bağımsız dış audit ve gerçek muhasebe mutabakatı geliştirilmeli.
5. Mobil/klavye/ekran okuyucu ve altı dilin insan onaylı QA'sı henüz bağımsız kabul edilmedi.
6. Bu paket **PR #5 draft** olarak kalır; canlı veritabanına migration, `main` birleştirme, müşteri/ödeme veya resmî dış gönderim yapılmaz.

**Resmî güvenlik başvuruları:** https://supabase.com/docs/guides/database/postgres/row-level-security · https://supabase.com/docs/guides/database/functions
