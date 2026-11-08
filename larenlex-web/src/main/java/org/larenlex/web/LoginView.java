package org.larenlex.web;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.Route;
@Route("login")
public class LoginView extends VerticalLayout {
 public LoginView(){add(new H1("LarenLex - güvenli giriş"),new Paragraph("Kimlik sağlayıcısı ve MFA henüz doğrulanmadı. Giriş kapalıdır; örnek kullanıcı veya şifre oluşturulmadı."),new Anchor("/","Kamu alanına dön")); }
}
