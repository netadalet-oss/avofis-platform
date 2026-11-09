package org.larenlex;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.theme.Theme;
@SpringBootApplication @Theme("larenlex")
public class LarenLexApplication implements AppShellConfigurator {
 public static void main(String[] args) { SpringApplication.run(LarenLexApplication.class,args); }
}
