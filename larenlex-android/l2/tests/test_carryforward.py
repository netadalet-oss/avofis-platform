from pathlib import Path
import json
import unittest
BASE=Path(__file__).resolve().parents[1]
class CarryForward(unittest.TestCase):
    def test_every_prior_group_retried_twice_with_evidence(self):
        x=json.loads((BASE/'evidence/L2_PREVIOUS_LEVEL_RETRIES.json').read_text())
        self.assertGreaterEqual(len(x['previous_level_gate_groups']),8)
        for row in x['previous_level_gate_groups']:
            self.assertEqual(len(row['attempts']),2)
            self.assertTrue(all(a['utc'] and a['method'] and 'evidence' in a for a in row['attempts']))
            self.assertTrue(row['carried_to_next_level_if_open'])
    def test_fake_bundle_not_accepted(self):
        x=json.loads((BASE/'evidence/L2_PREVIOUS_LEVEL_RETRIES.json').read_text())
        row=next(y for y in x['previous_level_gate_groups'] if y['id']=='L0-A518-INDEPENDENT-BUNDLE')
        self.assertTrue(row['open_after_attempts'])
        self.assertTrue(all(a['result']=='BLOCKED_OR_UNAVAILABLE' for a in row['attempts']))
if __name__=='__main__':unittest.main()
