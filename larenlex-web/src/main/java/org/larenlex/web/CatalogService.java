package org.larenlex.web;
import java.util.*;
import java.io.*;
import java.nio.file.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
/** Loads only metadata: no draft card text is available to public views. */
@Service
public class CatalogService {
 private final List<String[]> modules = new ArrayList<>();
 public CatalogService(@Value("${larenlex.catalog-dir:data}") String root) throws IOException {
  Path file=Path.of(root,"modules.tsv");
  if(Files.exists(file)){
   for(String row:Files.readAllLines(file)){String[] x=row.split("\t",3);if(x.length==3&&x[0].matches("M(0[1-9]|1[0-9]|2[0-5])"))modules.add(x);}
  }
 }
 public List<String[]> modules(){return Collections.unmodifiableList(modules);}
}
