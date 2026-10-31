#!/usr/bin/env python3
"""Offline LarenLex source-provenance audit; never claims Android acceptance."""
import argparse
import csv
import hashlib
import io
import json
import pathlib
import re
import sys
import zipfile

MAIN = "LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md"
ORIGINAL = "02_YUKLENEN_ORIJINAL_DOSYALAR/AVOFIS_LARENLEX_KATEGORIK_KAYIPSIZ_TEKIL_ANA_TALIMATNAME_v3.md"
NESTED = "01_YENI_AYRI_TALIMATNAMELER/LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip"
INDEX = "DENETIM/LARENLEX_ANDROID_TALIMAT_KANONIK_IZ_DIZINI.json"
A2 = "KAYNAK_KANIT/LARENLEX_453_A2_ISLEV_KABUL_BASLANGIC.csv"
API_CSV = "KAYNAK_KANIT/LARENLEX_A4_102_API_OPERASYON_BASLANGIC.csv"
API_JSON = "KAYNAK_KANIT/A5_18_102_API_COVERAGE.json"
R_SOURCE = "EKLER/594_R_ORTAK_KONU_KAPSAMI_REFERANS.md"
COUNTS = {"LX_GOREV": 62, "A2": 453, "API": 102}

class InvalidSource(ValueError):
    pass

def require(value, error):
    if not value:
        raise InvalidSource(error)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def rows(data):
    return list(csv.DictReader(io.StringIO(data.decode("utf-8-sig"))))

def manifest(zip_file, allowed_missing=()):
    names = [f.filename for f in zip_file.infolist() if not f.is_dir()]
    require(len(names) == len(set(names)), "duplicate archive entries")
    require("SHA256SUMS.txt" in names, "SHA256SUMS missing")
    seen = set()
    for line in zip_file.read("SHA256SUMS.txt").decode("utf-8").splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  (.+)", line)
        require(match is not None, "invalid manifest syntax")
        expected, filename = match.groups()
        require(filename in names and filename not in seen, "missing or duplicate manifest target")
        require(sha(zip_file.read(filename)) == expected, "SHA mismatch: " + filename)
        seen.add(filename)
    missing = set(names) - seen - {"SHA256SUMS.txt"}
    require(missing <= set(allowed_missing), "unlisted archive member(s): " + repr(sorted(missing)))
    require(zip_file.testzip() is None, "archive CRC error")
    return {"verified_sha256_files": len(seen), "crc": "PASS", "manifest_omissions": sorted(missing)}

def canonical(index, original, current):
    require(index["counts"] == COUNTS, "canonical count declaration changed")
    old_lines = original.decode("utf-8").splitlines()
    new_lines = current.decode("utf-8").splitlines()
    for kind, count in COUNTS.items():
        entries = index["entries"][kind]
        require(len(entries) == count, "wrong " + kind + " entries")
        for ident, record in entries.items():
            old, new = record["original_line"], record["new_line"]
            text = record["source_text"]
            require(0 < old <= len(old_lines) and 0 < new <= len(new_lines), "bad index " + ident)
            require(old_lines[old-1] == text and new_lines[new-1] == text, "wrong source line " + ident)
            require(sha(text.encode("utf-8")) == record["sha256_original_line"], "source hash changed " + ident)
            require(new_lines.count(text) == 1, "duplicate or absent canonical line " + ident)
    return dict(COUNTS)

def audit(l_path, c_path):
    require(pathlib.Path(l_path).is_file() and pathlib.Path(c_path).is_file(), "input archive missing")
    with zipfile.ZipFile(l_path) as lz, zipfile.ZipFile(c_path) as cz:
        l_integrity = manifest(lz)
        c_integrity = manifest(cz, ("03_ONCEKI_TESLIM_ZIP_ACILMIS/SHA256SUMS.txt",))
        require(cz.read(NESTED) == pathlib.Path(l_path).read_bytes(), "nested LarenLex ZIP not identical")
        idx = json.loads(lz.read(INDEX))
        old = cz.read(ORIGINAL)
        require(sha(old) == idx["source_document_sha256"], "original document SHA mismatch")
        counts = canonical(idx, old, lz.read(MAIN))
        a2 = rows(lz.read(A2))
        a2_ids = [r["A2 İşlev ID"] for r in a2]
        require(len(a2) == len(set(a2_ids)) == 453, "A2 count/uniqueness")
        require(set(a2_ids) == set(idx["entries"]["A2"]), "A2 identities differ")
        require(len(set(r["LX Sistemi"] for r in a2)) == 14, "A2 system count")
        require(len(set(r["Alt grup ID"] for r in a2)) == 69, "A2 group count")
        require(all(r["Bağımsız kabul"] == "BAĞIMSIZ KABUL YOK" for r in a2),
                "historical acceptance modified")
        for r in a2:
            require(r["A2 İşlev ID"].startswith(r["Alt grup ID"] + ".F"), "A2 group mismatch")
            require(r["Alt grup ID"].startswith(r["LX Sistemi"] + ".G"), "A2 system mismatch")
        refs = re.findall(r"\*\*\[(R-\d{3})\]\*\*\s*(.+)", lz.read(R_SOURCE).decode())
        require([r[0] for r in refs] == [f"R-{i:03d}" for i in range(1, 595)],
                "594 R reference identifiers changed")
        operations = json.loads(lz.read(API_JSON))["operations"]
        csv_ops = rows(lz.read(API_CSV))
        opids = [x["operationId"] for x in operations]
        require(len(opids) == len(set(opids)) == 102, "API identity count/uniqueness")
        require(set(opids) == set(x["operationId"] for x in csv_ops)
                == set(idx["entries"]["API"]), "API sources disagree")
        by_id = {x["operationId"]: x for x in csv_ops}
        require(len(set(x["path"] for x in operations)) == 73, "API path count")
        require(len(set((x["method"], x["path"]) for x in operations)) == 102,
                "duplicate API verb/path")
        for x in operations:
            require((x["method"], x["path"]) ==
                    (by_id[x["operationId"]]["HTTP"], by_id[x["operationId"]]["Yol"]),
                    "API contract mismatch: " + x["operationId"])
            require(not x["persistent_sqlite_fixture_tested"] or x["transient_fixture_tested"],
                    "SQLite is not a RAM-route subset")
            require(not x["production_backend_connected"]
                    and not x["postgres_rls_verified"]
                    and not x["android_client_connected"]
                    and not x["independently_accepted"], "historical acceptance elevated")
        api = {
            "node_ram": sum(bool(x["transient_fixture_tested"]) for x in operations),
            "sqlite_subset": sum(bool(x["persistent_sqlite_fixture_tested"]) for x in operations),
            "disabled": sum(not x["transient_fixture_tested"] for x in operations),
            "production": sum(bool(x["production_backend_connected"]) for x in operations)
        }
        require(api == {"node_ram": 87, "sqlite_subset": 37, "disabled": 15, "production": 0},
                "historical A5.18 operation layers inconsistent")
        return {
            "scope": "OFFLINE_SOURCE_PROVENANCE_ONLY", "audit_result": "PASS_SOURCE_ONLY",
            "inputs_sha256": {"larenlex": sha(pathlib.Path(l_path).read_bytes()),
                              "combined_reference": sha(pathlib.Path(c_path).read_bytes())},
            "integrity": {"larenlex": l_integrity, "combined_reference": c_integrity},
            "original_source_sha256": sha(old),
            "canonical_ids": counts, "A2_systems": 14, "A2_groups": 69,
            "R_reference_only": len(refs), "historical_API_layers": api,
            "android_git_bundle": "NOT_PROVIDED", "app_build": "NOT_RUN",
            "current_technical_acceptance": "UNVERIFIED",
            "independent_acceptance": "NOT_ESTABLISHED",
            "live_system_writes": False
        }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--larenlex-zip", type=pathlib.Path, required=True)
    p.add_argument("--combined-reference-zip", type=pathlib.Path, required=True)
    p.add_argument("--output", type=pathlib.Path, required=True)
    a = p.parse_args()
    try:
        result = audit(a.larenlex_zip, a.combined_reference_zip)
        a.output.mkdir(parents=True, exist_ok=True)
        dest = a.output / "L0_SOURCE_AUDIT.json"
        dest.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
                        encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except (InvalidSource, OSError, KeyError, ValueError, zipfile.BadZipFile) as e:
        print("FAIL L0 source audit: " + str(e), file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
