package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.larenlex.core.ScopeGate;
/** Privacy-free nonpersistent design exercise: never creates a real case or charge. */
@Route("triage-design") @AnonymousAllowed
public class TriageDesignView extends VerticalLayout {
 public TriageDesignView(){
  addClassName("shell");
  add(new Anchor("/","← Portal"),new H1("Ücretsiz ön uygunluk · W1 tasarım"));
  add(new Paragraph("Kişisel veri, ödeme veya başvuru alınmaz. Gerçek kabul yetkisi yoktur."));
  Select<String> country=new Select<>();country.setLabel("Ülke");country.setItems("NL","DE","BE","TR");country.setValue("NL");
  Select<String> service=new Select<>();service.setLabel("İşlem türü");service.setItems("Belge tasnifi","Mahkeme temsili");service.setValue("Belge tasnifi");
  Checkbox authority=new Checkbox("Ülke/hizmet yetkisi doğrulandı (senaryo)",false);
  Checkbox conflict=new Checkbox("Çıkar çatışması kontrol edildi (senaryo)",false);
  Checkbox partner=new Checkbox("Yetkili partner doğrulandı (senaryo)",false);
  Paragraph decision=new Paragraph("Ücret 0 € · kayıt oluşturulmadı");
  Button evaluate=new Button("Ön kontrol senaryosunu göster",e->{
   boolean reserved=service.getValue().equals("Mahkeme temsili");
   var d=ScopeGate.assess(new ScopeGate.Request(country.getValue(),service.getValue(),reserved,
    authority.getValue(),conflict.getValue(),false,partner.getValue()));
   decision.setText(d.result()+" · ücret 0 € · sözleşme/PSP BLOCKED");
  });
  add(country,service,authority,conflict,partner,evaluate,decision);
 }
}
