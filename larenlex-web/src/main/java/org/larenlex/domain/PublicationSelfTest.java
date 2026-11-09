package org.larenlex.domain;
import org.larenlex.core.AccessPolicy;
import java.time.*;
import java.util.*;
public final class PublicationSelfTest {
 private static int tests=0;
 private static void yes(boolean x,String why){tests++;if(!x)throw new AssertionError(why);}
 private static void fails(Class<? extends Throwable> type,Runnable r){tests++;try{r.run();throw new AssertionError("Expected exception "+type);}catch(Throwable t){if(!type.isInstance(t))throw new AssertionError("Wrong exception",t);}}
 private static AccessPolicy.Principal p(String s,AccessPolicy.Role r){return new AccessPolicy.Principal(s,Set.of(r),Set.of("t1"),Set.of());}
 public static void main(String[] args){
  var engine=new PublicationEngine(Clock.fixed(Instant.parse("2026-11-09T08:00:00Z"),ZoneOffset.UTC));
  var writer=p("writer",AccessPolicy.Role.LEGAL_REVIEWER);var reviewer=p("reviewer",AccessPolicy.Role.LEGAL_REVIEWER);var publisher=p("publisher",AccessPolicy.Role.ADMIN);
  var user=p("user",AccessPolicy.Role.APPLICANT);
  fails(SecurityException.class,()->engine.propose(user,PublicationEngine.Kind.NEWS,"News","Body","https://example.org"));
  fails(IllegalArgumentException.class,()->engine.propose(writer,PublicationEngine.Kind.NEWS,"News","Body","http://example.org"));
  var article=engine.propose(writer,PublicationEngine.Kind.ARTICLE,"A legal article","Article body",null);
  yes(article.stage()==PublicationEngine.Stage.REVIEW_PENDING,"pending");
  fails(NoSuchElementException.class,()->engine.readPublished(article.id()));
  fails(SecurityException.class,()->engine.review(writer,article.id(),0,true));
  fails(IllegalStateException.class,()->engine.publish(publisher,article.id(),0));
  var reviewed=engine.review(reviewer,article.id(),0,true);
  yes(reviewed.stage()==PublicationEngine.Stage.LEGAL_APPROVED,"legal review");
  fails(IllegalStateException.class,()->engine.publish(publisher,article.id(),0));
  var published=engine.publish(publisher,article.id(),1);
  yes(published.stage()==PublicationEngine.Stage.PUBLICATION_APPROVED,"published");
  yes(engine.listPublished().size()==1,"public list");
  yes(engine.readPublished(article.id()).title().equals("A legal article"),"read");
  fails(SecurityException.class,()->engine.withdraw(user,article.id(),2));
  var withdrawn=engine.withdraw(publisher,article.id(),2);
  yes(withdrawn.stage()==PublicationEngine.Stage.WITHDRAWN,"withdrawn");
  fails(NoSuchElementException.class,()->engine.readPublished(article.id()));
  var topic=engine.propose(user,PublicationEngine.Kind.FORUM_TOPIC,"Service discussion","A community post",null);
  yes(topic.stage()==PublicationEngine.Stage.REVIEW_PENDING,"forum moderated");
  fails(NoSuchElementException.class,()->engine.readPublished(topic.id()));
  yes(engine.listPublished().isEmpty(),"no unapproved publication");
  System.out.println("PUBLICATION TEST PASS: "+tests+" assertions, separation-of-duties and withdrawal");
 }
}
