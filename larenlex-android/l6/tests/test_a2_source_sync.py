"""Finite, read-only source drift tests: do not indicate acceptance."""
import copy
import importlib.util
from pathlib import Path
import unittest
import json

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('sync', ROOT/'tools/verify_a2_source_sync.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class A2SourceSyncTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.modules = json.loads(sync.MODULES.read_text(encoding='utf-8'))
        cls.rows = sync.csv_rows(sync.SOURCE)

    def verify_mutation_rejected(self, mutate):
        data = copy.deepcopy(self.modules)
        mutate(data)
        report = sync.reconcile(data, self.rows)
        self.assertFalse(report['ok'])

    def test_exact_453_source_rows(self):
        report = sync.reconcile(self.modules, self.rows)
        self.assertTrue(report['ok'], report['issues'])
        self.assertEqual((report['modules'], report['groups'], report['features']), (14, 69, 453))

    def test_duplicate_feature_rejected(self):
        self.verify_mutation_rejected(lambda m: m[0]['groups'][0]['features'].append(m[0]['groups'][0]['features'][0].copy()))

    def test_changed_title_rejected(self):
        self.verify_mutation_rejected(lambda m: m[0]['groups'][0]['features'][0].update(title='UNAPPROVED EDIT'))

    def test_unmapped_feature_rejected(self):
        self.verify_mutation_rejected(lambda m: m[0]['groups'][0]['features'][0].update(id='LX-01.G01.F99'))

    def test_false_acceptance_rejected(self):
        self.verify_mutation_rejected(lambda m: m[0]['groups'][0]['features'][0].update(accepted=True))

    def test_no_external_claim_by_default(self):
        report = sync.audit()
        self.assertTrue(report['ok'])
        self.assertEqual(report['external_original_a2'], 'NOT_PROVIDED')
        self.assertEqual(report['independent_a2_acceptance'], 'NOT_ESTABLISHED')


if __name__ == '__main__':
    unittest.main()
