# AVOfis — Güncel çok seviyeli, eksikleri birlikte tamamlama kararı

**Karar tarihi:** 31 Ekim 2026 (Seviye 1'e sıfırlama kararından sonra)  
**Kullanıcının açık yeni talimatı:** “Sonraki aşamalara geçiş serbest fakat eksikleri tamamlama çalışmaları da birlikte yapılacak”

## 1. Öncelik ve kararın etkisi

Bu karar, aynı tarihli önceki Seviye 1 kaydında bulunan **“Seviye 2'ye/sonraki seviyelere geçiş için ayrıca kullanıcı onayı gerekir”** kuralını **yalnız aşama ilerletme yönünden** değiştirir. Önceki kaydın tarihî içeriği silinmez veya geriye dönük değiştirilmez.

- **Seviye 2 ve sonraki seviyelerde çalışmaya başlamak serbesttir.** Her yeni seviye için yeniden kullanıcıdan aşama izni istenmez.
- **Seviye 1 ve daha önceki bütün açık iş ve hatalar paralel olarak giderilmeye devam eder.** Yeni seviyeye geçmek geçmiş işin tamamlandığını, reddedildiğini veya unutulduğunu ifade etmez.
- **Aşama açılması ≠ gereksinim kabulü ≠ canlı kullanıma izin.** Her aşama, kendi gerçek işlevi ve özgün R-ID kanıtlarıyla izlenir. Eski ilerleme rakamları yeni kabul sayılmaz.
- Aşamaların sayısal kabulü yalnız bağımsız kabul kanıtı bulunan özgün R-001–R-594 üzerinden hesaplanır; kod, CI, HTTP, tarayıcı, staging, hukuk/dil insan onayı ve üretim ayrı kalemlerdir.

## 2. Eş zamanlı iki çalışma kolu

**Kol A — Eksik ve güvenlik borçlarının kapatılması:** Seviye 1'den devreden S1-02…S1-06, B01–B18, gerçek Supabase staging/A-B rol ve Storage izolasyonu, eski kodların R-ID eşlemesi, hukukî kuruluş/meslekî yetki, altı dil ve hukukî içerik onayı. Bunlar bağımsız test ve gerçek kanıt olmadan kapatılmaz.

**Kol B — Sonraki seviye işlevlerinin geliştirilmesi:** 17 hizmet/14 hedef kitle/12 sorun rotası/16 rehber; güvenli müşteri dosyası ve bağlamsal belge hazırlama; personel çalışma alanları, IND/J/P alt işleri ve gerekli ülke-işlem adaptörleri. Yeni işlevlerin kapsamı 594 özgün gereksinim ve kaynak v18'e bağlı kalır.

Her çalışmada iki koldan en yüksek etki ve önceliğe sahip, izinli işler ilerletilir; mevcut açık P0 güvenlik riski varken gerçek müşteri verisi ya da canlı işleme açılışı yapılamaz. Her iş için **parent R-ID / B-ID / J/P/IND**, somut kod/dosya, test/CI, eksik kabul koşulu ve bir sonraki adım raporlanır.

## 3. Değişmeyen özel izin sınırları

Bu aşama izni **şu işlemlere açık onay değildir:** `main` birleştirmesi; Vercel production dağıtımı ve koruma değişiklikleri; canlı Supabase DDL/DML/RLS/GRANT/Storage değişikliği; gerçek müşteri veya personel kişisel verisi; resmî kurum/mahkeme/IND başvurusu; banka, PSP, tahsilat veya ödeme; hukuken gerekli meslekî/temsil yetkileri. Her biri ayrıca eylem bazlı açık izin ve ilgili gerçek yetki gerektirir.

G1–G4, GDPR/AVG, gerçek yetki, veri güvenliği, önceki deneme kayıtlarının korunması ve başarı iddiası için bağımsız kanıt koşulları aynı kalır. Canlıda yedi legacy RLS bulgusu ile B01–B18 kapatılmış sayılmaz.

## 4. Karar anındaki kabul referansı ve uygulama

- Ürün kapsamı: **594 özgün R-ID; 324 P0 ve 270 P1; 33 bölüm**.
- Yeni başlangıçta belgelenen bağımsız kabul: **0/594**. Aşama izni bunu artırmaz.
- Tarihî kanıt: **41 kısmi / 553 kanıtsız** (yeni kabul değildir).
- Kuruluş fizibilitesi: **64 kaynak madde** (şirket tescili veya hizmet hakkı değildir).
- Korunan açık engel kaydı: **B01–B18** (yeni kanıtla ayrı ayrı değerlendirilir).
- Aktif geliştirme referansı, karar kaydı sırasında: **PR #10**; `seviye1-yeniden-baslangic-20261031`; `6d9b096eb94be963411bb0e9a071510f8d648b38` (yeni commit geldikçe güncel GitHub doğrulanır).
- **Yürürlük:** Bu karar ileri aşamalara geçişi önceden izinli kılar; aktif yürütme seviyesinin veya bir seviyenin “tamamlandı” durumunun kayıtları, yalnız fiilen başlanan ve kanıtlanan işe göre güncellenir.

**Kaynakların sırası:** En yeni açık kullanıcı kararı > 31.10.2026 Seviye 1 başlangıç kararı (değişmeyen sıfır kabul/kapsam kısmı) > 29.10.2026 v18 özgün ürün gereksinimleri ve 64 maddelik kuruluş fizibilitesi > tarihî PR, test ve teknik kanıtlar.
