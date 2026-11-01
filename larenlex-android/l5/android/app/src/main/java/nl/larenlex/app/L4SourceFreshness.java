package nl.larenlex.app;

import java.time.LocalDate;
/** Offline published-source acceptability guard. Prevents stale/unapproved legal guidance. */
public final class L4SourceFreshness {
    private L4SourceFreshness() {}
    public static boolean mayClaimCurrent(String country, String expectedCountry, String sourceUrl,
                                         LocalDate checkedOn, LocalDate expiresOn,
                                         LocalDate currentDate, boolean humanLegalApproved) {
        if (country == null || !country.equals(expectedCountry) || sourceUrl == null ||
            !sourceUrl.startsWith("https://") || checkedOn == null || expiresOn == null || currentDate == null)
            return false;
        return humanLegalApproved && !checkedOn.isAfter(currentDate) && !expiresOn.isBefore(currentDate);
    }
}
