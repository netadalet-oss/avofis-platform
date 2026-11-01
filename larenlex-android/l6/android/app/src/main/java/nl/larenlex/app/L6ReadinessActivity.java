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
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/** All-14-module, offline A6/A7 status. No release, login, payment or institution action. */
public final class L6ReadinessActivity extends Activity {
    private LinearLayout content;
    private int dp(int d) { return (int)(d * getResources().getDisplayMetrics().density + .5f); }
    private void text(String s, int sp, boolean bold) {
        TextView v = new TextView(this);
        v.setText(s); v.setTextSize(sp); v.setTextColor(Color.rgb(26,43,66));
        v.setContentDescription(s); v.setPadding(dp(4),dp(10),dp(4),dp(10));
        if (bold) v.setTypeface(null, 1);
        content.addView(v);
    }
    private String asset(String filename) throws Exception {
        try (InputStream in = getAssets().open(filename); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096]; int count;
            while ((count=in.read(buffer))!=-1) out.write(buffer,0,count);
            return out.toString(StandardCharsets.UTF_8.name());
        }
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        ScrollView scroller = new ScrollView(this); scroller.setFillViewport(true);
        scroller.setBackgroundColor(Color.rgb(247,248,251));
        content = new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(18),dp(20),dp(18),dp(30));
        scroller.addView(content); setContentView(scroller);
        text("LarenLex · A6/A7 hazırlık",24,true);
        text("L6 geliştirme ekranıdır. APK/cihaz, hukukî kabul, imza ve yayın doğrulanmadı.",16,false);
        text("Bu ekrandan üretim API, gerçek kişi verisi, imzalama veya yayın başlatılamaz.",15,true);
        try {
            JSONObject readiness = new JSONObject(asset("l6_readiness.json"));
            JSONArray modules = readiness.getJSONArray("modules");
            if (modules.length()!=14) throw new IllegalStateException("modül sayısı");
            text("Tüm modüller · 14 / 14",20,true);
            for (int i=0; i<modules.length(); i++) {
                JSONObject m=modules.getJSONObject(i);
                text(m.getString("id")+" · "+m.getString("title"),16,true);
                text("Cihaz: "+m.getString("device_test")+" | Güvenlik: "+m.getString("security_acceptance")+
                     " | Hukuk: "+m.getString("legal_acceptance"),13,false);
            }
            text("A6 cihaz test matrisi · kayıtlı fakat yürütülmedi",19,true);
            JSONArray scenarios=readiness.getJSONArray("scenarios");
            for (int i=0; i<scenarios.length(); i++) {
                JSONObject x=scenarios.getJSONObject(i);
                text("• "+x.getString("id")+": "+x.getString("name")+" — "+x.getString("status"),14,false);
            }
        } catch (Exception error) {
            text("Kaynak A6/A7 envanteri yüklenemedi. İşlem kapalı.",17,true);
        }
        Button back=new Button(this);back.setText("‹ Uygulamaya dön"); back.setAllCaps(false);
        back.setMinHeight(dp(48)); back.setContentDescription("Uygulamaya dön");
        back.setOnClickListener((View v)->finish()); content.addView(back);
    }
}
