package org.larenlex.security;
import org.larenlex.web.LoginView;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.*;
import com.vaadin.flow.spring.security.VaadinSecurityConfigurer;
// Deny by default: no synthetic credentials, no private activity without a verified IdP.
@Configuration @EnableWebSecurity
public class SecurityConfig {
 @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
  http.with(VaadinSecurityConfigurer.vaadin(), c -> c.loginView(LoginView.class));
  return http.build();
 }
 @Bean UserDetailsService noUnverifiedUsers(){
  return name -> {throw new UsernameNotFoundException("External IAM not configured");};
 }
}
