"""Fail-closed negative tests for the A5.18 handoff gate."""
import pathlib
import subprocess
import tempfile
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / 'tools' / 'preflight_android_bundle.sh'

def run(*args, cwd=None):
    return subprocess.run(list(args), cwd=cwd, capture_output=True, text=True, check=False)

class BundleGateTests(unittest.TestCase):
    def test_missing_bundle_is_not_accepted(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = pathlib.Path(tmp)
            p = run('bash', str(SCRIPT), str(home/'missing.bundle'), str(home/'checkout'))
            self.assertEqual(p.returncode, 2)
            self.assertIn('BLOCKED: missing Git bundle', p.stderr)
            self.assertFalse((home/'checkout').exists())

    def test_preexisting_target_not_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = pathlib.Path(tmp)
            (home/'demo.bundle').write_bytes(b'not a real git bundle')
            (home/'checkout').mkdir()
            p = run('bash', str(SCRIPT), str(home/'demo.bundle'), str(home/'checkout'))
            self.assertEqual(p.returncode, 2)
            self.assertIn('REFUSED: target already exists', p.stderr)

    def test_wrong_bundle_ref_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = pathlib.Path(tmp)
            repo = home/'repo'; repo.mkdir()
            for argv in [
                ('git','init','-q','-b','develop'),
                ('git','config','user.email','synthetic@example.invalid'),
                ('git','config','user.name','Synthetic Only')]:
                p=run(*argv,cwd=repo); self.assertEqual(p.returncode,0,p.stderr)
            (repo/'dummy.txt').write_text('synthetic only\n')
            for argv in [('git','add','dummy.txt'),('git','commit','-qm','fixture'),('git','branch','main')]:
                p=run(*argv,cwd=repo); self.assertEqual(p.returncode,0,p.stderr)
            bundle=home/'synthetic.bundle'
            p=run('git','bundle','create',str(bundle),'--all',cwd=repo)
            self.assertEqual(p.returncode,0,p.stderr)
            p=run('bash',str(SCRIPT),str(bundle),str(home/'checkout'))
            self.assertEqual(p.returncode,1,p.stderr)
            self.assertIn('FAIL: Android source refs do not match',p.stderr)
            self.assertFalse((home/'checkout').exists(), 'Rejected source must not be published')

    def test_dangling_symlink_target_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            home = pathlib.Path(tmp)
            bundle = home/'synthetic.bundle'
            bundle.write_bytes(b'not used')
            target = home/'checkout'
            target.symlink_to(home/'nowhere')
            p = run('bash', str(SCRIPT), str(bundle), str(target))
            self.assertEqual(p.returncode, 2)
            self.assertIn('REFUSED: target already exists', p.stderr)
            self.assertTrue(target.is_symlink())

if __name__=='__main__': unittest.main()
