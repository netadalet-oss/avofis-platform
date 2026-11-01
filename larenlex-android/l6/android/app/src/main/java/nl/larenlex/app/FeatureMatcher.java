package nl.larenlex.app;

import java.text.Normalizer;
import java.util.Locale;

/** Accent-insensitive catalogue search, preserving canonical IDs in storage. */
public final class FeatureMatcher {
    private FeatureMatcher() {}
    private static String key(String text) {
        if(text == null) return "";
        String lowered = text.toLowerCase(Locale.ROOT).replace('\u0131','i');
        String decomposed = Normalizer.normalize(lowered,Normalizer.Form.NFD);
        StringBuilder out = new StringBuilder(decomposed.length());
        for(int i=0;i<decomposed.length();i++){
            char c=decomposed.charAt(i);
            if(Character.getType(c)!=Character.NON_SPACING_MARK)
                out.append(c);
        }
        return out.toString().trim();
    }
    public static boolean matches(String query,String... haystack) {
        String wanted=key(query);
        if(wanted.isEmpty())return false;
        for(String item:haystack)
            if(key(item).contains(wanted))return true;
        return false;
    }
}
