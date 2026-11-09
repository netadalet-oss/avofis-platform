package org.larenlex.web;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import java.util.List;
import java.util.Locale;

/** Customer-facing service discovery; NOT the internal 25-module designer interface. */
@Route("")
@AnonymousAllowed
public class PublicView extends VerticalLayout {
    private static final Locale TR = Locale.forLanguageTag("tr-TR");

    public PublicView(V86ServiceCatalog catalogue) {
        addClassName("shell");
        setWidthFull();
        setPadding(true);
        setSpacing(true);

        HorizontalLayout nav = new HorizontalLayout();
        nav.setWidthFull();
        nav.setAlignItems(Alignment.CENTER);
        nav.getStyle().set("justify-content", "space-between")
                .set("border-bottom", "1px solid rgba(223,191,89,.26)")
                .set("padding", "12px 0 22px");
        Span logo = new Span("LarenLex");
        logo.getStyle().set("color", "#f0d56d").set("font-size", "1.9rem")
                .set("font-weight", "850");
        nav.add(logo, new Anchor("#hizmetler", "Tüm Hizmetler"),
                new Anchor("#isleyis", "Nasıl Çalışır?"));
        add(nav);

        Div hero = new Div();
        hero.addClassName("card");
        hero.setWidthFull();
        hero.getStyle().set("padding", "clamp(24px,5vw,58px)")
                .set("background", "linear-gradient(145deg,rgba(4,13,38,.99),rgba(1,4,15,.998))");
        H1 title = new H1("Hukukî ve idarî işlerinize çözüm seçenekleri");
        title.getStyle().set("font-size", "clamp(2rem,5vw,3.6rem)")
                .set("line-height", "1.1").set("color", "#f0d56d");
        Paragraph intro = new Paragraph(
                "İş, kira, oturum, sosyal güvenlik, aile, miras, şirket, sözleşme, " +
                "kurum işlemleri ve Türkiye–Avrupa bağlantılı işlerinizi bulun. " +
                "Talebinizi ve bütçenizi belirterek uygunluk incelemesi sonrası teklif alabilirsiniz.");
        intro.getStyle().set("color", "#d2d9e9").set("max-width", "860px");
        hero.add(title, intro, new Anchor("#hizmetler", "Hizmet alanlarını keşfedin"));
        add(hero);

        H2 topicsTitle = new H2("Hangi konuda destek arıyorsunuz?");
        topicsTitle.setId("hizmetler");
        add(topicsTitle);
        Div categories = new Div();
        categories.addClassName("modules");
        categories.setWidthFull();

        TextField query = new TextField("İş veya sorun arayın");
        query.setPlaceholder("Örneğin: işten çıkarılma, kira depozitosu, UWV, tapu...");
        query.setClearButtonVisible(true);
        query.setValueChangeMode(ValueChangeMode.LAZY);
        query.setWidthFull();

        ComboBox<String> group = new ComboBox<>("Hizmet alanı");
        List<String> groups = catalogue.groups();
        group.setItems(mergeAll(groups));
        group.setValue("Tüm hizmetler");
        group.setWidthFull();

        for (String name : groups) {
            long count = catalogue.all().stream().filter(c -> c.group().equals(name)).count();
            Button button = new Button(name + " · " + count + " hizmet", e -> group.setValue(name));
            button.addClassName("card");
            button.getStyle().set("height", "auto")
                    .set("min-height", "94px")
                    .set("white-space", "normal")
                    .set("text-align", "left")
                    .set("color", "#f0d56d")
                    .set("padding", "18px")
                    .set("cursor", "pointer");
            categories.add(button);
        }
        add(categories);

        H2 allTitle = new H2("Yapılabilecek bütün işler");
        allTitle.setId("tum-isler");
        Paragraph note = new Paragraph(
                "Aşağıdaki hizmetler gerçek AVOfis v86 iş envanterindeki başlıklardır. " +
                "İş kabulü, ilgili ülke mevzuatı ve meslek yetkisi bakımından ön incelemeye bağlıdır.");
        note.getStyle().set("color", "#b8bfd1");
        HorizontalLayout filters = new HorizontalLayout(query, group);
        filters.setWidthFull();
        filters.setFlexGrow(2, query);
        filters.setFlexGrow(1, group);
        filters.getStyle().set("flex-wrap", "wrap");
        Div list = new Div();
        list.addClassName("modules");
        list.setWidthFull();
        Span resultCount = new Span();
        resultCount.getStyle().set("color", "#dfbf59");
        add(allTitle, note, filters, resultCount, list);

        Runnable repaint = () -> {
            list.removeAll();
            String term = lower(query.getValue());
            String selected = group.getValue();
            int total = 0;
            for (V86ServiceCatalog.Entry entry : catalogue.all()) {
                if (!("Tüm hizmetler".equals(selected) || entry.group().equals(selected))
                    || !(lower(entry.title() + " " + entry.group()).contains(term))) continue;
                total++;
                Div card = new Div();
                card.addClassName("card");
                Span area = new Span(entry.group());
                area.getStyle().set("color", "#dfbf59").set("font-size", ".78rem");
                H3 heading = new H3(entry.title());
                heading.getStyle().set("color", "#f6f4eb");
                Paragraph related = new Paragraph(
                        "İlgili işlem belgesi: " + entry.formCount()
                        + " · kontrol eki: " + entry.controlCount());
                related.getStyle().set("color", "#b8bfd1").set("font-size", ".85rem");
                Anchor process = new Anchor("/triage-design", "Talep ve uygunluk sürecini incele");
                card.add(area, heading, related, process);
                list.add(card);
            }
            resultCount.setText(total + " hizmet bulundu");
        };
        query.addValueChangeListener(e -> repaint.run());
        group.addValueChangeListener(e -> repaint.run());
        repaint.run();

        H2 how = new H2("Başvurudan teslimata dört adım");
        how.setId("isleyis");
        add(how);
        Div steps = new Div();
        steps.addClassName("modules");
        steps.add(step("01 · Başvuru", "İşinizi seçin; talebinizi ve önerdiğiniz bütçeyi iletin."),
                  step("02 · Ücretsiz ön uygunluk", "Ülke, meslek yetkisi, çıkar çatışması ve işlem koşulları incelenir."),
                  step("03 · Teklif ve çalışma", "Uygun işler için kapsam, ücret ve teslim aşamaları kararlaştırılır."),
                  step("04 · Teslim ve fatura", "Tamamlanan çalışma güvenli dosyanıza teslim edilir ve faturalandırılır."));
        add(steps);
        Paragraph safeguards = new Paragraph(
            "Yetki dışı veya hukuka aykırı işler ücretsiz ön incelemede reddedilir. " +
            "Zorunlu avukatlık, mali müşavirlik veya yeminli tercüme işlemleri yalnız " +
            "yetkili iş ortaklarıyla ve ilgili izinlerle yürütülebilir.");
        safeguards.getStyle().set("color", "#d1d7e4").set("padding", "18px")
                .set("background", "#04102C").set("border-left", "3px solid #dfbf59");
        add(safeguards);
    }

    private static Div step(String title, String detail) {
        Div box = new Div();
        box.addClassName("card");
        box.add(new H3(title), new Paragraph(detail));
        return box;
    }
    private static String lower(String x) {
        return x == null ? "" : x.toLowerCase(TR).trim();
    }
    private static List<String> mergeAll(List<String> input) {
        java.util.ArrayList<String> result = new java.util.ArrayList<>();
        result.add("Tüm hizmetler");
        result.addAll(input);
        return result;
    }
}
