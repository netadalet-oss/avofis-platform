# AVOfis v17 — P09/P10 personel MFA ve CMS yayın kapısı

**29 Ekim 2026 — taslak PR #5 / inceleme gerektiren ek güvenlik programı.** Bu kayıt, v17 ana talimatnamesindeki **594 R-ID'yi**, J01–J16 yargı ekini veya IND G1–G4 ve B01–B18 engellerini **değiştirmez**. `P09`/`P10` burada *teknik çalışma paketi numarasıdır*; personelin 16 menü alanı ayrı tutulur.

## P09: personel ikinci faktör (AAL2)

**Kaynaklar (29.10.2026):**
- https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel
- https://supabase.com/docs/reference/javascript/auth-mfa-enroll
- https://supabase.com/docs/reference/javascript/auth-mfa-challengeandverify
- https://supabase.com/docs/guides/auth/auth-mfa/totp
- https://supabase.com/docs/guides/auth/auth-mfa

**Kod:**
- `admin/src/lib/staff-mfa.ts`: her ayrı backend isteği için sunucu tarafında `auth.mfa.getAuthenticatorAssuranceLevel(jwt)` ile ilgili **kullanıcı JWT'sini Auth sunucusunda** doğrular; yalnız `currentLevel==='aal2'` geçer. Yanıt bulunmaz/bozulur/hata olursa izin çıkmaz. Personel rolü tek başına AAL2 değildir.
- `admin/src/app/login/page.tsx`: şifre + doğrulanmış personel kaydından sonra AAL2 yoksa `/mfa` ekranına yönlendirir. Eski `/auth/login` doğrudan CMS'ye giden yol yerine doğrulanmış girişe yönlendirilir.
- `admin/src/app/mfa/page.tsx`: TOTP cihazının doğrulanması, kayıtlı faktör sorgusu ve AAL2 oturum doğrulama akışı. Yeni cihaz kaydı `NEXT_PUBLIC_AVOFIS_STAFF_MFA_ENROLLMENT_ENABLED` varsayılan **kapalı**; gerçek staging, personel hesabı ve Supabase MFA yapılandırması onaylanmadan açılmaz. TOTP cihaz sırrı yalnız kullanıcının kurulum ekranında gösterilir; uygulama veri tabanına veya vaka kayıtlarına yazmaz.
- `admin/src/app/api/workspace/{route.ts,drafts/route.ts,grants/route.ts,reviews/route.ts,audit/route.ts}`: kimlik+rol doğrulamasına ek MFA AAL2; reddedilen istek HTTP 403 ve `no-store`, staging kapalıysa 503. Yüksek riskli işlemler için gerçek imzalı banka/mahkeme yetkisi hâlâ ayrı gereklidir.
- `admin/src/app/cms/page.tsx`: eskiden CMS yalnız normal admin oturumuna bakarken artık getUser + AAL2 kontrolü de yapar.

**RLS (yalnız staging):** `database/migrations/20261029_staff_mfa_sensitive_scope_staging_only.sql` AAL2 yokken doğrudan Supabase REST üzerinden personel izni, taslağı, audit, bağımsız iç inceleme ve atanan dosya/mesaj/finans/özel dosya erişimini engeller. **Gerçek müvekkilin kendi dosyası, mesajı, ödeme kaydı ve iki meşru test PDF'si AAL1 oturumunda korunmalıdır**. Bu ilave politika muhasebe ödemesini veya kuruma resmî işlem yetkisini açmaz.

**Sentetik test:** `database/tests/staff_mfa_sensitive_scope_synthetic.sql` içinde SQL `auth.jwt()` yalnız PG17 test için taklit edilir. `aal2` ve `aal1` metinlerinin testte kullanılması gerçek TOTP cihazının ve imzalı Supabase JWT'nin doğrulanması anlamına gelmez. A/B müşteri ve personel ayrımı ayrıca doğrulanır. `database/tests/synthetic_restore_assertions.sql` AAL2 yöneticinin yeniden izin vermesini, AAL1 müşterinin kendi kayıtlarına erişimini bekleyecek biçimde düzenlendi.

## P10: eski CMS resmî/dilsel onaysız yayın durdurma

**Bulgu:** Önceki `admin/src/app/cms/page.tsx`, `pages` ve `site_settings` üzerine doğrudan `upsert` yapabiliyor, hatta genel “varsayılan verileri yükle” seçeneği önceden tasarlanmış hizmet ve yayın iddialarını canlıya aktarabiliyordu. Bu, altı dilde hukukî editör onayı ve B01/B02 güvenliği olmadan uygun değil.

- Kodda `CMS_PUBLICATION_ALLOWED=false` sabit; beş yazma fonksiyonu işlem öncesi reddeder, yayın butonları devre dışıdır. İçerik inceleme yetkisi durur.
- `database/migrations/20261029_legacy_cms_publication_hold_staging_only.sql`: yayın yetkisi verilmemiş `pages`/`site_settings` veritabanı satırlarının INSERT/UPDATE/DELETE işlemlerini PostgreSQL grant + RESTRICTIVE RLS ile reddeder; **admin SELECT'i kesmez**. Mevcut satırlar silinmez.
- `database/tests/legacy_cms_publication_hold.sql`: disposable PostgreSQL17'de içerik okuma ve yayınlamanın engellenmesi testidir.

## Tek başına yeterli olmayan hususlar

1. **Üretim NO-GO:** bağlı canlı Supabase'deki eski 7 `public` tabloda RLS kapalı ve anonim CRUD var; canlı DDL yapılmadı. Yetkili sahibin gerçek backup/staging/değişiklik onayı gerekiyor.
2. **Gerçek MFA E2E:** staging Supabase projesi, 2 farklı gerçek insan/personel hesabı, doğrulanmış TOTP, JWT yenilenmesi, oturum iptali, cihaz kaybı/erişim kurtarma, MFA devre dışı senaryoları henüz yok.
3. **Yetki sınırları:** AAL2 tek başına müşteri dosyası ataması, hukukî meslek yetkisi, G1–G4, mahkeme dosyası imzası veya para çıkış izni değildir; SQL rol/izin kontrolü ayrıca sürer.
4. **Hukukî içerik yayını:** form/dilekçe/mevzuat kaynağının resmî sürümünün güncelliği, altı dil editör onayı, GDPR 6/9/13/28/32 ve bağımsız yayın GO kararları eksik.
5. **İç denetim:** PostgreSQL audit kayıtları sıradan role göre silinemez; bağımsız WORM/SIEM, DPO ve prod denetimi yerine geçmez.
6. **Önizleme:** Çevrimdışı ekran tasarımı gerçek Supabase kimlik doğrulaması değildir. Vercel preview GitHub HEAD değişimi için ayrıca SSO'lu dağıtım doğrulaması gerekir.

**Kabul sonucu:** Testler yalnız ilgili adımlara kısmi teknik kanıt sağlar; 594 R-ID'nin **hiçbiri bağımsız kabul edilmiş sayılmaz**. Canlı müşteri kabulü, ödeme/banka çıkışı, resmî IND/Rechtspraak gönderimi, gerçek gizli dosya aktarımı ve `main` merge kapalıdır.
