# AVOfis v18 — L4 R-379–R-395: 17 göç, aile, idare ve sınır aşan hazırlık formu

**30 Ekim 2026** · PR #5 **DRAFT** · **L4 uygulaması sürüyor** · **L5 kilitli**

## Kaynak: özgün gereksinimler, 22. bölüm (R-379–R-395)

Özgün talimatname: `AVOfis_v18_KESIN_TUM_TALIMATLAR_594_R_J_P_HUKUK_PORTAL_DEVIR_2026-10-29.md` (bölüm “Göç, aile, idarî ve uluslararası başvuru formları”). Kaynaktaki 17 kimlik ve konu birebir korunmuştur.

| R-ID | Kaynağa bağlı hazırlık alanı | Açık kalan fiilî kapsam |
|---|---|---|
| R-379 | Başvuru türü, **IND referansı var/yok** ve karar tarihi | Gerçek IND numarası ve kurum başvurusu alınmıyor |
| R-380 | Oturum geçerlilik tarihi (yalnız beyan) | Gerçek belge ve geçerlilik kontrolü yok |
| R-381 | Vize ret makamı kategorisi, karar tarihi, bulunulan ülke | Resmî makam kimliği doğrulanmadı |
| R-382 | Sponsor ve başvuran rolleri | Kişi bilgileri alınmıyor |
| R-383 | Vatandaşlık genel bilgi / karar inceleme | Otomatik uygunluk kararı yok |
| R-384 | Evlilik, ikamet ve işlem ülkeleri | Ülkeler arası yetki incelemesi yok |
| R-385 | Mevcut dava/karar ve iki tarafın ülkesi | Mahkeme belgeleri, kişi adları alınmıyor |
| R-386 | Çocukla ilgili yalnız genel konu | Çocuğun kişisel ayrıntıları ALINMIYOR |
| R-387 | Vefat tarihi beyanı, ilgili ülkeler ve belge türü | Yakın kimlik ve belgeleri alınmıyor |
| R-388 | Kurum türü, karar türü, gönderim ve öğrenme tarihleri | Kurum adı ve özgün resmî tebligat burada alınmıyor |
| R-389 | Sosyal hak talebinin genel türü | Hassas gelir/sağlık/durum bilgileri alınmıyor |
| R-390 | Belgenin düzenlendiği ve kullanılacağı ülkeler | Apostil sonucu taahhüt edilmiyor |
| R-391 | Karar türü ve kesinleşme bilgisinin mevcudiyeti | Tanıma/tenfiz kararı verilmez |
| R-392 | Belge türü, dil ve muhatap makam kategorisi | Yeminli tercüme/onay taahhüt edilmez |
| R-393 | Şirket ülkeleri, sözleşme dili, ihtilaf türü | Şirket kimliği, ticaret sırrı alınmaz |
| R-394 | Farklı ülkelerde paralel aile işlemleri | Yetki çatışması otomatik çözülmez |
| R-395 | En fazla 160 karakter yazılı genel niyet | Ses kaydı ve detaylı kişisel iddia alınmıyor |

## Gerçek teknik işler

- `portal/src/lib/international-form-preview.ts`: 17 kaynak ID, özgün gereksinim metniyle tekil 17 güvenli kategori/tarih/yazılı niyet şeması. `unknown` her alanda mümkündür.
- `portal/src/lib/sector-intake-preview.ts`: 14 yerel iş/kira/tüketici formu ile **toplam 31** hazırlık formunu kapsayan sınırlı doğrulama ve gönderimsiz yerel sonuç. Kişi adı, IND referans numarası ve çocuk kimliği bu taslakta toplanmaz.
- `portal/src/app/form-hazirlik/page.tsx`: kullanıcıya yalnız Türkçe kaynak-bağlantılı, gönderimsiz 31 seçenek gösterilir; karar tarihinden hukukî süre hesaplanmaz, belge yükleme, müşteri kabulü, PSP, mahkeme ve IND başvurusu yapılmaz.
- `portal/scripts/international-form-preview.test.mjs`: R-379–R-395 tekil eşleşmesi, her şemadaki gerekli kaynak kategorileri, hassas veri sınırları, `unknown`, yanlış tarih ve ses kullanılmaması.
- `.github/workflows/avofis-integrated-catalog-ci.yml`: yeni regresyonlar üretime dokunmayan CI'da koşar.
- İlk başarılı yeni 31-form CI kanıtı: https://github.com/netadalet-oss/avofis-platform/actions/runs/41094574025 (6/6 başarılı).

## Sözleşme/izin ve sayı sınırı

`R-377` ve `R-378` kodla geliştirilen ortak “bilmiyorum” ve “insan incelemesi” kurallarına bağlanmıştır. Fakat bu iki R zaten önceki 69 kısmi R kaydı içinde idi; **ikinci kez kısmi sayılmamıştır**. 17 yeni R sonucu kısmi teknik kanıt sayısı **86/594** olur.

Tüm L4 kod kanıtları: **49/973** (16 mevcut +14 sektör +17 uluslararası +2 ortak). Bağımsız insan kabulü: **0/973**. On sekiz L3 açık tasarım kararı: **18/18 açık**. Canlı ortam: **NO-GO**, staging/gerçek Auth/Storage ve meslekî onay eksik. **L5 hâlâ kilitli; PR #5 merge edilmedi.**

Bu dosya tam hukuki başvuru sisteminin tamamlandığını ileri sürmez. Yalnız kullanıcı onaylı L4 içindeki kaynaklı, dar ve sentetik testli teknik uygulamadır.
