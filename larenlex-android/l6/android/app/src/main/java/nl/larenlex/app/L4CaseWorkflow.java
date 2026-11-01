package nl.larenlex.app;

/** Synthetic-only L4 intake/matter/evidence transition policy. No real account or server data. */
public final class L4CaseWorkflow {
    public enum State { INTAKE_DRAFT, TRIAGE, MATTER_DRAFT, EVIDENCE_REVIEW, EXPERT_REVIEW, EXAMPLE_EXPORT_READY }
    private State state = State.INTAKE_DRAFT;
    private int version = 0;
    public State getState() { return state; }
    public int getVersion() { return version; }
    public boolean advance(State next, int expectedVersion, boolean sameTenant, boolean ownerOrAssigned,
                           boolean sessionValid, boolean mfaIfStaff, boolean evidenceVerified,
                           boolean legalHumanApproved) {
        if (!sameTenant || !ownerOrAssigned || !sessionValid || !mfaIfStaff || version != expectedVersion) return false;
        if (next == State.TRIAGE && state == State.INTAKE_DRAFT) {
            state = next;
        } else if (next == State.MATTER_DRAFT && state == State.TRIAGE) {
            state = next;
        } else if (next == State.EVIDENCE_REVIEW && state == State.MATTER_DRAFT) {
            state = next;
        } else if (next == State.EXPERT_REVIEW && state == State.EVIDENCE_REVIEW && evidenceVerified) {
            state = next;
        } else if (next == State.EXAMPLE_EXPORT_READY && state == State.EXPERT_REVIEW && legalHumanApproved) {
            state = next;
        } else return false;
        version++;
        return true;
    }
    public boolean officialSubmissionAllowed() { return false; }
    public boolean paymentConfirmed() { return false; }
}
