package nl.larenlex.app;

/** Local display filter only; server must enforce tenant, ownership, MFA and assignment. */
public final class NativeRecordOwnershipPolicy {
    private NativeRecordOwnershipPolicy() { }
    public static boolean canDisplay(String tenant,String owner,String callerTenant,String callerId,
                                      boolean staffAssigned, boolean mfa, boolean revoked) {
        if(revoked || tenant == null || !tenant.equals(callerTenant))return false;
        return owner!=null && owner.equals(callerId) || staffAssigned && mfa;
    }
}
