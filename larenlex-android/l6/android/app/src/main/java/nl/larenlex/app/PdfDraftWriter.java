package nl.larenlex.app;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import java.io.IOException;
import java.io.OutputStream;

/** Explicit user-initiated SAF-only example PDF. No private user data or templates. */
public final class PdfDraftWriter {
    private PdfDraftWriter() { }
    public static void writeExample(OutputStream out, String ignoredLabel) throws IOException {
        // Android PdfDocument has close(), but does not implement AutoCloseable.
        PdfDocument pdf = new PdfDocument();
        try {
            PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(595, 842, 1).create();
            PdfDocument.Page page = pdf.startPage(info);
            try {
                Canvas canvas = page.getCanvas();
                Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG); paint.setColor(Color.BLACK);
                paint.setTextSize(21); canvas.drawText("LarenLex - Sentetik Ornek", 42, 72, paint);
                paint.setTextSize(12); canvas.drawText("Yalniz gelistirme gostergesi; hukuki inceleme gerekir.", 42, 118, paint);
            } finally {
                pdf.finishPage(page);
            }
            pdf.writeTo(out);
        } finally {
            pdf.close();
        }
    }
}
