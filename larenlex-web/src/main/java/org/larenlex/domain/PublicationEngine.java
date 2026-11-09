package org.larenlex.domain;

import org.larenlex.core.AccessPolicy;
import java.time.*;
import java.net.URI;
import java.util.*;
import java.util.concurrent.*;

/** Local-only domain policy: no persistence or public publishing side effects. */
public final class PublicationEngine {
 public enum Kind { ARTICLE, NEWS, FORUM_TOPIC, COMMENT }
 public enum Stage { REVIEW_PENDING, LEGAL_APPROVED, PUBLICATION_APPROVED, WITHDRAWN, REJECTED }
 public record Entry(String id,Kind kind,Stage stage,String title,String body,String sourceUrl,
                     String author,String reviewedBy,long revision,Instant createdAt){}
 private static final class MutableEntry {
  String id,title,body,sourceUrl,author,reviewedBy;
  Kind kind; Stage stage=Stage.REVIEW_PENDING;long revision=0;Instant at;
 }
 private final Map<String,MutableEntry> entries=new ConcurrentHashMap<>();
 private final Clock clock;
 public PublicationEngine(Clock clock){this.clock=Objects.requireNonNull(clock);}
 private static boolean has(AccessPolicy.Principal p,AccessPolicy.Role role){
  return AccessPolicy.isAuthenticated(p)&&p.roles().contains(role);
 }
 private static void require(boolean yes){if(!yes)throw new SecurityException("Publication permission denied");}
 private static void expect(boolean yes){if(!yes)throw new IllegalStateException("Invalid publication transition");}
 private static String text(String in,String name,int max){
  if(in==null||in.isBlank()||in.length()>max)throw new IllegalArgumentException(name);
  return in.strip();
 }
 private static String checkSource(String source){
  if(source==null||source.isBlank())throw new IllegalArgumentException("news source required");
  URI url=URI.create(source);
  if(!"https".equalsIgnoreCase(url.getScheme())||url.getHost()==null)
    throw new IllegalArgumentException("HTTPS source required");
  return source;
 }
 private static Entry snapshot(MutableEntry x){return new Entry(x.id,x.kind,x.stage,x.title,x.body,x.sourceUrl,x.author,x.reviewedBy,x.revision,x.at);}
 public Entry propose(AccessPolicy.Principal p,Kind kind,String title,String body,String source){
  require(AccessPolicy.isAuthenticated(p));
  Objects.requireNonNull(kind);
  if(kind==Kind.ARTICLE||kind==Kind.NEWS){
   require(has(p,AccessPolicy.Role.LEGAL_REVIEWER)||has(p,AccessPolicy.Role.ADMIN));
  }else require(has(p,AccessPolicy.Role.APPLICANT)||has(p,AccessPolicy.Role.LEGAL_REVIEWER)||has(p,AccessPolicy.Role.ADMIN));
  MutableEntry e=new MutableEntry();e.id=UUID.randomUUID().toString();e.kind=kind;
  e.title=text(title,"title",140);e.body=text(body,"body",20000);
  e.sourceUrl=kind==Kind.NEWS?checkSource(source):source;
  e.author=p.subject();e.at=clock.instant();entries.put(e.id,e);return snapshot(e);
 }
 public Entry readPublished(String id){
  MutableEntry e=entries.get(id);
  if(e==null||e.stage!=Stage.PUBLICATION_APPROVED)throw new NoSuchElementException("Not published");
  return snapshot(e);
 }
 public Entry review(AccessPolicy.Principal p,String id,long expectedRevision,boolean approve){
  MutableEntry e=entries.get(id);if(e==null)throw new NoSuchElementException("Entry not found");
  require(has(p,AccessPolicy.Role.LEGAL_REVIEWER));
  require(!p.subject().equals(e.author));
  synchronized(e){
   expect(e.revision==expectedRevision&&e.stage==Stage.REVIEW_PENDING);
   e.stage=approve?Stage.LEGAL_APPROVED:Stage.REJECTED;
   e.reviewedBy=p.subject();e.revision++;return snapshot(e);
  }
 }
 public Entry publish(AccessPolicy.Principal p,String id,long expectedRevision){
  MutableEntry e=entries.get(id);if(e==null)throw new NoSuchElementException("Entry not found");
  require(has(p,AccessPolicy.Role.ADMIN));
  require(!p.subject().equals(e.author));
  synchronized(e){
   expect(e.revision==expectedRevision&&e.stage==Stage.LEGAL_APPROVED);
   e.stage=Stage.PUBLICATION_APPROVED;e.revision++;return snapshot(e);
  }
 }
 public Entry withdraw(AccessPolicy.Principal p,String id,long expectedRevision){
  MutableEntry e=entries.get(id);if(e==null)throw new NoSuchElementException("Entry not found");
  require(has(p,AccessPolicy.Role.ADMIN));
  synchronized(e){
   expect(e.revision==expectedRevision&&e.stage==Stage.PUBLICATION_APPROVED);
   e.stage=Stage.WITHDRAWN;e.revision++;return snapshot(e);
  }
 }
 public List<Entry> listPublished(){return entries.values().stream().filter(e->e.stage==Stage.PUBLICATION_APPROVED).map(PublicationEngine::snapshot).sorted(Comparator.comparing(Entry::createdAt)).toList();}
}
