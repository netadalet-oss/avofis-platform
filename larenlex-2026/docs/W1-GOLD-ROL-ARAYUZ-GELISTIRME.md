# LarenLex Gold — kullanıcı ve yönetim arayüzleri, W1

8 Kasım 2026 tasarım işlemi: kümülatif transfer ZIP'inde **9 rolün gösterim paneli**, **25 modülün her biri için 4 alt ekran (100 modül görünümü)**, gerçek v86 kaynak metaverisinde 554 kart + 1.016 form + 1.101 kontrol eki + 550 plan/proje araması, ücretsiz reddi simüle eden form, onay/yetki/ödeme/kurum kapıları ve responsive Gold CSS kaynakları oluşturuldu. Tüm çalışma kaynakları ZIP içindeki `web/` klasöründe; yaklaşık 1,1 MB tek dosyalık `LarenLex_GOLD_PORTAL_TUM_ROLLER_W1_ONIZLEME.html` tarayıcıda açılabilir. **Tam UX dosyaları bu commit'te GitHub'a kopyalanmış sayılmaz**; ZIP'de devir kontrolünde korunur.

Bu commit, Vaadin tarafında yalnız **kamuya açık ve verisiz bir rol tasarım görünümü** getirir: `/experience-preview`. Rol seçimi kimlik doğrulaması, özel içerik erişimi veya admin yetkisi değildir. 25 modül linkleri yalnız izin/yayın kapalı önizleme rotalarına gider.

**W1_DONE=HAYIR, WEB_GO=HAYIR.** Gerçek Java Vaadin derlemesi, 554 tam kartın özel veri deposu, PostgreSQL RLS, IdP/MFA ve 401/403 testleri açık. Eski Next.js/Express yapısı ve `main` korunur. v87 veya daha yenisi kullanılmaz. Taslak PR #17 açık kalmalıdır.
