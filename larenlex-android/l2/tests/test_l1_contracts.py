import json
import pathlib
import re
import sys
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'))
from catalog import load_catalog
from domain_registry import register,DOMAINS,STAFF_ONLY

class ContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=(ROOT.parent/'preview/whole-app-l0.html') if (ROOT.parent/'preview/whole-app-l0.html').exists() else (ROOT/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv')
        cls.reg=register(cls.source)
        cls.sql=(ROOT/'sql/002_postgresql_rls_disposable_draft.sql').read_text()

    def test_all_14_l1_domain_records(self):
        self.assertEqual(len(self.reg['modules']),14)
        self.assertEqual(set(DOMAINS),{x['system_id'] for x in self.reg['modules']})

    def test_69_and_453_source_counts(self):
        self.assertEqual(sum(x['source_subgroups'] for x in self.reg['modules']),69)
        self.assertEqual(sum(x['source_features'] for x in self.reg['modules']),453)

    def test_staff_only_permissions_source(self):
        self.assertEqual({m['system_id'] for m in self.reg['modules']
                          if m['customer_access']=='DENIED_STAFF_ONLY'},STAFF_ONLY)

    def test_missing_a4_registries_not_fabricated(self):
        self.assertIn('NOT_CANONICALLY_VERIFIED',self.reg['source_total_52_A4_entities'])
        self.assertIn('NOT_CANONICALLY_VERIFIED',self.reg['source_13_A4_profiles'])
        self.assertTrue(all(m['canonical_a4_entity_registry']=='NOT_PROVIDED'
                            for m in self.reg['modules']))

    def test_postgres_sql_named_disposable_guard(self):
        self.assertIn('larenlex_test_',self.sql)
        self.assertIn("RAISE EXCEPTION 'Refusing non-disposable database name'",self.sql)
        self.assertNotIn('CREATE ROLE',self.sql)
        self.assertNotIn('SECURITY DEFINER',self.sql.replace('-- No GRANT and no SECURITY DEFINER.', ''))

    def test_postgres_five_rls_are_force_enabled(self):
        for table in ['principals','matters','drafts','staff_assignments','staff_permissions']:
            self.assertIn(f'ALTER TABLE larenlex_sandbox.{table} ENABLE ROW LEVEL SECURITY;',self.sql)
            self.assertIn(f'ALTER TABLE larenlex_sandbox.{table} FORCE ROW LEVEL SECURITY;',self.sql)
            self.assertRegex(self.sql,rf'CREATE POLICY deny_{table} ON larenlex_sandbox\.{table} USING \(false\) WITH CHECK \(false\);')

    def test_pg_denies_application_grants_by_default(self):
        self.assertNotRegex(self.sql,r'(?im)^GRANT\s')
        self.assertNotRegex(self.sql,r'(?im)^CREATE ROLE\s')
        self.assertNotRegex(self.sql,r'(?im)^ALTER ROLE\s')

    def test_pg_no_live_issuer_claim_or_fake_identity(self):
        self.assertNotIn('current_setting(\'request.jwt',self.sql)
        self.assertNotIn('BYPASSRLS',self.sql.replace('-- Owner and BYPASSRLS role validation must occur in future disposable-PG integration tests.',''))

    def test_composite_fk_present(self):
        self.assertGreaterEqual(self.sql.count('FOREIGN KEY (tenant_id,'),5)

    def test_no_live_external_adapter_or_payment_action(self):
        result=json.loads((ROOT/'evidence/L1_ALL_MODULES_DOMAIN_REGISTER.json').read_text())
        self.assertTrue(all('SYNTHETIC' in m['operations'] for m in result['modules']))
        self.assertFalse(any(m['independent_technical_acceptance'] for m in result['modules']))

if __name__=='__main__':unittest.main()
