#!/usr/bin/env python3
"""Build evidence-conservative LarenLex A2/R/API/LX trace register.

Cross-links are empty until supported by real code/test/acceptance evidence.
Input ZIP is not extracted; output is historical trace only.
"""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile

A2_CSV = 'KAYNAK_KANIT/LARENLEX_453_A2_ISLEV_KABUL_BASLANGIC.csv'
API_JSON = 'KAYNAK_KANIT/A5_18_102_API_COVERAGE.json'
INDEX = 'DENETIM/LARENLEX_ANDROID_TALIMAT_KANONIK_IZ_DIZINI.json'
R_MARKDOWN = 'EKLER/594_R_ORTAK_KONU_KAPSAMI_REFERANS.md'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def verify_archive(z):
    files = [m.filename for m in z.infolist() if not m.is_dir()]
    if len(set(files)) != len(files):
        raise ValueError('Duplicate archive filename')
    verified = set()
    for line in z.read('SHA256SUMS.txt').decode('utf-8').splitlines():
        m = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        if not m or m[2] not in files or m[2] in verified:
            raise ValueError('Invalid archive SHA manifest')
        if hashlib.sha256(z.read(m[2])).hexdigest() != m[1]:
            raise ValueError('Archive source SHA mismatch: ' + m[2])
        verified.add(m[2])
    if set(files) - {'SHA256SUMS.txt'} != verified or z.testzip() is not None:
        raise ValueError('Incomplete SHA manifest or damaged archive')
    return len(verified)


def build(larenlex_zip):
    with zipfile.ZipFile(larenlex_zip) as z:
        verify_archive(z)
        idx = json.loads(z.read(INDEX))['entries']
        rows = list(csv.DictReader(io.StringIO(z.read(A2_CSV).decode('utf-8-sig'))))
        ops = json.loads(z.read(API_JSON))['operations']
        r_text = z.read(R_MARKDOWN).decode('utf-8')
        r = re.findall(r'^\d+\. \*\*\[(R-\d{3})\]\*\*\s*(.+)$', r_text, re.M)
    require(len(rows) == len({x['A2 İşlev ID'] for x in rows}) == 453, 'A2 count or duplicate')
    require(len(ops) == len({x['operationId'] for x in ops}) == 102, 'API count or duplicate')
    require(len(r) == 594 and [x[0] for x in r] == [f'R-{i:03}' for i in range(1,595)], 'R list mismatch')
    require({x['A2 İşlev ID'] for x in rows} == set(idx['A2']), 'A2 canonical index mismatch')
    require({x['operationId'] for x in ops} == set(idx['API']), 'API canonical index mismatch')
    require(len(idx['LX_GOREV']) == 62, 'LX canonical index mismatch')
    lx = [{
        'id': key, 'type': 'LARENLEX_LX',
        'source_line': value['new_line'],
        'source_sha256': value['sha256_original_line'],
        'code_paths': [], 'tests': [], 'ci_run_id': None,
        'technical_status': 'NOT_VERIFIED', 'independent_acceptance': False
    } for key, value in sorted(idx['LX_GOREV'].items())]
    a2 = [{
        'id': row['A2 İşlev ID'], 'type': 'LARENLEX_A2',
        'system': row['LX Sistemi'], 'group': row['Alt grup ID'],
        'title': row['Özgün işlev başlığı'],
        'source_line': idx['A2'][row['A2 İşlev ID']]['new_line'],
        'source_sha256': idx['A2'][row['A2 İşlev ID']]['sha256_original_line'],
        'r_verified_links': [], 'api_verified_links': [],
        'candidate_links': [], 'code_paths': [], 'tests': [],
        'security_review': None, 'legal_review': None, 'translation_review': None,
        'current_technical_status': 'NOT_VERIFIED',
        'historical_independent_acceptance': False,
        'current_independent_acceptance': 'NOT_VERIFIED'
    } for row in rows]
    api = [{
        'id': row['operationId'], 'type': 'LARENLEX_A4_OPERATION',
        'method': row['method'], 'path': row['path'],
        'source_line': idx['API'][row['operationId']]['new_line'],
        'source_sha256': idx['API'][row['operationId']]['sha256_original_line'],
        'historical_only': True,
        'historical_RAM_synthetic': bool(row['transient_fixture_tested']),
        'historical_SQLite_synthetic_subset': bool(row['persistent_sqlite_fixture_tested']),
        'historical_production_backend': bool(row['production_backend_connected']),
        'verified_A2_links': [], 'test_ids': [], 'current_runtime': 'NOT_VERIFIED',
        'current_independent_acceptance': 'NOT_VERIFIED'
    } for row in ops]
    references = [{
        'id': key, 'type': 'SHARED_PORTAL_ORIGIN_REFERENCE_ONLY',
        'source_sha256': digest(text), 'source_text': text,
        'verified_android_links': [], 'candidate_android_links': [],
        'historical_android_independent_acceptance': False,
        'current_independent_acceptance': 'NOT_VERIFIED'
    } for key, text in r]
    counters = {'LX': 62, 'A2': 453, 'API': 102, 'R_reference_only': 594,
        'API_RAM_synthetic_historical': sum(x['historical_RAM_synthetic'] for x in api),
        'API_SQLite_subset_historical': sum(x['historical_SQLite_synthetic_subset'] for x in api),
        'API_disabled_historical': sum(not x['historical_RAM_synthetic'] for x in api),
        'API_live_production_historical': sum(x['historical_production_backend'] for x in api),
        'verified_cross_product_links': 0, 'verified_device_acceptance': 0}
    require(counters['API_RAM_synthetic_historical'] == 87, 'RAM scope mismatch')
    require(counters['API_SQLite_subset_historical'] == 37, 'SQLite scope mismatch')
    require(counters['API_disabled_historical'] == 15, 'Disabled scope mismatch')
    require(counters['API_live_production_historical'] == 0, 'Unexpected production claim')
    require(all(not x['historical_SQLite_synthetic_subset'] or x['historical_RAM_synthetic'] for x in api), 'SQLite not RAM subset')
    return {
        'meta': {'status': 'HISTORICAL_TRACE_ONLY', 'source_zip_sha256': hashlib.sha256(Path(larenlex_zip).read_bytes()).hexdigest(),
                 'mapping_policy': 'Explicit primary-code evidence required, never inferred',
                 'independent_acceptance': 'NOT_ESTABLISHED', 'current_android_head': 'UNAVAILABLE'},
        'counts': counters, 'LX': lx, 'A2': a2, 'API': api, 'R': references
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--source', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    report = build(a.source)
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text(json.dumps(report, sort_keys=True, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(report['counts'], sort_keys=True))

if __name__ == '__main__':
    main()
