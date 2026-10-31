# AVOfis Seviye 6 — CMS toplu varsayılanları güvenli önizleme

**Tarih:** 31 Ekim 2026. **Operasyonel durum:** Seviye 6 aktif, Seviye 7 onaysız. **İş:** `SEC:S6-CMS-DEFAULTS-PARTIAL-RESET`.

## Önceki risk
`admin/src/app/cms/page.tsx` içinde “Varsayılan Verileri Yükle” düğmesi sırayla `home.hero`, `site_settings.navigation`, `modules`, `footer` kayıtlarını güncelliyordu. Bu işlemler tek bir transaction değildi. Bir adım başarısız olursa daha önceki adımlar kalıcı olabilirdi; dört bölümün birlikte kaydedildiği izlenimi yanıltıcıydı.

## Yapılan yeni çalışma
- `loadDefaults()` yerine yalnızca React ekrandaki taslak alanlarını güncelleyen `previewDefaults()` kullanılıyor.
- Düğme metni **“Varsayılanları Önizle (Kaydetmez)”** olarak değiştirildi.
- Tek tuşla hiçbir Supabase okuma, INSERT, UPDATE, UPSERT veya API çağrısı yapılmıyor.
- Daha önce veritabanından yüklenen özgün `heroBaseline` / `settingBaseline` kayıtları **değiştirilmedi**. Kullanıcı dört bölümü **ayrı ayrı** kaydederse her biri önceki eşzamanlılık korumasıyla işlenir.
- Mesaj, önizlemenin kaydedilmediğini ve bölümlerin ayrı kaydedilmesi gerektiğini açıkça bildiriyor.
- `admin/tests/cms-default-preview.test.cjs` 11 statik TypeScript AST ve içerik testi ile bu kuralı denetliyor. Mevcut CMS kalıcılığı testleri yeni davranışa göre güncellendi.

## Gerçek iki deneme
| Deneme | CI / commit | Sonuç |
|---|---|---|
| 1/2 | Kod `6259aa6a`; ilk test `52796109`; [GitHub Actions #41175029768](https://github.com/netadalet-oss/avofis-platform/actions/runs/41175029768) | **FAILED**: Admin 56/57 PASS, bir AST test yardımcı işlevi erken sonlandı |
| 2/2 | Test düzeltmesi `2602190b`; [GitHub Actions #41175089926](https://github.com/netadalet-oss/avofis-platform/actions/runs/41175089926) | **PASS**: 182/182 toplam test, 0 fail; API build, admin ve portal TypeScript başarılı |

**Deneme hakkı Seviye 6 için tükendi.** Daha fazla icra denemesi yapılmayacak; açık kabul ve üretim süreci ancak kullanıcı onaylı sonraki seviyelerde ele alınabilir.

## Kalan sınırlar
- Bu, **çok adımlı atomik sıfırlama** gerçekleştirmez; kullanıcı alanları ayrı ayrı kaydederek farklı zamanlarda değiştirebilir. Ancak bir tek düğme artık dört kısmi değişiklik oluşturmaz.
- Gerçek tarayıcıdan Supabase'e doğrulanmış RLS ve eşzamanlılık senaryoları uygulanmadı; kod hâlâ **taslak PR #8**'dedir. Canlı DB, `main` ve deployment **değişmedi**.
- 7 canlı RLS sorunu, 1 parola güvenlik uyarısı, 10 önceki devreden konu ve 18 tarihsel karar açık. Hollanda/AB resmî kontrol listesi ilgili tüm işlerde koşullu olarak izlenir.
- 973 tarihsel işin özgün kayıt kimlikleri yok; bu operasyonel düzeltme tarihsel iş kabulü değildir.
- **Seviye 7'ye ön onay yok.** Geçiş için kullanıcıdan ayrıca onay alınmalıdır.

## Kaynaklar
- PR #8: https://github.com/netadalet-oss/avofis-platform/pull/8
- GitHub: `docs/process/seviye6-onayli-devredilen-isler.json`, `tools/process/stage6-gate.cjs`, `tools/process/stage6-gate.test.cjs`
