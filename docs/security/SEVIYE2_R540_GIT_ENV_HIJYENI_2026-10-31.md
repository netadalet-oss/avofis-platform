# AVOfis — Seviye 2 R-540 yerel ortam dosyası güvenliği

Salt dosya yolu incelemesinde S2 dalında admin/.env.local dosyasının Git tarafından takip edildiği doğrulandı.
Dosyanın içeriği incelenmedi. Gerçek anahtar veya sır taşıdığına ilişkin sonuç çıkarılmadı.
Bu dosya yalnız S2 taslak dalından silindi; .gitignore ile root ve alt dizinlerdeki .env varyantları engellendi.
İçinde gerçek anahtar bulunmuşsa eski commitler ve main gibi başka dallar tarafından erişilebilir olmaya devam edebilir.
Bu çalışma geçmişi temizlemez, anahtarları iptal etmez veya döndürmez. Bunlar ayrıca yetki, inceleme ve koordinasyon gerektirir.
CI yalnız git ls-files yol listesini ve sentetik dosya örneklerini inceler, eski .env.local içeriğini okumaz.
Admin ve portal build ortam değişkenleri GitHub CI sırasında sahte değerlerle sağlanır.

R-540/R-527; B01-B18 açık, 594 özgün gereksinim korunur; bağımsız kabul 0/594.
Main, canlı Supabase, gerçek müşteri verileri, üretim, finans ve resmî işlem izni verilmemiştir.
