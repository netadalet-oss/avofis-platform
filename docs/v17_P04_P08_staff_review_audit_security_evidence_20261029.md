# AVOfis v17 — personel yetkileri, iç inceleme ve güvenlik kanıtı (teknik P04–P08)
**Tarih:** 29 Ekim 2026 | **Yalnız** `feature/avofis-v17-two-person-clearance-20261029` / taslak PR #5; `main` veya canlı Supabase değişmez.

## Gereksinim izleme ve kapsam
- Özgün **594 R-ID** ve J01–J16 Hollanda yargı ek talimatı **yeniden numaralandırılmaz**. Bu belgedeki **teknik P04–P08**, önceki `P01–P16` personel *menü iş alanı* etiketlerinden farklıdır.
- Kod halihazırda 16 bireysel erişim alanı, 14 kaynaklı hukukî iş akışı ve kapalı resmî işlem bayrakları içeren `admin` uygulamasını yeniden kullanır; yeni yazılım ya da gerçek müşteri hesabı açılmaz.
- Yönetici yetkisi şirket/meslekî/yargısal/finansal temsil izni **değildir**. İki yöneticinin iç inceleme kaydı **banka veya mahkeme yetkisi vermez**.

## Teknik değişiklikler / teyit kaynağı

| İlgili iş | GitHub kodu | Teknik kabul neyi kanıtlar | Eksik |
|---|---|---|---|
| P04-SEC | `database/migrations/20261029_staff_review_and_audit_staging_only.sql` | Taslak `review_requested` sonrası `UPDATE` SQL trigger ile reddedilir | Gerçek staging Auth ve üretim değişiklik onayı |
| P04-AUD | Aynı migration + `database/tests/staff_review_audit_synthetic.sql` | Yetki verme/kaldırma trigger ile `avofis_staff_capability_events` içine eklenir; normal authenticated rolü UPDATE/DELETE yapamaz | Değiştirilemez haricî/WORM log, SIEM ve saklama/DPO denetimi |
| P05-2P | `avofis_staff_work_item_signoffs` RLS ve birleşik 2 yönetici negatif test | Çalışanın veya kendi taslağının yöneticisinin self-review denemesi reddedilir. İki ayrı admin sentetik olarak tek taslağa farklı kayıtlara imza verebilir | Gerçek iki insan kimliği/MFA ve kurum makbuzu |
| P05-API | `admin/src/app/api/workspace/reviews/route.ts`, `admin/src/components/staff-review-queue.tsx` | Yönetici kimliği sunucuda doğrulanır, PostgREST RLS karar verir, yalnız `reviewed_internal`/`changes_requested` | Gerçek staging ve erişim testi |
| P06-API | `admin/src/app/api/workspace/grants/route.ts`, `admin/src/components/staff-grant-manager.tsx` | Her modül için kişisel grant/revoke, admin-only, kendine izin verme API'sinde yasak | Gerçek personel sicili, rol değişimi ve MFA |
| P07-AUD | `admin/src/app/api/workspace/audit/route.ts`, `admin/src/components/staff-audit-timeline.tsx` | Yetki/görev/iç inceleme geçmişi yalnız doğrulanmış admin API'sinde okunur | Gerçek PostgreSQL, retention ve denetçi kabulü |
| P08-HTTP | `admin/scripts/staff-workspace-http-smoke.mjs` ve GitHub Actions | Üretilmiş Next.js uygulamasının **11 API yöntemi** kapalı staging ortamında 503 + `Cache-Control: no-store` dönmelidir; giriş kabuğu 200, özel token yok | Tamamlanan CI koşusu kanıtı; gerçek MFA/RLS davranışına dair kanıt değildir |

## Çalışma akışı (güncel kod)
1. Personel kendi hesabıyla oturum açar. Supabase `getUser` kimliği, `avofis_staff` aktif rolü ve `avofis_staff_capability_grants` ayrı modül yetkisi doğrulanır.
2. Operatör yalnız kendine verilmiş yetki ve ayrıca dosya ataması/RLS ile kendi iç taslağını oluşturur. Tüm kayıtlar `draft` olarak başlar.
3. Personel “İç inceleme iste” işlemiyle taslağı `review_requested` durumuna gönderir; ilk sürüm artık değiştirilemez. Güncelleme denemesi veritabanı tetikleyicisiyle reddedilir.
4. İşlem sahibi olmayan **iki ayrı aktif yönetici**, ayrı sentetik kayıtlarla `reviewed_internal` veya `changes_requested` iç kontrolünü ekleyebilir; aynı kişiden ikinci kayıt reddedilir. Bu, henüz bir işin “tamamlandığı/ödendiği/gönderildiği” statüsünü yaratmaz.
5. Kişiye verilen `billing` veya başka modül yetkisi kaldırıldığında RLS o modülün taslaklarına erişimi keser. Grant/revoke ve iş geçişleri SQL audit kayıtlarına eklenir.
6. Yönetici özel “Denetim” ekranında son izin, görev ve iç inceleme olaylarını kaynağına sadık biçimde görebilir. Yalnız çalışan bir **staging** veritabanı varsa gerçek veriler döner; canlıda varsayılan kapalıdır.

## Özellikle açık kalan eksikler
- **B01/B02**: bağlı canlı Supabase'deki 7 eski `public` tablo RLS kapalı ve `anon` CRUD yetkileri açık; düzeltici migration canlıya uygulanmadı. Tek başına UI veya CI bunu kapatmaz.
- **B03/B04**: bağımsız gerçek Supabase staging projesi, uygulama servis envanteri, güvenli gerçek backup/restore, gerçek Auth/JWT/Storage ve personel MFA kanıtı eksik.
- **B05–B09**: meslekî/hukukî yetki, GDPR Madde 6/9/13/28/32, DPO, 6 dil hukukî editör, iade/ödeme/PSP kuralları, şirket/yetkili imzacı incelemesi açık.
- **Dış bağlantı**: Rechtspraak, Aansluitpunt ve IND gerçek başvuru/gönderim/kabul/makbuz bağlantıları kapalı. Yargı J01–J16 programı birbirinden ayrı tutulur.
- **İç denetim**: PostgreSQL audit satırlarının sıradan personele değiştirilememesi **WORM veya olayın haricen doğrulanması değildir**; yetkili DB operatöründen bağımsız log, retention ve incident testleri eklenmeli.
- **Finans**: Kullanıcıya ödeme yapılması, gelir tahsili, fatura kesme ve banka hareketleri için gerçek PSP/banka, çift kontrollü idari yetki, mutabakat, vergi ve geri ödeme sağlayıcısı henüz yok. Sentetik `amount_eur_cents` muhasebe kaydı sayılmaz.

## Doğrulama disiplini
- PG17 sentetik test: `database/tests/staff_review_audit_synthetic.sql` içinde ayrı admin C/E, operator D ve müvekkil A rolleri; kilitli taslağın değiştirilmesi, self-review, ikinci aynı admin imzası, denetim log silme, ayrı yetki kaldırma ve müvekkil yalıtımı kontrol edilir. `ROLLBACK` ile gerçek kullanıcı verisi sıfırdır.
- Built Next.js admin CI: `admin-workspace-validation`, `npm run typecheck`, `npm run build`, `admin/scripts/staff-workspace.test.mjs`, kapalı staging HTTP testi. CI 2026-10-29'da `npm run start` ile uygulama başlatılacak şekilde güncellendi; önceki yerel `node_modules/next` sabit yolu nedeniyle çıkan test altyapısı hatası düzeltildi.
- 594 R-ID'nin kabul hanesi `BAĞIMSIZ MADDE KABULÜ YOK`; teknik kanıt ayrıdır. Gerçek portal Vercel preview için günlük dağıtım kotası/geçiş sonucu ayrıca doğrulanmalı; çevrimdışı HTML yalnız sentetik ekran tasarımını temsil eder.

**Durdurma ilkesi:** Güvenlik açığı, rol ayrışma ihlali, yetkisiz bilgi sızıntısı, resmî makbuz sahteciliği ya da canlı veriyi etkileyen işlem tespit edilirse canlı bayraklar kapalı kalır; `main` veya üretime geçiş yoktur.
