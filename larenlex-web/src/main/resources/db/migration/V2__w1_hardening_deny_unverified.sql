-- W1 independent LarenLex hardening; AVOfis v87 is NOT a source.
-- CAUTION: this SQL must be applied by an audited migration role, NOT the runtime user.
ALTER TABLE private_card_body ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_card_body FORCE ROW LEVEL SECURITY;
-- No policies: full draft body is inaccessible to runtime role until legal approval/IAM.
ALTER TABLE client_case ADD CONSTRAINT uq_client_case_id_tenant UNIQUE (id,tenant_id);
ALTER TABLE case_document ADD CONSTRAINT fk_document_case_same_tenant
 FOREIGN KEY (case_id,tenant_id) REFERENCES client_case(id,tenant_id);
ALTER TABLE free_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_intake FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_event FORCE ROW LEVEL SECURITY;
ALTER TABLE service_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_permission FORCE ROW LEVEL SECURITY;
ALTER TABLE partner_credential ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_credential FORCE ROW LEVEL SECURITY;
ALTER TABLE institution_adapter ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_adapter FORCE ROW LEVEL SECURITY;
ALTER TABLE psp_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE psp_configuration FORCE ROW LEVEL SECURITY;
-- Default deny (no policies) until a separately reviewed grant and testing.
