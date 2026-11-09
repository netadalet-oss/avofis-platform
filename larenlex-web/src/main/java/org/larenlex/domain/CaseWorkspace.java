package org.larenlex.domain;

import org.larenlex.core.AccessPolicy;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * W1 reference aggregate: file work, milestones, task assignments, messages and
 * attachment *metadata*. Nothing is persisted or uploaded, invoiced or paid.
 * Every operation obtains a current case/tenant read from CaseEngine and checks
 * the authenticated role and case assignment. In production the same guards
 * MUST also exist at API, database RLS, and blob storage layers.
 */
public final class CaseWorkspace {
    public enum MilestoneStage { PLANNED, ACTIVE, SUBMITTED, REVISION_REQUESTED, ACCEPTED }
    public enum TaskStage { OPEN, DONE, VERIFIED }
    public enum Visibility { CUSTOMER, INTERNAL }
    public enum AttachmentStatus { SECURITY_REVIEW_REQUIRED }
    public record Milestone(String id, int order, String name, long budgetCents,
                            Instant dueAt, MilestoneStage stage, long revision,
                            String deliverySummary, String revisionReason) {}
    public record Task(String id, String title, String assignee, Visibility visibility,
                       TaskStage stage, Instant dueAt, long revision) {}
    public record Attachment(String id,String name,String sha256,long size,String mediaType,
                             String uploadedBy,Visibility visibility,
                             AttachmentStatus status,Instant at) {}
    public record Message(String id,String sender,String text,Instant at) {}
    public record Event(long number,String actor,String action,String item,Instant at) {}
    public record Snapshot(String caseId,String tenant,long revision,
                           List<Milestone> milestones,List<Task> tasks,
                           List<Attachment> attachments,List<Message> messages,
                           List<Event> history) {}
    private final CaseEngine caseEngine;
    private final Clock clock;
    private final Map<String,Workspace> workspaces=new ConcurrentHashMap<>();
    private static final Set<CaseEngine.Stage> ACCEPTS_WORK = EnumSet.of(
      CaseEngine.Stage.IN_PROGRESS,CaseEngine.Stage.DELIVERY_PENDING,
      CaseEngine.Stage.REVISION_REQUESTED,CaseEngine.Stage.DELIVERED,
      CaseEngine.Stage.INVOICE_DRAFTED);

    private static final class Workspace {
        final String id,tenant;
        long revision;
        final LinkedHashMap<String,Milestone> milestones=new LinkedHashMap<>();
        final LinkedHashMap<String,Task> tasks=new LinkedHashMap<>();
        final LinkedHashMap<String,Attachment> attachments=new LinkedHashMap<>();
        final List<Message> messages=new ArrayList<>();
        final List<Event> events=new ArrayList<>();
        Workspace(String id,String tenant){this.id=id;this.tenant=tenant;}
    }
    public CaseWorkspace(CaseEngine caseEngine,Clock clock){
        this.caseEngine=Objects.requireNonNull(caseEngine);
        this.clock=Objects.requireNonNull(clock);
    }
    private static String text(String s,String name,int max) {
        if(s==null||s.isBlank()||s.strip().length()>max)throw new IllegalArgumentException(name);
        return s.strip();
    }
    private static boolean is(AccessPolicy.Principal p,AccessPolicy.Role role){
        return AccessPolicy.isAuthenticated(p)&&p.roles().contains(role);
    }
    private static void require(boolean yes){if(!yes)throw new SecurityException("Not authorized for this case");}
    private static void expect(boolean yes,String msg){if(!yes)throw new IllegalStateException(msg);}
    private CaseEngine.Snapshot allowed(AccessPolicy.Principal actor,String tenant,String id){
        return caseEngine.read(actor,text(tenant,"tenant",80),text(id,"case",80));
    }
    private static boolean assigned(AccessPolicy.Principal p,CaseEngine.Snapshot c){
        return p.assignedCaseIds().contains(c.id());
    }
    private static boolean applicant(AccessPolicy.Principal p,CaseEngine.Snapshot c){
        return is(p,AccessPolicy.Role.APPLICANT)&&p.subject().equals(c.owner());
    }
    private static boolean staff(AccessPolicy.Principal p,CaseEngine.Snapshot c,AccessPolicy.Role r){
        return is(p,r)&&assigned(p,c);
    }
    private Workspace forCase(CaseEngine.Snapshot c){
        Workspace w=workspaces.computeIfAbsent(c.id(),id->new Workspace(id,c.tenant()));
        expect(w.tenant.equals(c.tenant()),"Workspace tenant mismatch");
        return w;
    }
    private void change(Workspace w,String actor,String action,String item){
        w.revision++;
        w.events.add(new Event(w.revision,actor,action,item,clock.instant()));
    }
    private static boolean staffRead(AccessPolicy.Principal p,CaseEngine.Snapshot c){
        return assigned(p,c)&&!Collections.disjoint(p.roles(),EnumSet.of(
          AccessPolicy.Role.MANAGER,AccessPolicy.Role.PROFESSIONAL,
          AccessPolicy.Role.LEGAL_REVIEWER,AccessPolicy.Role.ADMIN,AccessPolicy.Role.FINANCE));
    }
    private static Snapshot copy(Workspace w,boolean internal){
        List<Task> tasks=w.tasks.values().stream().filter(t->internal||t.visibility()==Visibility.CUSTOMER).toList();
        List<Attachment> docs=w.attachments.values().stream().filter(a->internal||a.visibility()==Visibility.CUSTOMER).toList();
        // Audit events are staff-only; applicants see the milestone and message timeline.
        return new Snapshot(w.id,w.tenant,w.revision,List.copyOf(w.milestones.values()),
          tasks,docs,List.copyOf(w.messages),internal?List.copyOf(w.events):List.of());
    }
    public Snapshot read(AccessPolicy.Principal actor,String tenant,String id){
        var c=allowed(actor,tenant,id);var w=forCase(c);
        synchronized(w){return copy(w,staffRead(actor,c));}
    }
    public Snapshot addMilestone(AccessPolicy.Principal actor,String tenant,String id,
                                 long expectedRevision,String name,long budgetCents,Instant dueAt){
        var c=allowed(actor,tenant,id);
        require(staff(actor,c,AccessPolicy.Role.MANAGER));
        expect(c.stage()==CaseEngine.Stage.IN_PROGRESS,"Work contract not in progress");
        if(budgetCents<=0||budgetCents>10_000_000_000L)throw new IllegalArgumentException("milestone budget");
        var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale workplan revision");
            expect(w.milestones.size()<25,"Milestone limit");
            // Comparisons use subtraction to avoid long overflow.
            long available=Objects.requireNonNull(c.offeredCents(),"accepted offer required");
            for(var m:w.milestones.values())available-=m.budgetCents();
            expect(budgetCents<=available,"Milestone amounts exceed accepted offer");
            expect(dueAt==null||dueAt.isAfter(clock.instant()),"Milestone due date must be future");
            String mid=UUID.randomUUID().toString();
            w.milestones.put(mid,new Milestone(mid,w.milestones.size()+1,
              text(name,"milestone title",160),budgetCents,dueAt,MilestoneStage.PLANNED,0,null,null));
            change(w,actor.subject(),"MILESTONE_CREATED",mid);
            return copy(w,true);
        }
    }
    public Snapshot changeMilestone(AccessPolicy.Principal actor,String tenant,String id,
                      String milestoneId,long expectedRevision,MilestoneStage target,String explanation){
        var c=allowed(actor,tenant,id);var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale workplan revision");
            Milestone m=w.milestones.get(milestoneId);
            if(m==null)throw new NoSuchElementException("Unknown milestone");
            MilestoneStage from=m.stage();
            if(target==MilestoneStage.ACTIVE){
                require(staff(actor,c,AccessPolicy.Role.MANAGER));
                expect(from==MilestoneStage.PLANNED && c.stage()==CaseEngine.Stage.IN_PROGRESS,
                  "Cannot activate milestone");
            }else if(target==MilestoneStage.SUBMITTED){
                require(staff(actor,c,AccessPolicy.Role.PROFESSIONAL));
                expect((from==MilestoneStage.ACTIVE||from==MilestoneStage.REVISION_REQUESTED)
                    && (c.stage()==CaseEngine.Stage.IN_PROGRESS || c.stage()==CaseEngine.Stage.REVISION_REQUESTED),"Milestone not active");
                explanation=text(explanation,"delivery summary",1500);
            }else if(target==MilestoneStage.REVISION_REQUESTED){
                require(applicant(actor,c));
                expect(from==MilestoneStage.SUBMITTED,"No delivery to revise");
                explanation=text(explanation,"revision reason",600);
            }else if(target==MilestoneStage.ACCEPTED){
                require(applicant(actor,c));
                expect(from==MilestoneStage.SUBMITTED,"Milestone not delivered");
            }else throw new IllegalArgumentException("Unsupported change");
            String delivery=target==MilestoneStage.SUBMITTED?explanation:m.deliverySummary();
            String revision=target==MilestoneStage.REVISION_REQUESTED?explanation:m.revisionReason();
            w.milestones.put(milestoneId,new Milestone(m.id(),m.order(),m.name(),m.budgetCents(),
              m.dueAt(),target,m.revision()+1,delivery,revision));
            change(w,actor.subject(),"MILESTONE_"+target,milestoneId);
            return copy(w,staffRead(actor,c));
        }
    }
    public Snapshot addTask(AccessPolicy.Principal actor,String tenant,String id,
             long expectedRevision,String name,String assignedTo,Visibility visibility,Instant dueAt){
        var c=allowed(actor,tenant,id);
        require(staff(actor,c,AccessPolicy.Role.MANAGER));
        expect(c.stage()==CaseEngine.Stage.IN_PROGRESS,"Work not in progress");
        Objects.requireNonNull(visibility);
        var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale workplan revision");
            expect(w.tasks.size()<100,"Task limit");
            String tid=UUID.randomUUID().toString();
            w.tasks.put(tid,new Task(tid,text(name,"task title",160),
               text(assignedTo,"assignee",120),visibility,TaskStage.OPEN,dueAt,0));
            change(w,actor.subject(),"TASK_CREATED",tid);
            return copy(w,true);
        }
    }
    public Snapshot completeTask(AccessPolicy.Principal actor,String tenant,String id,
             String taskId,long expectedRevision,TaskStage target){
        var c=allowed(actor,tenant,id);var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale revision");
            Task t=w.tasks.get(taskId);if(t==null)throw new NoSuchElementException("Task");
            if(target==TaskStage.DONE){
                require(staff(actor,c,AccessPolicy.Role.PROFESSIONAL)&&actor.subject().equals(t.assignee()));
                expect(t.stage()==TaskStage.OPEN,"Task already done");
            }else if(target==TaskStage.VERIFIED){
                require(staff(actor,c,AccessPolicy.Role.MANAGER));
                expect(t.stage()==TaskStage.DONE,"Task not finished");
            }else throw new IllegalArgumentException("Unsupported task state");
            w.tasks.put(taskId,new Task(t.id(),t.title(),t.assignee(),t.visibility(),target,t.dueAt(),t.revision()+1));
            change(w,actor.subject(),"TASK_"+target,taskId);
            return copy(w,staffRead(actor,c));
        }
    }
    public Snapshot registerAttachmentMetadata(AccessPolicy.Principal actor,String tenant,String id,
              long expectedRevision,String filename,String sha256,long size,String mediaType,Visibility visibility){
        var c=allowed(actor,tenant,id);
        require(applicant(actor,c)||staff(actor,c,AccessPolicy.Role.PROFESSIONAL));
        Objects.requireNonNull(visibility);
        if(applicant(actor,c)&&visibility!=Visibility.CUSTOMER)throw new SecurityException("Applicant cannot create internal documents");
        if(size<=0||size>15L*1024*1024)throw new IllegalArgumentException("File size exceeds policy");
        if(sha256==null||!sha256.matches("[a-fA-F0-9]{64}"))throw new IllegalArgumentException("Invalid hash");
        String mime=text(mediaType,"mediaType",80);
        if(!Set.of("application/pdf","image/jpeg","image/png","text/plain").contains(mime))
            throw new IllegalArgumentException("Unsupported document type");
        String name=text(filename,"filename",180);
        if(name.contains("/")||name.contains("\\")||name.indexOf('\u0000')>=0||name.contains("..")||
           !name.matches("(?iu)^[\\p{L}\\p{N}_.() \\-]{1,180}$"))
            throw new IllegalArgumentException("Invalid file name");
        // File bytes and malware scan must be handled by a separate quarantine vault.
        var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale revision");
            expect(w.attachments.size()<100,"Attachment limit");
            String docId=UUID.randomUUID().toString();
            w.attachments.put(docId,new Attachment(docId,name,sha256.toLowerCase(Locale.ROOT),size,mime,
                actor.subject(),visibility,AttachmentStatus.SECURITY_REVIEW_REQUIRED,clock.instant()));
            change(w,actor.subject(),"DOCUMENT_METADATA_REGISTERED",docId);
            return copy(w,staffRead(actor,c));
        }
    }
    public Snapshot sendMessage(AccessPolicy.Principal actor,String tenant,String id,
                              long expectedRevision,String body){
        var c=allowed(actor,tenant,id);
        require(applicant(actor,c)||staff(actor,c,AccessPolicy.Role.PROFESSIONAL)
          ||staff(actor,c,AccessPolicy.Role.MANAGER));
        var w=forCase(c);
        synchronized(w){
            expect(w.revision==expectedRevision,"Stale revision");
            expect(w.messages.size()<500,"Message limit");
            String messageId=UUID.randomUUID().toString();
            w.messages.add(new Message(messageId,actor.subject(),text(body,"message",2000),clock.instant()));
            change(w,actor.subject(),"CASE_MESSAGE",messageId);
            return copy(w,staffRead(actor,c));
        }
    }
    /** True only when all agreed milestone amounts match the offer and were accepted. */
    public boolean milestonesReadyForFinance(AccessPolicy.Principal actor,String tenant,String id){
        var c=allowed(actor,tenant,id);
        require(staff(actor,c,AccessPolicy.Role.FINANCE));
        if(c.stage()!=CaseEngine.Stage.DELIVERED&&c.stage()!=CaseEngine.Stage.INVOICE_DRAFTED)return false;
        var w=forCase(c);
        synchronized(w){
            if(w.milestones.isEmpty()||c.offeredCents()==null)return false;
            long remaining=c.offeredCents();
            for(var m:w.milestones.values()){
                if(m.stage()!=MilestoneStage.ACCEPTED)return false;
                remaining-=m.budgetCents();
            }
            return remaining==0;
        }
    }
    public boolean paymentsEnabled(){return false;}
    public boolean externalInstitutionEnabled(){return false;}
}
