import nl.larenlex.app.L6ReleaseGate;
import nl.larenlex.app.L6RecoveryPolicy;
public final class L6PolicyHarness {
    public static void main(String[] args) {
        L6ReleaseGate.Evidence absent=new L6ReleaseGate.Evidence(false,false,false,false,false,false,false,false,false,false,false);
        if(L6ReleaseGate.evaluate(absent)!=L6ReleaseGate.Decision.BLOCKED) throw new AssertionError("missing evidence accepted");
        L6ReleaseGate.Evidence noPublish=new L6ReleaseGate.Evidence(true,true,true,true,true,true,true,true,true,true,false);
        if(L6ReleaseGate.evaluate(noPublish)!=L6ReleaseGate.Decision.READY_FOR_HUMAN_SIGNING_REVIEW) throw new AssertionError("publish authorized without permission");
        L6ReleaseGate.Evidence fullyAuthorized=new L6ReleaseGate.Evidence(true,true,true,true,true,true,true,true,true,true,true);
        if(L6ReleaseGate.evaluate(fullyAuthorized)!=L6ReleaseGate.Decision.READY_FOR_HUMAN_PUBLISHING_REVIEW) throw new AssertionError("decision mismatch");
        if(L6RecoveryPolicy.check(false,true,true,true)!=L6RecoveryPolicy.Result.LOCKED_REQUIRE_REAUTH) throw new AssertionError("session");
        if(L6RecoveryPolicy.check(true,false,true,true)!=L6RecoveryPolicy.Result.KEY_UNAVAILABLE_CANNOT_RECOVER) throw new AssertionError("key");
        if(L6RecoveryPolicy.check(true,true,false,true)!=L6RecoveryPolicy.Result.REJECT_CROSS_ACCOUNT) throw new AssertionError("ownership");
        if(L6RecoveryPolicy.check(true,true,true,false)!=L6RecoveryPolicy.Result.EXPIRED_DELETE) throw new AssertionError("retention");
        if(L6RecoveryPolicy.check(true,true,true,true)!=L6RecoveryPolicy.Result.CONFIRM_LOCAL_DRAFT_ONLY) throw new AssertionError("recovery safe path");
        System.out.println("L6 java policy checks: 8 PASS");
    }
}
