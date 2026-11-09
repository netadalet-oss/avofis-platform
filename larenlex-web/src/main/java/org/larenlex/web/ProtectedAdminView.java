package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
/** Server-side protected route; no fake admin identities are installed. */
@Route("secure-admin") @RolesAllowed("ADMIN")
public class ProtectedAdminView extends VerticalLayout {
 public ProtectedAdminView(){add(new H1("LarenLex · yönetim çalışma alanı"),
 new Paragraph("Gerçek IdP/MFA, audit ve ayrı tenant erişimi doğrulanmadı. Veri/rol mutasyonu BLOCKED."));}
}
