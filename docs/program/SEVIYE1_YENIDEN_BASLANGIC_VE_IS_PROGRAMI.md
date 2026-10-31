# AVOfis — SEVİYE 1 / Kayıpsız yeniden başlangıç

**Karar tarihi:** 31 Ekim 2026  
**Kullanıcı komutu:** "Tüm çalışmayı sıfırla seviye1 den başla"  
**Durum:** Seviye 1 başlatıldı. Seviye 2 için onay **yok**.

## 1. "Sıfırlama"nın kesin anlamı
Eski Seviye 4–7 operasyonel ilerleme, tamamlandı iddiası, %28,33/60 gösterimi ve sonradan kaynağı eşlenmemiş 973 iş / 63 modül hesabı, **yeni programın kabulüne aktarılmaz**. Eski GitHub dalları, draft PR'lar, CI sonuçları ve dosyalar **arşiv/yeniden kullanım adayıdır**, fakat yenide "tamamlanmış" sayılamaz.

Bu karar kaynakları veya tarihsel kanıtı silmez. `main` dalı, geçmiş commit'ler, açık PR'lar, canlı Supabase ve Vercel üretimi değiştirilmeyecek. Yeni geliştirme dalı `seviye1-yeniden-baslangic-20261031`, `main` commit `c97d03d67ffe9b4db0affc6b36f12dd331bc4cb6` üzerinde açıldı. Bu dalın eski PR'larda kalmış yeni kodları otomatik devralmadığı bilinmelidir; tekrar kullanım yalnız ayrı inceleme/diff/test/kabul ile yapılacak.

## 2. Bağlayıcı kaynaklar — iki ayrı eksen

### A. Ürün/yazılım kapsamı
29.10.2026 tarihli **v18 Kesin Birleşik Talimatname**: `R-001..R-594` (33 bölüm x18), T01–T13, IND-01–08/G1–G4, J01–J16, P01–P10, B01–B18. Ürün yönü: Hollanda merkezli Avrupa geneli, altı dil (TR/NL/DE/EN/AR/RU), 17 hizmet, 14 hedef kitle, 12 sorun rotası, 16 hukuk rehberi, 7 kurumsal sayfa, 8 belge listesi; güvenli müşteri/personel dosya, belge, yargı, finans, iç kontrol. Belge hazırlama ilgili hizmetin doğal parçasıdır; tek başına sahte "dilekçe tamamlama" motoru olarak sayılmaz.

### B. İşletme kuruluşu ve hukukî fizibilite
31.10.2026 tarihli **64 maddelik kuruluş ve faaliyet konuşması**: henüz **fizibilite/kuruluş öncesi**. Şirket tescili/KVK, meslekî yetki, işe alma, ilk müşteri sözleşmesi, faaliyet adresi, banka, fiyat, gerçek iş ortağı **doğrulanmış değil**. Bu 64 madde kuruluş, ticari gerçeklik ve hukukî uygunluk inceleme konularıdır; "64 kabul edilmiş iş" değildir. İş planı, kurucular, ilk hukuken sunulabilir hizmet, gerçek talep ve 12 aylık bütçe temel dört karar kapısıdır. Mevzuat kaynakları ilgili ülke/prosedür ve tarih ile ayrıca doğrulanır.

## 3. Kanıta dayalı başlangıç

29.10.2026 v18 arşivindeki en güncel **P09/P10 MFA/CMS** kabul matrisi içinden doğrudan denetlendi:

| Başlık | Kanıtlı kaynak durumu |
|---|---:|
| Özgün R-ID | **594 benzersiz**, ilk R-001, son R-594 |
| P0 / P1 | **324 / 270** |
| Eski kısmi teknik kanıt | **41** (tarihsel; yeni kabul değil) |
| Madde bazında kanıt eksik | **553** |
| Bağımsız madde kabulü | **0 / 594 = %0** |
| Canlı madde kabulü | **0 / 594 = %0** |
| Kuruluş konuları | **64 / 64 kaynak konu** (gerçek kabul ayrı) |
| Açık tarihsel yayın engeli | **B01–B18 = 18**, kapanmış sayılmadı |
| Bildirilen eski RLS riski | **7 public tablo**, canlıya yazma yapılmadı |

**Kural:** Genel tamamlanma oranı tek payda ile, yalnız özgün 594'ün bağımsız kabulüyle ölçülür. Test sayısını ve yeni prototip işlevlerini kabul sayısına katma. Yeni işin özgün R-ID karşılığı, kaynak dosyası, sınama, hukuk/dil/rol onayı ve kabul kararı ayrı tutulur.

## 4. Seviye 1'in görev sırası

1. **Ana gereksinim denetimi:** R-001..R-594 tekil kayıt ve tarihsel kabul matrisinin yeni Seviye 1 sıfır kabul temelinin doğrulanması. **Gerçekleştirildi (kaynak doğrulaması ve yeni envanter).**
2. **Kuruluş/hizmet yetkisi fizibilitesi:** 64 konudan ilk dört soruya kanıt aranacak: kurucular/gerçek çalışma hakkı, yasal olarak sunulabilecek ilk sınırlı hizmet, müşteri talebinin doğrulanması, ilk 12 aylık bütçe. **Açık; kullanıcı/kurum kanıtları olmadan karara bağlanamaz.**
3. **Mevcut kodun R-ID denetimi:** `main` ve eski draft PR'ların fonksiyon/sayfa/dosya sınıfları, v18'deki gerçek müşteri–personel akışlarıyla karşılaştırılacak. **Açık; önceki testler devredilen kabul sayılmaz.**
4. **Güvenlik ve kapalı sistemler:** 7 eski RLS bulgusu, CMS, Auth/Storage, gerçek A/B izolasyonu ve B01–B18 gözden geçirilecek. **Açık; canlı üretim değişimi için ayrıca onay.**
5. **İlk gerçek son kullanıcı uçtan uca hizmeti:** ziyaretçi -> ülke/dil/sorun -> hizmet -> güvenli ön başvuru -> ilişik belge taslağı -> gerektiğinde insan incelemesi ve doğru işlem durumu. Doğrulanmış hukukî yetki yoksa gerçek müşteri kabulü kapalı. **Açık.**
6. **Seviye 1 kabul/önizleme:** gerçek Next.js/browser, izole staging Auth/Storage, negatif güvenlik, kaynaklı hukuk/dil ve insan kabulü; yeni R-ID sonucu/kanıt. **Açık.**

**Seviye başına hedef:** en az **10 yüzde puan** doğrulanabilir işlev gelişimi. Fakat %10 ölçüsü yalnız `594 bağımsız kabul / 594` koşullarında ise "gerçek genel tamamlanma" olarak sunulur. Madde ağırlıkları her R eşit sayıldığı için ürün değerini tek başına ölçmez; kritik P0 ve gerçek E2E ayrıca izlenir.

## 5. Sabit yönetim ve şeffaflık
- Bir işte aynı seviyede **en fazla iki gerçek uygulama+test denemesi**. Öncekilerden eski tarihî sonuçlar silinmez, fakat sıfırlama yeni Seviye 1 operasyonel sayaç açar; önceki başarısız işleri yeniden yapmadan önce iş güvenliği ve izin kontrol edilir.
- **Her çalışma içinde** hangi konuyu ele aldığımızı, nedenini, gerçekten ne yapıldığını ve kalan eksiği teknik olmayan cümlelerle açıklayacağız.
- **Seviye 2'ye geçmeden önce açık kullanıcı onayı** alınır.
- `main` merge, canlı Supabase DDL/DML/RLS, üretim dağıtımı, gerçek müşteri kabulü, banka/PSP para hareketi, resmî kuruma başvuru ve gerçek personel/uzman temsili ayrıca somut yetki ister.
- Gerçek olmayan şirket, fiyat, tescil, avukatlık sıfatı, başarı istatistiği veya aktif resmî kurumsal ilişki uydurulmaz.

## 6. Başlangıç kayıtları
- Yeni seviye ve sıfır kabul: `docs/program/seviye1-yeniden-baslangic-2026-10-31.json`.
- Yeni dört sayfalı çalışma tablosu: `AVOfis_Seviye1_Yeniden_Baslangic_594_64_18_Kabul_Matrisi_2026-10-31.xlsx` (sohbet ekinde; repo'ya **henüz yüklenmedi**).
- Önceki kapsamın tam kaynağı: kullanıcı yüklediği v18 MD ve özgün v18 ZIP; işletme kaynağı: 64 maddelik 31.10.2026 DOCX.
- Eski çalışma: PR #9 başta olmak üzere eski taslaklar arşiv/adaydır, **yeni Seviye 1'in tamamlanmış işleri değildir**.

**Bu belgenin işlevi sıfırlamanın dürüst, veri kayıpsız ve denetlenebilir olmasıdır; ilk hizmetin kabul edildiği veya şirketin kurulduğu anlamına gelmez.**
