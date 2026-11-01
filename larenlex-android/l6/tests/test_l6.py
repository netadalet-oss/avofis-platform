"""L6 source and status tests. Not independent A2 or A6 acceptance."""
import importlib.util, json, re, shutil, subprocess, tempfile
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('audit_l6',ROOT/'tools/audit_l6.py')
audit=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(audit)
class L6Tests(unittest.TestCase):
    def test_14_modules_69_groups_453_features(self):
        m=json.loads((ROOT/'android/app/src/main/assets/modules.json').read_text())
        self.assertEqual((len(m),sum(len(x['groups']) for x in m),sum(len(g['features']) for x in m for g in x['groups'])),(14,69,453))
    def test_independent_A6_A7_acceptance_unset(self):
        m=json.loads((ROOT/'android/app/src/main/assets/l6_readiness.json').read_text())
        self.assertFalse(m['independent_A6_device_acceptance']);self.assertFalse(m['A7_signing_permission']);self.assertFalse(m['A7_publishing_permission'])
        self.assertTrue(all(x['device_test']=='NOT_RUN' for x in m['modules']))
    def test_12_real_device_scenarios_not_falsely_executed(self):
        m=json.loads((ROOT/'android/app/src/main/assets/l6_readiness.json').read_text())
        self.assertEqual(len(m['scenarios']),12);self.assertTrue(all(x['actual_execution']=='NOT_RUN' for x in m['scenarios']))
    def test_existing_l5_debt_records_not_promoted_to_acceptance(self):
        q=json.loads((ROOT/'evidence/L5_PREVIOUS_BLOCKERS.json').read_text())
        self.assertEqual(q['new_attempts'],20);self.assertEqual(len(q['groups']),10)
        self.assertTrue(all(len(x['l5_attempts'])==2 for x in q['groups']))
    def test_no_live_release_grant_in_manifest(self):
        r=audit.audit();self.assertTrue(r['static_all_pass'])
        self.assertEqual(r['apk']['status'],'BLOCKED_NO_APK')
        self.assertFalse(r['L6_independent_technical_acceptance'])
    def test_missing_apk_fails_closed(self):
        self.assertEqual(audit.audit(ROOT/'missing-debug.apk')['apk']['status'],'BLOCKED_APK_NOT_FOUND')
    def test_all_module_offline_preview(self):
        h=(ROOT/'preview/LARENLEX_ANDROID_L6_BUTUN_UYGULAMA_ONIZLEME.html').read_text()
        self.assertIn('id="l6-grid"',h);self.assertIn('id="l6-matrix"',h)
        obj=json.loads(re.search(r'<script id="l6-matrix" type="application/json">(.*?)</script>',h,re.S).group(1))
        self.assertEqual(len(obj['modules']),14)
        for x in ('id="language"','L5','APK','l6-scenarios'):self.assertIn(x,h)
    def test_pure_java_release_and_recovery(self):
        if not shutil.which('javac') or not shutil.which('java'):self.skipTest('JDK not installed')
        j=ROOT/'android/app/src/main/java/nl/larenlex/app'
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['javac','-d',d,str(j/'L6ReleaseGate.java'),str(j/'L6RecoveryPolicy.java'),str(ROOT/'tests/L6PolicyHarness.java')],check=True,capture_output=True,timeout=35)
            output=subprocess.run(['java','-cp',d,'L6PolicyHarness'],capture_output=True,check=True,text=True,timeout=20).stdout
            self.assertIn('8 PASS',output)
if __name__=='__main__':unittest.main()
