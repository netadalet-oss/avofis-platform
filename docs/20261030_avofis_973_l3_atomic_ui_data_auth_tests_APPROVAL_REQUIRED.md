# AVOfis v18 — Seviye 3 (L3), 973 kaynak-ID teknik tasarım sözleşmesi

**Tarih: 30 Ekim 2026. Durum: ONAY BEKLİYOR.**
**Kullanıcı onayları:** L0 (8 ana kol) onaylı; L1 (63 alt program) onaylı; L2 (63 modül, 142 modül içi akış, 12 çapraz yolculuk, 973/973 eşleme) onaylı. **L3 için onay henüz verilmedi; L4 kodlama ve uygulama izni YOKTUR.**

## Değişmeyen 973 kapsamı

| Kaynak | Kapsam | L3 tekil sözleşmesi | Bağımsız kabul |
|---|---:|---:|---:|
| R-001–R-594 (33×18, 324 P0 + 270 P1) | 594 | 594 | 0 |
| 16 personel modülü × 12 kontrol | 192 | 192 | 0 |
| B/J/P/IND/G/T ve kuruluş ek paketleri | 113 | 113 | 0 |
| 66 içerik ve 8 kontrol listesi | 74 | 74 | 0 |
| **Toplam** | **973** | **973** | **0/973** |

L3 ayrıca **63 mantıksal modül sözleşmesi**, **154 iş akışı sözleşmesi** (142 iç + 12 çapraz) ve **18 açık L3 karar/uyumsuzluk kaydı** içerir. Bunlar 973 iş paydasına eklenmez. 41/594 ana R kısmi teknik kanıtlıdır; B01–B04 için 4/113 sentetik test kanıtı vardır; hiçbirisi bağımsız kabul olarak sayılmaz.

## L3 tekil sözleşmesi — 973 kaydın her biri için

Her tekil işin **kaynağın birebir orijinal sözü ve orijinal kabul ölçütü** korunarak aşağıdaki tasarım bilgileri ayrı bağlanır:

1. L0 kolu, L1 programı, L2 modül, birincil akış ve zorunlu bağımsız kabul akışı;
2. Özgün metinden çıkarılan **önerilen işlem türü, veri konuları ve muhtemel arayüz** (kaynağın doğrudan talebi ile öneri ayrıştırılır);
3. Mantıksal veri nesnesi ve servis/API işlem sınırı, gerekli oturum, dosya sahibi/rol ve hukukî insan kontrolü;
4. Pozitif ve negatif test hedefi, denetim/kanıt izi, B01–B18 ve ilgili J/P/IND/G/yayın bağımlılıkları;
5. Mevcut sentetik teknik kanıtın sınırı, gerçek staging ve hukuk/ana dil onaylarının gerekliliği, bağımsız kabul ve L4 uygulama kilidi;
6. Kaynak Excel satırı, korunmuş metnin kısa SHA-256 izi, belge/iş kapsamı uyarısı.

**Önemli:** L3'teki mantıksal API komutları, veri nesneleri, durum önerileri ve UI yüzeyleri **mevcut çalışan HTTP rotası, SQL tablosu, Storage izni, gerçek ödeme veya resmî kurum işlemi değildir.** Fiziksel route, veri şeması ve kod dosyası ancak bir sonraki uygulama aşaması ayrı izinle başlayınca gerçek kodla eşleştirilir.

## Dosyalar / doğrudan izlenebilirlik

- `ops/avofis-l3-module-contracts.json` — **63/63** kaynak programına bağlı öneri UI / mantıksal veri / izin / audit sözleşmesi.
- `ops/l3/avofis-l3-atomic-L0-01.json` … `L0-08.json` — sekiz onaylı ana kol için sırasıyla **83, 218, 189, 90, 54, 72, 220, 47** = **973/973** kaynak ID'li tasarım kaydı.
- `ops/avofis-l3-flow-contracts.json` — **154** akış ve çapraz devir/saldırı/ret kapısı.
- `ops/avofis-l3-open-decisions.json` — **18 açık tasarım kararı**.
- `portal/scripts/master-atomic-contracts-l3.test.mjs` — CI'da 973 benzersiz ID, tüm L0–L3 ebeveyn zinciri, 63/154 sayımı ve L4 kilidi.
- **Tam ve kaynak metni birebir koruyan Excel:** `AVOfis_v18_SEVIYE3_973_Tekil_Teknik_Sozlesme_63_Modul_154_Akis_Onay_Bekliyor_2026-10-30.xlsx`. Sekmeler **46** (63 modül), **47** (973 orijinal metin + teknik sözleşme), **48** (154 akış), **49** (18 açık karar), **50** (durum/kabul). GitHub makine indeksleri tam orijinal metni tekrarlamak yerine bu kaynak Excel'deki özgün satırlara bağlıdır.

## Kaynakta doğrulanan gerçek uyumsuzluk

**R-398**, PDF, **DOCX** ve yaygın görselleri sınırlı boyut ve tür kontrolüyle kabul etmeyi açıkça istiyor. Mevcut B04 sentetik private Storage migration ise MIME sınırında **PDF, PNG, JPEG, WebP** destekliyor, **DOCX desteklemiyor**. Bu L3 kararı **AÇIK**; DOCX uzantısını veya MIME iznini canlıda ya da staging olmadan kendiliğinden eklemek yasak. AV taraması, belge zararsızlaştırma, kullanım amacı, dosya boyutu ve gerçek Auth/Storage E2E ile insan onayı gerekli.

**CHK-01…CHK-08:** Tarihî kaynakta sekiz kontrol listesi kaydı var fakat kanıtlanmış özgün başlık/slug bulunmadığından yenisi uydurulmadı. Kaynak araştırma açığı devam eder.

**Öteki açık riskler:** gerçek staging ve yedek/restore, signed URL iptali, personelin nesne bazlı müşteri rızası, GDPR/DSAR ve saklama, 7 canlı public RLS hatası ve 1 Auth parola uyarısı, gerçek profesyonel ruhsat/yetki, IND/mahkeme kurumu makbuzu, gerçek PSP ödeme, altı dil hukukî onay, WCAG 2.2 AA ve bağımsız denetim.

## Kesin onay kapısı

- L3 hazırlanmış, **onay bekliyor**. L3'tü onaylamadan L4 (kod/SQL/UI oluşturma, CI saldırı testinin gerçek uygulaması, deploy) **başlamaz**.
- L3'ü onaylamak dahi **live SQL, production deploy, PR merge, gerçek müşteri, ödeme veya IND/mahkeme resmî gönderim izni değildir**; bunlar için ayrıca özel ve açık operasyonel onay gerekir.
- PR #5 draft kalır ve mevcut canlı güvenlik durumu **NO-GO**.
- **Sonraki karar:** Kullanıcı L3 paketini topluca onaylar ya da spesifik revizyon ister.

**Onay cümlesi:** `Seviye 3'ün 973 tekil teknik sözleşmesini, 63 modül ve 154 akış tasarımını onaylıyorum. Seviye 4'e geç; canlı ortama izinsiz dokunma.`
