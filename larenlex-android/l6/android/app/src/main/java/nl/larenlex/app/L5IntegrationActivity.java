package nl.larenlex.app;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;
import org.json.JSONArray;

/** Shows all-module local L5 evidence WITHOUT enabling release network functionality. */
public final class L5IntegrationActivity extends Activity {
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
        ScrollView scroll = new ScrollView(this);
        LinearLayout body = new LinearLayout(this);
        body.setPadding(24,24,24,24);
        body.setOrientation(LinearLayout.VERTICAL);
        scroll.addView(body);setContentView(scroll);
        body.addView(LarenLexBrandHeader.create(this, "LarenLex · L5 entegrasyon ve kanıt", 21));
        append(body,"Çevrimdışı geliştirme ekranı. Canlı sunucu, ödeme, resmî kurum veya kabul yok.",14);
        try (InputStream stream = getAssets().open("l5_integration.json")) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] bytes = new byte[4096];int n;
            while((n=stream.read(bytes))!=-1)output.write(bytes,0,n);
            JSONObject evidence = new JSONObject(output.toString(StandardCharsets.UTF_8.name()));
            JSONArray modules = evidence.getJSONArray("modules");
            if(modules.length()!=14) throw new SecurityException("Incomplete source catalogue");
            for(int i=0;i<modules.length();i++){
                JSONObject item = modules.getJSONObject(i);
                append(body,item.getString("id")+" · "+item.getString("title"),17);
                append(body,"İşlev "+item.getInt("features")+" · sentetik HTTP politikası · gerçek kabul: YOK",13);
            }
            append(body,"453 işlev için yalnız test fixtürü; gerçek bağımsız kabul: 0",15);
        } catch(Exception ex) {
            append(body,"Kaynak ve kanıt doğrulanamadı. İşlem kapalı.",17);
        }
    }
    private void append(LinearLayout container,String value,int sp){
        TextView view=new TextView(this);view.setText(value);view.setTextSize(sp);
        view.setTextColor(Color.rgb(18,32,57));view.setPadding(0,9,0,9);
        container.addView(view);
    }
}
