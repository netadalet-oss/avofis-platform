package nl.larenlex.app;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/** Minimal offline DOCX sample. No legal submission, external network, or personal data. */
public final class DraftDocxWriter {
    private DraftDocxWriter() { }
    private static String xml(String s) {
        if (s == null || s.length() > 500) throw new IllegalArgumentException("Invalid document title");
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if ((c < 32 && c != '\n' && c != '\t') || Character.isSurrogate(c)) throw new IllegalArgumentException("Control character");
            switch (c) {
                case '&': out.append("&amp;"); break;
                case '<': out.append("&lt;"); break;
                case '>': out.append("&gt;"); break;
                case '"': out.append("&quot;"); break;
                case '\'': out.append("&apos;"); break;
                default: out.append(c);
            }
        }
        return out.toString();
    }
    private static void put(ZipOutputStream zip, String name, String text) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(text.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }
    public static void writeExample(OutputStream destination, String title) throws IOException {
        // The caller owns the output stream and must have explicitly selected the SAF URI.
        ZipOutputStream zip = new ZipOutputStream(destination, StandardCharsets.UTF_8);
        put(zip, "[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>");
        put(zip, "_rels/.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>");
        put(zip, "word/document.xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>" + xml(title) + "</w:t></w:r></w:p><w:p><w:r><w:t>Yalnız sentetik örnek; hukukî inceleme ve onay gerektirir.</w:t></w:r></w:p><w:sectPr/></w:body></w:document>");
        zip.finish();
    }
}
