package org.larenlex.core;
import java.math.BigDecimal;
public final class DemoWorkflowSmokeTest {
    private static void require(boolean yes, String message) { if (!yes) throw new AssertionError(message); }
    private static void invalid(Runnable code) {
        try { code.run(); throw new AssertionError("Expected rejection"); }
        catch (IllegalArgumentException | IllegalStateException expected) { }
    }
    public static void main(String[] args) {
        var case1 = new DemoWorkflow("P1/1", "NL", "Örnek sözleşme inceleme işlemi", new BigDecimal("220"));
        invalid(() -> case1.quoteDemo(new BigDecimal("200")));
        case1.demoPrecheck();
        case1.quoteDemo(new BigDecimal("350.50"));
        invalid(case1::showInvoiceDemo);
        case1.clientAcceptQuoteDemo();
        invalid(() -> case1.deliverDemo("Örnek teslim içerik sonucu"));
        case1.addWorkNote("Örnek belgeler incelendi");
        case1.deliverDemo("Örnek belge listesi tamamlandı");
        case1.clientAcceptDeliveryDemo();
        case1.showInvoiceDemo();
        require(case1.stage() == DemoWorkflow.Stage.INVOICED_DEMO, "End state");
        require(case1.history().size() == 8, "History length");
        require(!case1.realPaymentEnabled() && !case1.institutionIntegrationEnabled() && !case1.realLegalApprovalRecorded(), "No live integrations");
        var case2 = new DemoWorkflow("P1/2", "BE", "Örnek ücretsiz ret talebi", BigDecimal.ZERO);
        case2.rejectWithoutCharge();
        require(case2.stage() == DemoWorkflow.Stage.REJECTED_FREE, "Free rejection");
        require(case2.quotedAmount() == null, "No quoted amount in rejection");
        invalid(case2::demoPrecheck);
        invalid(() -> new DemoWorkflow("P1/3", "NL", "Too short", new BigDecimal("10")));
        invalid(() -> new DemoWorkflow("P1/3", "NL", "Örnek negatif bütçe talebi", new BigDecimal("-10")));
        System.out.println("PASS: workflow + free rejection + illegal transitions + safe guards");
    }
}
