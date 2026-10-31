# AVOfis — Seviye 6 CMS eşzamanlı düzenleme koruması ve kalan kabul koşulları

**Tarih:** 31 Ekim 2026. **İş kimliği:** `SEC:S6-CMS-CONCURRENT-EDIT-GUARD`.
**Sonuç:** Taslak kod ve CI doğrulandı; **üretim/staging kabulü açık**.
**Seviye 6 gerçek denemeleri: 2/2; üçüncü deneme yasak.**

## Somut, kaynakla desteklenen risk

Seviye 6 yönetim paneli düzeltmesinin ilk sürümü, `pages` kaydını okuyup `hero` alanını birleştirdikten sonra `UPDATE` yapıyordu. Böylece kayıt alanlarının çoğu korunuyordu; ancak başka yönetici arada JSONB içerik güncellerse eski ekrandan gelen değişiklikle veri kaybı mümkündü. `site_settings` için de önceki güncelleme yalnızca `key` alanına bağlıydı.

Yeni kod: `admin/src/lib/cms-persistence.ts` ve `admin/src/app/cms/page.tsx`.

- Yüklenen JSONB değerinin **derin kopyası** React `useRef` içinde tutulur. Ekran state'inin iç içe öğelerini değiştirmesi bu orijinal karşılaştırma kopyasını bozamaz.
- `pages` için `UPDATE ... WHERE slug='home' AND content = <yüklenen jsonb>` eşdeğeri, `site_settings` için `UPDATE ... WHERE key=? AND value = <yüklenen jsonb>` eşdeğeri PostgREST filtreleri kullanılır. Supabase JS filtre parametresine nesne değil `JSON.stringify` edilmiş değer geçirilir.
- 0 satır dönmesi, yetki/eksik kayıt/eşzamanlı değişiklik ayrımı yapılmaksızın **başarısız** sayılır; eski veri üzerine otomatik yeniden yazma/retry yoktur.
- 1 eşleşen `id` doğrulanmadan “başarıyla kaydedildi” mesajı üretilmez. Çok satır dönmesi de başarısızdır.
- Veritabanı erişim sınırı Supabase RLS'dir. Bu değişiklik yeni bir servis rolü veya istemci kimlik doğrulama yöntemi eklemez.

## Gerçek iki deneme ve kanıtları

| Seviye 6 denemesi | Commit ve CI | Sonuç |
|---|---|---|
| 1 / 2 | Kod `5ff1f142`, test `f8d7892b`; [GitHub Actions #41174570965](https://github.com/netadalet-oss/avofis-platform/actions/runs/41174570965) | **FAILED:** yönetim paneli testinde 45/46 PASS, 1 FAIL; kaynak kod ifadesinin satıra bölünmesi test regex'ine uymadı |
| 2 / 2 | Test düzeltmesi `f59cf143`; [GitHub Actions #41174624419](https://github.com/netadalet-oss/avofis-platform/actions/runs/41174624419) | **PASS:** toplam 168/168, API/admin/portal TypeScript kontrolü başarılı |

Deneme sonucunun geçmişini yeniden yazmayı reddeden ek süreç testi dosyaları:
`docs/process/seviye6-onayli-devredilen-isler.json`, `tools/process/stage6-gate.cjs`, `tools/process/stage6-gate.test.cjs`.

## Sınırlar ve bir sonraki seviyeye taşınacak kabul işleri

1. **Gerçek PostgREST JSONB equality davranışı**, Supabase Data API ile yetkilendirilmiş staging kullanıcılarında pozitif ve negatif test edilmedi. JS mock testi bunu kanıtlamaz.
2. İki kullanıcının aynı kaydı yükleyip farklı sırayla kaydettiği tarayıcı testinde, sonrakinin hiçbir veriyi ezmeden reddedildiği doğrulanmalı.
3. `loadDefaults` işlemi dört bağımsız yazmaya dayanır; arada hata veya veri çakışması olursa önceki adımlar uygulanmış olabilir. Atomic RPC/transaction önerisi ayrı tasarım ve kullanıcı/DB izni gerektirir.
4. Portal tarafındaki eski görüntüden tüm `home` JSONB içeriğini yazma davranışı bağımsız inceleme konusudur. Bu seviye içinde artık 2 denemesi dolmuş admin CAS işine üçüncü deneme yapılmaz.
5. Canlı Supabase'in **7 RLS disabled** riski hâlâ ayrıdır; bu istemci taraflı yazma koruması RLS düzeltmesi veya üretim kabulü değildir.
6. Yeni bir seviyeye yalnızca kullanıcının ön onayıyla geçilir. **Seviye 7 onaylanmış değildir**. Açık konular sonraki seviyeye taşınmak üzere saklanır.

## Kaynaklar
- [Supabase JS filtreleme](https://supabase.com/docs/reference/javascript/using-filters)
- [Supabase JS güncellenen satırları döndürme](https://supabase.com/docs/reference/javascript/using-modifiers-select)
- [PostgREST filtreleme ve PATCH](https://docs.postgrest.org/en/stable/references/api/tables_views.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- GitHub taslak PR #8: https://github.com/netadalet-oss/avofis-platform/pull/8

Tarihsel temel 63 alt program / 63 modül / 973 iş / 973 teknik sözleşme / 154 akış ve 18 açık karar korunur. Tarihsel Seviye 6 iş kimlikleri mevcut olmadığından bu yeni kontrol özgün işlerden biriymiş gibi eşleştirilmedi. Kullanıcının Business.gov.nl kontrol listesi ilgili tüm seviyelerde koşullu olarak gözetilir.
