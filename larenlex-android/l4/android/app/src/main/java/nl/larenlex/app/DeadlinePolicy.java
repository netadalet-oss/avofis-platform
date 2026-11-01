package nl.larenlex.app;

/** Date labels have no legal effect; does not calculate a statutory deadline. */
public final class DeadlinePolicy {
    private DeadlinePolicy() { }
    public static String reminderOnly(String isoDate) {
        if(isoDate==null || !isoDate.matches("\\d{4}-\\d{2}-\\d{2}")) throw new IllegalArgumentException("ISO date required");
        java.time.LocalDate.parse(isoDate);
        return isoDate + " · kişisel hatırlatma; resmî tebligat veya kanunî son gün değildir";
    }
}
