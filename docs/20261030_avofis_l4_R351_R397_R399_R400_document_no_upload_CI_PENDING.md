# AVOfis v18 — Seviye 4: R-351 / R-397 / R-399 / R-400 dar teknik uygulama

**30.10.2026 · PR #5 DRAFT · L4 DEVAM · L5 KİLİTLİ · ÜRETİM NO-GO**

Özgün kaynak `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md` içinde:
- **R-351:** “Telefon, e-posta ve yazılı iletişim tercihini isteğe bağlı erişilebilir alanlarla al.”
- **R-397:** “Belge yüklemeyi ilk ücretsiz temas ekranından ayrı, güvenli dosya alanında başlat.”
- **R-399:** “Yüklemeden önce kullanıcıya gereksiz BSN, kimlik ve sağlık verilerini maskeleme uyarısı göster.”
- **R-400:** “Belgeleri olay, karar, sözleşme, yazışma, kimlik ve diğer kategorileriyle sınıflandır.”

## Kodlanan, fakat henüz gerçek kabul olmayan alt kapsam

1. R-351: `public-triage.ts` / `public-triage-review.ts` / `triyaj/page.tsx` içinde yalnız isteğe bağlı iletişim **kanalı** (`none/phone/email/written/unknown`), ad/telefon/e-posta adresi olmadan. Talep gönderimi ve gerçek iletişim sözleşmesi yoktur.
2. R-397: `belge-hazirlik/page.tsx` kamu belgesi hazırlığı. İlk anonim temas içinde özel belge yüklemesi bulunmaz. `api/document-upload/route.ts` GET/POST/PUT/PATCH/DELETE HTTP 403, no-store/nosniff ve request body okuma yoktur.
3. R-399: BSN/kimlik/sağlık veri minimizasyonu uyarısı TR/NL/EN, belge seçmeden **önce** görünür; hukuken uygun redaksiyon ayrıca insan incelemesi gerektirir.
4. R-400: olay, karar, sözleşme, yazışma, kimlik, diğer ve bilinmiyor olarak 7 kategorik **kamu yönlendirme** seçeneği; gerçek özel belgeye kategori yazan backend yoktur.
5. Olumsuz sınamalar: beklenmeyen PII anahtarları reddi, her kategoride upload/share/signed URL kapalı, HTTP yöntemlerinde 403 ve env bayrağının kamu endpointini açamaması.
6. `portal/scripts/public-triage.test.mjs`, `public-triage-review.test.mjs`, `document-preparation-gate.test.mjs` ve GitHub Actions CI kapısı güncellendi.

## Kesinlikle çözülmüş sayılmayanlar

**L3-DEC-01** açık: özgün **R-398 DOCX** desteği isteği ve B04 MIME/AV whitelist'i çelişiyor. PDF/DOCX/PNG kabulü, tarama, gerçek özel Storage, müşteri/kadro kimlik yetkilendirmesi, A/B izolasyonu, signed URL, virüs karantinası ve belge imha düzeni devrede **değildir**. 18 L3 açık kararın tamamı açık tutulur; 0/973 bağımsız kabul.

Bu değişiklikler `ops/avofis-l4-implementation-evidence.json` içinde **CODE_CHANGED_PENDING_CI** olarak işaretlenmiştir. Actions sonucu bağımsızca doğrulanmadıkça **CI_SYNTHETIC_VERIFIED** veya 594 R izleme defterinde yeni kısmi kabul olarak sayılmaz. Önceki **49 kaynak-ID kapsamı** CI sentetik doğrulanmış; bu dört değişiklik yalnız kod düzeyinde vardır. Önceki R kısmi teknik kanıtı **86/594**, bağımsız kabul **0/973**; L5 kilitli ve üretim NO-GO.
