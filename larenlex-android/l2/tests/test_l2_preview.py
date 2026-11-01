from pathlib import Path
import json
import re
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'))
from catalog import load_catalog

class FullPreview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=(ROOT/'preview/LARENLEX_ANDROID_L2_BUTUN_UYGULAMA_ONIZLEME.html').read_text(encoding='utf-8')
        cls.catalog=load_catalog(ROOT/'evidence/SOURCE_A2_453_LOCAL_REFERENCE.csv')
        cls.browsers=json.loads((ROOT/'evidence/L2_BROWSER_TEST.json').read_text())

    def test_14_modules_and_453_features_preserved(self):
        self.assertEqual(len(self.catalog),14)
        self.assertEqual(sum(len(g['features']) for m in self.catalog.values() for g in m['groups'].values()),453)
        self.assertIn('id="module-data"',self.html)
        self.assertIn('id="l1-domain-data"',self.html)

    def test_old_l1_roles_and_new_l2_controls_present(self):
        for key in ('l2-module-grid','l2-actor','l2-activity','l2-feature','l2-execute','l2-reset','l1-module-grid'):
            self.assertIn('id="'+key+'"',self.html)

    def test_synthetic_warning_is_unambiguous(self):
        for marker in ('Çevrimdışı etkileşimli prototip','gerçek sunucuya','BROWSER_SIMULATION_NOT_HTTP','Gerçek üretim kabulü: yok'):
            self.assertIn(marker,self.html)

    def test_no_fetch_or_external_form_submission(self):
        self.assertNotIn('fetch(',self.html)
        self.assertNotIn('XMLHttpRequest',self.html)
        self.assertNotIn('<iframe',self.html)

    def test_7_auth_roles_and_5_operations(self):
        section=self.html[self.html.index('id="l2-interactive"'):self.html.index('id="l2-controller"')]
        self.assertEqual(len(re.findall('<option value="(?:owner|same-other|foreign|staff-mfa|staff-nomfa|staff-unassigned|revoked)"',section)),7)
        self.assertEqual(len(re.findall('<option value="(?:create|list|read|update|delete)"',section)),5)

    def test_actual_browser_checks_pass(self):
        self.assertEqual(self.browsers['status'],'PASS')
        self.assertEqual(len(self.browsers['observations']),2)
        for row in self.browsers['observations']:
            self.assertEqual(row['module_cards'],14)
            self.assertFalse(row['overflow'])
            self.assertFalse(row['errors'])

if __name__=='__main__':unittest.main()
