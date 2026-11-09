package org.larenlex.web;
import com.vaadin.flow.component.*;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.*;
import jakarta.annotation.security.RolesAllowed;
import java.util.*;
@Route("catalog") @RolesAllowed("ADMIN")
public class CatalogView extends VerticalLayout {
 private final CatalogService data;private final Grid<Map<String,String>> table=new Grid<>();
 private final Select<String> groups=new Select<>();private final TextField filter=new TextField("Arama");
 public CatalogView(CatalogService data){this.data=data;addClassName("shell");
  add(new Anchor("/","← Portal"),new H1("v86 kaynak envanteri"),new Paragraph("Kamuya açık envanterde yalnız metadata; özel kart içeriği korunur."));
  groups.setLabel("Kaynak türü");groups.setItems("cards","forms","controls","projects");groups.setValue("cards");
  table.addColumn(m->m.getOrDefault("id",m.getOrDefault("source_part",""))).setHeader("Kimlik").setAutoWidth(true);
  table.addColumn(m->m.getOrDefault("title",m.getOrDefault("name",""))).setHeader("Başlık / belge").setFlexGrow(3);
  table.addColumn(m->m.getOrDefault("sha256","?")).setHeader("SHA-256").setFlexGrow(2);
  groups.addValueChangeListener(e->refresh());filter.setClearButtonVisible(true);filter.addValueChangeListener(e->refresh());
  add(new HorizontalLayout(groups,filter),table);table.setWidthFull();refresh();
 }
 private void refresh(){table.setItems(data.find(groups.getValue(),filter.getValue()));}
}
