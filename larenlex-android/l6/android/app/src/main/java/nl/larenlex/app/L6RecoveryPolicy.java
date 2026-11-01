package nl.larenlex.app;

/** Metadata-only failure and recovery policy; no actual customer data or key material. */
public final class L6RecoveryPolicy {
    private L6RecoveryPolicy() { }
    public enum Result { LOCKED_REQUIRE_REAUTH, KEY_UNAVAILABLE_CANNOT_RECOVER, EXPIRED_DELETE,
                         REJECT_CROSS_ACCOUNT, CONFIRM_LOCAL_DRAFT_ONLY }

    public static Result check(boolean sessionValid, boolean localKeyAvailable,
                               boolean ownershipMatches, boolean withinRetention) {
        if (!sessionValid) return Result.LOCKED_REQUIRE_REAUTH;
        if (!localKeyAvailable) return Result.KEY_UNAVAILABLE_CANNOT_RECOVER;
        if (!ownershipMatches) return Result.REJECT_CROSS_ACCOUNT;
        if (!withinRetention) return Result.EXPIRED_DELETE;
        return Result.CONFIRM_LOCAL_DRAFT_ONLY;
    }
}
