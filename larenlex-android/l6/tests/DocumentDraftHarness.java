import nl.larenlex.app.DocumentDraft;
import nl.larenlex.app.DraftDocxWriter;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipEntry;

public final class DocumentDraftHarness {
    static int tests=0;
    static void check(boolean ok) { if(!ok) throw new AssertionError("Case "+(tests+1));tests++; }
    static void rejected(String t, String b) {
        try { new DocumentDraft(t,b);throw new AssertionError("Invalid value accepted"); }
        catch(IllegalArgumentException ex) { tests++; }
    }
    public static void main(String[] args) throws Exception {
        rejected("","body");
        rejected("title","");
        rejected("title","\u0000bad");
        rejected("title","broken\uD800");
        rejected("title","   ");
        rejected("t\nbroken","valid");
        rejected("x".repeat(141),"body");
        rejected("title","y".repeat(20001));
        DocumentDraft doc=new DocumentDraft("A & <Türkçe> 😀","İlk & satır\nİkinci <test>\n\nSon \"satır\"");
        check(doc.title.contains("😀"));
        ByteArrayOutputStream bytes=new ByteArrayOutputStream();
        DraftDocxWriter.write(bytes,doc);
        check(bytes.size()>450);
        String xml="";
        int entries=0;
        try(ZipInputStream in=new ZipInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            ZipEntry e;
            while((e=in.getNextEntry())!=null) {
                entries++;
                ByteArrayOutputStream target=new ByteArrayOutputStream();
                in.transferTo(target);
                if(e.getName().equals("word/document.xml")) xml=target.toString(StandardCharsets.UTF_8);
            }
        }
        check(entries==3);
        check(xml.contains("A &amp; &lt;Türkçe&gt; 😀"));
        check(xml.contains("İkinci &lt;test&gt;"));
        check(xml.contains("Son &quot;satır&quot;"));
        check(xml.contains("<w:p><w:r><w:t xml:space=\"preserve\"></w:t></w:r></w:p>"));
        // The user-selected destination remains owned by the caller.
        bytes.write(1);
        check(bytes.size()>450);
        check(new DocumentDraft("T","\r\nA\rB").body.equals("\nA\nB"));
        System.out.println(tests+" PASS document validation / DOCX");
    }
}
