package nl.larenlex.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/** L4 whole-product OFFLINE catalogue: no network, customer data, payments, external submissions. */
public final class L4LegalFlowsActivity extends Activity {
    private static final int INK=Color.rgb(22,36,57), GOLD=Color.rgb(142,109,55);
    private JSONObject catalog;
    private LinearLayout list;
    private String language="tr";
    private String section="home";
    private boolean openedDetail=false;
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        try (InputStream in=getAssets().open("l4_legal_catalog.json")) {
            ByteArrayOutputStream bytes=new ByteArrayOutputStream();
            byte[] b=new byte[4096]; int n;
            while((n=in.read(b))!=-1) bytes.write(b,0,n);
            catalog=new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
            if(catalog.getJSONArray("modules").length()!=14 || catalog.getJSONArray("services").length()!=17)
                throw new IllegalStateException("Incorrect source inventory");
            home();
        } catch (Exception e) {
            TextView error=new TextView(this);
            error.setText("Kanonik L4 katalog yüklenemedi; tüm işlemler kapatıldı.");
            error.setPadding(24,48,24,24);
            setContentView(error);
        }
    }
    private int px(int dp){return Math.round(dp*getResources().getDisplayMetrics().density);}
    private String label(String key) {
        return catalog.optJSONObject("ui_translations_unreviewed").optJSONObject(language).optString(key,key);
    }
    private void surface(String title, String detail) {
        ScrollView s=new ScrollView(this);s.setFillViewport(true);
        s.setBackgroundColor(Color.rgb(247,248,251));
        list=new LinearLayout(this);list.setOrientation(LinearLayout.VERTICAL);
        list.setPadding(px(16),px(18),px(16),px(30));
        list.setLayoutDirection("ar".equals(language)? View.LAYOUT_DIRECTION_RTL:View.LAYOUT_DIRECTION_LTR);
        s.addView(list); setContentView(s);
        text(title,24,true,INK);text(detail,14,false,INK);
        text(label("preview")+" · Kaynak ve hukukî/çeviri onayı bekliyor.",13,true,GOLD);
    }
    private void text(String str,int sp,boolean bold,int color) {
        TextView v=new TextView(this);v.setText(str);v.setTextSize(sp);v.setTextColor(color);
        v.setPadding(0,px(8),0,px(8));
        if(bold)v.setTypeface(null,1);
        list.addView(v,new LinearLayout.LayoutParams(-1,-2));
    }
    private void action(String title,Runnable handler) {
        Button b=new Button(this);b.setText(title);b.setAllCaps(false);
        b.setMinHeight(px(48));b.setContentDescription(title);
        b.setOnClickListener(v->handler.run());
        list.addView(b,new LinearLayout.LayoutParams(-1,-2));
    }
    private void back(){action("‹ "+label("back"),this::home);}
    private void home(){section="home";openedDetail=false;
        surface("LarenLex Android L4", "14 modül / 17 hizmet / 14 kitle / 12 kaynak bekleyen sorun rotası / 6 dil");
        for(String code:new String[]{"tr","nl","de","en","ar","ru"})
            action("Dil / Language: "+code.toUpperCase(),()->{language=code;home();});
        for(String category:new String[]{"modules","services","audiences","issues","guides","staff","documents","institutions","privacy"})
            action(label(category.equals("modules")?"module":category),()->category(category));
    }
    private void category(String name){section=name;openedDetail=false;
        surface(label(name.equals("modules")?"module":name),label("review")); back();
        if(name.equals("documents")){showDocument();return;}
        if(name.equals("privacy")){text("Kişisel veri toplama, DSAR, resmî gönderim, ödeme ve kurum bağlantıları devre dışıdır.",16,false,INK);return;}
        if(name.equals("guides")){
            for(String type:new String[]{"guides","corporate_pages","document_lists"}) {
                JSONArray a=catalog.optJSONObject("content").optJSONArray(type);
                text(type+" · "+a.length()+" kayıt yeri (özgün başlık ve URL bekliyor)",16,true,INK);
            }
            return;
        }
        if(name.equals("institutions")){
            for(String type:new String[]{"ind_procedures","ind_gates","judicial_tasks","institutions"})
                showItems(type,catalog.optJSONArray(type));
            return;
        }
        showItems(name,catalog.optJSONArray(name.equals("modules")?"modules":name.equals("issues")?"issue_routes":name));
    }
    private void showItems(String type,JSONArray items){
        if(items==null) return;
        text(type+" · "+items.length(),15,true,GOLD);
        for(int i=0;i<items.length();i++){
            JSONObject item=items.optJSONObject(i);
            final JSONObject current=item;
            String name=item.optString("title_tr",item.optString("title",item.optString("name",item.optString("id","Kaynak kimliği bekliyor"))));
            if(name==null || name.isEmpty()) name="Özgün kayıt bekleniyor / #"+(i+1);
            String code=item.optString("id",item.optString("slot",String.valueOf(i+1)));
            action(code+" · "+name,()->showDetail(type,current));
        }
    }
    private void showDetail(String type,JSONObject item){openedDetail=true;
        surface(item.optString("title_tr",item.optString("title",item.optString("id","Bilgi"))),
                "Yalnız kaynak kataloğu / işlem bağlantısı kapalı");
        action("‹ "+label("back"),()->category(section));
        if(type.equals("services")){
            text("Kaynak: "+item.optString("id")+" · Hukukî rol/yetki/ülke/uzman/ücret: doğrulanmadı",15,false,INK);
            text("Hizmet türü yayınlanmış veya sözleşme kabul edilmiş değildir.",15,true,GOLD);
        } else if(type.equals("audiences")){
            text("Kitle–hizmet çapraz bağlantıları ancak kanonik kaynakla onaylanınca açılır.",15,false,INK);
        } else if(type.equals("issue_routes")){
            text("Özgün 12 sorun rotasının başlık/slug kaydı henüz sağlanmadı; tahmin yapılmadı.",15,false,INK);
        } else if(type.equals("staff")){
            text("Rol, MFA ve matter atanması olmadığı için okuma/yazma kapalıdır.",15,false,INK);
        } else if(type.equals("ind_procedures")){
            text("G1–G4, müşteri yazılı yetkisi ve bağımsız uzman onayı gerektirir. Resmî gönderim yoktur.",15,false,INK);
        } else if(type.equals("institutions")){
            text("Resmî kaynak: "+item.optString("url","Doğrulama bekliyor"),14,false,INK);
            text("Haricî bağlantı uygulama içinde otomatik açılmaz.",13,false,GOLD);
        } else if(type.equals("modules")){
            JSONArray groups=item.optJSONArray("groups");
            if(groups!=null)for(int i=0;i<groups.length();i++) {
                JSONObject group=groups.optJSONObject(i);
                text(group.optString("id")+" · "+group.optString("title")+" ("+group.optJSONArray("features").length()+" işlev)",14,false,INK);
            }
        }
        text(label("blocked")+" · Bağımsız teknik/hukukî kabul yok.",14,true,GOLD);
    }
    private void showDocument(){
        text("Taslak → uzman incelemesi → ancak insan onaylı örnek dışa aktarım",16,true,INK);
        text("Ülke, merci, konu, gerekli deliller, kaynak sürümü ve sorumlu uzman bilinmeden belge tamam sayılmaz.",15,false,INK);
        text("Resmî gönderim, e-imza ve gerçek kurum makbuzu kesinlikle kapalıdır.",15,false,GOLD);
    }
    @Override public void onBackPressed(){if(openedDetail)category(section);else home();}
}
