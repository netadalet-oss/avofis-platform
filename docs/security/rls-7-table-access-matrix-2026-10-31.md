# AVOfis Seviye 4 — 7 tablo RLS sahiplik matrisi ve kontrollü düzeltme kapısı

**Kayıt tarihi:** 31 Ekim 2026. **Çalışma durumu:** kaynak doğrulamalı tasarım/denetim; **uygulanan canlı RLS düzeltmesi: 0/7**.

## Kanıt yöntemi
Bağlı AVOfis Supabase projesinin PostgreSQL sistem kataloğu, `information_schema`, mevcut policy envanteri ve yalnızca `COUNT(*)` toplamları salt okunur sorgularla incelendi. Veriler `rls-live-baseline-2026-10-31.json` dosyasında birincil kanıttan türetilmiş yapısal görüntü olarak saklanmıştır. `rls-readonly-preflight.sql` mevcut anlık riskin yeniden ölçülmesini sağlar. Canlı DDL/DML yapılmadı.

**Önemli:** Yedi tablonun tamamında sorgu anında kayıt sayısı **0** idi. Bu, güvenlik açığını kapatmaz: RLS kapalı ve `anon/authenticated` için `SELECT/INSERT/UPDATE/DELETE` nesne izinleri mevcuttur. Yapılandırma değerleri ileride değişebilir.

## Kaynakta gözlemlenen yapısal ilişki ve henüz KARARA BAĞLANMAMIŞ erişim tasarımı

| Tablo | Özgün canlı ilişki | Gözlemlenen kimlik alanı | Güvenlik kararının önündeki gerçek engel |
|---|---|---|---|
| `applications` | `job_id → jobs.id`, `user_id → profiles.id` | `user_id` nullable | Başvuru sahibinin erişimi, ilan sahibi/ofis yöneticisi inceleme yetkisi, özgeçmiş URL gizliliği ve silme/iptal yetkisi tanımlı değil |
| `jobs` | `office_id → offices.id` | Doğrudan kullanıcı sahibi YOK | İlanı yayınlama/düzenleme yetkisi, ofis üyelik rollerinin anlamı ve herkese açık ilan kriteri doğrulanmadı |
| `media_assets` | FK yok | Doğrudan kullanıcı sahibi YOK | Yükleyici/sahip/bağlı varlık alanı olmadan sahip bazlı RLS doğrulanamaz; okuma ve indirme gizlilik sınıfı bilinmiyor |
| `office_members` | `office_id → offices.id`, `user_id → profiles.id` | `user_id` nullable | Üye ekleme/çıkarma yetkisi, `position` değerlerinin yetki anlamı, davet ve onay iş akışları belirsiz |
| `offices` | Yabancı anahtar yok | Doğrudan kullanıcı sahibi YOK | Ofis sahibi/yönetici bağı kurulmamış; ofis bilgisi anonim okunabilir mi ve sahipliği kim değiştirebilir belirsiz |
| `posts` | `topic_id → topics.id`, `author_id → profiles.id` | `author_id` nullable | Anonim/oturumlu okuma, moderasyon, düzenleme ve silme yetkileri tanımsız |
| `topics` | `created_by → profiles.id` | `created_by` nullable | Konu görünürlüğü, açma/kapatma, moderasyon ve yazara ait işlemler tanımsız |

**NOT:** `candidate_owner_column` yalnızca teknik sütun/FK gözlemidir; kullanıcı tarafından onaylı sahiplik veya satır erişim politikası değildir. Nullable alanlar nedeniyle ileride sahipsiz kayıt oluşması engellenmelidir.

## Uygulama sırası / emniyet kapıları

1. **Operasyon matrisi:** her tablo için rol × CRUD × nesne/satır ilişkisi yazılı olarak belirlenecek. Roller sadece `anon`, `authenticated` değildir; ofis sahibi/yönetici, başvuru sahibi, içerik yazarı ve moderatör yetkileri de önceki özgün teknik sözleşmelerle eşleştirilmelidir.
2. **Şema kararı:** `offices`, `jobs`, `media_assets` doğrudan sahiplik alanı olmadan otomatik yetkilendirilmeyecek. Gerekirse ilişki tablosu veya alan önerisi ayrı değişiklik talebi olarak hazırlanacak; kaynak/karar onayı olmadan kesinleştirilmeyecek.
3. **Asgari yetki:** erişim modeli belli olana kadar anonim **yazma/silme yetkisi** verilmesi güvenli kabul edilmez; canlı `REVOKE` hemen çalıştırılmayacak, önce uygulama etkisi doğrulanacak.
4. **Politika taslağı:** yalnızca karar verilmiş satır erişimi için RLS `TO` + `USING` ve özellikle `UPDATE` için `WITH CHECK` üretilecek. `SECURITY DEFINER` ile RLS aşılmayacak. Sahte `USING (true)` politikası güvenli çözüm sayılmayacak.
5. **Negatif test:** `anon`, başka kullanıcı, başka ofis üyesi, kendi satırı ve yetkili yönetici senaryolarında her CRUD işlemi için izin/ret sonucu denenecek; null owner, başkasına owner atama ve referanssız nesne durumları da test edilecek.
6. **Daha sonra canlıya çıkış:** yalnızca bağımsız staging DB doğrulaması, önce/sonra yetki ve API doğrulaması, geri dönüş planı, kullanıcı onayı ve Supabase security advisors temizliği sonrasında. Bu dosya üretim değişikliği izni değildir.

## Tekrar çalıştırılabilir kontroller
- `node tools/security/rls-readiness.cjs` → anlık görüntüde 7 açık riski JSON olarak gösterir; **canlı durum sorgulamaz**, snapshot'a bağlıdır.
- `node tools/security/rls-readiness.cjs --fail-on-open-risk` → açık risk varsa çıkış kodu 2; canlı düzeltme olmaksızın `SUCCESS` vermez.
- `node --test tools/security/rls-readiness.test.cjs` → yanlış kaynak ve tamamlanma iddialarını reddeden 15 otomatik test.
- `docs/security/rls-readonly-preflight.sql` → canlı/veri içermeyen salt-okunur PostgreSQL katalog ve politika sorgusu. Çıktıdan yeni snapshot hazırlanıp sürümlenmelidir; kendi kendine değişiklik uygulamaz.

## Ayrı ve değişmeyen tarihsel kısıt
Seviye 0–3 onaylıdır: 63 alt program / 63 modül / 973 iş / 142 iç akış / 12 çapraz yolculuk / 154 toplam akış / 973 teknik sözleşme / **18 ÇÖZÜLMEMİŞ karar**. Seviye 4 özgün görev payı/payda bilinmiyor; %80 eşiği halen kanıtlanmadı. Bu güvenlik matrisi, özgün iş kimlikleri yerine geçmez.

Kaynak: [PR #6](https://github.com/netadalet-oss/avofis-platform/pull/6) — [Supabase Data API güvenliği](https://supabase.com/docs/guides/api/securing-your-api) — [RLS linter](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public).
