# LarenLex Android — L2 bütün uygulama geliştirme teslimi

**Proje:** LarenLex Android | **Seviye:** L2 (L1→L2 onayı alınmıştır) | **Kapsam:** 14 sistem, 69 alt grup, 453 kaynak A2 işlevi. 102 tarihî A4 API operasyonu ayrı kayıtta korunur; gerçek uygulandığı iddia edilmez.

## Çalıştırılabilir kaynak

- `src/l1_store.py` — L1'den korunan sentetik SQLite veri/yetki modeli.
- `src/l2_api.py` — 10 genel HTTP rota şablonunu sunan **yalnız proses içi WSGI referans servisi**; 14 modül ve 453 kimlik üzerinden denetlenir.
- `sql/001_sqlite_synthetic_schema.sql` — yalnız bellek içi sentetik veritabanı.
- `sql/002_postgresql_rls_disposable_draft.sql` — **asla canlı sistemde yürütülmemiş** eski L1 taslağı.
- `contracts/L2_API_CONTRACT_SCOPE.json` — 102 tarihî A4 işlem ile 10 yeni sentetik rotanın bilinçli ayrımı.
- `preview/LARENLEX_ANDROID_L2_BUTUN_UYGULAMA_ONIZLEME.html` — tüm uygulamayı içeren offline etkileşimli önizleme; L1 envanterinin üzerine L2 rol/işlem simülatörü eklenmiştir. **Gerçek Android uygulaması değildir.**

Komutlar (herhangi bir ağ bağlantısı gerekmez):

```bash
cd larenlex_l2
python -m unittest discover -s tests -v
python -O -m unittest discover -s tests -v
python -m compileall -q src tests
python preview/check_browser.py
```

A4 tarihî sözleşme kimliklerinin doğrulanması yalnız kullanıcıdan gelen özel talimatname ZIP'inde mümkündür. İndeks önceden üretilmiştir; gerçek ZIP'i GitHub'a göndermeyin. Çevrimdışı yeniden üretim:

```bash
python contract_inventory.py --source /secure/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip --out contracts/L2_API_CONTRACT_SCOPE.json
```

## Güvenlik ve kabul sınırı

Yerel WSGI sunucusu dış dünyaya açılmaz. Test oturumları yalnız Python süreç belleğinde üretilir; gerçek müşteri verisi, OAuth sağlayıcısı, canlı Supabase/PostgreSQL, gerçek belge, ödeme, hukukî kurum entegrasyonu, Android Gradle/APK/cihaz veya imza anahtarı kullanılmaz. Hata yanıtları veri sızdırmayan sabit kalıplar içerir; statik HTML arayüzünün JS simülatörü **Python WSGI servisiyle konuşmaz**.

Her modülün olası bağımsız kabulü **henüz yoktur**. Devir ve kaynak eksikleri `evidence/L2_PREVIOUS_LEVEL_RETRIES.json` içinde ikişer yeniden denemeyle kaydedildi ve açık kalanlar sonraki seviyeye taşınmalıdır. Bu L2 geliştirme döngüsünün bitmesi, teknik/hukukî kabul veya üretim izni değildir. L3'e geçiş için kullanıcı buton onayı gerekir.
