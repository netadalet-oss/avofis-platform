"""Minimal integrity checks for source, debug isolation, trace, and acceptance."""
import json
from pathlib import Path
import unittest
import zipfile
import sys

ROOT=Path(__file__).resolve().parents[1]

class ArtifactContract(unittest.TestCase):
    def test_fourteen_modules_full_scope_and_453_ids(self):
        modules=json.loads((ROOT/'android/app/src/main/assets/modules.json').read_text())
        ids=[f['id'] for m in modules for g in m['groups'] for f in g['features']]
        self.assertEqual((len(modules),sum(len(m['groups']) for m in modules),len(ids)),(14,69,453))
        self.assertEqual(len(set(ids)),453)
        self.assertEqual([m['id'] for m in modules],[f'LX-{i:02}' for i in range(1,15)])

    def test_debug_only_internet_and_release_closed(self):
        base=(ROOT/'android/app/src/main/AndroidManifest.xml').read_text()
        debug=(ROOT/'android/app/src/debug/AndroidManifest.xml').read_text()
        config=(ROOT/'android/app/src/debug/res/xml/debug_loopback_security.xml').read_text()
        source=(ROOT/'android/app/src/debug/java/nl/larenlex/app/DebugLoopbackClient.java').read_text()
        self.assertNotIn('android.permission.INTERNET',base)
        self.assertNotIn('usesCleartextTraffic="true"',base)
        self.assertIn('android.permission.INTERNET',debug)
        self.assertIn('cleartextTrafficPermitted="false"',config)
        self.assertIn('10.0.2.2',config)
        self.assertIn('setInstanceFollowRedirects(false)',source)
        self.assertIn('setUseCaches(false)',source)
        self.assertNotIn('new WebView(',source)

    def test_453_trace_and_102_history_not_accepted(self):
        data=json.loads((ROOT/'evidence/L5_A2_A4_TRACE.json').read_text())
        self.assertEqual((len(data['A2']),len(data['A4'])),(453,102))
        self.assertEqual(data['counts']['new_real_accepted'],0)
        self.assertFalse(data['acceptance_gate']['at_least_46_real_newly_accepted'])
        self.assertTrue(all(not a['independent_acceptance'] for a in data['A4']))
        self.assertTrue(all(not x['technical_independent_acceptance'] for x in data['A2']))

    def test_two_new_attempts_every_previous_open_group(self):
        data=json.loads((ROOT/'evidence/L5_PREVIOUS_BLOCKERS.json').read_text())
        self.assertEqual(len(data['groups']),10)
        self.assertEqual(data['new_attempts'],20)
        self.assertTrue(all(len(x['l5_attempts'])==2 for x in data['groups']))
        self.assertTrue(all(x['status']=='CARRY_FORWARD_NOT_ACCEPTED' for x in data['groups']))

    def test_preview_is_independent_offline_and_retains_l4(self):
        html=(ROOT/'preview/LARENLEX_ANDROID_L5_BUTUN_UYGULAMA_ONIZLEME.html').read_text()
        self.assertIn('id="l5-grid"',html)
        self.assertIn('id="l5-role"',html)
        self.assertIn('IND-01',html)
        self.assertIn('L5 yerel HTTP test kapsamı',html)
        self.assertIn('aria-live="polite"',html)
        self.assertNotIn('fetch(',html)
        self.assertNotIn('XMLHttpRequest',html)

if __name__=='__main__': unittest.main()
