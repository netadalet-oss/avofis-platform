# LarenLex (kuruluş/ilk sürüm hedefi: 2026)

Bu klasör, mevcut **AvOfis** monoreposunu silmeden LarenLex hukuk hizmet platformuna dönüştürmek için açılan W1 çalışma alanıdır. **Ana dal `main` korunur.** Ürün adı yalnız **LarenLex**; 2026 marka adının parçası değildir.

## Mevcut teknoloji ve dönüşüm

Mevcut `portal/`, `admin/` ve `api/` Next.js/TypeScript/Express; hedef LarenLex web uygulaması **Java 21 + Spring Boot + Vaadin Flow**, veritabanı **PostgreSQL**'dir. Mevcut dosyalar, fonksiyonlar, veri şemaları ve faydalı bileşenler denetlenmeden silinmez. Geçiş kademeli ve geri alınabilir olacaktır.

## İlk seviye W1 için sıfır istisna

* **25/25 ana modül** ve bütün iş alanları: müşteri/kamu, profesyonel, admin, finans, kurum ve iş ortaklığı ekranları.
* **554/554 P1–P5 hukuk kartı** v86 kaynaklarından gerçek kimlik, başlık, kategori, sürüm ve dosya yolu ile içe aktarılacak; geçerlilik ve hukukî kabul durumu saklanacak. Kart sayısı ve benzersiz kimlikler otomatik test edilecek.
* **1.016 belge/form** ve **1.101 kontrol eki** W1'de envanter görünümüne dahil edilir; özgün baytlar ve SHA-256 koruma planı vardır.
* W1 tüm sayfaları, alt gezinmeyi, modül girişlerini, arama/filtreyi, dosya ve teklif–teslim aşama görünümlerini kapsar; gerçek kurum ve ödeme işlemleri kanıtlanmadan `BLOCKED/SANDBOX` olur.
* Kamuya açık tanıtım ve inceleme ile özel dosya erişimi **ayrılır**. Hukukî onaysız 554 kartın tam metni kamuya yayınlanmaz; yetkili iç incelemede erişilir.
* UYAP benzeri işlem, başvuru, dosya ve admin bilgi mimarisi kullanılır; **resmî portalın logosu/kimliği/tasarımı birebir kopyalanmaz**, resmi entegrasyon varmış gibi davranılmaz.
* Upwork benzeri ön başvuru/teklif/milestone/teslim akışı; uygunluk reddinde ücret sıfır, ödeme yalnız lisanslı PSP ve gerektiğinde sandbox.

## Değişmez görsel tanım

- `--ref-panel: #030A22`
- `--ref-panel-2: #04102C`
- `--ref-panel-3: #071738`
- `--ref-gold: #dfbf59`
- `--ref-gold-strong: #f0d56d`
- Kart: `linear-gradient(145deg, rgba(4,13,38,.99), rgba(1,4,15,.998))`.

## Kaynak sınırı

Yalnız v86 ve öncesi. v87 veri tabanı, v87 HTML'i veya şema taslağı kaynak değildir. 210 MB düzeyindeki özgün ZIP GitHub kaynağına doğrudan commit edilmez; bağımsız devir arşivinde **tek kopya** tutulur ve SHA-256 ile kontrol edilir. İlk W1 import betiği P01'deki 554 kartı birebir yükler.

**Durum:** Bu dal, gereksinim ve tasarım temeli oluşturur. W1'in bütün uygulama kabul testlerinin geçtiği veya dağıtım yapıldığı iddia edilmez.
