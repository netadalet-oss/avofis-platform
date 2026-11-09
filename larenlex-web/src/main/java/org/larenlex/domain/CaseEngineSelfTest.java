package org.larenlex.domain;

import org.larenlex.core.*;
import java.nio.file.*;
import java.time.*;
import java.util.*;

public final class CaseEngineSelfTest {
 private static int checks=0;
 private static void check(boolean yes,String message){checks++;if(!yes)throw new AssertionError(message);}
 private static void fails(Class<? extends Throwable> type,Runnable op,String message){
  checks++;
  try{op.run();throw new AssertionError("Expected failure: "+message);}
  catch(Throwable e){if(!type.isInstance(e))throw new AssertionError("Wrong exception for "+message,e);}
 }
 private static CaseEngine.Command cmd(CaseEngine.Action a,long revision,Long amount,String text,
                                       CaseEngine.ReviewEvidence evidence){return new CaseEngine.Command(a,revision,amount,text,evidence);}
 private static AccessPolicy.Principal principal(String name,AccessPolicy.Role role,String tenant,String id){
  return new AccessPolicy.Principal(name,Set.of(role),Set.of(tenant),id==null?Set.of():Set.of(id));
 }
 public static void main(String[] args)throws Exception {
  Inventory inv=new Inventory(Path.of(args[0]));
  Set<String> ids=new HashSet<>();for(var row:inv.all("cards"))ids.add(row.get("id"));
  check(ids.size()==554,"service inventory");
  Clock clock=Clock.fixed(Instant.parse("2026-11-09T08:00:00Z"),ZoneOffset.UTC);
  CaseEngine engine=new CaseEngine(ids::contains,clock);
  var owner=principal("owner",AccessPolicy.Role.APPLICANT,"tenant-A",null);
  var outsider=principal("intruder",AccessPolicy.Role.APPLICANT,"tenant-A",null);
  var otherTenant=principal("other",AccessPolicy.Role.APPLICANT,"tenant-B",null);
  var request=new CaseEngine.Submission("tenant-A","P1/123","NL","Business description",25000L);
  var opened=engine.submit(owner,request,"req-001");
  String id=opened.id();check(opened.stage()==CaseEngine.Stage.SUBMITTED,"submitted");
  check(engine.submit(owner,request,"req-001").id().equals(id),"idempotency");
  fails(IllegalStateException.class,()->engine.submit(owner,
    new CaseEngine.Submission("tenant-A","P1/123","NL","Changed request data",25000L),
    "req-001"),"idempotency key payload collision rejected");
  fails(IllegalStateException.class,()->engine.submit(owner,
    new CaseEngine.Submission("tenant-A","P1/123","NL","Changed request data",25000L),
    "req-001"),"idempotency key payload collision rejected");
  fails(IllegalStateException.class,()->engine.submit(owner,
      new CaseEngine.Submission("tenant-A","P9/999","NL","test",null),"bad"),"unknown service");
  fails(SecurityException.class,()->engine.submit(otherTenant,request,"cross"),"cross tenant submit");
  fails(SecurityException.class,()->engine.read(outsider,"tenant-A",id),"same tenant non-owner blocked");
  fails(SecurityException.class,()->engine.read(otherTenant,"tenant-B",id),"cross tenant read");
  fails(SecurityException.class,()->engine.execute(outsider,"tenant-A",id,
    cmd(CaseEngine.Action.ACCEPT_OFFER,0,null,null,null)),"outsider mutate blocked");
  var manager=principal("manager",AccessPolicy.Role.MANAGER,"tenant-A",id);
  var legal=principal("lawyer",AccessPolicy.Role.LEGAL_REVIEWER,"tenant-A",id);
  var professional=principal("expert",AccessPolicy.Role.PROFESSIONAL,"tenant-A",id);
  var finance=principal("finance",AccessPolicy.Role.FINANCE,"tenant-A",id);
  var unassigned=principal("manager2",AccessPolicy.Role.MANAGER,"tenant-A",null);
  fails(SecurityException.class,()->engine.read(unassigned,"tenant-A",id),"unassigned manager");
  fails(SecurityException.class,()->engine.execute(owner,"tenant-A",id,
     cmd(CaseEngine.Action.START_REVIEW,0,null,null,null)),"applicant cannot review");
  opened=engine.execute(manager,"tenant-A",id,cmd(CaseEngine.Action.START_REVIEW,0,null,null,null));
  check(opened.stage()==CaseEngine.Stage.ELIGIBILITY_REVIEW,"review");
  fails(IllegalStateException.class,()->engine.execute(legal,"tenant-A",id,
     cmd(CaseEngine.Action.APPROVE_SCOPE,1,null,null,
         new CaseEngine.ReviewEvidence(true,true,false,"checked"))),"no professional license");
  fails(SecurityException.class,()->engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.APPROVE_SCOPE,1,null,null,
        new CaseEngine.ReviewEvidence(true,true,true,"yes"))),"manager cannot legal-approve");
  opened=engine.execute(legal,"tenant-A",id,cmd(CaseEngine.Action.APPROVE_SCOPE,1,null,null,
        new CaseEngine.ReviewEvidence(true,true,true,"review references on file")));
  check(opened.reviewed(),"review evidence");
  fails(IllegalStateException.class,()->engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.SEND_OFFER,1,45000L,"work",null)),"stale revision");
  fails(IllegalArgumentException.class,()->engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.SEND_OFFER,2,0L,"work",null)),"free offer bad amount");
  opened=engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.SEND_OFFER,2,45000L,"Document check and review",null));
  check(opened.offeredCents().equals(45000L),"real quote cents");
  fails(SecurityException.class,()->engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.ACCEPT_OFFER,3,null,null,null)),"manager cannot accept customer offer");
  opened=engine.execute(owner,"tenant-A",id,cmd(CaseEngine.Action.ACCEPT_OFFER,3,null,null,null));
  opened=engine.execute(owner,"tenant-A",id,cmd(CaseEngine.Action.ACKNOWLEDGE_TERMS,4,null,null,null));
  opened=engine.execute(manager,"tenant-A",id,cmd(CaseEngine.Action.START_WORK,5,null,null,null));
  fails(SecurityException.class,()->engine.execute(owner,"tenant-A",id,
      cmd(CaseEngine.Action.SUBMIT_DELIVERY,6,null,"secret",null)),"client cannot deliver");
  opened=engine.execute(professional,"tenant-A",id,
     cmd(CaseEngine.Action.SUBMIT_DELIVERY,6,null,"Reviewed contract summary",null));
  opened=engine.execute(owner,"tenant-A",id,cmd(CaseEngine.Action.REQUEST_REVISION,7,null,"add appendix",null));
  check(opened.stage()==CaseEngine.Stage.REVISION_REQUESTED,"revision");
  // Revise loop must not bypass the professional's role or resumption.
  fails(SecurityException.class,()->engine.execute(owner,"tenant-A",id,
      cmd(CaseEngine.Action.START_WORK,8,null,null,null)),"customer cannot resume work");
  opened=engine.execute(professional,"tenant-A",id,
     cmd(CaseEngine.Action.RESUME_WORK,8,null,null,null));
  check(opened.stage()==CaseEngine.Stage.IN_PROGRESS,"professional resuming revision");
  opened=engine.execute(professional,"tenant-A",id,
     cmd(CaseEngine.Action.SUBMIT_DELIVERY,9,null,"Revised contract with appendix",null));
  opened=engine.execute(owner,"tenant-A",id,
     cmd(CaseEngine.Action.ACCEPT_DELIVERY,10,null,null,null));
  check(opened.stage()==CaseEngine.Stage.DELIVERED,"customer delivery accepted");
  fails(SecurityException.class,()->engine.execute(manager,"tenant-A",id,
     cmd(CaseEngine.Action.DRAFT_INVOICE,11,null,null,null)),"manager cannot draft invoice");
  opened=engine.execute(finance,"tenant-A",id,
     cmd(CaseEngine.Action.DRAFT_INVOICE,11,null,null,null));
  check(opened.stage()==CaseEngine.Stage.INVOICE_DRAFTED&&opened.invoiceDraftCents()==45000L,
    "invoice draft equals accepted quote");
  check(opened.history().size()==13,"immutable audit events");
  check(!engine.mayCollectPayment(),"payments disabled");
  check(!engine.maySendToInstitution(),"official adapters disabled");
  var req2=engine.submit(owner,new CaseEngine.Submission("tenant-A","P1/124","NL","review",null),"req-002");
  var legal2=principal("lawyer",AccessPolicy.Role.LEGAL_REVIEWER,"tenant-A",req2.id());
  var refused=engine.execute(legal2,"tenant-A",req2.id(),
     cmd(CaseEngine.Action.REJECT_FREE,0,null,null,null));
  check(refused.stage()==CaseEngine.Stage.REJECTED_FREE&&refused.offeredCents()==null,"free reject");
  fails(IllegalStateException.class,()->engine.execute(legal2,"tenant-A",req2.id(),
     cmd(CaseEngine.Action.REJECT_FREE,1,null,null,null)),"duplicate rejection");
  System.out.println("DOMAIN TEST PASS: "+checks+" tests, 554 validated service IDs, cross-tenant and stage gates, no-charge, no-PSP");
 }
}
