"""Trace builder regression tests; optional source ZIP integration."""
import importlib.util
import io
import os
from pathlib import Path
import unittest
import zipfile

MOD = Path(__file__).resolve().parents[1] / 'tools' / 'build_l0_trace.py'
spec = importlib.util.spec_from_file_location('builder', MOD)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class TraceTests(unittest.TestCase):
    def test_sha_manifest_tampering_rejected(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as z:
            z.writestr('payload.txt', b'tampered')
            z.writestr('SHA256SUMS.txt', builder.digest('other') + '  payload.txt\n')
        with zipfile.ZipFile(io.BytesIO(stream.getvalue())) as z:
            with self.assertRaises(ValueError): builder.verify_archive(z)

    def test_partial_manifest_rejected(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as z:
            z.writestr('payload.txt', b'one')
            z.writestr('ignored.txt', b'two')
            z.writestr('SHA256SUMS.txt', builder.digest('one') + '  payload.txt\n')
        with zipfile.ZipFile(io.BytesIO(stream.getvalue())) as z:
            with self.assertRaises(ValueError): builder.verify_archive(z)

    def test_missing_archive_rejected(self):
        with self.assertRaises(FileNotFoundError): builder.build('/not-a-file.zip')

    @unittest.skipUnless(os.getenv('LARENLEX_SOURCE_ZIP'), 'private source ZIP not provided')
    def test_actual_source_unaccepted_and_nonduplicated(self):
        r = builder.build(os.environ['LARENLEX_SOURCE_ZIP'])
        c = r['counts']
        self.assertEqual((c['LX'],c['A2'],c['API'],c['R_reference_only']), (62,453,102,594))
        self.assertEqual((c['API_RAM_synthetic_historical'],c['API_SQLite_subset_historical'],c['API_disabled_historical']), (87,37,15))
        self.assertEqual(c['verified_cross_product_links'],0)
        self.assertTrue(all(not row['api_verified_links'] for row in r['A2']))
        self.assertTrue(all(row['current_independent_acceptance']=='NOT_VERIFIED' for row in r['A2']))

if __name__ == '__main__':
    unittest.main()
