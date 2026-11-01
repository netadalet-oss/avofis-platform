import json
from pathlib import Path
import unittest

BASE=Path(__file__).resolve().parents[1]
CONTRACTS=json.loads((BASE/'contracts/L2_API_CONTRACT_SCOPE.json').read_text())

class Inventory(unittest.TestCase):
    def test_a4_ids_102_and_not_implemented(self):
        rows=CONTRACTS['a4_historical_102']
        self.assertEqual(len(rows),102)
        self.assertEqual(len(set(x['operationId'] for x in rows)),102)
        self.assertTrue(all(not x['verified_in_current_l2_runtime'] for x in rows))
        self.assertTrue(all(not x['independent_acceptance'] for x in rows))

    def test_ram_sqlite_history_not_promoted(self):
        rows=CONTRACTS['a4_historical_102']
        self.assertEqual(sum(x['historical_synthetic_RAM'] for x in rows),87)
        self.assertEqual(sum(x['historical_synthetic_SQLite_subset'] for x in rows),37)
        self.assertTrue(all(not x['historical_synthetic_SQLite_subset'] or x['historical_synthetic_RAM'] for x in rows))

    def test_10_generic_routes_distinct(self):
        routes=CONTRACTS['new_l2_10_generic_route_templates']
        self.assertEqual(len(routes),10)
        self.assertEqual(len(set((x['method'],x['route']) for x in routes)),10)
        self.assertTrue(all(not x['real_postgres_auth_or_android_connected'] for x in routes))

if __name__=='__main__':unittest.main()
