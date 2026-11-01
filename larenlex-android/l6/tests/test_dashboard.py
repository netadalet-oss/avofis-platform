"""Native dashboard: actual search + accessibility/source boundaries."""
from pathlib import Path
import subprocess, shutil, tempfile, unittest
from xml.etree import ElementTree
ROOT=Path(__file__).resolve().parents[1]
JAVA=ROOT/'android/app/src/main/java/nl/larenlex/app'
A='{http://schemas.android.com/apk/res/android}'

class DashboardTests(unittest.TestCase):
    def test_search_is_real_pure_java_logic(self):
        if not shutil.which('javac') or not shutil.which('java'):
            self.skipTest('JDK not available')
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['javac','-d',d,str(JAVA/'FeatureMatcher.java'),
                str(ROOT/'tests/FeatureMatcherHarness.java')],check=True,capture_output=True,timeout=30)
            got=subprocess.run(['java','-cp',d,'FeatureMatcherHarness'],
                check=True,capture_output=True,text=True,timeout=20)
            self.assertIn('10 PASS',got.stdout)

    def test_one_launcher_and_document_access(self):
        root=ElementTree.parse(ROOT/'android/app/src/main/AndroidManifest.xml').getroot()
        activities=root.find('application').findall('activity')
        by_name={a.get(A+'name'):a for a in activities}
        self.assertEqual(by_name['.DashboardActivity'].get(A+'exported'),'true')
        self.assertEqual(by_name['.MainActivity'].get(A+'exported'),'false')
        launcher=[a for a in activities if a.find('intent-filter') is not None]
        self.assertEqual([x.get(A+'name') for x in launcher],['.DashboardActivity'])
        self.assertEqual(by_name['.DocumentComposerActivity'].get(A+'exported'),'false')

    def test_actual_navigable_scope_and_no_acceptance_inflation(self):
        s=(JAVA/'DashboardActivity.java').read_text(encoding='utf-8')
        for marker in ('modules.length()!=14','groupCount!=69','featureCount!=453',
            'FeatureMatcher.matches(', 'getStringSet(', 'DocumentComposerActivity.class',
            'L4LegalFlowsActivity.class', 'L5IntegrationActivity.class',
            'L6ReadinessActivity.class','bağımsız teknik ve hukukî kabulü bulunmuyor'):
            self.assertIn(marker,s)
        self.assertNotIn('INTERNET', (ROOT/'android/app/src/main/AndroidManifest.xml').read_text())

if __name__=='__main__':
    unittest.main()
