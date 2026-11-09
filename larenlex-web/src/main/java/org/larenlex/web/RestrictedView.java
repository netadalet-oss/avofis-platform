package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
@Route("review") @RolesAllowed({"LEGAL_REVIEWER","ADMIN"})
public class RestrictedView extends VerticalLayout {
 public RestrictedView(){add(new H1("Hukukî denetim"),new Paragraph("Onaysız içerik yayınlanamaz. Kimlik ve yetkili inceleme doğrulanmadan bu alan kullanılmaz."));}
}
