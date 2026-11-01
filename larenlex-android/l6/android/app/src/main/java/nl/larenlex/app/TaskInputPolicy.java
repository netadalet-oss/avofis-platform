package nl.larenlex.app;

/** Bounded, synthetic local-task input policy (no legal deadline calculation). */
public final class TaskInputPolicy {
    private TaskInputPolicy() {}
    public static String title(String raw) { return check(raw,120,true); }
    public static String detail(String raw) { return check(raw,1200,false); }

    private static String check(String raw,int max,boolean required) {
        if(raw==null || raw.length()>max) throw new IllegalArgumentException("Metin çok uzun");
        if(required && raw.trim().isEmpty()) throw new IllegalArgumentException("Başlık gerekli");
        for(int i=0;i<raw.length();) {
            char ch=raw.charAt(i);
            int cp=raw.codePointAt(i);
            int width=Character.charCount(cp);
            if(Character.isSurrogate(ch) && width==1)
                throw new IllegalArgumentException("Geçersiz Unicode");
            if(cp==0 || cp==0xFFFE || cp==0xFFFF ||
                (cp<32 && cp!='\t' && cp!='\n') || (cp>=0x7f && cp<=0x9f))
                throw new IllegalArgumentException("Geçersiz karakter");
            i+=width;
        }
        return raw;
    }
}
