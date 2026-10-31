# AVOfis v18 — L4 belge hazırlığı: R-397 / R-399 / R-400

**30.10.2026** · Draft PR #5 · Kullanıcı L4 devam izni verdi · **L5 KİLİTLİ** · Üretim **NO-GO**.

## Özgün gereksinimler

- **R-397:** “Belge yüklemeyi ilk ücretsiz temas ekranından ayrı, güvenli dosya alanında başlat.”
- **R-399:** “Yüklemeden önce kullanıcıya gereksiz BSN, kimlik ve sağlık verilerini maskeleme uyarısı göster.”
- **R-400:** “Belgeleri olay, karar, sözleşme, yazışma, kimlik ve diğer kategorileriyle sınıflandır.”

Özgün kaynak: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md`, R-397/R-399/R-400. Yalnız **güvenli kamu hazırlık alt kapsamı** uygulanmıştır. Gerçek özel belge yüklemesi geliştirilmiş/açılmış **değildir**.

## Gerçek kod ve güvenlik durumu

1. `portal/src/lib/document-preparation-gate.ts`: kamu sayfasında 7 sınırlandırılmış sınıf (olay/karar/sözleşme/yazışma/kimlik/diğer/bilinmiyor); yalnız kategorik seçim. Kullanıcı BSN, kimlik, sağlık bilgilerini gereksizse maskeleme uyarısını TR/NL/EN dilinde görür. Beklenmeyen veri alanları veya uygunsuz türler reddedilir.
2. `portal/src/app/belge-hazirlik/page.tsx`: dosya seçici ve gönderme işlemi olmadan gizlilik bilgilendirmesi, belge kategorisi ve gelecekteki özel kanal gereksiniminin yalnız yerel gösterimi; `/triyaj`dan erişilebilir.
3. `portal/src/app/api/document-upload/route.ts`: **GET, POST, PUT, PATCH ve DELETE için hiçbir body okumadan 403**, `no-store` ve `nosniff`. Üretim bayrağı bunu açmaz. Bu uç, gerçek özel Storage broker değildir; yeni bir istemci kaydı, dosya, yetki, signed URL veya dosya metaverisi oluşturmaz.
4. `portal/scripts/document-preparation-gate.test.mjs`: yedi kategori, hassas veri uyarıları, beklenmeyen alanın reddi, 5 yöntemle 403 ve kamu ekranında dosya yükleme/API bulunmaması.

## Açık/uygulanmayan konular

- **R-398** DOCX orijinal kaynak gereksinimi ile B04 dosya güvenliği whitelist taslağında uyumsuzluk; **L3-DEC-01 AÇIK**. Kabul edildi veya engel çözüldü denemez.
- **R-401–R-414** asıl özel Storage, içerik tarama ve virüs karantinası, sahip izolasyonu, indirme logu, süreli link, denetim izi, redaksiyon, üçüncü kişi hukukî dayanak ve saklama/silme işlevleri **bu dilimde uygulanmadı**.
- Canlı Supabase ve gerçek Auth/Storage tenant izolasyonu, güvenlik testi, GDPR izinleri, hukukçu kontrolü, erişilebilirlik ve çok dilli meslekî QA **eksik**.
- Tüm 18 L3 açık tasarım kararı açık; Seviye 5 için ayrı onay yok, üretim NO-GO, **0/973 bağımsız kabul**.

Kayıt kanıtı, ilgili CI çalışması başarıyla tamamlandıktan sonra `ops/avofis-l4-implementation-evidence.json` ve iş-kimliği defterine girilecektir; bu dosyanın varlığı tek başına test geçildiğini veya tam iş kabulünü kanıtlamaz.
