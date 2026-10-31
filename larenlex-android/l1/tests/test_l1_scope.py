"""Offline L1 GitHub scope/SQL checks. Not production or Android acceptance."""
import json
from pathlib import Path
import re
import unittest

BASE = Path(__file__).resolve().parents[1]
REG = json.loads((BASE / 'contracts/all_module_data_contracts.json').read_text(encoding='utf-8'))
HTML = (BASE.parent / 'preview/whole-app-l1.html').read_text(encoding='utf-8')
SQL = (BASE / 'sql/001_disposable_pg_rls_deny_all_draft.sql').read_text(encoding='utf-8')

class L1ScopeTests(unittest.TestCase):
    def test_all_14_modules(self):
        self.assertEqual({m['id'] for m in REG['modules']}, {f'LX-{i:02d}' for i in range(1, 15)})
    def test_full_group_and_feature_counts(self):
        self.assertEqual(sum(m['groups'] for m in REG['modules']),69)
        self.assertEqual(sum(m['features'] for m in REG['modules']),453)
    def test_development_is_not_claimed_accepted(self):
        self.assertFalse(REG['independent_acceptance'])
        self.assertTrue(all(not m['real_backend_connected'] and not m['legal_accepted'] for m in REG['modules']))
        self.assertEqual(REG['source_a4_canonical_entity_names'],'NOT_AVAILABLE_52_REFERENCE_COUNT_ONLY')
    def test_five_pg_tables_force_rls(self):
        for table in ['principals','matters','drafts','staff_assignments','staff_permissions']:
            self.assertIn(f'ALTER TABLE larenlex_sandbox.{table} FORCE ROW LEVEL SECURITY;',SQL)
            self.assertIn(f'CREATE POLICY deny_{table}',SQL)
    def test_no_grants_or_issuer_claims(self):
        self.assertNotRegex(SQL, r'(?im)^\s*GRANT\s+')
        self.assertNotRegex(SQL, r'(?im)^\s*CREATE\s+ROLE\s+')
        self.assertIn('Refusing non-disposable database',SQL.replace('Rejecting non-disposable database','Refusing non-disposable database'))
    def test_preview_contains_source_inventory_and_status(self):
        self.assertIn('id="l1contract"',HTML)
        self.assertIn('Gerçek sistem erişim testi değildir',HTML)
        self.assertIn('L1 · veri ve yetki taslağı',HTML)
        matches=re.search(r'<script type="application/json" id="l1contract">(.*?)</script>',HTML,re.S)
        self.assertIsNotNone(matches)
        data=json.loads(matches.group(1))
        self.assertEqual(len(data),14)
        self.assertEqual(sum(m['features'] for m in data),453)

if __name__ == '__main__':
    unittest.main()
