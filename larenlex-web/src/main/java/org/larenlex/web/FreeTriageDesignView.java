package org.larenlex.web;

import org.larenlex.core.ScopeGate;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

/** Non-persistent no-charge simulation; captures no person, case, ID or payment data. */
@Route("triage-design") @RolesAllowed("ADMIN")
public class FreeTriageDesignView extends VerticalLayout {
    public FreeTriageDesignView() {
        addClassName("shell");
        add(new Anchor("/", "← LarenLex"), new H1("Ücretsiz ön uygunluk · W1 tasarım testi"));
        add(new Paragraph("Bu ekran kişisel bilgi veya ödeme almaz. Buradaki sonuç gerçek hizmet kabulü değildir."));
        Select<String> country=new Select<>();country.setLabel("Ülke");
        country.setItems("NL","DE","BE","TR");country.setValue("NL");
        Select<String> service=new Select<>();service.setLabel("Hizmet sınıfı (deneme)");
        service.setItems("Belge tasnifi","Ruhsatlı temsil","Bilinmeyen hizmet");service.setValue("Bilinmeyen hizmet");
        Checkbox authority=new Checkbox("İlgili yetki belgelendi (sadece senaryo)",false);
        Checkbox conflict=new Checkbox("Çıkar çatışması incelendi (sadece senaryo)",false);
        Checkbox partner=new Checkbox("Yetkili meslek mensubu belgelendi (sadece senaryo)",false);
        Paragraph verdict=new Paragraph("Başvurucu/kayıt bilgisi alınmadı · ücret: 0 €");
        Button evaluate=new Button("Ücretsiz değerlendirme senaryosunu göster",e -> {
            var d=ScopeGate.assess(new ScopeGate.Request(country.getValue(),service.getValue(),
                "Ruhsatlı temsil".equals(service.getValue()),authority.getValue(),
                conflict.getValue(),false,partner.getValue()));
            verdict.setText(d.result()+" · ücret: 0 € · "+d.explanation()+
                " · gerçek sözleşme/ödeme: BLOCKED");
        });
        add(country,service,authority,conflict,partner,evaluate,verdict);
    }
}
