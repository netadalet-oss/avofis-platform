package org.larenlex.domain;
import org.larenlex.core.*;
import java.nio.file.*;
import java.time.*;
import java.util.*;

public final class CaseWorkspaceSelfTest {
 private static int checks;
 private static void ok(boolean condition,String label){checks++;if(!condition)throw new AssertionError(label);}
 private static void deny(Class<? extends Throwable> expected,Runnable fn,String label){
  checks++;try{fn.run();throw new AssertionError("Expected rejection: "+label);}
  catch(Throwable ex){if(!expected.isInstance(ex))throw new AssertionError("Unexpected rejection for "+label,ex);}
 }
 private static AccessPolicy.Principal p(String subject,AccessPolicy.Role role,String tenant,String id){
  return new AccessPolicy.Principal(subject,Set.of(role),Set.of(tenant),id==null?Set.of():Set.of(id));
 }
 private static CaseEngine.Command cmd(CaseEngine.Action a,long rev,Long sum,String details,CaseEngine.ReviewEvidence evidence){
  return new CaseEngine.Command(a,rev,sum,details,evidence);
 }
 public static void main(String[] args)throws Exception {
  Inventory inv=new Inventory(Path.of(args[0]));Set<String> ids=new HashSet<>();
  inv.all("cards").forEach(r->ids.add(r.get("id")));
  Clock clock=Clock.fixed(Instant.parse("2026-11-09T09:00:00Z"),ZoneOffset.UTC);
  java.util.concurrent.atomic.AtomicReference<CaseWorkspace> planRef=new java.util.concurrent.atomic.AtomicReference<>();
  var cases=new CaseEngine(ids::contains,clock,(actor,c)->planRef.get()!=null
     && planRef.get().milestonesReadyForFinance(actor,c.tenant(),c.id()));
  var applicant=p("client",AccessPolicy.Role.APPLICANT,"tenant-A",null);
  var created=cases.submit(applicant,new CaseEngine.Submission("tenant-A","P1/123","NL","Case description",100000L),"workflow-001");
  var manager=p("manager",AccessPolicy.Role.MANAGER,"tenant-A",created.id());
  var professional=p("professional",AccessPolicy.Role.PROFESSIONAL,"tenant-A",created.id());
  var legal=p("legal",AccessPolicy.Role.LEGAL_REVIEWER,"tenant-A",created.id());
  var finance=p("finance",AccessPolicy.Role.FINANCE,"tenant-A",created.id());
  var other=p("outsider",AccessPolicy.Role.APPLICANT,"tenant-A",null);
  var tenantB=p("intruder",AccessPolicy.Role.MANAGER,"tenant-B",created.id());
  var w=new CaseWorkspace(cases,clock);planRef.set(w);
  String id=created.id();
  deny(SecurityException.class,()->w.read(other,"tenant-A",id),"other applicant cannot read");
  deny(SecurityException.class,()->w.read(tenantB,"tenant-B",id),"foreign tenant cannot read");
  deny(SecurityException.class,()->w.addTask(applicant,"tenant-A",id,0,"Secret","professional",CaseWorkspace.Visibility.INTERNAL,null),"client may not create task");
  deny(IllegalStateException.class,()->w.addMilestone(manager,"tenant-A",id,0,"First",10000L,null),"work not started");
  cases.execute(manager,"tenant-A",id,cmd(CaseEngine.Action.START_REVIEW,0,null,null,null));
  cases.execute(legal,"tenant-A",id,cmd(CaseEngine.Action.APPROVE_SCOPE,1,null,null,
   new CaseEngine.ReviewEvidence(true,true,true,"qualified independent review")));
  cases.execute(manager,"tenant-A",id,cmd(CaseEngine.Action.SEND_OFFER,2,100000L,"Agreed work scope",null));
  cases.execute(applicant,"tenant-A",id,cmd(CaseEngine.Action.ACCEPT_OFFER,3,null,null,null));
  cases.execute(applicant,"tenant-A",id,cmd(CaseEngine.Action.ACKNOWLEDGE_TERMS,4,null,null,null));
  cases.execute(manager,"tenant-A",id,cmd(CaseEngine.Action.START_WORK,5,null,null,null));
  var snapshot=w.addMilestone(manager,"tenant-A",id,0,"Contract review",60000L,null);
  ok(snapshot.milestones().size()==1,"first milestone");
  deny(IllegalStateException.class,()->w.addMilestone(manager,"tenant-A",id,1,"Excess",50000L,null),"budget ceiling");
  snapshot=w.addMilestone(manager,"tenant-A",id,1,"Delivery documents",40000L,null);
  ok(snapshot.milestones().size()==2,"second milestone");
  String first=snapshot.milestones().get(0).id(),second=snapshot.milestones().get(1).id();
  deny(SecurityException.class,()->w.changeMilestone(applicant,"tenant-A",id,first,2,CaseWorkspace.MilestoneStage.ACTIVE,null),"client activation");
  snapshot=w.changeMilestone(manager,"tenant-A",id,first,2,CaseWorkspace.MilestoneStage.ACTIVE,null);
  snapshot=w.changeMilestone(professional,"tenant-A",id,first,3,CaseWorkspace.MilestoneStage.SUBMITTED,"Draft reviewed");
  snapshot=w.changeMilestone(applicant,"tenant-A",id,first,4,CaseWorkspace.MilestoneStage.REVISION_REQUESTED,"Amend clause");
  ok(snapshot.milestones().get(0).stage()==CaseWorkspace.MilestoneStage.REVISION_REQUESTED,"revision");
  snapshot=w.changeMilestone(professional,"tenant-A",id,first,5,CaseWorkspace.MilestoneStage.SUBMITTED,"Amended draft");
  snapshot=w.changeMilestone(applicant,"tenant-A",id,first,6,CaseWorkspace.MilestoneStage.ACCEPTED,null);
  snapshot=w.changeMilestone(manager,"tenant-A",id,second,7,CaseWorkspace.MilestoneStage.ACTIVE,null);
  snapshot=w.changeMilestone(professional,"tenant-A",id,second,8,CaseWorkspace.MilestoneStage.SUBMITTED,"Final documents");
  snapshot=w.changeMilestone(applicant,"tenant-A",id,second,9,CaseWorkspace.MilestoneStage.ACCEPTED,null);
  ok(snapshot.milestones().stream().allMatch(m->m.stage()==CaseWorkspace.MilestoneStage.ACCEPTED),"all milestones accepted");
  snapshot=w.addTask(manager,"tenant-A",id,10,"Internal review","professional",CaseWorkspace.Visibility.INTERNAL,null);
  String task=snapshot.tasks().get(0).id();
  ok(w.read(applicant,"tenant-A",id).tasks().isEmpty(),"private task hidden from client");
  deny(SecurityException.class,()->w.completeTask(applicant,"tenant-A",id,task,11,CaseWorkspace.TaskStage.DONE),"client cannot complete internal task");
  snapshot=w.completeTask(professional,"tenant-A",id,task,11,CaseWorkspace.TaskStage.DONE);
  snapshot=w.completeTask(manager,"tenant-A",id,task,12,CaseWorkspace.TaskStage.VERIFIED);
  String hash="ab".repeat(32);
  snapshot=w.registerAttachmentMetadata(applicant,"tenant-A",id,13,"contract.pdf",hash,3000L,"application/pdf",CaseWorkspace.Visibility.CUSTOMER);
  ok(snapshot.attachments().get(0).status()==CaseWorkspace.AttachmentStatus.SECURITY_REVIEW_REQUIRED,"document quarantined");
  deny(IllegalArgumentException.class,()->w.registerAttachmentMetadata(applicant,"tenant-A",id,14,"../secret.pdf",hash,3000,"application/pdf",CaseWorkspace.Visibility.CUSTOMER),"traversal name");
  deny(IllegalArgumentException.class,()->w.registerAttachmentMetadata(applicant,"tenant-A",id,14,"virus.exe",hash,3000,"application/x-msdownload",CaseWorkspace.Visibility.CUSTOMER),"binary MIME");
  snapshot=w.sendMessage(applicant,"tenant-A",id,14,"Request an update");
  ok(w.read(manager,"tenant-A",id).messages().size()==1,"message visible to assigned manager");
  deny(IllegalStateException.class,()->w.sendMessage(applicant,"tenant-A",id,14,"Duplicate replay"),"stale revision");
  ok(!w.milestonesReadyForFinance(finance,"tenant-A",id),"payment blocked before main delivery acceptance");
  cases.execute(professional,"tenant-A",id,cmd(CaseEngine.Action.SUBMIT_DELIVERY,6,null,"Completed handover",null));
  cases.execute(applicant,"tenant-A",id,cmd(CaseEngine.Action.ACCEPT_DELIVERY,7,null,null,null));
  ok(w.milestonesReadyForFinance(finance,"tenant-A",id),"accepted milestones reconcile with offer");
  var invoiced=cases.execute(finance,"tenant-A",id,cmd(CaseEngine.Action.DRAFT_INVOICE,8,null,null,null));
  ok(invoiced.stage()==CaseEngine.Stage.INVOICE_DRAFTED && invoiced.invoiceDraftCents()==100000L,
     "invoice draft only after accepted phases and full quote reconciliation");
  deny(SecurityException.class,()->w.milestonesReadyForFinance(manager,"tenant-A",id),"nonfinance may not finance gate");
  ok(!w.paymentsEnabled()&&!w.externalInstitutionEnabled(),"no payments no institution");
  System.out.println("WORKSPACE TEST PASS: "+checks+" assertions, milestone sum, tenant, 403, immutable revision, private docs, quarantine, messages, no PSP");
 }
}
