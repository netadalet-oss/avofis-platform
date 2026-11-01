import nl.larenlex.app.FeatureMatcher;
public final class FeatureMatcherHarness {
    static int checks=0;
    static void yes(boolean b){if(!b)throw new AssertionError("Failure "+(checks+1));checks++;}
    public static void main(String[] args){
        yes(FeatureMatcher.matches("gizlilik","GİZLİLİK", "privacy"));
        yes(FeatureMatcher.matches("belge","BELGE YÖNETİMİ"));
        yes(FeatureMatcher.matches("lx-06","LX-06.G01.F01"));
        yes(FeatureMatcher.matches("goc","Göç ve IND"));
        yes(FeatureMatcher.matches("avukat","Avukat / noter"));
        yes(FeatureMatcher.matches("ISTANBUL","İstanbul"));
        yes(!FeatureMatcher.matches("","anything"));
        yes(!FeatureMatcher.matches("    ","anything"));
        yes(!FeatureMatcher.matches("fatura","Belgeler","Veri güvenliği"));
        yes(!FeatureMatcher.matches("mahkeme",(String)null,"PDF"));
        System.out.println(checks+" PASS search normalization");
    }
}
