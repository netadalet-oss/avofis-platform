"""Local, standard-library-only L0 audit tests; no production access."""
import hashlib
import importlib.util
import io
import os
import pathlib
import unittest
import warnings
import zipfile

script = pathlib.Path(__file__).resolve().parents[1] / "tools" / "verify_l0.py"
spec = importlib.util.spec_from_file_location("larenlex_audit", script)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class L0PureUnitTests(unittest.TestCase):
    def test_sha256_reference(self):
        self.assertEqual(m.sha(b"abc"), hashlib.sha256(b"abc").hexdigest())

    def test_missing_sha_manifest_rejected(self):
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, "w") as z:
            z.writestr("file.txt", "abc")
        with zipfile.ZipFile(io.BytesIO(payload.getvalue())) as z:
            with self.assertRaises(m.InvalidSource):
                m.manifest(z)

    def test_modified_content_rejected(self):
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, "w") as z:
            z.writestr("file.txt", "bad")
            z.writestr("SHA256SUMS.txt", m.sha(b"good") + "  file.txt\n")
        with zipfile.ZipFile(io.BytesIO(payload.getvalue())) as z:
            with self.assertRaises(m.InvalidSource):
                m.manifest(z)

    def test_duplicate_zip_filename_rejected(self):
        payload = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with zipfile.ZipFile(payload, "w") as z:
                z.writestr("same.txt", "a")
                z.writestr("same.txt", "b")
                z.writestr("SHA256SUMS.txt", m.sha(b"b") + "  same.txt\n")
        with zipfile.ZipFile(io.BytesIO(payload.getvalue())) as z:
            with self.assertRaises(m.InvalidSource):
                m.manifest(z)

    def test_missing_canonical_records_rejected(self):
        bad = {"counts": dict(m.COUNTS),
               "entries": {"LX_GOREV": {}, "A2": {}, "API": {}}}
        with self.assertRaises(m.InvalidSource):
            m.canonical(bad, b"source", b"source")

    def test_missing_archives_rejected(self):
        with self.assertRaises(m.InvalidSource):
            m.audit("/path/absent/laren.zip", "/path/absent/combined.zip")

class SuppliedArchivesIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        one = os.getenv("LARENLEX_SOURCE_ZIP")
        two = os.getenv("AVOFIS_REFERENCE_ZIP")
        if not (one and two):
            raise unittest.SkipTest("No private source archives provided; not an integration PASS")
        cls.report = m.audit(one, two)

    def test_complete_id_integrity(self):
        self.assertEqual(self.report["canonical_ids"], {"LX_GOREV": 62, "A2": 453, "API": 102})
        self.assertEqual(self.report["R_reference_only"], 594)

    def test_no_accidental_production_acceptance(self):
        api = self.report["historical_API_layers"]
        self.assertEqual((api["node_ram"], api["sqlite_subset"], api["disabled"], api["production"]),
                         (87, 37, 15, 0))
        self.assertEqual(self.report["app_build"], "NOT_RUN")
        self.assertEqual(self.report["audit_result"], "PASS_SOURCE_ONLY")

if __name__ == "__main__":
    unittest.main()
