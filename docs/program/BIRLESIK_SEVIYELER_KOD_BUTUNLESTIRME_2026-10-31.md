# AVOfis — Çok seviyeli kod bütünleştirmesi / kod ve güvenlik köprüsü

**Tarih:** 31.10.2026. **Ana dal:** `main` değiştirilmez. **Birleştirme hedefi:** `integration/avofis-birlesik-seviyeler-20261031` (taslak PR; `seviye1-yeniden-baslangic-20261031` tabanlı).

## Kaynaklar ve tercih
- Güvenli güncel PR #10: `af39df21230b211a3e7321f568556daad19ebcf1` — korunan kaynak ve hesap/CMS güvenlik kapıları.
- v17 tarihî işlev dalı: `e20a2f39271fd8e782e5e5c08c7f052996525720` — **215** yalnızca hedef ağaçta bulunmayan, açıkça gizli olmayan dosya.
- Seviye 4–7 birikimli dal: `6ebeafde51fc8680e05b30ece0b293e6bd5e3434` — **65** dosya, bunun **10** tanesi tabanda bulunan dosyaya kontrollü güncellemedir.
- Tekrarlayan ana sayfa, CMS sunucu uç noktası ve üst menü gibi çakışmalarda yeni S1 dosyaları korunur.
- Yeni PR #10'un `/hizmetler/[slug]` ile çakışan v17 `/hizmetler/[service]` dinamik rotası alınmaz.
- Tarihî `.env.local` ve benzeri gizli yapılandırmalar birleştirme ağacına alınmaz; eski CI tanımları çalıştırılmak üzere kopyalanmaz.
- Eski tarihî PR'lar birleştirilmiş/kapalı sayılmaz; üst seviye dosyaları da canlı hizmet hakkı doğurmaz.

## Kabul koşulları ve açık işler
Bu bütünleştirme yalnız **kod aktarımıdır**. `npm` / Next.js / API build, HTTP, tarayıcı, izole Supabase Auth/Storage ve hukukî/dilsel kabul **ayrıca kanıtlanmadıkça** sistem tamamlanmış sayılmaz. Kaynaklar farklı Next.js sürümleriyle geliştirilmiştir; güncel S1'in Next 14/React 18 paketleri korunmuştur. CI sonucu görülmeden uyumlu olduğu iddia edilemez.

**B01–B18 açık; 7 canlı RLS riski** ayrıca izinli staging ve gerçek veri ayırma testleri bekler. **594 R-ID bağımsız kabul 0/594** (kod aktarımı ile otomatik artmaz). Hiçbir canlı üretim, gerçek para, kurum başvurusu, kişisel veri veya meslekî yetki açılmaz.

## Değişiklik dizini
Güvenli aktarım listesi, kaynak SHA'ları, çakışma ve hariç bırakmalar: `docs/program/birlesik-kod-aktarim-manifesti-2026-10-31.json`.

## İzleyen teknik öncelikler
1. Birleştirilmiş Next.js portal, admin, API derlemeleri ve otomatik testler.
2. Somut çakışma / bağımlılık hatalarının doğru kodla giderilmesi, kullanıcı akışında belge hazırlama bağlantısı ve gerçek preview.
3. Staging A/B, MFA, Storage ve RLS negatif testleri, hukukî kaynak ve altı dil/RTL QA; ayrı izin olmadan üretime geçiş yok.
