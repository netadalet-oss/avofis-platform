# AVOfis S2 — B01/B02 izole RLS/GRANT taslağı

31.10.2026 kullanıcı onayı yalnızca izole test ortamında geliştirme ve iki sentetik kullanıcı testi içindir. Main, canlı Supabase, gerçek kullanıcı, üretim, para ve resmî işlem izinleri verilmemiştir.

## Kaynak
Tarihî PR #9'daki 31.10.2026 RLS kaynak envanteri ve S2 salt okunur katalog denetimi. İlgili özgün gereksinimler: R-524, R-527, R-580, R-586, R-587, R-594.

Dört alanda yalnız teknik profil bağlantısı gözlendi: applications.user_id, office_members.user_id, posts.author_id, topics.created_by. Bu alanların profiles.id olması, gerçek Supabase Auth kullanıcı kimliğiyle birebir eşleştirildiği anlamına GELMEZ. NULL değerler mümkündür. Offices, jobs, media_assets için doğrudan sahiplik doğrulanmadı.

## İzole test sözleşmesi
GitHub Actions postgres:17 servis konteynerinde geçici avofis_s2_test veritabanı oluşturulur. SQL dosyaları yalnız o adla çalışmak üzere guard taşır. Sentetik A ve B sahipliği + NULL sahipli satırlar eklenir; tarihî aşırı yetkili grant ve CMS okuma politikaları yalnız fikstürde modellenir.

- A ve B kendi dört ilişkili satırını okuyabilir, birbirinin satırını okuyamaz.
- Anonim kullanıcı hiçbir bu tabloya doğrudan erişemez; yazma, silme, sahibi değiştirme kapalıdır.
- Offices, jobs, media_assets ve CMS her rol için doğrudan kapalıdır.
- Profil-ID/auth.uid eşitliği sadece test hipotezidir. Gerçek izin, başvuru kabulü, uzman yetkisi veya CMS yayın politikası burada verilmez.
- Scriptler canlı migration değildir; canlı Supabase bağlantısı ve gerçek PII içermez.

## Kabul dışı kalanlar
Gerçek Supabase JWT imza doğrulaması, Auth/Storage, signed URL, MFA, personel ve uzman rol ataması, iptal, API HTTP uçtan uca, profillerin gerçek kimlik bağı, 6 dil hukukî yayın onayı, yedek/rollback ve kullanıcı kabulü doğrulanmadı.

Özgün payda 594; bağımsız kabul 0/594, canlı kabul 0/594. 18 açık engelin tamamı açık. Testlerin yeşil olması B01/B02'nin canlıda kapandığı anlamına gelmez.

Resmî teknik kaynak: https://supabase.com/docs/guides/database/postgres/row-level-security
