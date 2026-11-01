#!/usr/bin/env python3
"""Read-only LarenLex A2 source/Android catalogue reconciliation (not A2 acceptance)."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'server/SOURCE_A2_453_LOCAL_REFERENCE.csv'
MODULES = ROOT / 'android/app/src/main/assets/modules.json'


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def csv_rows(path):
    with Path(path).open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


def reconcile(modules, rows):
    """Return bounded issues and counts without treating display identifiers as implementation."""
    issues = []
    def issue(message):
        if len(issues) < 30:
            issues.append(message)
    required = {'A2 İşlev ID', 'LX Sistemi', 'Sistem adı', 'Alt grup ID',
                'Alt grup adı', 'Özgün işlev başlığı', 'Bağımsız kabul'}
    if not rows or not required.issubset(rows[0]):
        return {'ok': False, 'modules': 0, 'groups': 0, 'features': 0,
                'source_rows': len(rows), 'issues': ['Missing canonical CSV columns']}
    source = {}
    for row in rows:
        fid = row['A2 İşlev ID']
        if fid in source:
            issue('Duplicate canonical feature: ' + fid)
        source[fid] = row
    observed = set()
    mod_ids, group_ids = set(), set()
    count = 0
    for mod in modules:
        mid = mod['id']
        if mid in mod_ids:
            issue('Duplicate module: ' + mid)
        mod_ids.add(mid)
        for group in mod['groups']:
            gid = group['id']
            if gid in group_ids or not gid.startswith(mid + '.'):
                issue('Invalid/duplicate group: ' + gid)
            group_ids.add(gid)
            for f in group['features']:
                count += 1
                fid = f['id']
                if fid in observed or not fid.startswith(gid + '.'):
                    issue('Invalid/duplicate feature: ' + fid)
                observed.add(fid)
                row = source.get(fid)
                if row is None:
                    issue('Unmapped feature: ' + fid)
                    continue
                expected = (row['LX Sistemi'], row['Sistem adı'], row['Alt grup ID'],
                            row['Alt grup adı'], row['Özgün işlev başlığı'])
                actual = (mid, mod['title'], gid, group['title'], f['title'])
                if actual != expected:
                    issue('Catalogue title/parent drift: ' + fid)
                if f.get('accepted') is not False:
                    issue('Acceptance flag without independent evidence: ' + fid)
    for missing in sorted(source.keys() - observed)[:10]:
        issue('Canonical feature missing from Android: ' + missing)
    if len(mod_ids) != 14 or len(group_ids) != 69 or count != 453 or len(source) != 453:
        issue('14/69/453 source baseline not preserved')
    if sorted(mod_ids) != [f'LX-{i:02d}' for i in range(1, 15)]:
        issue('LX-01..LX-14 coverage is incomplete')
    if any(row['Bağımsız kabul'] != 'BAĞIMSIZ KABUL YOK' for row in rows):
        issue('Source acceptance status requires separate human review')
    return {'ok': not issues, 'modules': len(mod_ids), 'groups': len(group_ids),
            'features': count, 'source_rows': len(rows), 'issues': issues}


def audit(original_a2=None, a4=None, refs=None, manual=None,
          *, local_source=SOURCE, modules_path=MODULES):
    result = reconcile(json.loads(Path(modules_path).read_text(encoding='utf-8')),
                       csv_rows(local_source))
    result['local_source_sha256'] = sha256(local_source)
    result['android_modules_sha256'] = sha256(modules_path)
    result['external_original_a2'] = 'NOT_PROVIDED'
    if original_a2 is not None:
        same = sha256(original_a2) == result['local_source_sha256']
        result['external_original_a2'] = 'BYTE_IDENTICAL' if same else 'MISMATCH'
        if not same:
            result['issues'].append('External original A2 source differs from local reference')
            result['ok'] = False
    for name, path, column, n in (
        ('a4_operations', a4, 'operationId', 102),
        ('avofis_shared_R_references', refs, 'R-ID', 594)):
        if path is None:
            result[name] = 'NOT_PROVIDED'
            continue
        records = csv_rows(path)
        ids = [r[column] for r in records]
        valid = len(ids) == n and len(set(ids)) == n and all(ids)
        result[name] = {'count': len(ids), 'unique': len(set(ids)),
                        'inventory_pass': valid, 'sha256': sha256(path)}
        if not valid:
            result['ok'] = False
            result['issues'].append(f'{name}: expected {n} distinct IDs')
    if manual is None:
        result['lx_001_062'] = 'NOT_PROVIDED'
    else:
        import re
        body = Path(manual).read_text(encoding='utf-8')
        found = re.findall(r'^#### LX-(\d{3})\s', body, re.M)
        valid = sorted(found) == [f'{i:03d}' for i in range(1, 63)]
        result['lx_001_062'] = {'inventory_pass': valid, 'unique': len(set(found)), 'sha256': sha256(manual)}
        if not valid:
            result['ok'] = False
            result['issues'].append('LX-001..LX-062 original task headings incomplete')
    result['verdict'] = 'SOURCE_CATALOGUE_MATCH_ONLY' if result['ok'] else 'SOURCE_DRIFT'
    result['independent_a2_acceptance'] = 'NOT_ESTABLISHED'
    result['android_device_acceptance'] = 'NOT_RUN'
    result['notes'] = 'Inventory/source check only; no APK, production API, device, RLS/Auth or legal acceptance.'
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--original-a2', type=Path)
    p.add_argument('--a4', type=Path)
    p.add_argument('--refs', type=Path)
    p.add_argument('--manual', type=Path)
    p.add_argument('--output', type=Path)
    args = p.parse_args()
    result = audit(args.original_a2, args.a4, args.refs, args.manual)
    rendered = json.dumps(result, indent=2, ensure_ascii=False) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding='utf-8')
    print(rendered)
    return 0 if result['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
