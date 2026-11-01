"""Source-derived inventory. No independent implementation claim for 453 A2 functions."""
import csv
import json
import re
from pathlib import Path


def load_catalog(path):
    path = Path(path)
    if path.suffix.lower() == '.html':
        source = path.read_text(encoding='utf-8')
        match = re.search(r'<script id="module-data" type="application/json">(.*?)</script>', source, re.S)
        if not match:
            raise ValueError('missing canonical L0 preview inventory')
        data = json.loads(match.group(1))
        rows = []
        for m in data:
            for g in m['groups'].values():
                for f in g['features']:
                    rows.append({'LX Sistemi':m['id'],'Sistem adı':m['title'],
                                 'Alt grup ID':g['id'],'Alt grup adı':g['title'],
                                 'A2 İşlev ID':f['id'],'Özgün işlev başlığı':f['title']})
    else:
        with open(path, encoding='utf-8-sig', newline='') as handle:
            rows = list(csv.DictReader(handle))
    systems = {}
    ids = set()
    for r in rows:
        sid, gid, fid = r['LX Sistemi'], r['Alt grup ID'], r['A2 İşlev ID']
        if fid in ids or not gid.startswith(sid + '.G') or not fid.startswith(gid + '.F'):
            raise ValueError('duplicate or invalid source identity')
        ids.add(fid)
        mod = systems.setdefault(sid, {'id': sid, 'title': r['Sistem adı'], 'groups': {}})
        if mod['title'] != r['Sistem adı']:
            raise ValueError('inconsistent module title')
        group = mod['groups'].setdefault(gid, {'id': gid, 'title': r['Alt grup adı'], 'features': []})
        if group['title'] != r['Alt grup adı']:
            raise ValueError('inconsistent subgroup title')
        group['features'].append({'id': fid, 'title': r['Özgün işlev başlığı'], 'accepted': False})
    if len(systems) != 14 or sum(len(x['groups']) for x in systems.values()) != 69 or len(ids) != 453:
        raise ValueError('source catalogue counts differ')
    return systems


def export_catalog(source_csv, target):
    mods = load_catalog(source_csv)
    output = {'provenance': 'LARENLEX_453_A2_ISLEV_KABUL_BASLANGIC.csv',
              'independent_acceptance': False, 'modules': list(mods.values())}
    Path(target).write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return output
