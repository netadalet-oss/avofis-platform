package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
import org.larenlex.core.UiBlueprint;
import java.util.*;

/** A visible design illustration; never turns a selected role into an authenticated principal. */
@Route("role-design") @RolesAllowed("ADMIN")
public class RoleDesignView extends VerticalLayout {
    private static final Map<String,String> LABELS = Map.of(
        "visitor","Ziyaretçi", "applicant","Başvurucu", "professional","Profesyonel",
        "manager","Operasyon yöneticisi", "admin","Sistem yöneticisi",
        "legal","Hukukî denetçi", "finance","Finans yöneticisi",
        "partner","İş ortağı", "institution","Kurum işlem masası");
    private final VerticalLayout pane = new VerticalLayout();
    public RoleDesignView(CatalogService data, BlueprintService blueprints) {
        UiBlueprint map = blueprints.get();
        setWidthFull();addClassName("shell");
        add(new Anchor("/", "← LarenLex"), new H1("Nihai ürün · 9 rolün çalışma ekranı"));
        var disclaimer = new Paragraph("TASARIM ÖNİZLEMESİ: seçilen rol, kimlik doğrulama veya yönetici yetkisi " +
            "değildir. Gerçek özel kayıtlar, kullanıcı verileri ve onaysız hukuk metni gösterilmez.");
        disclaimer.getStyle().set("color","#f0d56d");add(disclaimer);
        Select<String> role = new Select<>();role.setLabel("Arayüzü görüntüle");
        role.setItems(List.of("visitor","applicant","professional","manager","admin","legal","finance","partner","institution"));
        role.setItemLabelGenerator(r -> LABELS.get(r));role.setValue("visitor");
        role.addValueChangeListener(e -> paint(data,map,e.getValue()));
        add(role,pane);paint(data,map,role.getValue());
    }
    private void paint(CatalogService data,UiBlueprint map,String role) {
        pane.removeAll();pane.add(new H2(LABELS.getOrDefault(role,role)+" · çalışma masası"));
        Div cards = new Div();cards.addClassName("modules");
        int count=0;
        for(var module:data.all("modules")) {
            String id=module.get("id");if(!map.visibleDesignModules(role).contains(id))continue;
            count++;
            Div cell=new Div();cell.addClassName("card");cell.add(new H3(id+" · "+module.get("name")),
                new Paragraph(module.get("description")),new Anchor("/module-design/"+id,"Dört alt ekranı görüntüle"));
            cards.add(cell);
        }
        pane.add(new Paragraph("Tasarımda görünen modüller: "+count+" / 25. Üretim yetkilendirmesi ayrı denetlenir."),cards);
    }
}
