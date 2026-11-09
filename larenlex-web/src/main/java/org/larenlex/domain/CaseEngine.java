package org.larenlex.domain;

import org.larenlex.core.AccessPolicy;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Predicate;

/**
 * Auditable, tenant-separated W1 legal-case workflow contract.
 * Pure JDK reference domain. This is not an authenticated HTTP API, not persistent,
 * does not accept private attachments, and NEVER invokes a payment provider.
 */
public final class CaseEngine {
    public enum Stage {
        SUBMITTED, ELIGIBILITY_REVIEW, SCOPE_APPROVED, OFFER_SENT, OFFER_ACCEPTED,
        TERMS_ACKNOWLEDGED, IN_PROGRESS, DELIVERY_PENDING, REVISION_REQUESTED,
        DELIVERED, INVOICE_DRAFTED, REJECTED_FREE
    }
    public enum Action {
        START_REVIEW, APPROVE_SCOPE, SEND_OFFER, ACCEPT_OFFER, ACKNOWLEDGE_TERMS,
        START_WORK, RESUME_WORK, SUBMIT_DELIVERY, REQUEST_REVISION, ACCEPT_DELIVERY,
        DRAFT_INVOICE, REJECT_FREE
    }
    public record ReviewEvidence(boolean countryScope, boolean conflictsChecked,
                                 boolean professionalAuthority, String reviewBasis) {}
    public record Submission(String tenant, String serviceId, String country,
                             String businessSummary, Long suggestedBudgetCents) {}
    public record Command(Action action, long expectedRevision, Long amountCents,
                          String description, ReviewEvidence evidence) {}
    public record Audit(long revision, Instant at, String actor, Action action,
                        Stage from, Stage to) {}
    public record Snapshot(String id, String tenant, String owner, String serviceId,
                           String country, Stage stage, long revision,
                           Long proposedBudgetCents, Long offeredCents,
                           Long invoiceDraftCents, String offerScope,
                           String deliverySummary, boolean reviewed,
                           List<Audit> history) {}

    private static final long MAX_AMOUNT_CENTS = 10_000_000_000L;
    private final Predicate<String> publishedServiceKnown;
    private final Clock clock;
    private final ConcurrentMap<String,MutableCase> cases=new ConcurrentHashMap<>();
    private final ConcurrentMap<String,String> submissions=new ConcurrentHashMap<>();

    public CaseEngine(Predicate<String> serviceKnown, Clock clock) {
        this.publishedServiceKnown=Objects.requireNonNull(serviceKnown);
        this.clock=Objects.requireNonNull(clock);
    }
    private static final class MutableCase {
        String id,tenant,owner,serviceId,country,offerScope,deliverySummary,submissionSignature;
        Long budget,offer,invoiceDraft;
        Stage stage=Stage.SUBMITTED;
        long version=0;
        boolean reviewed=false;
        final List<Audit> history=new ArrayList<>();
    }
    private static String required(String s,String name,int max) {
        if(s==null||s.isBlank()||s.strip().length()>max)throw new IllegalArgumentException(name);
        return s.strip();
    }
    private static Long positiveAmount(Long cents,String name) {
        if(cents==null||cents<=0||cents>MAX_AMOUNT_CENTS)throw new IllegalArgumentException(name);
        return cents;
    }
    private static void permitted(boolean yes) {
        if(!yes)throw new SecurityException("Case access denied");
    }
    private static void expect(boolean yes,String message) {
        if(!yes)throw new IllegalStateException(message);
    }
    private static boolean has(AccessPolicy.Principal p,AccessPolicy.Role role) {
        return AccessPolicy.isAuthenticated(p)&&p.roles().contains(role);
    }
    private static boolean isApplicant(AccessPolicy.Principal p,MutableCase c) {
        return has(p,AccessPolicy.Role.APPLICANT)&&c.owner.equals(p.subject());
    }
    private static boolean isStaff(AccessPolicy.Principal p,MutableCase c,AccessPolicy.Role role) {
        return has(p,role)&&p.assignedCaseIds().contains(c.id);
    }
    private static boolean mayRead(AccessPolicy.Principal p,MutableCase c) {
        return AccessPolicy.isAuthenticated(p)&&p.tenantIds().contains(c.tenant)
            && (isApplicant(p,c)||p.assignedCaseIds().contains(c.id)
                && !Collections.disjoint(p.roles(),EnumSet.of(AccessPolicy.Role.MANAGER,
                    AccessPolicy.Role.PROFESSIONAL,AccessPolicy.Role.LEGAL_REVIEWER,
                    AccessPolicy.Role.FINANCE,AccessPolicy.Role.ADMIN)));
    }
    private static Snapshot view(MutableCase c) {
        return new Snapshot(c.id,c.tenant,c.owner,c.serviceId,c.country,c.stage,c.version,
            c.budget,c.offer,c.invoiceDraft,c.offerScope,c.deliverySummary,c.reviewed,
            List.copyOf(c.history));
    }

    /** Duplicate requests with the same idempotency key return the original draft, never create another case. */
    public Snapshot submit(AccessPolicy.Principal principal,Submission request,String idempotencyKey) {
        permitted(has(principal,AccessPolicy.Role.APPLICANT));
        Objects.requireNonNull(request);
        final String tenant=required(request.tenant(),"tenant",80);
        permitted(principal.tenantIds().contains(tenant));
        final String service=required(request.serviceId(),"serviceId",40);
        expect(publishedServiceKnown.test(service),"Unknown v86 service ID");
        final String country=required(request.country(),"country",12);
        if(request.suggestedBudgetCents()!=null)positiveAmount(request.suggestedBudgetCents(),"budget");
        final String summary=required(request.businessSummary(),"businessSummary",2000);
        final String signature=service+"\u0000"+country+"\u0000"+summary+"\u0000"+String.valueOf(request.suggestedBudgetCents());
        final String clientKey=principal.subject()+"|"+tenant+"|"+required(idempotencyKey,"idempotencyKey",140);
        synchronized(submissions){
            String prior=submissions.get(clientKey);
            if(prior!=null){
                MutableCase existing=cases.get(prior);
                expect(existing!=null&&Objects.equals(existing.submissionSignature,signature),
                    "Idempotency key reused for different request");
                synchronized(existing){return view(existing);}
            }
            MutableCase c=new MutableCase();c.id=UUID.randomUUID().toString();c.tenant=tenant;
            c.owner=principal.subject();c.serviceId=service;c.country=country;
            c.budget=request.suggestedBudgetCents();c.submissionSignature=signature;
            c.history.add(new Audit(0,clock.instant(),principal.subject(),null,null,Stage.SUBMITTED));
            cases.put(c.id,c);submissions.put(clientKey,c.id);
            return view(c);
        }
    }
    public Snapshot read(AccessPolicy.Principal principal,String tenant,String id) {
        MutableCase c=cases.get(required(id,"caseId",80));
        if(c==null)throw new NoSuchElementException("Case not found");
        permitted(Objects.equals(tenant,c.tenant)&&mayRead(principal,c));
        synchronized(c){return view(c);}
    }
    public Snapshot execute(AccessPolicy.Principal principal,String tenant,String id,Command cmd) {
        Objects.requireNonNull(cmd);
        MutableCase c=cases.get(required(id,"caseId",80));
        if(c==null)throw new NoSuchElementException("Case not found");
        permitted(Objects.equals(tenant,c.tenant)&&mayRead(principal,c));
        synchronized(c){
            expect(cmd.expectedRevision()==c.version,"Stale revision");
            Stage from=c.stage;
            switch(cmd.action()) {
                case START_REVIEW -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.MANAGER));
                    expect(c.stage==Stage.SUBMITTED,"Review requires submitted case");
                    c.stage=Stage.ELIGIBILITY_REVIEW;
                }
                case APPROVE_SCOPE -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.LEGAL_REVIEWER));
                    expect(c.stage==Stage.ELIGIBILITY_REVIEW,"Scope review stage");
                    ReviewEvidence ev=Objects.requireNonNull(cmd.evidence());
                    expect(ev.countryScope()&&ev.conflictsChecked()&&ev.professionalAuthority()
                        &&ev.reviewBasis()!=null&&!ev.reviewBasis().isBlank(),"Review evidence incomplete");
                    c.reviewed=true;c.stage=Stage.SCOPE_APPROVED;
                }
                case SEND_OFFER -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.MANAGER));
                    expect(c.stage==Stage.SCOPE_APPROVED&&c.reviewed,"Approved legal scope required");
                    c.offer=positiveAmount(cmd.amountCents(),"offer amount");
                    c.offerScope=required(cmd.description(),"offer scope",500);
                    c.stage=Stage.OFFER_SENT;
                }
                case ACCEPT_OFFER -> {
                    permitted(isApplicant(principal,c));
                    expect(c.stage==Stage.OFFER_SENT&&c.offer!=null,"Offer missing");
                    c.stage=Stage.OFFER_ACCEPTED;
                }
                case ACKNOWLEDGE_TERMS -> {
                    permitted(isApplicant(principal,c));
                    expect(c.stage==Stage.OFFER_ACCEPTED,"Offer acceptance required");
                    // Merely records UI acknowledgement; not qualified e-signature.
                    c.stage=Stage.TERMS_ACKNOWLEDGED;
                }
                case START_WORK -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.MANAGER));
                    expect(c.stage==Stage.TERMS_ACKNOWLEDGED,"Client terms acknowledgement required");
                    c.stage=Stage.IN_PROGRESS;
                }
                case RESUME_WORK -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.PROFESSIONAL));
                    expect(c.stage==Stage.REVISION_REQUESTED,"Client revision must be requested");
                    c.stage=Stage.IN_PROGRESS;
                }
                case SUBMIT_DELIVERY -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.PROFESSIONAL));
                    expect(c.stage==Stage.IN_PROGRESS,"Work must be in progress");
                    c.deliverySummary=required(cmd.description(),"delivery summary",800);
                    c.stage=Stage.DELIVERY_PENDING;
                }
                case REQUEST_REVISION -> {
                    permitted(isApplicant(principal,c));
                    expect(c.stage==Stage.DELIVERY_PENDING,"Delivery required");
                    required(cmd.description(),"revision explanation",500);
                    c.stage=Stage.REVISION_REQUESTED;
                }
                case ACCEPT_DELIVERY -> {
                    permitted(isApplicant(principal,c));
                    expect(c.stage==Stage.DELIVERY_PENDING,"Delivery required");
                    c.stage=Stage.DELIVERED;
                }
                case DRAFT_INVOICE -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.FINANCE));
                    expect(c.stage==Stage.DELIVERED&&c.offer!=null,"Delivered and agreed offer required");
                    c.invoiceDraft=c.offer;c.stage=Stage.INVOICE_DRAFTED;
                }
                case REJECT_FREE -> {
                    permitted(isStaff(principal,c,AccessPolicy.Role.LEGAL_REVIEWER));
                    expect(c.stage==Stage.SUBMITTED||c.stage==Stage.ELIGIBILITY_REVIEW,
                        "Free rejection only before offer");
                    c.offer=null;c.invoiceDraft=null;c.stage=Stage.REJECTED_FREE;
                }
            }
            c.version++;
            c.history.add(new Audit(c.version,clock.instant(),principal.subject(),cmd.action(),from,c.stage));
            return view(c);
        }
    }
    public boolean mayCollectPayment(){return false;}
    public boolean maySendToInstitution(){return false;}
}
