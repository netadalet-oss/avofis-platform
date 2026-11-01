"""JVM preflight + static call-site assertions; NOT Android device acceptance."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'android/app/src/main/java/nl/larenlex/app'

class DraftRevisionPolicyTests(unittest.TestCase):
    def test_revision_rejection_harness(self):
        if not shutil.which('javac') or not shutil.which('java'):
            self.skipTest('JDK not available')
        with tempfile.TemporaryDirectory() as temp:
            subprocess.run(['javac', '-d', temp,
                            str(SOURCE/'DraftRevisionPolicy.java'),
                            str(ROOT/'tests/DraftRevisionPolicyHarness.java')],
                           check=True, capture_output=True, timeout=35)
            result = subprocess.run(['java', '-cp', temp, 'DraftRevisionPolicyHarness'],
                                    capture_output=True, text=True, check=True, timeout=25)
            self.assertIn('14 PASS', result.stdout)

    def test_existing_ciphertext_authenticated_before_replacement(self):
        body = (SOURCE/'SecureDraftVault.java').read_text(encoding='utf-8')
        self.assertIn('DraftRevisionPolicy.precedingRevision(output,revision,MAX)',body)
        self.assertIn('read(matter,draft,previous);',body)
        self.assertIn('synchronized (LOCAL_WRITE_LOCK)',body)
        self.assertIn('StandardCopyOption.ATOMIC_MOVE',body)
        self.assertIn('StandardCopyOption.REPLACE_EXISTING',body)
        self.assertIn('File.createTempFile(',body)
        self.assertIn('read(matter,draft,revision);',body)
        self.assertLess(body.index('read(matter,draft,previous);'),body.index('Files.move('))

if __name__=='__main__': unittest.main()
