package nl.larenlex.app;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import java.io.IOException;
import java.io.OutputStream;

/** User-authored, offline, multipage A4 PDF; caller selects and owns SAF destination. */
public final class PdfDraftWriter {
    private static final int PAGE_W = 595, PAGE_H = 842, MARGIN = 46, BOTTOM = 780;
    private PdfDraftWriter() { }

    private static final class Painter {
        final PdfDocument pdf;
        final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        PdfDocument.Page page;
        Canvas canvas;
        float y;
        int pageNo;
        Painter(PdfDocument pdf) { this.pdf = pdf; paint.setColor(Color.rgb(24, 41, 63)); }
        void start() {
            if (page != null) pdf.finishPage(page);
            if (++pageNo > 36) throw new IllegalArgumentException("Belge sayfa sınırı aşıldı");
            page = pdf.startPage(new PdfDocument.PageInfo.Builder(PAGE_W, PAGE_H, pageNo).create());
            canvas = page.getCanvas();
            y = 62;
            paint.setTextSize(11);
            paint.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
            canvas.drawText("LarenLex • Kullanıcı taslağı", MARGIN, 30, paint);
            canvas.drawText(String.valueOf(pageNo), PAGE_W-MARGIN-20, PAGE_H-29, paint);
        }
        void print(String source, float sp, boolean bold, float leading) {
            if (page == null) start();
            paint.setTextSize(sp);
            paint.setTypeface(Typeface.create("sans-serif", bold ? Typeface.BOLD : Typeface.NORMAL));
            if (source.length() == 0) { y += leading; return; }
            String remaining = source;
            final float width = PAGE_W - 2 * MARGIN;
            while (!remaining.isEmpty()) {
                if (y + leading > BOTTOM) start();
                paint.setTextSize(sp);
                paint.setTypeface(Typeface.create("sans-serif", bold ? Typeface.BOLD : Typeface.NORMAL));
                int count = paint.breakText(remaining, true, width, null);
                if (count < 1) throw new IllegalArgumentException("PDF satır yerleşimi başarısız");
                if (count < remaining.length()) {
                    // Do not split a valid UTF-16 surrogate pair.
                    if (Character.isHighSurrogate(remaining.charAt(count-1))) count--;
                    if (count < 1) throw new IllegalArgumentException("Unicode yerleşimi başarısız");
                    int lastSpace = remaining.lastIndexOf(' ', count-1);
                    if (lastSpace >= count/3) count = lastSpace+1;
                }
                String line = remaining.substring(0, count);
                canvas.drawText(line, MARGIN, y, paint);
                y += leading;
                remaining = remaining.substring(count);
            }
        }
        void finish() {
            if (page != null) { pdf.finishPage(page); page = null; }
        }
    }

    public static void write(OutputStream out, DocumentDraft draft) throws IOException {
        if (out == null || draft == null) throw new IllegalArgumentException("Geçersiz belge");
        PdfDocument pdf = new PdfDocument();
        try {
            Painter p = new Painter(pdf);
            p.print(draft.title, 19f, true, 27f);
            p.y += 12f;
            for (String line : draft.body.split("\n", -1)) {
                p.print(line, 11f, false, 17f);
            }
            p.finish();
            pdf.writeTo(out);
        } finally { pdf.close(); }
    }

    /** Legacy synthetic example retained separately from actual user drafting. */
    public static void writeExample(OutputStream out, String title) throws IOException {
        write(out, new DocumentDraft(
            title == null || title.trim().isEmpty() ? "Sentetik belge" : title.substring(0, Math.min(title.length(), DocumentDraft.MAX_TITLE)),
            "Yalnız sentetik örnek; hukukî inceleme ve onay gerektirir."));
    }
}
