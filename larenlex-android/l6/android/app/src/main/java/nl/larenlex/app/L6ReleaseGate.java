package nl.larenlex.app;

/** A6/A7 offline readiness verdict; never signs, publishes, or opens network. */
public final class L6ReleaseGate {
    private L6ReleaseGate() { }

    public static final class Evidence {
        public final boolean authenticSource, independentCi, apkBuilt, deviceMatrix;
        public final boolean accessibility, security, rlsAuth, legalReview;
        public final boolean ownerSigningKey, explicitSigningPermission, explicitPublishingPermission;
        public Evidence(boolean authenticSource, boolean independentCi, boolean apkBuilt,
                        boolean deviceMatrix, boolean accessibility, boolean security,
                        boolean rlsAuth, boolean legalReview, boolean ownerSigningKey,
                        boolean explicitSigningPermission, boolean explicitPublishingPermission) {
            this.authenticSource = authenticSource;
            this.independentCi = independentCi;
            this.apkBuilt = apkBuilt;
            this.deviceMatrix = deviceMatrix;
            this.accessibility = accessibility;
            this.security = security;
            this.rlsAuth = rlsAuth;
            this.legalReview = legalReview;
            this.ownerSigningKey = ownerSigningKey;
            this.explicitSigningPermission = explicitSigningPermission;
            this.explicitPublishingPermission = explicitPublishingPermission;
        }
    }

    public enum Decision { BLOCKED, READY_FOR_HUMAN_SIGNING_REVIEW, READY_FOR_HUMAN_PUBLISHING_REVIEW }

    /** Development approval is not a signature or publication approval. */
    public static Decision evaluate(Evidence e) {
        if (e == null || !e.authenticSource || !e.independentCi || !e.apkBuilt ||
            !e.deviceMatrix || !e.accessibility || !e.security || !e.rlsAuth ||
            !e.legalReview || !e.ownerSigningKey || !e.explicitSigningPermission) {
            return Decision.BLOCKED;
        }
        if (!e.explicitPublishingPermission) return Decision.READY_FOR_HUMAN_SIGNING_REVIEW;
        return Decision.READY_FOR_HUMAN_PUBLISHING_REVIEW;
    }
}
