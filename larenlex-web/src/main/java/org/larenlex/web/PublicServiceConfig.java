package org.larenlex.web;

import org.larenlex.core.PublicServices;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.io.*;

@Configuration
public class PublicServiceConfig {
 @Bean
 public PublicServices publicServices() throws IOException {
  try(InputStream in=getClass().getClassLoader().getResourceAsStream("portal-public/services-v86-public.tsv")) {
   return new PublicServices(in);
  }
 }
}
