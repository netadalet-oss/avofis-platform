package nl.larenlex.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.InputFilter;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.io.OutputStream;

/** Offline document editor: no network, no privileged file access, no legal templates. */
public final class DocumentComposerActivity extends Activity {
    private static final int DOCX = 81, PDF = 82;
    private EditText titleField, bodyField;
    private DocumentDraft pending;
    private int pendingFormat;

    private int dp(int n) { return (int)(n * getResources().getDisplayMetrics().density + .5f); }
    private TextView text(String value, int size) {
        TextView t = new TextView(this); t.setText(value); t.setTextSize(size);
        t.setTextColor(Color.rgb(25, 46, 65)); t.setPadding(0, dp(8), 0, dp(8));
        return t;
    }
    private void button(LinearLayout panel, String caption, Runnable task) {
        Button b = new Button(this); b.setText(caption); b.setAllCaps(false);
        b.setContentDescription(caption); b.setMinHeight(dp(48));
        b.setOnClickListener(v -> task.run()); panel.addView(b);
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true); scroll.setBackgroundColor(Color.rgb(245,247,251));
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(18),dp(20),dp(18),dp(28));
        scroll.addView(panel); setContentView(scroll);
        panel.addView(LarenLexBrandHeader.create(this, "Belge düzenleyici", 23));
        panel.addView(text("Çevrimdışı metin düzenleme ve kullanıcı seçimiyle PDF/DOCX kaydı.",15));
        panel.addView(text("Hukukî şablon veya kurum gönderimi değildir. Gerçek müşteri verisi girmeyin.",13));
        titleField = new EditText(this);
        titleField.setHint("Belge başlığı");
        titleField.setSingleLine(true);
        titleField.setFilters(new InputFilter[]{new InputFilter.LengthFilter(DocumentDraft.MAX_TITLE)});
        titleField.setContentDescription("Belge başlığı");
        titleField.setText("Yeni belge");
        panel.addView(titleField, new LinearLayout.LayoutParams(-1,-2));
        bodyField = new EditText(this);
        bodyField.setHint("Belge metnini yazın...");
        bodyField.setGravity(Gravity.TOP | Gravity.START);
        bodyField.setMinLines(12);
        bodyField.setInputType(android.text.InputType.TYPE_CLASS_TEXT |
                android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE |
                android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        bodyField.setFilters(new InputFilter[]{new InputFilter.LengthFilter(DocumentDraft.MAX_BODY)});
        bodyField.setContentDescription("Belge metni");
        panel.addView(bodyField, new LinearLayout.LayoutParams(-1,-2));
        button(panel, "DOCX olarak kaydet", () -> request(DOCX));
        button(panel, "PDF olarak kaydet", () -> request(PDF));
        button(panel, "Kapat (kaydedilmeyen metin silinir)", this::finish);
    }
    private void request(int format) {
        try {
            pending = new DocumentDraft(titleField.getText().toString(), bodyField.getText().toString());
        } catch (IllegalArgumentException problem) {
            Toast.makeText(this, "Geçerli başlık ve metin girin: " + problem.getMessage(), Toast.LENGTH_LONG).show();
            return;
        }
        pendingFormat = format;
        String mime = format == DOCX ?
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/pdf";
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, format == DOCX ? "LarenLex-taslak.docx" : "LarenLex-taslak.pdf");
        startActivityForResult(intent, format);
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if (request != DOCX && request != PDF) return;
        // Never reuse a prior pending draft after one Save As action, even on cancellation.
        DocumentDraft snapshot = pending;
        int authorized = pendingFormat;
        pending = null; pendingFormat = 0;
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        if (snapshot == null || authorized != request) {
            Toast.makeText(this,"Belge durumu değişti; işlem iptal edildi.",Toast.LENGTH_LONG).show();
            return;
        }
        try (OutputStream stream = getContentResolver().openOutputStream(data.getData(),"w")) {
            if (stream == null) throw new IllegalStateException("Dosya akışı açılamadı");
            if (request == DOCX) DraftDocxWriter.write(stream,snapshot);
            else PdfDraftWriter.write(stream,snapshot);
            stream.flush();
            Toast.makeText(this,"Belge seçtiğiniz konuma kaydedildi.",Toast.LENGTH_LONG).show();
        } catch (Exception failure) {
            Toast.makeText(this,"Kaydetme başarısız. Dosya konumunu kontrol edin.",Toast.LENGTH_LONG).show();
        }
    }
    @Override protected void onDestroy() {
        pending = null;
        super.onDestroy();
    }
}
