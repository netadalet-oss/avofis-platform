package nl.larenlex.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Native-only L3 catalog and explicit example document export. NO LIVE API / legal representation. */
public final class MainActivity extends Activity {
    private JSONArray modules;
    private LinearLayout column;
    private int screen = 0;
    private int selectedModule = -1, selectedGroup = -1;
    private static final int CREATE_DOCX = 41, CREATE_PDF = 42;
    private static final int INK = Color.rgb(17, 31, 58), GOLD = Color.rgb(140, 107, 49);
    private String exportTitle = "Sentetik örnek belge";

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        try (InputStream in = getAssets().open("modules.json")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[4096]; int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            modules = new JSONArray(out.toString(StandardCharsets.UTF_8.name()));
            if (modules.length() != 14) throw new IllegalStateException("Source module mismatch");
        } catch (Exception failure) {
            showSourceFailure(); return;
        }
        showHome();
    }
    private void showSourceFailure() {
        TextView error = new TextView(this);
        error.setPadding(24, 48, 24, 48);
        error.setText("Uygulamanın kanonik modül envanteri doğrulanamadı. İşlem yapılamaz.");
        setContentView(error);
    }
    private void surface(String title, String subtitle) {
        ScrollView scroller = new ScrollView(this);
        scroller.setFillViewport(true);
        scroller.setBackgroundColor(Color.rgb(245, 247, 251));
        column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        column.setPadding(dp(18), dp(22), dp(18), dp(34));
        scroller.addView(column);
        setContentView(scroller);
        TextView header = text(title, 25, INK, true);
        column.addView(header);
        column.addView(text(subtitle, 14, Color.DKGRAY, false));
        column.addView(text("GELİŞTİRME ÖNİZLEMESİ · Gerçek dosya, kurum veya sunucu bağlantısı yoktur.", 13, GOLD, true));
    }
    private int dp(int x) { return (int) (x * getResources().getDisplayMetrics().density + .5f); }
    private TextView text(String content, int sp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(content); view.setTextSize(sp); view.setTextColor(color);
        view.setPadding(0, dp(9), 0, dp(9));
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        view.setTextIsSelectable(false);
        return view;
    }
    private void action(String label, Runnable onClick) {
        Button b = new Button(this); b.setText(label); b.setAllCaps(false); b.setTextSize(15);
        b.setMinHeight(dp(48)); b.setContentDescription(label); b.setOnClickListener(v -> onClick.run());
        column.addView(b, new LinearLayout.LayoutParams(-1, -2));
    }
    private JSONObject module(int idx) { return modules.optJSONObject(idx); }
    private JSONArray groups(int idx) { return module(idx).optJSONArray("groups"); }
    private void showHome() {
        screen = 0; selectedModule = -1; selectedGroup = -1;
        surface("LarenLex", "14 ana sistem · 69 alt grup · 453 tanımlı işlev");
        column.addView(text("Bu sürüm yalnız gezinim ve örnek belge üretimini gösterir. Kimlik doğrulama, hukukî tavsiye, ödeme ve gerçek dosya işlemi devre dışıdır.", 15, INK, false));
        for (int i = 0; i < modules.length(); i++) {
            JSONObject m = module(i); final int id = i;
            action(m.optString("id") + " · " + m.optString("title"), () -> showModule(id));
        }
        action("Personel alanları (16 tanım)", this::showStaff);
        action("Veri ve gizlilik sınırları", this::showPrivacy);
    }
    private void showModule(int moduleIndex) {
        selectedModule = moduleIndex; selectedGroup = -1; screen = 1;
        JSONObject mod = module(moduleIndex);
        surface(mod.optString("title"), mod.optString("id") + " · Ana sistem ve alt grupları");
        action("‹ Tüm modüller", this::showHome);
        JSONArray gs = groups(moduleIndex);
        for (int g = 0; g < gs.length(); g++) {
            JSONObject group = gs.optJSONObject(g); final int groupIndex = g;
            action(group.optString("id") + " · " + group.optString("title"), () -> showGroup(moduleIndex, groupIndex));
        }
    }
    private void showGroup(int moduleIndex, int groupIndex) {
        selectedModule = moduleIndex; selectedGroup = groupIndex; screen = 2;
        JSONObject group = groups(moduleIndex).optJSONObject(groupIndex);
        surface(group.optString("title"), "Kaynak işlev kataloğu · Kabul durumu: doğrulanmadı");
        action("‹ Modül", () -> showModule(moduleIndex));
        JSONArray features = group.optJSONArray("features");
        for (int i = 0; i < features.length(); i++) {
            JSONObject f = features.optJSONObject(i);
            String id = f.optString("id"), label = f.optString("title");
            action(id + " · " + label, () -> showFeature(id, label));
        }
    }
    private void showFeature(String featureId, String label) {
        screen = 3;
        surface(label, featureId + " · Tasarım aşaması / gerçek işlev kabul edilmedi");
        action("‹ Alt grup", () -> showGroup(selectedModule, selectedGroup));
        column.addView(text("Bu işlev kaynak envanterinde tanımlıdır; gerçek hesap, başvuru veya sunucu işlemi burada yürütülmez.", 15, INK, false));
        exportTitle = featureId + " — Sentetik örnek taslak";
        action("Örnek DOCX oluştur (kullanıcı dosya seçer)", () -> requestExport(CREATE_DOCX, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "LarenLex-ornek.docx"));
        action("Örnek PDF oluştur (kullanıcı dosya seçer)", () -> requestExport(CREATE_PDF, "application/pdf", "LarenLex-ornek.pdf"));
        column.addView(text("Örnek belge kişisel veri içermez. Resmî hukukî süre veya mahkeme kararı hesaplanmaz. Dışa aktarım yalnız açık kullanıcı seçiminden sonra yapılır.", 13, GOLD, false));
    }
    private void requestExport(int code, String mime, String fileName) {
        Intent chooser = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        chooser.addCategory(Intent.CATEGORY_OPENABLE);
        chooser.setType(mime);
        chooser.putExtra(Intent.EXTRA_TITLE, fileName);
        startActivityForResult(chooser, code);
    }
    @Override protected void onActivityResult(int req, int result, Intent data) {
        super.onActivityResult(req, result, data);
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        if (req != CREATE_DOCX && req != CREATE_PDF) return;
        try (OutputStream out = getContentResolver().openOutputStream(data.getData(), "w")) {
            if (out == null) throw new IllegalStateException("Export stream unavailable");
            if (req == CREATE_DOCX) DraftDocxWriter.writeExample(out, exportTitle);
            else PdfDraftWriter.writeExample(out, exportTitle);
            out.flush();
            column.addView(text("Örnek belge seçtiğiniz konuma yazıldı. Hukukî belge kabulü yoktur.", 14, GOLD, false));
        } catch (Exception e) {
            column.addView(text("Belge dışa aktarımı başarısız. Seçilen hedefi kontrol edin.", 14, Color.RED, false));
        }
    }
    private void showPrivacy() {
        screen = 4; surface("Veri güvenliği", "Yerel geliştirme sürümü · Hizmet açılmadı");
        action("‹ Ana ekran", this::showHome);
        column.addView(text("• Gerçek müşteri veya dosya verisi girilmemelidir.\n• Sunucuya bağlantı ve INTERNET izni bulunmaz.\n• Örnek belge yalnız kullanıcı onayıyla seçilen konuma dışa aktarılır.\n• Uygulama yedeği kapalıdır; ekran yakalama engellenmiştir.\n• Android Keystore modülü hazırlanmıştır ancak gerçek cihaz güvenlik kabulü yapılmamıştır.\n• Tebligat, yasal son süre ve kurum işlemleri uzman doğrulaması gerektirir.", 16, INK, false));
    }
    private void showStaff() {
        screen = 5; surface("Personel çalışma alanları", "16 alan · Rol/MFA bağlı gerçek hizmet henüz açılmadı");
        action("‹ Ana ekran", this::showHome);
        String[] areas = {"Başvuru masası", "Ön inceleme", "Dosyalar", "Takvim / görev", "Belgeler", "Dilekçeler", "Mevzuat / içtihat", "Mahkeme", "Göç / IND", "Yazışmalar", "Faturalar", "Giderler", "Raporlama", "Denetim", "Personel / izin", "Ayarlar"};
        for (String a : areas) column.addView(text("• " + a + " · İşlem kapalı, yetki kabulü bekliyor", 15, INK, false));
    }
    @Override public void onBackPressed() {
        if (screen == 3) showGroup(selectedModule, selectedGroup);
        else if (screen == 2) showModule(selectedModule);
        else showHome();
    }
    @Override protected void onStop() {
        // Do not retain sensitive screen data on task switch. No process-local user auth is represented.
        super.onStop();
        exportTitle = "Sentetik örnek belge";
    }
}
