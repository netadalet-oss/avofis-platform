package nl.larenlex.app;

/** Testable session boundary. Real unlock requires an independently configured IdP. */
public final class AppSessionBoundary {
    private boolean locked = true;
    private long generation = 0;
    public boolean canUsePrivateData(){ return !locked; }
    public void onBackground(){ locked = true; generation++; }
    public void onRevoked(){ locked = true; generation++; }
    public long generation(){ return generation; }
    // Never expose a local unlock shortcut in the product: auth provider unavailable.
}
