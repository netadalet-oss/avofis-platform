package org.larenlex.web;

import org.larenlex.core.PublicServices;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

/** Public read-only metadata endpoints. No unpublished legal bodies, source paths or SHA hashes. */
@RestController
@RequestMapping("/api/public/v1/services")
public final class PublicServiceApiController {
 public record ServiceView(String id,String category,String title,String summary,
                           int forms,int controls) {}
 public record GroupView(String id,String title,int count) {}
 public record SearchResult(long total,int offset,int limit,List<ServiceView> items) {}
 private final PublicServices services;
 public PublicServiceApiController(PublicServices services){this.services=services;}
 private static ServiceView view(PublicServices.Service s){return new ServiceView(s.id(),s.group(),
      s.title(),s.summary(),s.formCount(),s.controlCount());}
 @GetMapping
 public ResponseEntity<SearchResult> list(@RequestParam(defaultValue="") String q,
                                           @RequestParam(defaultValue="") String group,
                                           @RequestParam(defaultValue="0") int offset,
                                           @RequestParam(defaultValue="24") int limit){
  if(q.length()>150||group.length()>70||offset<0||offset>554||limit<1||limit>60)
    throw new IllegalArgumentException("Invalid service search pagination");
  // Dataset is bounded at the verified 554-record v86 inventory.
  var all=services.search(q,group,554);
  List<ServiceView> page=all.stream().skip(offset).limit(limit).map(PublicServiceApiController::view).toList();
  return ResponseEntity.ok().cacheControl(CacheControl.maxAge(5,TimeUnit.MINUTES))
    .body(new SearchResult(all.size(),offset,limit,page));
 }
 @GetMapping("/groups")
 public ResponseEntity<List<GroupView>> groups(){
  return ResponseEntity.ok().cacheControl(CacheControl.maxAge(5,TimeUnit.MINUTES))
   .body(services.groups().entrySet().stream().map(e->new GroupView(e.getKey(),
     e.getValue().get(0).group(),e.getValue().size())).toList());
 }
 @GetMapping("/{part}/{number}")
 public ResponseEntity<ServiceView> detail(@PathVariable String part,@PathVariable int number){
  if(!part.matches("P[1-5]")||number<1)return ResponseEntity.notFound().build();
  return services.find(part+"/"+number).map(PublicServiceApiController::view)
   .map(x->ResponseEntity.ok().cacheControl(CacheControl.maxAge(5,TimeUnit.MINUTES)).body(x))
   .orElseGet(()->ResponseEntity.notFound().build());
 }
}
