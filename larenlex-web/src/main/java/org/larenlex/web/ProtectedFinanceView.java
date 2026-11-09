package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
@Route("secure-finance") @RolesAllowed({"FINANCE","ADMIN"})
public class ProtectedFinanceView extends VerticalLayout {
 public ProtectedFinanceView(){add(new H1("LarenLex · finans çalışma alanı"),
 new Paragraph("PSP sandbox izin/kimlik doğrulaması yok; gerçek tahsilat, fatura ve iade BLOCKED."));}
}
