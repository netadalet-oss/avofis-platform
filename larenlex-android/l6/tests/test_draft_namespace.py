"""Pure JVM regression for LarenLex L6 draft namespace; NOT Android acceptance."""
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "android/app/src/main/java/nl/larenlex/app"

class DraftNamespaceTests(unittest.TestCase):
    def test_account_scoped_draft_names(self):
        if not shutil.which("javac") or not shutil.which("java"):
            self.skipTest("JDK not available")
        self.assertIn("DraftFileNamespace.fileName(alias, matterId, draftId)",
                      (SOURCE / "SecureDraftVault.java").read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(["javac", "-d", d, str(SOURCE / "DraftFileNamespace.java"),
                            str(ROOT / "tests/DraftFileNamespaceHarness.java")],
                           capture_output=True, check=True, timeout=30)
            result = subprocess.run(["java", "-cp", d, "DraftFileNamespaceHarness"],
                                    capture_output=True, text=True, check=True, timeout=15)
            self.assertIn("12 PASS", result.stdout)

if __name__ == "__main__":
    unittest.main()
