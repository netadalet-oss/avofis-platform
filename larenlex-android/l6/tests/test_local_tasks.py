"""Local encrypted task workflow: source and pure JVM input tests; no device security acceptance."""
import shutil,subprocess,tempfile,unittest
from pathlib import Path
from xml.etree import ElementTree
ROOT=Path(__file__).resolve().parents[1]
J=ROOT/'android/app/src/main/java/nl/larenlex/app'
A='{http://schemas.android.com/apk/res/android}'
class LocalTasksTests(unittest.TestCase):
    def test_task_input_policy(self):
        if not shutil.which('javac') or not shutil.which('java'):self.skipTest('JDK missing')
        with tempfile.TemporaryDirectory() as temp:
            subprocess.run(['javac','-d',temp,str(J/'TaskInputPolicy.java'),
                str(ROOT/'tests/TaskInputHarness.java')],capture_output=True,check=True,timeout=30)
            out=subprocess.run(['java','-cp',temp,'TaskInputHarness'],
                check=True,capture_output=True,text=True,timeout=20)
            self.assertIn('10 PASS',out.stdout)
    def test_encrypted_storage_fail_closed(self):
        s=(J/'EncryptedLocalTaskStore.java').read_text()
        for key in ('AndroidKeyStore','AES/GCM/NoPadding','GCMParameterSpec(128,iv)',
                    'cipher.updateAAD(AAD)','ATOMIC_MOVE','MAX_BYTES','getFilesDir()'):
            self.assertIn(key,s)
        self.assertNotIn('SharedPreferences',s)
    def test_real_task_actions_and_private_activity(self):
        s=(J/'LocalTaskActivity.java').read_text()
        for key in ('storage.load()','storage.save(tasks)','Görev ekle','Düzenle','Sil','setPositiveButton'):
            self.assertIn(key,s)
        m=ElementTree.parse(ROOT/'android/app/src/main/AndroidManifest.xml').getroot()
        activities=m.find('application').findall('activity')
        target=next(x for x in activities if x.get(A+'name')=='.LocalTaskActivity')
        self.assertEqual(target.get(A+'exported'),'false')
        self.assertIn('LocalTaskActivity.class',(J/'DashboardActivity.java').read_text())
if __name__=='__main__': unittest.main()
