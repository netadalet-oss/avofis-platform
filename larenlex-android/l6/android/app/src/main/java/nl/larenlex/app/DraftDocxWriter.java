package nl.larenlex.app;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/** User-authored, bounded, offline DOCX written only to a user-selected SAF stream. */
public final class DraftDocxWriter {
    private DraftDocxWriter() { }

    static String xmlText(String s) {
        StringBuilder out = new StringBuilder(s.length() + 32);
        for (int i=0; i<s.length(); i++) {
            char c=s.charAt(i);
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

    private static void put(ZipOutputStream zip, String name, String xml) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(xml.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    public static void write(OutputStream destination, DocumentDraft draft) throws IOException {
        if (destination == null || draft == null) throw new IllegalArgumentException("Geçersiz belge");
        // The caller owns the SAF destination; never close or transfer ownership here.
        StringBuilder document = new StringBuilder(draft.body.length() * 2 + 1024);
        document.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        document.append("<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>");
        document.append("<w:p><w:pPr><w:pStyle w:val=\"Title\"/></w:pPr><w:r><w:t xml:space=\"preserve\">");
        document.append(xmlText(draft.title));
        document.append("</w:t></w:r></w:p>");
        for (String line : draft.body.split("\n", -1)) {
            document.append("<w:p><w:r><w:t xml:space=\"preserve\">");
            document.append(xmlText(line));
            document.append("</w:t></w:r></w:p>");
        }
        document.append("<w:sectPr/></w:body></w:document>");
        ZipOutputStream zip = new ZipOutputStream(destination, StandardCharsets.UTF_8);
        put(zip, "[Content_Types].xml",
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>");
        put(zip, "_rels/.rels",
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>");
        put(zip, "word/document.xml", document.toString());
        zip.finish();
        zip.flush();
    }

    /** Legacy sample export stays explicitly synthetic. */
    public static void writeExample(OutputStream destination, String title) throws IOException {
        write(destination, new DocumentDraft(
            title == null || title.trim().isEmpty() ? "Sentetik belge" : title.substring(0, Math.min(title.length(), DocumentDraft.MAX_TITLE)),
            "Yalnız sentetik örnek; hukukî inceleme ve onay gerektirir."));
    }
}
