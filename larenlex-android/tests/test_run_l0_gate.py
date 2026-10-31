"""Tests that historical evidence cannot accidentally close L0."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

p=Path(__file__).resolve().parents[1]/'tools'/'run_l0_gate.py'
spec=importlib.util.spec_from_file_location('run_l0_gate',p)
gate=importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class L0GateTests(unittest.TestCase):
    def test_missing_inputs_cannot_close_level(self):
        with tempfile.TemporaryDirectory() as temp:
            r=gate.run(None,None,None,None,None,Path(temp)/'audit.json')
            self.assertEqual(r['decision'],'BLOCKED_NOT_COMPLETE')
            self.assertEqual(r['gates']['android_git_provenance']['status'],'BLOCKED_MISSING_INPUT')
            self.assertFalse(r['L1_transition_authorized'])

    def test_missing_bundle_cannot_elevate_valid_zip_inputs(self):
        if not (os.getenv('LARENLEX_SOURCE_ZIP') and os.getenv('AVOFIS_REFERENCE_ZIP')):
            self.skipTest('private ZIPs not provided')
        a=Path(os.environ['LARENLEX_SOURCE_ZIP'])
        b=Path(os.environ['AVOFIS_REFERENCE_ZIP'])
        self.assertTrue(a.is_file() and b.is_file(), 'Configured input ZIPs must exist')
        with tempfile.TemporaryDirectory() as temp:
            r=gate.run(a,b,None,None,None,Path(temp)/'audit.json',
                       tools_dir=Path(__file__).resolve().parents[1]/'tools')
            self.assertEqual(r['decision'],'BLOCKED_NOT_COMPLETE')
            self.assertEqual(r['gates']['android_git_provenance']['status'],'BLOCKED_MISSING_INPUT')
            self.assertEqual(r['gates']['offline_source_audit']['status'],'PASS')
            self.assertEqual(r['gates']['offline_trace_register']['status'],'PASS')

    def test_existing_checkout_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as temp:
            target=Path(temp)/'exists'; target.mkdir()
            with self.assertRaises(ValueError):
                gate.run(None,None,None,None,target,Path(temp)/'audit.json')
            self.assertTrue(target.is_dir())

    def test_no_fake_source_acceptance_fields(self):
        with tempfile.TemporaryDirectory() as temp:
            r=gate.run(None,None,None,None,None,Path(temp)/'audit.json')
            self.assertTrue(r['source_only_is_not_android_acceptance'])
            self.assertEqual(r['gates']['current_ci_run_on_head']['status'],'NOT_VERIFIED')
            self.assertEqual(r['gates']['current_android_device_evidence']['status'],'NOT_VERIFIED')


if __name__=='__main__': unittest.main()
