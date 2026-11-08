# W1 — Bütün portalın zorunlu kabul matrisi (2026)

**Kaynak:** Ekli AVOfis v86, P01 (554 güncel kart), P02 (1.016 form), P03 (1.101 kontrol), P04 (550 tarihsel plan/proje), P05–P07 (siciller ve asıllar). **v87 kesinlikle başlangıç kaynağı değildir.**

## İlk seviyede her modülün kendi sayfası/rotası, menüsü ve durumu olmalıdır

| Kod | Modül | İlk seviye görünürlüğü |
|---|---|---|
| M01 | Kamusal ana sayfa ve erişilebilirlik | Açık bilgi, yönlendirme |
| M02 | Hukuk kütüphanesi | P1–P5 **554/554** kart, arama, filtre, durum |
| M03 | Hizmet kataloğu/yetki | Ülke, meslek, işlem, açık/ret |
| M04 | Ücretsiz başvuru ön inceleme | Kayıtlı/anonim başvuru giriş ekranı, ücret öncesi karar |
| M05 | Bireysel/kurumsal hesaplar | Profil ve dosya izolasyonu örnek ekranı |
| M06 | Bütçe/teklif | Kalemler, revizyon, karar |
| M07 | Sözleşmeler/kilometre taşları | Taslak, kabul, iptal |
| M08 | Ödeme/finans/fatura | PSP sandbox/engelli statü, iade |
| M09 | Dosya/evrak/arşiv | UYAP benzeri bağımsız dosya ağacı |
| M10 | Görev/takvim | SLA, son tarih, fiziksel işlem |
| M11 | Teslim/revizyon/kabul | Sürüm ve hash alanları |
| M12 | Güvenli mesaj | İletişim taslağı, bildirim |
| M13 | Profesyonel çalışma masası | Atanan işler, taslaklar |
| M14 | Admin/yönetim | Rol, MFA, denetim, kullanıcılar |
| M15 | Hukukî onay ve yayın | Kart onay statüsü/meslek yetkisi |
| M16 | Partner/advocaat/mali müşavir/tercüman | Sözleşme, yetki, onay |
| M17 | Kurum arayüzleri | İzinli API/manüel/fizikî ayrımı |
| M18 | Sınır ötesi vekâlet/temsil | Ülke bazlı kısıtlar |
| M19 | Göç/öğrenci/iş/aile/turizm | Uygunluk ve başvuru türleri |
| M20 | İthalat/ihracat/ticaret eşleştirme | Ticari iş akışları |
| M21 | Çok dilli CMS/çeviri | TR/NL/EN/DE dil alanları |
| M22 | Denetim/veri koruma | GDPR, hak talepleri, veri saklama |
| M23 | Analitik ve raporlama | Yetki filtreli göstergeler |
| M24 | API/webhook/mobil hazırlık | Sürüm/endpoint şema ekranları |
| M25 | İşletim/güvenlik/yedek | Health, audit, kurtarma test göstergeleri |

## Gerçek v86 kart kabulü

- P01 alt ZIP taranır. Her kart için **ID (P1/ID...)**, gerçek başlık, metin, kategori, güncel kaynak yolu, sürüm, SHA-256 ve yayımlanma/onay durumu tutulur.
- UI, P1–P5 gruplarını, **554 benzersiz kartı** ve belge/ek ilişkilerini gösterir. Eksik / çift ID için test başarısız olur.
- Kaynak hukukî durumuna saygı: hiçbir kart otomatik `ONAYLI` işaretlenmez; **iç inceleme** ile **kamu yayını** kesin ayrılır. Dış ortamda tam metin onay olmadan görünmez.
- Formlar ve kontrol ekleri için indekste **1.016** ve **1.101** kayıt gösterilir. Gerçek asıllar değişmeden / ayrı içerik deposunda saklanır.

## Tasarım / davranış

- Exact Gold renkleri: `#030A22`, `#04102C`, `#071738`, `#dfbf59`, `#f0d56d`. Kart gradyanı `linear-gradient(145deg, rgba(4,13,38,.99), rgba(1,4,15,.998))`.
- UYAP'taki **işlevsel düzen**: sol işlem ağacı, dosya listesi, detay, işlem geçmişi, rol ve kurum/başvuru akışı. Kopya marka, logo, sayfa tasarım veya resmî giriş izlenimi **yasak**.
- Anonim kullanıcılar kamu bilgisi, arama ve uygunluk başvurusuna erişir. Dosya/iş içerikleri yalnız ilgili kullanıcı/atanmış profesyonel ve yetkili admin tarafından görüntülenir.
- W1 için gerçek para, gerçek kurum sorgusu ve gerçek müşteri verisi YOK. Aktif olmayan işlemler açıkça `DEMO` / `BLOCKED` olarak etiketlenir.

## GitHub disiplini

- `main` değişmeden korunur; bu dalda adaptasyon yapılır, sonradan testli PR ile birleştirilir.
- Ana AvOfis fonksiyonlarının envanteri ve etki analizi olmadan eski dosya silinmez. Eski Next.js sisteminden Java 21 + Spring Boot + Vaadin Flow'a geçişte paralel çalışma/route devri uygulanır.
- v86 büyük arşivini GitHub normal git blob olarak koyma. Kurulum sırasında harici doğrulanmış kaynaktan kontrollü import et. DB seed ve indeks raporlarını commit et; gizli veri, kimlik bilgisi veya özel dosya commit etme.
- Her seviye sonunda kullanıcıya ekran önizlemesi, tüm 25 modülde ilerleme, gerçek test sonuçları, hesaplanmış kalan iş, tek kümülatif ZIP ve kesintisiz devir belgesi ver.

**Bu dokümanın varlığı W1'in tamamlandığı anlamına gelmez.** W1 ancak gerçek çalışan Java uygulama, 25 modülün ekranları, 554 gerçek kart kontrolü ve güvenlik testleriyle kapatılır.
