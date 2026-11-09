package org.larenlex.core;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Standalone, non-persistent workflow demonstration for LarenLex W1.
 * Not a source of legal eligibility, attorney authority or real payment execution.
 * Never bind this demo class to a public real-case API or production PSP.
 */
public final class DemoWorkflow {
    public enum Stage {
        SUBMITTED, PRECHECKED_DEMO, REJECTED_FREE, QUOTED_DEMO,
        IN_PROGRESS_DEMO, DELIVERED_DEMO, ACCEPTED_DEMO, INVOICED_DEMO
    }

    private final String serviceId;
    private final String country;
    private final String summary;
    private final BigDecimal budgetProposal;
    private final List<String> history = new ArrayList<>();
    private final List<String> taskNotes = new ArrayList<>();
    private Stage stage = Stage.SUBMITTED;
    private BigDecimal quotedAmount;
    private String deliverySummary;

    public DemoWorkflow(String serviceId, String country, String summary, BigDecimal budgetProposal) {
        this.serviceId = required(serviceId, 30);
        this.country = required(country, 60);
        this.summary = required(summary, 1000);
        if (this.summary.length() < 10) throw new IllegalArgumentException("Description too short");
        if (budgetProposal != null) this.budgetProposal = money(budgetProposal, true);
        else this.budgetProposal = null;
        history.add("Örnek talep oluşturuldu; ücret 0 EUR.");
    }

    public Stage stage() { return stage; }
    public String serviceId() { return serviceId; }
    public String country() { return country; }
    public String summary() { return summary; }
    public BigDecimal budgetProposal() { return budgetProposal; }
    public BigDecimal quotedAmount() { return quotedAmount; }
    public String deliverySummary() { return deliverySummary; }
    public List<String> taskNotes() { return List.copyOf(taskNotes); }
    public List<String> history() { return List.copyOf(history); }
    public boolean realPaymentEnabled() { return false; }
    public boolean institutionIntegrationEnabled() { return false; }
    public boolean realLegalApprovalRecorded() { return false; }

    public void demoPrecheck() {
        require(Stage.SUBMITTED);
        stage = Stage.PRECHECKED_DEMO;
        history.add("Örnek uygunluk ön inceleme safhası. Gerçek ruhsat/ülke kontrolü YOK.");
    }

    public void rejectWithoutCharge() {
        if (stage != Stage.SUBMITTED && stage != Stage.PRECHECKED_DEMO)
            throw new IllegalStateException("Free rejection gate passed");
        stage = Stage.REJECTED_FREE;
        history.add("Yetki/uygunluk örneği: talep ücretsiz reddedildi, ücret 0 EUR.");
    }

    public void quoteDemo(BigDecimal amount) {
        require(Stage.PRECHECKED_DEMO);
        quotedAmount = money(Objects.requireNonNull(amount), false);
        stage = Stage.QUOTED_DEMO;
        history.add("Örnek ücret teklifi: " + quotedAmount + " EUR; henüz kabul/ödeme yok.");
    }

    public void clientAcceptQuoteDemo() {
        require(Stage.QUOTED_DEMO);
        stage = Stage.IN_PROGRESS_DEMO;
        history.add("Başvurucu, örnek iş teklifini kabul etti. Gerçek sözleşme/ödeme yok.");
    }

    public void addWorkNote(String text) {
        require(Stage.IN_PROGRESS_DEMO);
        String note = required(text, 700);
        if (note.length() < 5) throw new IllegalArgumentException("Note too short");
        taskNotes.add(note);
        history.add("Örnek iş safahatı: " + note);
    }

    public void deliverDemo(String text) {
        require(Stage.IN_PROGRESS_DEMO);
        if (taskNotes.isEmpty()) throw new IllegalStateException("At least one task note required");
        deliverySummary = required(text, 800);
        if (deliverySummary.length() < 8) throw new IllegalArgumentException("Delivery text too short");
        stage = Stage.DELIVERED_DEMO;
        history.add("Örnek teslim oluşturuldu; gerçek belge gönderimi yok.");
    }

    public void clientAcceptDeliveryDemo() {
        require(Stage.DELIVERED_DEMO);
        stage = Stage.ACCEPTED_DEMO;
        history.add("Örnek teslim başvurucu tarafından kabul edildi.");
    }

    public void showInvoiceDemo() {
        require(Stage.ACCEPTED_DEMO);
        stage = Stage.INVOICED_DEMO;
        history.add("Geçersiz fatura örneği; vergi kaydı veya tahsilat oluşturulmadı.");
    }

    private void require(Stage expected) {
        if (stage != expected) throw new IllegalStateException("Expected " + expected + " but was " + stage);
    }
    private static String required(String input, int max) {
        String out = Objects.requireNonNull(input, "Required").trim();
        if (out.isBlank() || out.length() > max) throw new IllegalArgumentException("Invalid length");
        return out;
    }
    private static BigDecimal money(BigDecimal input, boolean allowZero) {
        if (input.signum() < 0 || (!allowZero && input.signum() == 0) || input.compareTo(new BigDecimal("1000000")) > 0)
            throw new IllegalArgumentException("Invalid example amount");
        return input.setScale(2, RoundingMode.UNNECESSARY);
    }
}
