package org.larenlex.local;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import org.larenlex.core.PublicServices;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

/**
 * JDK 21 LOOPBACK-only runtime for the actual service-first portal frontend.
 * GET-only public v86 catalogue metadata, NEVER a production application server.
 * No personal records are stored or accepted and no protected route is implemented.
 */
public final class PublicPortalServer {
 private PublicPortalServer(){}
 private static String json(String s){
  StringBuilder b=new StringBuilder("\"");
  for(int i=0;i<s.length();i++){
   char c=s.charAt(i);
   switch(c){
    case '"'->b.append("\\\"");case '\\'->b.append("\\\\");case '\n'->b.append("\\n");
    case '\r'->b.append("\\r");case '\t'->b.append("\\t");
    default->{if(c<32)b.append(String.format(Locale.ROOT,"\\u%04x",(int)c));else b.append(c);}
   }
  }
  return b.append('"').toString();
 }
 private static void headers(HttpExchange ex,String mime){
  var h=ex.getResponseHeaders();
  h.set("Content-Type",mime+"; charset=utf-8");
  h.set("Cache-Control","no-store");
  h.set("X-Content-Type-Options","nosniff");
  h.set("X-Frame-Options","DENY");
  h.set("Referrer-Policy","no-referrer");
  h.set("X-Robots-Tag","noindex, nofollow, noarchive");
  h.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
 }
 private static void reply(HttpExchange ex,int status,String mime,byte[] bytes)throws IOException{
  headers(ex,mime);
  ex.sendResponseHeaders(status,bytes.length);
  try(var out=ex.getResponseBody()){out.write(bytes);}
 }
 private static void text(HttpExchange ex,int status,String mime,String data)throws IOException{
  reply(ex,status,mime,data.getBytes(StandardCharsets.UTF_8));
 }
 private static String getQuery(URI uri,String key){
  String q=uri.getRawQuery();if(q==null)return "";
  for(String part:q.split("&")){
   String[] kv=part.split("=",2);
   if(kv.length>=1&&kv[0].equals(key)){
    try{return URLDecoder.decode(kv.length==2?kv[1]:"",StandardCharsets.UTF_8);}catch(IllegalArgumentException ex){return "";}
   }
  }
  return "";
 }
 private static int number(String text,int fallback){
  if(text.isBlank())return fallback;
  try{return Integer.parseInt(text);}catch(NumberFormatException ex){return -1;}
 }
 private static String view(PublicServices.Service s){
  return "{\"id\":"+json(s.id())+",\"title\":"+json(s.title())+
    ",\"category\":"+json(s.group())+",\"summary\":"+json(s.summary())+
    ",\"forms\":"+s.formCount()+",\"controls\":"+s.controlCount()+"}";
 }
 private static String groupJson(PublicServices services){
  var b=new StringJoiner(",","[","]");
  services.groups().forEach((id,items)->b.add("{\"id\":"+json(id)+",\"title\":"+
    json(items.get(0).group())+",\"services\":"+items.size()+"}"));
  return b.toString();
 }
 private static String pageJson(PublicServices services,String q,String group,int offset,int limit){
  var rows=services.search(q,group,554);
  var join=new StringJoiner(",","[","]");
  rows.stream().skip(offset).limit(limit).forEach(x->join.add(view(x)));
  return "{\"total\":"+rows.size()+",\"offset\":"+offset+",\"limit\":"+limit+
   ",\"items\":"+join+"}";
 }
 public static HttpServer start(Path staticDirectory,Path publicTsv,int port)throws IOException{
  final PublicServices services;
  try(var f=Files.newInputStream(publicTsv)){services=new PublicServices(f);}
  final Map<String,String> assets=Map.of("/","index.html","/index.html","index.html",
   "/styles.css","styles.css","/catalog-data.js","catalog-data.js","/app.js","app.js");
  HttpServer server=HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(),port),32);
  server.createContext("/",ex->{
   try{
    if(!ex.getRequestMethod().equals("GET")){
     text(ex,405,"text/plain","Method not allowed");return;
    }
    String path=ex.getRequestURI().getPath();
    if(path.equals("/api/public/v1/services/groups")){
     text(ex,200,"application/json",groupJson(services));return;
    }
    if(path.equals("/api/public/v1/services")){
     String q=getQuery(ex.getRequestURI(),"q"),g=getQuery(ex.getRequestURI(),"group");
     int limit=number(getQuery(ex.getRequestURI(),"limit"),24),offset=number(getQuery(ex.getRequestURI(),"offset"),0);
     if(q.length()>150||g.length()>70||offset<0||offset>554||limit<1||limit>60){
      text(ex,400,"application/json","{\"error\":\"Invalid search\"}");return;
     }
     text(ex,200,"application/json",pageJson(services,q,g,offset,limit));return;
    }
    if(path.startsWith("/api/public/v1/services/")){
     String key=path.substring("/api/public/v1/services/".length());
     if(!key.matches("P[1-5]/[1-9][0-9]*")){
      text(ex,404,"application/json","{\"error\":\"Service not found\"}");return;
     }
     var s=services.find(key);
     text(ex,s.isPresent()?200:404,"application/json",
       s.map(PublicPortalServer::view).orElse("{\"error\":\"Service not found\"}"));return;
    }
    if(path.equals("/healthz")){
     text(ex,200,"application/json","{\"status\":\"LOCAL_PREVIEW_ONLY\",\"services\":554}");return;
    }
    String filename=assets.get(path);
    if(filename==null){text(ex,path.startsWith("/admin")||path.startsWith("/api/private")?403:404,
      "text/plain","Access not available");return;}
    Path file=staticDirectory.resolve(filename).normalize();
    if(!file.startsWith(staticDirectory.normalize())||!Files.isRegularFile(file)){
     text(ex,404,"text/plain","File not found");return;
    }
    String mime=filename.endsWith(".css")?"text/css":filename.endsWith(".js")?"application/javascript":"text/html";
    reply(ex,200,mime,Files.readAllBytes(file));
   }finally{ex.close();}
  });
  server.start();return server;
 }
 public static void main(String[] args)throws Exception{
  if(args.length!=2)throw new IllegalArgumentException("Usage: PublicPortalServer <site-public-dir> <safe-services-tsv>");
  var s=start(Path.of(args[0]),Path.of(args[1]),18765);
  System.out.println("Local portal at http://127.0.0.1:"+s.getAddress().getPort()+" — NOT PRODUCTION");
 }
}
