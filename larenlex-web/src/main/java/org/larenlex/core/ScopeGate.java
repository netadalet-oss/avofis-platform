package org.larenlex.core;
/** Fail-closed free triage. This class never authorizes an actual payment. */
public final class ScopeGate {
 private ScopeGate(){}
 public enum Result { REJECTED_NO_CHARGE, HUMAN_REVIEW_REQUIRED, ACCEPTABLE_IN_PRINCIPLE }
 public record Request(String country,String service,boolean reserved,boolean localAuthorityVerified,boolean conflictClear,boolean partnerVerified){}
 public record Decision(Result result,long chargeCents,boolean contractAllowed,boolean paymentAllowed,String reason){}
 public static Decision assess(Request r) {
  if(r==null||r.country()==null||r.country().isBlank()||r.service()==null||r.service().isBlank())
   return new Decision(Result.HUMAN_REVIEW_REQUIRED,0,false,false,"Missing jurisdiction/service");
  if(r.reserved()&&!r.partnerVerified())
   return new Decision(Result.REJECTED_NO_CHARGE,0,false,false,"Reserved profession not verified");
  if(!r.localAuthorityVerified()||!r.conflictClear())
   return new Decision(Result.HUMAN_REVIEW_REQUIRED,0,false,false,"Authority/conflict review required");
  return new Decision(Result.ACCEPTABLE_IN_PRINCIPLE,0,false,false,"Preliminary only; contract/PSP independent gates");
 }
}
