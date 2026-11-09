package org.larenlex.web;

import com.vaadin.flow.component.*;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.larenlex.core.PublicServices;
import java.util.*;

/** Visitor experience: real v86 service titles, no system/module headings or unpublished texts. */
@Route("") @AnonymousAllowed
public class PublicView extends VerticalLayout {
 private final Div results=new Div();
 private final PublicServices services;
 public PublicView(PublicServices services){
  this.services=services;
  setWidthFull();addClassName("shell");addClassName("public-home");
  var brand=new Anchor("/","LarenLex");brand.getStyle().set("font-size","24px").set("font-weight","750");
  HorizontalLayout nav=new HorizontalLayout(brand,new Anchor("/services","Hizmetler"),
     new Anchor("/portal/index.html#/is-ver","İş Ver / Teklif Al"),
     new Anchor("/portal/index.html#/rehber","Hukuk Rehberi"),
     new Anchor("/portal/index.html#/haberler","Haberler"),
     new Anchor("/portal/index.html#/makaleler","Makaleler"),
     new Anchor("/portal/index.html#/forum","Forum"),
     new Anchor("/portal/index.html#/dosyalarim","Dosyalarım"));
  nav.setWidthFull();nav.getStyle().set("align-items","center").set("flex-wrap","wrap")
     .set("gap","16px").set("padding","15px 0");
  add(nav);
  H1 accessibleTitle=new H1("Hukuk hizmetleri");
  accessibleTitle.getStyle().set("position","absolute").set("width","1px")
       .set("height","1px").set("overflow","hidden");
  add(accessibleTitle);
  TextField search=new TextField();search.setPlaceholder("Hizmet veya işlem ara");
  search.setAriaLabel("Hukuk hizmeti ara");search.setClearButtonVisible(true);
  search.setWidthFull();search.getStyle().set("max-width","680px").set("margin","24px 0");
  add(search);
  add(new H2("Hizmet alanları"));
  Div categories=new Div();categories.addClassName("service-areas");
  for(var entry:services.groups().entrySet()){
   var first=entry.getValue().get(0);String group=entry.getKey();
   Div card=new Div();card.addClassName("service-area");
   card.add(new H3(first.group()),new Paragraph(entry.getValue().size()+" işlem"),
    new Anchor("/services?group="+group,"Hizmetleri incele"));categories.add(card);
  }
  add(categories,new H2("Hizmetler"),results);
  results.setWidthFull();results.addClassName("service-results");
  search.addValueChangeListener(e->paint(e.getValue()));paint("");
  add(new Anchor("/services","Tüm hizmetleri görüntüle"));
 }
 private void paint(String query){
  results.removeAll();
  for(var s:services.search(query,null,8)){
   Div card=new Div();card.addClassName("service-result");
   card.add(new Span(s.group()),new H3(s.title()),
      new Anchor("/service/"+s.id().replace('/','-'),"Hizmeti incele"));
   results.add(card);
  }
 }
}
