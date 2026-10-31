"""L0 all-module offline preview coverage; does not claim Android acceptance."""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "preview" / "whole-app-l0.html"
REGISTER = ROOT / "docs" / "ALL_MODULES_CROSS_LEVEL_REGISTER_2026-11-01.json"


class AllModulesCoverage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PREVIEW.read_text(encoding="utf-8")
        cls.register = json.loads(REGISTER.read_text(encoding="utf-8"))
        cls.modules = json.loads(re.search(
            r'<script id="module-data" type="application/json">(.*?)</script>',
            cls.html, re.S).group(1))

    def test_14_complete_systems(self):
        self.assertEqual([m["id"] for m in self.modules],
                         [f"LX-{i:02d}" for i in range(1, 15)])

    def test_all_69_subgroups(self):
        self.assertEqual(sum(len(m["groups"]) for m in self.modules), 69)

    def test_all_453_unique_a2(self):
        ids = [f["id"] for m in self.modules for g in m["groups"].values()
               for f in g["features"]]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(ids), 453)

    def test_all_14_on_each_level(self):
        levels = self.register["levels"]
        self.assertEqual(len(levels), 7)
        for level in levels:
            self.assertEqual(level["applies_to"],
                             [f"LX-{i:02d}" for i in range(1, 15)])

    def test_all_16_staff_areas(self):
        self.assertIn("inbox · Başvuru masası", self.html)
        self.assertIn("settings · Ayarlar", self.html)
        self.assertEqual(self.register["source_inventory"]["staff_modules"], 16)

    def test_offline_prototype_does_not_claim_real_android(self):
        self.assertIn("Gerçek Android APK", self.html)
        self.assertFalse(self.register["real_android_app_implemented"])
        self.assertFalse(self.register["android_apk_preview_available"])

    def test_no_live_network_request_in_prototype(self):
        for term in ("fetch(", "XMLHttpRequest", "form action=", "https://"):
            self.assertNotIn(term, self.html)

    def test_per_module_independent_acceptance_not_inferred(self):
        self.assertTrue(all(not m["level0"]["independent_acceptance"]
                            for m in self.register["modules"]))

    def test_retries_follow_not_block_other_modules(self):
        self.assertTrue(all(level["open_items_carried_forward"]
                            for level in self.register["levels"]))
        self.assertTrue(all(level["user_transition_approval_required"]
                            for level in self.register["levels"]))

    def test_module_navigation_and_mobile_rules(self):
        self.assertIn("openModule(m)", self.html)
        self.assertIn("search.addEventListener", self.html)
        self.assertIn("max-width:520px", self.html)


if __name__ == "__main__":
    unittest.main()
