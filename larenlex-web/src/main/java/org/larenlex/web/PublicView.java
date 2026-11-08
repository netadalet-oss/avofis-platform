package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
@Route("") @AnonymousAllowed
public class PublicView extends VerticalLayout {
 public PublicView(CatalogService data){
  addClassName("shell");
  add(new H1("LarenLex · W1 hukuk portalı"),
    new Paragraph("AVOfis v86 kaynakları: 25 modül / 554 kart / 1.016 form / 1.101 kontrol eki / 550 plan."),
    new Paragraph("W1 geliştirme önizlemesi: hukukî onaysız tam metin, özel dosya, ücret, ödeme ve resmî kurum işlemleri kapalıdır."));
  Div items=new Div();items.addClassName("modules");
  for(String[] m:data.modules()){
    Div c=new Div();c.addClassName("card");c.add(new H3(m[0]+" · "+m[1]),new Paragraph(m[2]),new Anchor("/m/"+m[0],"Modülü incele"));items.add(c);
  }
  add(items);
 }
}
