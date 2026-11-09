package org.larenlex.web;
import java.util.*;
/** W1 design labels from the audited 25x4 end-state UX matrix. No access grants. */
public final class ScreenBlueprint {
 private static final Map<String,List<String>> SCREENS=new LinkedHashMap<>();
 static {
  String lines="M01|Ana sayfa|Güvenli yolculuk|Sık sorulanlar|İletişim\nM02|Kart kataloğu|Mevzuat & ECLI|Kaynak sürümleri|Hukukî yayın\nM03|Hizmet alanları|Ülke / yetki matrisi|Çıkar çatışması|İzin kayıtları\nM04|Ücretsiz ön kontrol|Başvuru listesi|Ret & yönlendirme|Başvuru formları\nM05|Hesap özeti|Kuruluş & temsil|Kullanıcılar|Güvenlik\nM06|Teklif taslakları|Bütçe kalemleri|Karşılaştırma|Onay kuralları\nM07|Sözleşmeler|Kilometre taşları|Değişiklikler|İmza & iptal\nM08|Ödeme & PSP|Faturalar|İadeler|Mutabakat\nM09|Dosya ağacı|Evrak envanteri|Sürüm / hash|Arşiv erişimi\nM10|Görev panosu|Takvim|Süre & alarm|Atamalar\nM11|Teslimler|Revizyonlar|Müşteri kabulü|Teslim kanıtı\nM12|Gelen kutusu|Bildirimler|İç mesajlar|Şablonlar\nM13|Çalışma masası|İnceleme kuyruğu|Sorumlular|Kalite kapıları\nM14|Kullanıcı & roller|Tenant yapısı|Erişim onayları|Sistem ayarları\nM15|Hukukî inceleme|554 kart denetimi|Yayın & geri çekme|Kaynak kanıtı\nM16|Partner kayıtları|Meslekî belgeler|İş atamaları|Onay & kalite\nM17|Kurum konektörleri|İzin matrisi|Manuel işlem|Olay günlüğü\nM18|Ülke geçişi|Vekâlet & yetki|Belge dönüşümü|İşlem süreleri\nM19|Göç ve vize|İş & öğrenci|Aile & ikamet|Kurum yolu\nM20|İthalat & ihracat|Ticari sözleşme|Pazar eşleşmesi|Gümrük & belge\nM21|Çeviri masası|Diller|İçerik yönetimi|Sürüm onayı\nM22|Denetim izi|KVKK / GDPR|Erişim talepleri|Saklama kuralları\nM23|İşletme göstergeleri|Envanter dağılımı|Kapasite|Risk raporu\nM24|API kataloğu|Webhook tasarımı|Erişim anahtarları|Mobil hazırlık\nM25|Sistem sağlığı|Yedekleme|Geri yükleme|Olay müdahalesi\n";
  for(String line:lines.split("\n")){
   if(line.isBlank())continue;
   String[] fields=line.split("\\|",-1);
   if(fields.length!=5||!fields[0].matches("M(0[1-9]|1[0-9]|2[0-5])"))throw new IllegalStateException("invalid screen mapping");
   if(SCREENS.putIfAbsent(fields[0],List.of(fields[1],fields[2],fields[3],fields[4]))!=null)
    throw new IllegalStateException("duplicate module");
  }
  if(SCREENS.size()!=25)throw new IllegalStateException("25 expected");
 }
 private ScreenBlueprint(){}
 public static List<String> sections(String id){return SCREENS.getOrDefault(id,List.of());}
 public static int sectionCount(){return SCREENS.values().stream().mapToInt(List::size).sum();}
}
