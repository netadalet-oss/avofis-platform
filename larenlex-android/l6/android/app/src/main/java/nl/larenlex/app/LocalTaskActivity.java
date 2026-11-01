package nl.larenlex.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.UUID;

/** Offline encrypted development task list. No authentication or legal deadline engine. */
public final class LocalTaskActivity extends Activity {
    private EncryptedLocalTaskStore storage;
    private JSONArray tasks;
    private String editId;
    private EditText titleInput, detailInput;
    private LinearLayout root;
    private int dp(int n){return (int)(getResources().getDisplayMetrics().density*n+.5f);}
    private TextView label(String s,int size,boolean bold){
        TextView t=new TextView(this);t.setText(s);t.setTextSize(size);
        t.setTextColor(Color.rgb(24,42,61));
        if(bold)t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        t.setPadding(0,dp(7),0,dp(7));return t;
    }
    private void action(LinearLayout owner,String name,Runnable callback){
        Button b=new Button(this);b.setAllCaps(false);b.setText(name);
        b.setMinHeight(dp(46));b.setContentDescription(name);
        b.setOnClickListener(v->callback.run());owner.addView(b);
    }
    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        storage=new EncryptedLocalTaskStore(this);
        try{tasks=storage.load();render();}
        catch(Exception problem){
            TextView error=label("Şifrelenmiş yerel görev verisi açılamadı. Kayıtların üzerine yazılmayacak.",17,true);
            error.setPadding(dp(22),dp(35),dp(22),dp(24));
            setContentView(error);
        }
    }
    private void persist(){
        try{storage.save(tasks);render();}
        catch(Exception failure){
            Toast.makeText(this,"Yerel kayıt başarısız. Eski şifreli dosya korunur.",Toast.LENGTH_LONG).show();
        }
    }
    private void save(){
        try{
            String title=TaskInputPolicy.title(titleInput.getText().toString());
            String detail=TaskInputPolicy.detail(detailInput.getText().toString());
            if(editId==null && tasks.length()>=100)
                throw new IllegalArgumentException("En fazla 100 görev");
            if(editId==null){
                JSONObject obj=new JSONObject();
                obj.put("id",UUID.randomUUID().toString());
                obj.put("title",title);obj.put("detail",detail);obj.put("complete",false);
                tasks.put(obj);
            }else{
                boolean found=false;
                for(int i=0;i<tasks.length();i++){
                    JSONObject o=tasks.getJSONObject(i);
                    if(o.getString("id").equals(editId)){
                        o.put("title",title);o.put("detail",detail);found=true;break;
                    }
                }
                if(!found)throw new IllegalArgumentException("Görev bulunamadı");
            }
            editId=null;persist();
        }catch(Exception e){
            Toast.makeText(this,"Görev doğrulanamadı: "+e.getMessage(),Toast.LENGTH_LONG).show();
        }
    }
    private void toggle(String id){
        try{
            for(int i=0;i<tasks.length();i++){
                JSONObject o=tasks.getJSONObject(i);
                if(o.getString("id").equals(id)){
                    o.put("complete",!o.getBoolean("complete"));persist();return;
                }
            }
        }catch(Exception e){Toast.makeText(this,"Görev güncellenemedi.",Toast.LENGTH_LONG).show();}
    }
    private void delete(String id){
        new AlertDialog.Builder(this)
            .setTitle("Görevi sil")
            .setMessage("Bu görev yerel şifreli kayıttan silinecek.")
            .setNegativeButton("Vazgeç",null)
            .setPositiveButton("Sil",(dialog,which)->{
                JSONArray next=new JSONArray();
                for(int i=0;i<tasks.length();i++){
                    JSONObject o=tasks.optJSONObject(i);
                    if(o!=null && !id.equals(o.optString("id")))next.put(o);
                }
                tasks=next;editId=null;persist();
            }).show();
    }
    private void beginEdit(String id){
        try{
            for(int i=0;i<tasks.length();i++){
                JSONObject o=tasks.getJSONObject(i);
                if(o.getString("id").equals(id)){
                    editId=id;render();
                    titleInput.setText(o.getString("title"));
                    detailInput.setText(o.getString("detail"));
                    titleInput.requestFocus();
                    return;
                }
            }
        }catch(Exception e){Toast.makeText(this,"Görev açılamadı.",Toast.LENGTH_LONG).show();}
    }
    private void render(){
        ScrollView scroll=new ScrollView(this);
        scroll.setBackgroundColor(Color.rgb(244,247,250));
        root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18),dp(20),dp(18),dp(32));
        scroll.addView(root);setContentView(scroll);
        root.addView(LarenLexBrandHeader.create(this,"Yerel görevler",23));
        root.addView(label("Cihaz içinde AES-GCM ile şifrelenmiş görev listesi.",15,false));
        root.addView(label("Bu geliştirme alanında gerçek müşteri verisi veya hukukî süre kaydetmeyin.",13,true));
        root.addView(label(editId==null?"Yeni görev":"Görevi düzenle",20,true));
        titleInput=new EditText(this);titleInput.setHint("Görev başlığı");
        titleInput.setSingleLine(true);titleInput.setContentDescription("Görev başlığı");
        titleInput.setFilters(new android.text.InputFilter[]{
            new android.text.InputFilter.LengthFilter(120)});
        root.addView(titleInput);
        detailInput=new EditText(this);detailInput.setHint("Açıklama (isteğe bağlı)");
        detailInput.setMinLines(3);detailInput.setGravity(Gravity.TOP);
        detailInput.setContentDescription("Görev açıklaması");
        detailInput.setFilters(new android.text.InputFilter[]{
            new android.text.InputFilter.LengthFilter(1200)});
        root.addView(detailInput);
        action(root,editId==null?"Görev ekle":"Değişiklikleri kaydet",this::save);
        if(editId!=null)action(root,"Düzenlemeyi iptal et",()->{editId=null;render();});
        int completed=0;
        for(int i=0;i<tasks.length();i++)
            if(tasks.optJSONObject(i).optBoolean("complete"))completed++;
        root.addView(label("Görevler  •  "+(tasks.length()-completed)+" açık  /  "+completed+" tamamlanan",19,true));
        if(tasks.length()==0)root.addView(label("Henüz görev yok.",15,false));
        for(int i=0;i<tasks.length();i++){
            JSONObject o=tasks.optJSONObject(i);
            String id=o.optString("id");
            boolean done=o.optBoolean("complete");
            LinearLayout item=new LinearLayout(this);
            item.setOrientation(LinearLayout.VERTICAL);
            item.setPadding(dp(13),dp(9),dp(13),dp(12));
            android.graphics.drawable.GradientDrawable panel=new android.graphics.drawable.GradientDrawable();
            panel.setColor(Color.WHITE);panel.setCornerRadius(dp(15));
            panel.setStroke(dp(1),Color.rgb(224,230,236));
            item.setBackground(panel);
            LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);
            p.bottomMargin=dp(10);root.addView(item,p);
            item.addView(label((done?"✓  ":"○  ")+o.optString("title"),16,true));
            if(!o.optString("detail").isEmpty())item.addView(label(o.optString("detail"),13,false));
            action(item,done?"Tekrar aç":"Tamamlandı olarak işaretle",()->toggle(id));
            action(item,"Düzenle",()->beginEdit(id));
            action(item,"Sil",()->delete(id));
        }
    }
}
