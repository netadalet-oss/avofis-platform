package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.*;
import jakarta.annotation.security.RolesAllowed;
@Route("m") @RolesAllowed("ADMIN")
public class ModuleView extends VerticalLayout implements HasUrlParameter<String> {
 private final CatalogService data;
 public ModuleView(CatalogService data){this.data=data;addClassName("shell");}
 public void setParameter(BeforeEvent event,String id){
  removeAll();add(new Anchor("/","Ana sayfa"));
  for(String[] m:data.modules())if(m[0].equals(id)){
    add(new H1(m[0]+" · "+m[1]),new Paragraph(m[2]));
    add(new Paragraph("Kapsam görünür; izin/kimlik/kabul gerektiren işlev BLOCKED. Kamuya özel kart veya müşteri dosyası verilmez."));
    return;
  }
  add(new H1("Modül bulunamadı"));
 }
}
