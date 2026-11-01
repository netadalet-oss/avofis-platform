# AVOfis Seviye 1 — Ön başvuru gövde sınırı ve aktivasyon reddi (01.11.2026)

**Kapsam:** yalnız AVOfis Portal `POST /api/intake`; canlı sistem/staging/gerçek kişisel veriler üzerinde işlem **YOK**. Test ve değişiklikler mevcut taslak PR #14 içindedir.

## Kaynak görevler

- **AV-019** (`7f178d1a1617f83e6683777f93cf60c48ee419e6796cbd23c1c6e28e73fc2e16` özgün talimat satır SHA256): sunucu HTTP sınırları ve olumsuz test.
- **AV-025** (`e1da85ff9f71a35a1f1e35194b2fb2f72d522142338f3e188eeecd50a085293e` özgün talimat satır SHA256): gerçek müşteri verisi kabulü bağımsız güvenlik/hukuk/işletme onayından önce kapalı.

## Gerçek kod farkı

| Yol | Değişiklik | Ret |
|---|---|---|
| `portal/src/lib/limited-json-request.ts` | `Request.body` akışını gerçek alınan `Uint8Array` baytlarıyla ve maksimum 7.000 baytla sınırlar; `Content-Length` yok veya düşük gösterilmiş olsa da sınır uygulanır | `REQUEST_TOO_LARGE` ya da `INVALID_REQUEST_JSON` |
| `portal/src/app/api/intake/route.ts` | Önce `intakeReleased()` ret kapısı; ancak kapı izin verirse yeni sınırlı JSON okuma. Gelen kişisel gövdeyi veya sağlayıcı sırrını loglamaz | Kapalıyken 503, gelecekteki aşırı gövde 413, bozuk JSON 400 |
| `portal/tests/limited-json-request.test.cjs` | Sentetik küçük JSON olumlu; içerik uzunluğu olmayan parçalı büyük veri, sahte kısa `Content-Length`, yanlış MIME ve bozuk JSON olumsuz; kodda kapı sırası | CI içinde gerçek ReadableStream / Request nesnesi; üretim haricî E2E değil |

## Doğrulanmış kod ve CI

Kod + workflow HEAD: `27c58380f8094fa3c1a2992ce88729d3114ffb03`.

- [Portal build ve HTTP CI #41253311809](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253311809): **SUCCESS**.
- [API/admin/portal güvenlik CI #41253311890](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253311890): **SUCCESS**.
- [Kamu hesap/CMS yayın kapısı CI #41253311740](https://github.com/netadalet-oss/avofis-platform/actions/runs/41253311740): **SUCCESS**.

## Henüz karşılanmayan gerçek kabul koşulları

- Kamu ön başvuru kapısı hâlâ `release-authorization.ts` ve `public-release-status.ts` tarafından **kapalı**. Test içinde kapının açıldığı veya `avofis_leads` tablosuna yazıldığı iddia edilmez.
- Gerçek staging, Auth/JWT ve RLS, anti-bot, hız sınırlaması, HTTPS/WAF, kişisel veri envanteri, GDPR/AVG DPO ve hukukî kurumsal onay, DSAR, saklama ve güvenlik testleri eksik.
- Buradaki HTTP testleri JSON yardımcı kodunun negatif/pozitif davranışını kanıtlar; gerçek üretim API'sini, herhangi bir kişisel dosyanın korunmasını veya bağımsız hukukî onayı kanıtlamaz.
- **Bağımsız R kabul 0/594, canlı R kabul 0/594; B01–B18 ve yedi canlı RLS bulgusu açık**. `main`, Supabase ve Vercel production değiştirilmedi.
