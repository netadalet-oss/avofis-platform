package org.larenlex.core;
import java.nio.file.*;
import java.io.*;
import java.util.*;
public final class PublicServicesSelfTest {
 private static void check(boolean yes,String what){if(!yes)throw new AssertionError(what);}
 public static void main(String[] args)throws Exception {
  PublicServices v;
  try(var input=Files.newInputStream(Path.of(args[0]))) {v=new PublicServices(input);}
  check(v.all().size()==554,"554 services");
  check(v.groups().size()==17,"17 areas");
  check(v.find("P1/123").isPresent(),"source ID");
  check(v.search("sözleşme",null,554).size()>5,"search");
  check(v.search("",null,554).size()==554,"all results");
  check(v.search("", "calisma",554).stream().allMatch(s->s.groupId().equals("calisma")),"area");
  check(v.all().stream().noneMatch(s->s.title().matches(".*(?i:(Revizyon v[0-9]+|Durum: [0-9]+\\. parti)).*")),"no tracking in public names");
  check(v.all().stream().allMatch(s->s.formCount()>=0&&s.controlCount()>=0),"document references");
  check(v.find("P9/99").isEmpty(),"no fabricated record");
  System.out.println("PUBLIC SERVICE TEST PASS: 554 unique services, 17 groups, 9 assertions");
 }
}
