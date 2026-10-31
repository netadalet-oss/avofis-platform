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


class SourceBoundaryRegression(unittest.TestCase):
    def test_foreign_endpoint_in_kotlin_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            (Path(d) / 'app/src/main/ApiClient.kt').write_text('val url = "https://avofis-platform.example.invalid/api"')
            self.assertIn('OTHER_PRODUCT_REFERENCE_IN_APP_SOURCE', checks.verify(d)['reasons'])

    def test_foreign_endpoint_in_java_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            (Path(d) / 'app/src/main/Client.java').write_text('String url = "https://lexlingo.example.invalid";')
            self.assertIn('OTHER_PRODUCT_REFERENCE_IN_APP_SOURCE', checks.verify(d)['reasons'])

    def test_symlink_file_rejected_without_reading(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            external = Path(d).parent / 'outside-target-file-identity-test'
            (Path(d) / 'app/src/main/Local.kt').symlink_to(external)
            self.assertIn('LINKED_SOURCE_PATH_REVIEW_REQUIRED', checks.verify(d)['reasons'])

    def test_symlink_directory_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            (Path(d) / 'linked').symlink_to('/etc', target_is_directory=True)
            self.assertIn('LINKED_SOURCE_PATH_REVIEW_REQUIRED', checks.verify(d)['reasons'])

    def test_unreadable_or_large_source_not_ignored(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            (Path(d) / 'app/src/main/Huge.kt').write_bytes(b'x' * (checks.MAX_FILE_BYTES + 1))
            self.assertIn('SOURCE_FILE_TOO_LARGE_TO_VERIFY', checks.verify(d)['reasons'])

    def test_dot_env_rejected_without_leaking_values(self):
        with tempfile.TemporaryDirectory() as d:
            fixture(d)
            (Path(d) / '.env').write_text('API_KEY=FAKE_SECRET_DO_NOT_PRINT')
            result = checks.verify(d)
            self.assertIn('LOCAL_ENV_FILE_MUST_NOT_ENTER_SOURCE_SCAN', result['reasons'])
            self.assertNotIn('FAKE_SECRET_DO_NOT_PRINT', str(result))
