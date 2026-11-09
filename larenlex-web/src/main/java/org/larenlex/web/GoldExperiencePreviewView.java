package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.orderedlayout.FlexComponent.Alignment;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
import java.util.*;

/**
 * W1 role EXPERIENCE PREVIEW only. Selecting another role does not authenticate,
 * grant privileges, expose unpublished card bodies or open customer cases.
 * The full Gold UX/real-source-metadata interactive offline prototype is in the
 * user's cumulative transfer ZIP, not in this public GitHub repository.
 */
@Route("experience-preview")
@RolesAllowed("ADMIN")
public class GoldExperiencePreviewView extends VerticalLayout {
 private static final String[] ROLES = {"Ziyaretçi","Başvurucu","Profesyonel / uzman",
  "Operasyon yöneticisi","Sistem yöneticisi","Hukukî denetçi",
  "Finans yöneticisi","İş ortağı / partner","Kurum işlem masası"};
 private static final String[] NAMES = {
  "Kamusal ana sayfa, tanıtım ve erişilebilirlik",
  "Kamu hukuk kütüphanesi ve kaynak araması",
  "Hizmet kataloğu ve ülke/yetki kapısı",
  "Başvuru alma ve ücretsiz ön değerlendirme",
  "Kişisel ve kurumsal hesaplar",
  "Teklif, bütçe, fiyat kalemleri",
  "Sözleşme, kilometre taşı, değişiklik",
  "Tahsilat, PSP, finans ve fatura",
  "Dosya, evrak, versiyon, arşiv",
  "İş planı, görevler, sorumlular, takvim",
  "Teslim, revizyon ve müşteri kabul",
  "İç iletişim, güvenli mesaj ve bildirim",
  "İç hukukçu/çalışan çalışma masası",
  "Admin/yönetim paneli",
  "Hukuki onay, yayın ve uygunluk denetimi",
  "Partner/advocaat/mali müşavir/tercüman",
  "Kurum arayüzleri/izinli entegrasyon",
  "Sınır ötesi işlem, vekalet ve temsil",
  "Göç, öğrenci, iş, aile, turizm danışmanlık",
  "İhracat-ithalat, ticaret ve pazar eşleştirme",
  "Çok dillilik, içerik yönetimi ve çeviri",
  "Denetim izi, veri koruma, hak talepleri",
  "Analitik, rapor, işlem ve finans izleme",
  "Geliştirici API, webhook ve mobil hazırlık",
  "İşletim, yedek, izleme ve güvenlik"
 };
 private static final int[][] VISIBLE = {
  {1,2,3,4,19,20,21},
  {1,2,3,4,5,6,7,8,9,10,11,12,18,19,20,21},
  {2,3,4,9,10,11,12,13,15,16,18,19,20,21},
  {3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,21,22,23,25},
  {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25},
  {2,3,9,13,15,21,22},
  {6,7,8,11,14,22,23},
  {3,5,9,10,11,12,16,18,19,20},
  {3,5,9,10,12,17,18,22}
 };
 private final Select<String> selector = new Select<>();
 private final VerticalLayout stage = new VerticalLayout();

 public GoldExperiencePreviewView(){
  addClassName("shell");
  setWidthFull();
  add(new Anchor("/", "← LarenLex ana ekranı"),
      new H1("LarenLex · Gold portal deneyimi"),
      new Paragraph("Kullanıcı, uzman, yönetici, admin, finans, partner ve kurum arayüzlerinin W1 yapısal önizlemesi."));
  var security = new Paragraph("Yalnız görsel tasarım: rol değiştirmek kullanıcı kimliği veya erişim izni değildir. " +
   "554 hukuk kartı onay bekliyor; özel tam metin, canlı ödeme ve resmî kurum işlemi kapalıdır.");
  security.getStyle().set("color","#f0d56d");
  add(security);
  selector.setLabel("Önizlenecek kullanıcı deneyimi");
  selector.setItems(ROLES);
  selector.setValue(ROLES[0]);
  selector.addValueChangeListener(e -> redraw());
  add(selector,stage);
  redraw();
 }
 private void redraw(){
  stage.removeAll();
  int role=Arrays.asList(ROLES).indexOf(selector.getValue());
  if(role<0)return;
  stage.add(new H2(ROLES[role] + " · çalışma alanı"));
  HorizontalLayout stats = new HorizontalLayout();
  stats.setWidthFull();
  stats.add(stat("25","Modül tasarımı"),stat("554","Gerçek kart / yayın kapalı"),
      stat("1.016","Form envanteri"),stat("1.101","Kontrol eki"));
  stats.getStyle().set("flex-wrap","wrap");
  stage.add(stats);
  stage.add(new H3("Görüntülenebilecek alanlar — rol tasarımı"));
  FlexLayout tiles=new FlexLayout();
  tiles.setFlexWrap(FlexLayout.FlexWrap.WRAP);
  tiles.getStyle().set("gap","12px");
  for(int number:VISIBLE[role]){
   String id=String.format(Locale.ROOT,"M%02d",number);
   Div card=new Div();
   card.addClassName("card");
   card.getStyle().set("padding","15px").set("width","260px");
   card.add(new Span(id),new H3(NAMES[number-1]),
     new Paragraph("Dört alt ekranın tasarımı / W1. Gerçek işlem ve yayın yalnız doğrulanmış izinle."));
   card.add(new Anchor("/m/"+id,"Modülü gör"));
   tiles.add(card);
  }
  stage.add(tiles);
  stage.add(new Anchor("/catalog","Doğrulanmış kaynak kataloğuna geç"));
 }
 private Div stat(String n,String label){
  Div d=new Div();
  d.addClassName("card");
  d.getStyle().set("padding","13px").set("minWidth","160px");
  d.add(new H2(n),new Span(label));
  return d;
 }
}
