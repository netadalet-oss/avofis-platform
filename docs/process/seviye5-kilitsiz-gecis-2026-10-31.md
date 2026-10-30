# AVOfis — Seviye geçişinde zorunlu ön onay ve kilitsiz ilerleme
**Son düzeltme:** 31 Ekim 2026 — kullanıcının “Yine de geçiş öncesi onay istenmeliydi” talimatı.
**Önceki izinsiz geçiş beyanı:** geri çekildi.
**Mevcut operasyonel seviye: 4. Seviye 5: ONAY BEKLİYOR.**

## Kuralların birlikte uygulanması
1. **Her seviye geçişinden önce kullanıcıya açıkça sorulacak ve olumlu onay alınacak.** Kullanıcının “devam et” talimatı veya kilit kaldırma ifadesi, tek başına belirli seviye geçişinin onayı sayılmaz. Kullanıcı açıkça “Seviye 5'e geç” derse, bu o geçiş için açık onay kabul edilir.
2. **%80 eşiği bir kilit değildir.** Ölçülebilen ilerleme yüzdesi raporlanır; yüzde bilinmiyor veya %80'in altındaysa da geçiş **teklif edilebilir**. Ancak kullanıcı kabul etmeden geçiş **uygulanmaz**.
3. Aynı iş için **bir seviyede en fazla iki gerçek icra denemesi** yapılır. Yeni tur açılması sayacı sıfırlamaz. Kanıtlı blokaj varsa sıfır veya bir denemeden sonra ilgili işin sonraki seviyeye **devri teklif edilebilir**.
4. Devredilecek açık işler silinmez, başarılmış sayılmaz; deneme ve kanıt geçmişi korunur. Ön onay alınınca sonraki seviyede tekrar gündeme alınır. Her sonraki seviye geçişinde yeniden **ön onay** gerekir.
5. Kodu hazırlamak, taslak dalı veya taslak PR açmak; onay alındığı, canlıya alındığı veya özgün 973 işin tamamlandığı anlamına gelmez. Üretime dağıtım, DB migration, PR birleştirme gibi yan etkiler ayrıca değerlendirilir.
6. Hollanda/AB (Business.gov.nl) kapsam kontrolleri ilgili olduğu ölçüde tüm aşamalarda sürer; hukuki uyum varsayılmaz.
7. 63 alt program, 63 modül, 973 iş, 973 teknik sözleşme, 154 akış ve 18 açık karar; özgün tarihsel Seviye 4 iş listesi ve tamamlama yüzdesinin bilinmediği gerçeği korunur.

## Geri alma/kanonik kayıt
- Önceki metindeki “Seviye 5 operasyonel çalışmaya açıktır” ifadesi **yanlıştı ve yürürlükte değildir**.
- Kullanıcının talimatı netleştirdiği tarihte Seviye 5'e **ön onay verilmemiştir**; geçiş yapılmış sayılmaz.
- Yedi RLS bulgusu **Seviye 4'te açık** tutulur; Seviye 5'e devri yalnızca adaydır. Yeni GDPR ve DSA incelemeleri de geçişe hazırlık/taslak kabul edilir.
- Taslak Seviye 5 dalı ve PR, yapılan çalışmaları kaybetmemek için tutulabilir; **onay alınana kadar uygulanmış Seviye 5 teslimi değildir**.

## Geçiş teklifi için kullanıcıya sunulacak özet
**Hedef:** Seviye 4 → Seviye 5.
**Durum:** Seviye 4 tarihsel tamamlanma oranı belirlenemedi; 7 canlı RLS bulgusu açık; 18 tarihsel karar açık.
**Teklif:** Açık işleri devrederek Seviye 5'te sürdürmek, hiçbirini tamamlandı saymamak.
**Soru:** “Seviye 5'e geçişi onaylıyor musunuz?” — olumlu yanıt beklenir.
