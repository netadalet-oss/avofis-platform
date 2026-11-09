package org.larenlex.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Public service-title catalogue. Imports only v86-derived metadata verified
 * against the original per-card SHA-256 manifest. Never publishes card bodies.
 * Refuses to start with missing, incomplete or duplicate source records.
 */
@Service
public final class V86ServiceCatalog {
    public record Entry(String id, String title, String group, int formCount,
                        int controlCount, String sourceSha256) {}

    private final List<Entry> entries;

    public V86ServiceCatalog(@Value("${larenlex.catalog-dir:data}") String root) throws IOException {
        Path file = Path.of(root, "services-v86.tsv").toAbsolutePath().normalize();
        if (!Files.isRegularFile(file)) {
            throw new IllegalStateException("v86 service catalogue absent: " + file);
        }
        List<Entry> parsed = new ArrayList<>();
        Set<String> ids = new HashSet<>();
        for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
            if (line.isBlank()) continue;
            String[] a = line.split("\\t", -1);
            if (a.length != 6 || !a[0].matches("P[1-5]/[0-9]+")
                    || a[1].isBlank() || a[2].isBlank()
                    || !a[5].matches("[0-9a-f]{64}") || !ids.add(a[0])) {
                throw new IllegalStateException("Invalid or duplicate v86 service entry: " + line);
            }
            int forms = Integer.parseInt(a[3]);
            int controls = Integer.parseInt(a[4]);
            if (forms < 0 || controls < 0) {
                throw new IllegalStateException("Negative attachment count: " + a[0]);
            }
            parsed.add(new Entry(a[0], a[1], a[2], forms, controls, a[5]));
        }
        if (parsed.size() != 554) {
            throw new IllegalStateException("Expected 554 real v86 services; got " + parsed.size());
        }
        entries = Collections.unmodifiableList(parsed);
    }

    public List<Entry> all() { return entries; }

    public List<String> groups() {
        return entries.stream().map(Entry::group).distinct()
                .sorted(java.text.Collator.getInstance(java.util.Locale.forLanguageTag("tr")))
                .toList();
    }
}
