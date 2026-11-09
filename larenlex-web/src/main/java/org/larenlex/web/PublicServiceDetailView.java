package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.*;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.larenlex.core.PublicServices;

@Route("service") @AnonymousAllowed
public class PublicServiceDetailView extends VerticalLayout implements HasUrlParameter<String> {
 private final PublicServices data;
 public PublicServiceDetailView(PublicServices data){this.data=data;setWidthFull();addClassName("shell");}
 @Override public void setParameter(BeforeEvent event,String encoded){
  removeAll();add(new Anchor("/services","← Tüm hizmetler"));
  String id=encoded==null?"":encoded.replaceFirst("-","/");
  var possible=data.find(id);
  if(possible.isEmpty()){add(new H1("Hizmet bulunamadı"));return;}
  var service=possible.get();
  add(new Paragraph(service.group()),new H1(service.title()),
      new Paragraph(service.summary()),new H2("Başvuru ve işlem"),
      new Paragraph("Başvuru, ücretsiz ön inceleme, kapsam ve teklif, dosya takibi ve teslim aşamaları."),
      new H2("İlgili belgeler"),
      new Paragraph(service.formCount()+" ilgili belge kaydı"),
      new Paragraph(service.controlCount()+" işlem ve inceleme eki"),
      new Anchor("/portal/index.html#/basvuru/"+service.id().replace('/','-'),"Başvuru yap"),
      new Anchor("/portal/index.html#/is-ver/"+service.id().replace('/','-'),"Teklif iste"));
 }
}
