package org.larenlex.web;

import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.*;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.larenlex.core.PublicServices;
import java.util.*;

@Route("services") @AnonymousAllowed
public class PublicServiceListView extends VerticalLayout {
 private final PublicServices data;
 private final Grid<PublicServices.Service> grid=new Grid<>();
 private final TextField search=new TextField("Hizmet ara");
 private final Select<String> group=new Select<>();
 public PublicServiceListView(PublicServices data){
  this.data=data;setWidthFull();addClassName("shell");add(new Anchor("/","← LarenLex"),new H1("Hukuk hizmetleri"));
  search.setPlaceholder("Hizmet veya işlem adı");search.setClearButtonVisible(true);
  group.setLabel("Hizmet alanı");
  List<String> names=new ArrayList<>(List.of("Tüm hizmetler"));
  for(var entry:data.groups().entrySet())names.add(entry.getValue().get(0).group());
  group.setItems(names);group.setValue("Tüm hizmetler");
  grid.addComponentColumn(s->new Anchor("/service/"+s.id().replace('/','-'),s.title()))
      .setHeader("Hizmet").setFlexGrow(3);
  grid.addColumn(PublicServices.Service::group).setHeader("Hizmet alanı").setFlexGrow(2);
  grid.addColumn(s->s.formCount()+" belge").setHeader("İlgili formlar").setFlexGrow(1);
  grid.setPageSize(25);grid.setWidthFull();
  search.addValueChangeListener(e->refresh());group.addValueChangeListener(e->refresh());
  add(new HorizontalLayout(search,group),grid);refresh();
 }
 private void refresh(){
  String current=group.getValue();String id=null;
  if(current!=null&&!current.equals("Tüm hizmetler"))
    for(var entry:data.groups().entrySet())if(entry.getValue().get(0).group().equals(current))id=entry.getKey();
  grid.setItems(data.search(search.getValue(),id,554));
 }
}
