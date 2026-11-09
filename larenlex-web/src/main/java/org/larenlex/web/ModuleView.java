package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.*;
import jakarta.annotation.security.RolesAllowed;
import java.util.*;
@Route("m") @RolesAllowed("ADMIN")
public class ModuleView extends VerticalLayout implements HasUrlParameter<String> {
 private final CatalogService data;
 public ModuleView(CatalogService data){this.data=data;addClassName("shell");}
 @Override public void setParameter(BeforeEvent event,String id){removeAll();
   var m=data.all("modules").stream().filter(x->x.get("id").equals(id)).findFirst();
   if(m.isEmpty()){add(new H1("Bilinmeyen modül"),new Anchor("/","Geri"));return;}
   Map<String,String> module=m.get();add(new Anchor("/","← Genel görünüm"),new H1(id+" · "+module.get("name")),new Paragraph(module.get("description")));
   add(new Paragraph("W1 durum: bu işlem için hukukî yetki/kimlik/işlem kanıtları tamamlanana kadar BLOCKED. Kamuya yalnız envanter ve gezinme gösterilir."));
   if(id.equals("M02"))add(new Anchor("/catalog?group=cards","554 kaynak kartı ara"));
   if(id.equals("M09"))add(new Anchor("/catalog?group=forms","Form ve evrak envanteri"));
   if(id.equals("M22"))add(new Anchor("/catalog?group=controls","Denetim ekleri"));
   add(new Anchor("/catalog","Bütün doğrulanmış kataloglar"));
 }
}
