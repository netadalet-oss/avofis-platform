"""Offline functional document validation / DOCX regressions; no Android device claim."""
import pathlib
import shutil
import subprocess
import tempfile
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
JAVA=ROOT/'android/app/src/main/java/nl/larenlex/app'

class DocumentComposerTests(unittest.TestCase):
    def test_java_validation_and_real_docx_contents(self):
        if not shutil.which('javac') or not shutil.which('java'): self.skipTest('JDK unavailable')
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['javac','-d',d,str(JAVA/'DocumentDraft.java'),
                            str(JAVA/'DraftDocxWriter.java'),str(ROOT/'tests/DocumentDraftHarness.java')],
                           check=True,capture_output=True,timeout=35)
            x=subprocess.run(['java','-cp',d,'DocumentDraftHarness'],check=True,
                             capture_output=True,text=True,timeout=20)
            self.assertIn('18 PASS',x.stdout)

    def test_nonexported_editor_and_saf_only(self):
        manifest=(ROOT/'android/app/src/main/AndroidManifest.xml').read_text()
        editor=(JAVA/'DocumentComposerActivity.java').read_text()
        self.assertIn('android:name=".DocumentComposerActivity" android:exported="false"',manifest)
        self.assertIn('Intent.ACTION_CREATE_DOCUMENT',editor)
        self.assertIn('new DocumentDraft(',editor)
        self.assertIn('DraftDocxWriter.write(stream,snapshot)',editor)
        self.assertIn('PdfDraftWriter.write(stream,snapshot)',editor)
        self.assertNotIn('android.permission.INTERNET',manifest)

    def test_entrypoints_present_without_453_acceptance(self):
        main=(JAVA/'MainActivity.java').read_text()
        self.assertIn('Belge düzenleyici — DOCX/PDF',main)
        self.assertIn('DocumentComposerActivity.class',main)
        self.assertIn('gerçek işlev kabul edilmedi',main)

if __name__=='__main__':unittest.main()
