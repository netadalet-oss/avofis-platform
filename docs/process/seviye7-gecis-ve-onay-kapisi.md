# AVOfis Seviye 7 — kullanıcı açık onayıyla açılış

**Kullanıcı onayı, 31 Ekim 2026:**

> AVOfis projesinde Seviye 6'dan Seviye 7'ye geçişi açıkça onaylıyorum. Açık ve başarısız işleri tüm kanıt ve deneme geçmişleriyle Seviye 7'ye taşıyarak çalışmaya devam et. Seviye 8'e geçmeden önce yeniden açık onayımı iste.

**Durum:** Seviye 7 operasyonel aktif; Seviye 6 tarihsel olarak tamamlandı sayılmıyor. %80 ölçümü eksik özgün kaynaklardan tahmin edilmeyecek. **Seviye 8 için ONAY YOK.**

Tüm seviyelerde bir iş için en fazla **iki gerçek uygulama denemesi** vardır; seviye içi yeni turlar limiti sıfırlamaz. Seviye 6'dan **14 açık kayıt** kanıtlarıyla Seviye 7'ye taşındı: 10 önceden açık konu ve 4 yeni teknik iş. Önceki başarısız denemelerin sonucuna dokunulmadı. Seviye 7'de yeni denemeler ayrı sayaçla kaydedilir; iki deneme ile sonuç alınamazsa sonraki seviye *ancak kullanıcı onayı alındıktan sonra* devralır.

7 canlı RLS açığı, 18 özgün açık karar, GDPR/DSA kapsam şartları, onaylanmış 973 iş ve 973 teknik sözleşme korunur. Seviye 6 CI geçişi ve taslak kodlar, canlı dağıtım ya da tarihsel kabul değildir. Business.gov.nl Hollanda/AB uyumu ilgili her çalışmada koşullu gözetilir.

**İlk yeni iş:** Yönetim panelindeki CMS yazma işlemlerinde, güncel kullanıcı ve `profiles.role` yetkisini her yazma öncesi tekrar kontrol etmek; kullanıcı değişince eski yönetici UI yetkisini gecikmeden kapatmak. Bu arayüz ek güvenlik katmanıdır; asıl yetki sınırı canlı Supabase RLS'dir. Canlı DB değiştirilmeyecek.
