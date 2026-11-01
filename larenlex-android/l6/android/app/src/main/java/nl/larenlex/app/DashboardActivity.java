package nl.larenlex.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/** LarenLex native navigation. Navigation does not mean domain implementation/acceptance. */
public final class DashboardActivity extends Activity {
    private static final int NAVY = Color.rgb(20,39,63);
    private static final int NAVY_2 = Color.rgb(32,58,86);
    private static final int GOLD = Color.rgb(174,135,66);
    private static final int BG = Color.rgb(244,247,250);
    private static final int TEXT = Color.rgb(23,42,63);
    private static final int MUTED = Color.rgb(92,109,126);
    private static final int BORDER = Color.rgb(224,230,236);
    private static final int WHITE = Color.WHITE;
    private static final int MAX_RESULTS = 40;
    private JSONArray modules;
    private LinearLayout body;
    private LinearLayout searchResults;
    private int screen = 0, modulePos = -1, groupPos = -1, featurePos = -1;
    private SharedPreferences preferences;

    private int d(int n) {
        return (int)(getResources().getDisplayMetrics().density * n + .5f);
    }
    private GradientDrawable bg(int fill, int border, int radius) {
        GradientDrawable shape = new GradientDrawable();
        shape.setColor(fill);
        shape.setCornerRadius(d(radius));
        if (border != 0) shape.setStroke(d(1), border);
        return shape;
    }
    private TextView label(String value, int sp, int color, boolean strong) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(sp);
        t.setTextColor(color);
        t.setIncludeFontPadding(true);
        if (strong) t.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return t;
    }
    private LinearLayout vertical() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }
    private void addSpace(LinearLayout target, int height) {
        View gap = new View(this);
        target.addView(gap,new LinearLayout.LayoutParams(1,d(height)));
    }
    private void smallLabel(String title) {
        TextView tag = label(title,12,GOLD,true);
        tag.setLetterSpacing(.07f);
        body.addView(tag);
        addSpace(body,10);
    }
    private void section(String title, String description) {
        addSpace(body,22);
        body.addView(label(title,20,TEXT,true));
        if(description != null && !description.isEmpty()) {
            addSpace(body,5);
            body.addView(label(description,13,MUTED,false));
        }
        addSpace(body,10);
    }
    private void card(LinearLayout destination, String tag, String title, String detail, Runnable open) {
        LinearLayout box = vertical();
        box.setPadding(d(17),d(15),d(17),d(15));
        box.setBackground(bg(WHITE,BORDER,16));
        box.setElevation(d(1));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1,-2);
        params.bottomMargin=d(10);
        destination.addView(box,params);
        if(tag!=null && !tag.isEmpty()) {
            TextView t=label(tag,11,GOLD,true);
            t.setLetterSpacing(.07f);
            box.addView(t);
            addSpace(box,4);
        }
        box.addView(label(title,16,TEXT,true));
        if(detail!=null && !detail.isEmpty()) {
            addSpace(box,6);
            box.addView(label(detail,13,MUTED,false));
        }
        box.setContentDescription(title + ". " + (detail==null?"":detail));
        box.setFocusable(true);
        if(open!=null) box.setOnClickListener(v->open.run());
    }
    private void openActivity(Class<?> klass) {
        startActivity(new Intent(this,klass));
    }
    private JSONObject obj(JSONArray array,int i) {
        return array.optJSONObject(i);
    }
    private JSONArray groups(int module) {
        return obj(modules,module).optJSONArray("groups");
    }
    private JSONArray features(int module,int group) {
        return obj(groups(module),group).optJSONArray("features");
    }
    private void frame(String section, String title, String description, Runnable back) {
        ScrollView scroll=new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);
        body=vertical();
        body.setPadding(d(18),d(20),d(18),d(42));
        scroll.addView(body);
        setContentView(scroll);
        LinearLayout brand = new LinearLayout(this);
        brand.setGravity(Gravity.CENTER_VERTICAL);
        ImageView logo=new ImageView(this);
        logo.setImageResource(R.drawable.larenlex_brand_mark);
        logo.setContentDescription("LarenLex");
        brand.addView(logo,new LinearLayout.LayoutParams(d(46),d(46)));
        LinearLayout names=vertical();
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-2,1);
        p.leftMargin=d(11);
        brand.addView(names,p);
        names.addView(label("LARENLEX",18,NAVY,true));
        names.addView(label("ANDROID  ·  ÇALIŞMA ALANI",10,GOLD,true));
        body.addView(brand);
        addSpace(body,24);
        if(back!=null) {
            TextView btn=label("‹  Geri",14,GOLD,true);
            btn.setPadding(d(3),d(7),d(3),d(12));
            btn.setContentDescription("Önceki ekrana dön");
            btn.setOnClickListener(v->back.run());
            body.addView(btn);
        }
        if(section!=null && !section.isEmpty()) smallLabel(section);
        body.addView(label(title,27,NAVY,true));
        addSpace(body,7);
        body.addView(label(description,14,MUTED,false));
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        getWindow().setStatusBarColor(NAVY);
        getWindow().setNavigationBarColor(NAVY);
        preferences=getSharedPreferences("larenlex_navigation_v1",MODE_PRIVATE);
        try(InputStream source=getAssets().open("modules.json");
            ByteArrayOutputStream bytes=new ByteArrayOutputStream()) {
            byte[] buffer=new byte[4096]; int n;
            while((n=source.read(buffer))!=-1) bytes.write(buffer,0,n);
            modules=new JSONArray(bytes.toString(StandardCharsets.UTF_8.name()));
            int groupCount=0,featureCount=0;
            Set<String> unique=new HashSet<>();
            for(int m=0;m<modules.length();m++) {
                JSONArray groups=groups(m);
                for(int g=0;g<groups.length();g++) {
                    groupCount++;
                    JSONArray features=features(m,g);
                    for(int f=0;f<features.length();f++) {
                        featureCount++;
                        if(!unique.add(obj(features,f).optString("id")))
                            throw new IllegalStateException("Duplicate feature");
                    }
                }
            }
            if(modules.length()!=14 || groupCount!=69 || featureCount!=453)
                throw new IllegalStateException("Incomplete canonical catalogue");
            home();
        } catch(Exception failure) {
            TextView error=label("Kanonik katalog doğrulanamadı. İşlemler güvenli biçimde kapatıldı.",17,NAVY,true);
            error.setPadding(d(24),d(45),d(24),d(24));
            setContentView(error);
        }
    }
    private void home() {
        screen=0; modulePos=groupPos=featurePos=-1;
        frame("BAŞLANGIÇ","Hukuk iş akışlarınız için",
                "Modülleri keşfedin, kaynak kataloğunda arayın ve belge hazırlayın.",null);
        addSpace(body,20);
        LinearLayout hero=vertical();
        hero.setPadding(d(21),d(22),d(21),d(22));
        hero.setBackground(bg(NAVY,0,20));
        body.addView(hero);
        hero.addView(label("ARENANIZ. DÜZENİNİZ.",11,GOLD,true));
        addSpace(hero,9);
        hero.addView(label("LarenLex çalışma alanı",23,WHITE,true));
        addSpace(hero,8);
        hero.addView(label("14 sistem · 69 alt grup · 453 kaynak gereksinimi",14,Color.rgb(221,230,237),false));
        addSpace(hero,12);
        hero.addView(label("Geliştirme sürümü: gerçek müşteri kayıtları ve canlı kurum bağlantıları kapalıdır.",12,Color.rgb(244,210,145),false));

        section("Hızlı erişim","Doğrudan kullanılabilir yerel araçlar");
        card(body,"BELGE","PDF / DOCX düzenleyici",
                "Metin yazın ve seçtiğiniz konuma dışa aktarın.",
                ()->openActivity(DocumentComposerActivity.class));
        card(body,"YEREL GÖREVLER","Şifreli görev listesi",
                "Görev ekleyin, düzenleyin, tamamlayın veya silin.",
                ()->openActivity(LocalTaskActivity.class));
        card(body,"KİŞİSELLEŞTİRME","Kaydedilen işlevler",
                "Yalnız katalog kimlikleri cihazda saklanır.",this::favorites);
        section("Tüm işlevlerde arayın","Modül, alt grup, başlık veya LX kimliği");
        EditText search=new EditText(this);
        search.setSingleLine(true);
        search.setTextSize(16);
        search.setHint("Örnek: belge, gizlilik, LX-06...");
        search.setContentDescription("453 işlevin kataloğunda ara");
        search.setPadding(d(16),d(12),d(16),d(12));
        search.setBackground(bg(WHITE,BORDER,14));
        body.addView(search,new LinearLayout.LayoutParams(-1,d(54)));
        addSpace(body,12);
        searchResults=vertical();
        body.addView(searchResults);
        search.addTextChangedListener(new TextWatcher(){
            @Override public void beforeTextChanged(CharSequence s,int start,int count,int after){}
            @Override public void onTextChanged(CharSequence s,int start,int before,int count){
                updateSearch(s.toString());
            }
            @Override public void afterTextChanged(Editable s){}
        });
        section("14 ana sistem","Kanonik kapsam; uygulama kabulü ile karıştırılmamalıdır");
        for(int m=0;m<modules.length();m++) {
            final int index=m;
            JSONObject item=obj(modules,m);
            JSONArray groups=item.optJSONArray("groups");
            int n=0;
            for(int g=0;g<groups.length();g++)
                n+=obj(groups,g).optJSONArray("features").length();
            card(body,item.optString("id"),item.optString("title"),
                    groups.length()+" alt grup · "+n+" tanımlı işlev",
                    ()->module(index));
        }
        section("Diğer bölümler","Geliştirme ve kaynak durumları");
        card(body,null,"Hizmetler, diller ve hukukî rotalar",
                "Çevrimdışı L4 kaynak ekranı",()->openActivity(L4LegalFlowsActivity.class));
        card(body,null,"Entegrasyon ve güvenlik kayıtları",
                "L5 doğrulama ekranı",()->openActivity(L5IntegrationActivity.class));
        card(body,null,"Cihaz ve yayın hazırlığı",
                "L6 açık test ve kabul koşulları",()->openActivity(L6ReadinessActivity.class));
    }
    private void updateSearch(String query) {
        if(searchResults==null || modules==null)return;
        searchResults.removeAllViews();
        if(query.trim().isEmpty())return;
        int matched=0,shown=0;
        for(int m=0;m<modules.length();m++){
            JSONObject mod=obj(modules,m);
            JSONArray all=groups(m);
            for(int g=0;g<all.length();g++){
                JSONObject grp=obj(all,g);
                JSONArray fs=features(m,g);
                for(int f=0;f<fs.length();f++){
                    JSONObject feature=obj(fs,f);
                    if(!FeatureMatcher.matches(query,feature.optString("id"),
                            feature.optString("title"),grp.optString("title"),mod.optString("title")))
                        continue;
                    matched++;
                    if(shown++ >= MAX_RESULTS) continue;
                    final int mi=m,gi=g,fi=f;
                    card(searchResults,feature.optString("id"),feature.optString("title"),
                            mod.optString("id")+"  ·  "+grp.optString("title"),
                            ()->feature(mi,gi,fi));
                }
            }
        }
        TextView count=label(matched==0?"Sonuç bulunamadı":
                matched+" eşleşme"+(matched>MAX_RESULTS?" · ilk 40 gösteriliyor":""),13,MUTED,false);
        searchResults.addView(count,0);
        addSpace(searchResults,10);
    }
    private void module(int m) {
        screen=1;modulePos=m;groupPos=featurePos=-1;
        JSONObject mod=obj(modules,m);
        JSONArray gs=groups(m);
        frame(mod.optString("id"),mod.optString("title"),
                gs.length()+" alt grup · kaynak işlev kataloğu",this::home);
        section("Alt gruplar",null);
        for(int g=0;g<gs.length();g++) {
            final int index=g;
            JSONObject group=obj(gs,g);
            card(body,group.optString("id"),group.optString("title"),
                    group.optJSONArray("features").length()+" işlev",
                    ()->group(m,index));
        }
    }
    private void group(int m,int g) {
        screen=2;modulePos=m;groupPos=g;featurePos=-1;
        JSONObject grp=obj(groups(m),g);
        JSONArray fs=features(m,g);
        frame(grp.optString("id"),grp.optString("title"),
                fs.length()+" kayıt · kaynak tanımı, bağımsız kabul değildir",()->module(m));
        section("İşlev kataloğu",null);
        for(int f=0;f<fs.length();f++){
            final int index=f;
            JSONObject record=obj(fs,f);
            card(body,record.optString("id"),record.optString("title"),
                    "İnceleme / uygulama kabulü bekliyor",()->feature(m,g,index));
        }
    }
    private Set<String> bookmarks() {
        return new HashSet<>(preferences.getStringSet("saved_feature_ids",new HashSet<>()));
    }
    private void toggle(String id) {
        Set<String> saved=bookmarks();
        if(!saved.add(id))saved.remove(id);
        preferences.edit().putStringSet("saved_feature_ids",saved).apply();
        feature(modulePos,groupPos,featurePos);
    }
    private void feature(int m,int g,int f) {
        screen=3;modulePos=m;groupPos=g;featurePos=f;
        JSONObject record=obj(features(m,g),f);
        String id=record.optString("id");
        frame(id,record.optString("title"),
                obj(modules,m).optString("title")+" / "+obj(groups(m),g).optString("title"),
                ()->group(m,g));
        section("İşlev durumu",null);
        card(body,"KAPSAM","Kaynakta tanımlı",
                "Bu işlevin bağımsız teknik ve hukukî kabulü bulunmuyor.",null);
        card(body,"KATALOG",bookmarks().contains(id)?"Kaydedilenlerden çıkar":"İşlevi kaydet",
                "Kaydedilen işlevler cihazın yerel tercihleriyle tutulur.",
                ()->toggle(id));
        card(body,"ARAÇ","Belge düzenleyicisini aç",
                "Bağımsız yerel belge aracı; bu işlevin uygulandığı anlamına gelmez.",
                ()->openActivity(DocumentComposerActivity.class));
    }
    private void favorites() {
        screen=4;modulePos=groupPos=featurePos=-1;
        frame("KAYDEDİLENLER","Kaydedilen işlevler",
                "Kişisel dosya bilgisi değil, yalnız LX kimlikleri saklanır.",this::home);
        Set<String> saved=bookmarks();
        int count=0;
        for(int m=0;m<modules.length();m++)
            for(int g=0;g<groups(m).length();g++)
                for(int f=0;f<features(m,g).length();f++){
                    JSONObject feature=obj(features(m,g),f);
                    if(!saved.contains(feature.optString("id")))continue;
                    count++;
                    final int mi=m,gi=g,fi=f;
                    card(body,feature.optString("id"),feature.optString("title"),
                            obj(modules,m).optString("title"),()->feature(mi,gi,fi));
                }
        if(count==0){
            section("Henüz kayıt yok","Bir işlevin ayrıntısından kaydedebilirsiniz.");
        }
    }
    @Override public void onBackPressed() {
        if(screen==3)group(modulePos,groupPos);
        else if(screen==2)module(modulePos);
        else home();
    }
}
