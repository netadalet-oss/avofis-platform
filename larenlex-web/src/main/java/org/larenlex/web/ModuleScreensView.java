package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.tabs.Tabs;
import com.vaadin.flow.component.tabs.Tab;
import com.vaadin.flow.router.*;
import jakarta.annotation.security.RolesAllowed;
import java.util.*;
/** Zero-customer-data screen design: the final UX structure without operational privileges. */
@Route("module-screens") @RolesAllowed("ADMIN")
public class ModuleScreensView extends VerticalLayout implements HasUrlParameter<String> {
 private final CatalogService catalog;
 private final VerticalLayout panel=new VerticalLayout();
 public ModuleScreensView(CatalogService catalog){this.catalog=catalog;addClassName("shell");}
 @Override public void setParameter(BeforeEvent event,String moduleId){
  removeAll(); add(new Anchor("/","← LarenLex"));
  var sections=ScreenBlueprint.sections(moduleId);
  if(sections.isEmpty()){add(new H1("Modül bulunamadı"));return;}
  add(new H1(moduleId+" · nihai dört ekran düzeni"),
   new Paragraph("W1 tasarımı; gerçek rol yetkilendirmesi veya özel dosya erişimi değildir."));
  Tabs tabs=new Tabs();
  for(String label:sections)tabs.add(new Tab(label));
  tabs.addSelectedChangeListener(e->{int i=e.getSelectedIndex();if(i>=0&&i<4)show(moduleId,sections.get(i),i);});
  add(tabs,panel);show(moduleId,sections.get(0),0);
 }
 private void show(String moduleId,String section,int index){
  panel.removeAll();panel.add(new H2(section),new Paragraph("Ekran "+(index+1)+"/4 — "+moduleId));
  String catalogGroup=switch(moduleId){
   case "M02","M13","M15"->"cards";
   case "M09","M11","M21"->"forms";
   case "M17","M22","M25"->"controls";
   case "M10","M20","M23"->"projects";
   default->"";
  };
  if(!catalogGroup.isBlank()){
   panel.add(new Paragraph("v86 kaynak metaveri grubu: "+catalogGroup+
     "; özgün tam metin ve müşteri kayıtları kapalı."),new Anchor("/catalog","Aranabilir katalogu aç"));
  }else{
   panel.add(new Paragraph("Gerçek işlem, ödeme, kurum bağlantısı ve hukukî yayın onayı yok: BLOCKED."));
  }
  if(moduleId.equals("M04"))panel.add(new Anchor("/triage-design","Ücretsiz ön değerlendirme tasarımı"));
 }
}
