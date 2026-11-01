/**
 * AVOfis S1 / AV-062–AV-077. Top-level staff module directory only.
 * No user records, staff privileges, documents or live actions are exposed.
 * Actual authority requires independently proven server access, AAL2 and RLS.
 */
export const STAFF_TOP_LEVEL = [
  { slug:"inbox", title:"Gelen işler", scope:"Başvuruların güvenli karşılanması", firstAction:"Başvuru türlerini sınıflandırma", output:"Atama kuyruğu taslağı" },
  { slug:"triage", title:"Ön değerlendirme", scope:"Ülke, işlem ve aciliyet ayrımı", firstAction:"Öncelik ve yetki gereksinimini belirleme", output:"İnsan inceleme işareti" },
  { slug:"matters", title:"Dosyalar", scope:"Müşteri, tenant ve dosya durumları", firstAction:"Dosya yaşam döngüsü taslağı", output:"Korunan dosya durumu" },
  { slug:"calendar", title:"Takvim", scope:"Randevu ve resmî süreleri ayırma", firstAction:"Süre kaynağını inceleme", output:"Doğrulanacak tarih kaydı" },
  { slug:"documents", title:"Belgeler", scope:"Dosya, sürüm ve Storage erişimi", firstAction:"Dosya tipi ve erişim kontrolü", output:"Belge kontrol izi" },
  { slug:"pleadings", title:"Dilekçeler", scope:"İnsan incelemeli taslak ve yetki", firstAction:"Taslak türü ve ülke seçimi", output:"Onaysız taslak" },
  { slug:"research", title:"Hukuk araştırması", scope:"Resmî kaynakların tarihli incelemesi", firstAction:"Kaynak dayanağını kaydetme", output:"Kaynak denetim izi" },
  { slug:"judicial", title:"Yargı", scope:"J01–J16 ve kurum sınırları", firstAction:"Doğru resmî kanalı ayırt etme", output:"Bağlantı kontrolü, gönderim yok" },
  { slug:"ind", title:"IND", scope:"Sekiz işlem, G1–G4", firstAction:"İşlem türü ile temsil sınırını ayırt etme", output:"Yetki inceleme işareti" },
  { slug:"messages", title:"Mesajlar", scope:"Atanmış dosyaya bağlı iletişim", firstAction:"Alıcı ve dosya atamasını doğrulama", output:"Kapalı mesaj taslağı" },
  { slug:"billing", title:"Faturalama", scope:"Doğrulanmış teklif, sözleşme ve harç ayrımı", firstAction:"Ücret kalemlerini sınıflandırma", output:"Onaysız tahakkuk taslağı" },
  { slug:"payables", title:"Ödemeler", scope:"İki kişi onayı ve iade kontrolü", firstAction:"Ödeme yetkisi ve çift imza kontrolü", output:"Kapalı ödeme kuyruğu" },
  { slug:"reporting", title:"Raporlama", scope:"Sınırlı, yetkili faaliyet ölçümü", firstAction:"Metrik kapsamı ve veri minimizasyonu", output:"Kişisel verisiz KPI taslağı" },
  { slug:"audit", title:"Denetim", scope:"Yetki ve işlem kayıtlarının bütünlüğü", firstAction:"Denetim olayı ve sorumluyu tanımlama", output:"Değiştirilemez iz gereksinimi" },
  { slug:"people", title:"Kişiler", scope:"Personel, müvekkil ve uzman rolü", firstAction:"Gerçek kimlik ve meslekî yetki doğrulama", output:"Henüz onaylanmamış rol kaydı" },
  { slug:"settings", title:"Ayarlar", scope:"Yayın, roller ve ortam sınırları", firstAction:"Yayın bayraklarını kapalı doğrulama", output:"İnsan onayı bekleyen değişiklik" }
] as const;

export function staffModuleBySlug(slug: string) {
  return STAFF_TOP_LEVEL.find((item) => item.slug === slug) ?? null;
}
