package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.tabs.*;
import com.vaadin.flow.router.*;
import jakarta.annotation.security.RolesAllowed;
import org.larenlex.core.UiBlueprint;
import java.util.*;

/** Public-safe structural rendering of the same 25x4 UX blueprint.
 * No private record or legal text is made accessible by visiting a screen.
 */
@Route("module-design") @RolesAllowed("ADMIN")
public class ModuleWorkstationView extends VerticalLayout implements HasUrlParameter<String> {
    private final CatalogService catalog;
    private final UiBlueprint matrix;
    private final VerticalLayout pane = new VerticalLayout();

    public ModuleWorkstationView(CatalogService catalog, BlueprintService blueprint) {
        this.catalog = catalog;
        this.matrix = blueprint.get();
        addClassName("shell");
        setWidthFull();
    }
    @Override public void setParameter(BeforeEvent event, String moduleId) {
        removeAll();
        add(new Anchor("/", "← LarenLex genel görünüm"));
        var found = catalog.all("modules").stream().filter(m -> moduleId.equals(m.get("id"))).findFirst();
        if (found.isEmpty()) { add(new H1("Modül bulunamadı")); return; }
        var module = found.get();
        add(new H1(moduleId + " · " + module.get("name")), new Paragraph(module.get("description")));
        Paragraph note = new Paragraph("W1 gerçek kaynak metaverisi ve nihai arayüz düzeni gösterilir. " +
            "Rol seçimi erişim izni vermez; özel dosya, hukukî yayın, ödeme ve kurum işlemi BLOCKED.");
        note.getStyle().set("color", "#f0d56d");
        add(note);
        var sections = matrix.screens(moduleId);
        Tabs tabs = new Tabs();
        for (var s : sections) tabs.add(new Tab(s.name()));
        tabs.setWidthFull();
        tabs.addSelectedChangeListener(e -> {
            if(e.getSelectedIndex() >= 0 && e.getSelectedIndex() < sections.size())
                showSection(moduleId, sections.get(e.getSelectedIndex()));
        });
        add(tabs, pane);
        showSection(moduleId, sections.get(0));
    }
    private void showSection(String id, UiBlueprint.Screen screen) {
        pane.removeAll();
        pane.add(new H2(screen.name()),
          new Paragraph("Modül ekranı " + (screen.index()+1) + "/4 · " + id +
              " · W1 kaynak ve tasarım görünümü. Gerçek işlem kabul edilmedi."));
        String source = switch(id) {
            case "M02", "M15", "M13" -> "cards";
            case "M09", "M11", "M21" -> "forms";
            case "M22", "M17", "M25" -> "controls";
            case "M10", "M20", "M23" -> "projects";
            default -> "";
        };
        if (!source.isEmpty()) {
            int count = catalog.all(source).size();
            pane.add(new H3("Özgün v86 envanteri · " + count),
                new Anchor("/catalog", "Kaynak ve SHA-256 kaydını ara"));
            for (var item : catalog.all(source).stream().limit(5).toList()) {
                Div card = new Div();card.addClassName("card");
                card.add(new Span(item.getOrDefault("id", item.getOrDefault("name", "Kaynak"))),
                    new Paragraph(item.getOrDefault("title", item.getOrDefault("path", ""))));
                pane.add(card);
            }
        } else {
            pane.add(new Paragraph("Kayıt işlemi, müşteri dosyası, kurum bağlantısı veya ücretli hizmet " +
                "henüz doğrulanmadı; bu ekranın arayüz alanları W1'de tasarlandı."));
        }
        if (id.equals("M04") || id.equals("M03"))
            pane.add(new Anchor("/triage-design", "Ücretsiz ön uygunluk kapısını incele"));
    }
}
