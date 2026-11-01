"""Source-only LarenLex provisional logo checks; never signify trademark approval."""
import unittest
from pathlib import Path
from xml.etree import ElementTree

ROOT=Path(__file__).resolve().parents[1]
MAIN=ROOT/'android/app/src/main'
APP=MAIN/'java/nl/larenlex/app'
ANDROID='{http://schemas.android.com/apk/res/android}'

class BrandingSourceTests(unittest.TestCase):
    def test_mark_is_android_vector(self):
        d=ElementTree.parse(MAIN/'res/drawable/larenlex_brand_mark.xml').getroot()
        self.assertEqual(d.tag, 'vector')
        self.assertGreaterEqual(len(d.findall('path')), 3)
    def test_adaptive_launcher_and_manifest(self):
        d=ElementTree.parse(MAIN/'res/mipmap-anydpi-v26/ic_launcher.xml').getroot()
        self.assertEqual(d.tag, 'adaptive-icon')
        m=ElementTree.parse(MAIN/'AndroidManifest.xml').getroot().find('application')
        self.assertEqual(m.get(ANDROID+'icon'), '@mipmap/ic_launcher')
    def test_all_navigational_activities_share_branded_header(self):
        for name in ('MainActivity','L4LegalFlowsActivity','L5IntegrationActivity','L6ReadinessActivity'):
            with self.subTest(name=name):
                self.assertIn('LarenLexBrandHeader.create(', (APP/(name+'.java')).read_text())
        self.assertIn('R.drawable.larenlex_brand_mark', (APP/'LarenLexBrandHeader.java').read_text())
    def test_not_production_signing_or_internet(self):
        gradle=(ROOT/'android/app/build.gradle').read_text()
        manifest=(MAIN/'AndroidManifest.xml').read_text()
        self.assertNotIn('signingConfigs',gradle)
        self.assertNotIn('android.permission.INTERNET',manifest)

if __name__=='__main__':
    unittest.main()
