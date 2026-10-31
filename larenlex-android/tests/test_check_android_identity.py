"""Synthetic, fail-closed Android identity tests; no real signing secrets."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

script=Path(__file__).resolve().parents[1]/'tools'/'check_android_identity.py'
spec=importlib.util.spec_from_file_location('check_android_identity',script)
checks=importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)


def fixture(root,app='nl.larenlex.app',extra=''):
    root=Path(root)
    (root/'app/src/main').mkdir(parents=True)
    (root/'settings.gradle.kts').write_text('include(":app")\n')
    (root/'app/src/main/AndroidManifest.xml').write_text('<manifest></manifest>\n')
    (root/'app/build.gradle.kts').write_text('android { defaultConfig { applicationId = "'+app+'" } }\n'+extra+'\n')


class IdentityTests(unittest.TestCase):
    def test_missing_android_source_rejected(self):
        self.assertEqual(checks.verify('/missing/larenlex-android')['result'],'BLOCKED_SOURCE')

    def test_valid_synthetic_fixture_does_not_claim_acceptance(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            r=checks.verify(d)
            self.assertEqual(r['result'],'STATIC_GATES_PASS_NOT_ACCEPTANCE')
            self.assertEqual(r['backend_independence'],'NOT_PROVEN_STATIC_ONLY')

    def test_wrong_application_id_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d,'com.avofis.portal')
            self.assertEqual(checks.verify(d)['result'],'FAIL')

    def test_other_product_endpoint_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d,extra='val endpoint = "https://avofis-platform.example.invalid"')
            self.assertIn('OTHER_PRODUCT_REFERENCE_IN_BUILD_SCRIPT',checks.verify(d)['reasons'])

    def test_literal_signing_secret_rejected_without_echo(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d,extra='storePassword = "DO_NOT_ECHO_THIS"')
            r=checks.verify(d)
            self.assertIn('LITERAL_SIGNING_PASSWORD_IN_BUILD_SCRIPT',r['reasons'])
            self.assertNotIn('DO_NOT_ECHO_THIS',str(r))


if __name__=='__main__': unittest.main()
