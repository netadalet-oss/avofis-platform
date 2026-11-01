"""L1 proposed per-system metadata; NOT a reconstruction of missing canonical A4 entities."""
from catalog import load_catalog

STAFF_ONLY = {'LX-09', 'LX-12', 'LX-13', 'LX-14'}
DOMAINS = {
    'LX-01': ('organization_notice','kurum/profil kaydı','public_content_review'),
    'LX-02': ('mobile_preference','cihaz erişilebilirlik tercihi','minimal'),
    'LX-03': ('service_topic','hizmet ve hukukî bilgi taslağı','editorial_review'),
    'LX-04': ('intake_draft','ön başvuru taslağı','confidential'),
    'LX-05': ('matter_timeline','dosya kronolojisi','high_confidential'),
    'LX-06': ('document_draft','belge/çıktı taslağı','high_confidential'),
    'LX-07': ('privacy_choice','izin ve oturum tercihi','security_sensitive'),
    'LX-08': ('billing_preparation','finansal hazırlık','financial_no_payment'),
    'LX-09': ('staff_work_item','personel iş listesi','staff_mfa'),
    'LX-10': ('translation_draft','çok dilli içerik taslağı','editorial_review'),
    'LX-11': ('institution_reference','resmî kurum bağlantı taslağı','no_official_submission'),
    'LX-12': ('release_preparation','Android sürüm hazırlığı','no_signing'),
    'LX-13': ('test_evidence','QA test delili','staff_only'),
    'LX-14': ('operations_readiness','işletim/yayın hazırlık kaydı','no_release'),
}


def register(csv_path):
    source = load_catalog(csv_path)
    if set(source) != set(DOMAINS):
        raise ValueError('all module models must be represented')
    objects=[]
    for sid,m in source.items():
        object_id,kind,risk=DOMAINS[sid]
        objects.append({'system_id':sid,'system_title':m['title'],
                        'proposed_l1_record_kind':object_id, 'description':kind,
                        'data_handling':risk,
                        'fields':['id','tenant_id','matter_id','owner_id','module_id','feature_id','label','state','version','deleted'],
                        'foreign_key_rule':'(tenant_id,matter_id)->matters, (tenant_id,owner_id)->principals',
                        'customer_access':'DENIED_STAFF_ONLY' if sid in STAFF_ONLY else 'OWN_MATTER_ONLY',
                        'staff_access':'ACTIVE_MATTER_AND_MODULE_ASSIGNMENT_AND_MFA_ONLY',
                        'operations':'SYNTHETIC_METADATA_CREATE_READ_UPDATE_DELETE_ONLY',
                        'source_subgroups':len(m['groups']),
                        'source_features':sum(len(g['features']) for g in m['groups'].values()),
                        'canonical_a4_entity_registry':'NOT_PROVIDED',
                        'independent_technical_acceptance':False,
                        'legal_acceptance':False})
    return {'status':'L1_PROPOSED_MODEL_AND_TESTED_SYNTHETIC_RECORDS',
            'source_total_52_A4_entities':'REFERENCE_COUNT_ONLY_NOT_CANONICALLY_VERIFIED',
            'source_13_A4_profiles':'REFERENCE_COUNT_ONLY_NOT_CANONICALLY_VERIFIED',
            'L1_shared_schema_objects':['tenants','principals','matters','staff_assignments','sessions','module_records','audit_events','document_refs'],
            'modules':objects}
