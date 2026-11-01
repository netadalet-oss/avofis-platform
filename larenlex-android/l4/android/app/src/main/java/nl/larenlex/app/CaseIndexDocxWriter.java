package nl.larenlex.app;

import java.io.IOException;
import java.io.OutputStream;

/** A case-index demonstrator; never consumes real private case data before auth approval. */
public final class CaseIndexDocxWriter {
    private CaseIndexDocxWriter() { }
    public static void writeSyntheticIndex(OutputStream out) throws IOException {
        DraftDocxWriter.writeExample(out, "Sentetik dosya indeksi — hukuki belge değildir");
    }
}
