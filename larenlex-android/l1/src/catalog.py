"""Read 453 A2 source identities from private local CSV or existing L0 preview JSON."""
import csv
import json
from pathlib import Path
import re

def load_catalog(path):
    path=Path(path)
    if path.suffix.lower()=='.html':
        data=path.read_text(encoding='utf-8')
        match=re.search(r'<script id="module-data" type="application/json">(.*?)</script>',data,re.S)
        if not match:raise ValueError('missing source module-data')
        rows=[]
        for m in json.loads(match.group(1)):
            for g in m['groups'].values():
                for f in g['features']:
                    rows.append({'LX Sistemi':m['id'],'Sistem adı':m['title'],
                                 'Alt grup ID':g['id'],'Alt grup adı':g['title'],
                                 'A2 İşlev ID':f['id'],'Özgün işlev başlığı':f['title']})
    else:
        with open(path,encoding='utf-8-sig',newline='') as handle:
            rows=list(csv.DictReader(handle))
    systems={};seen=set()
    for r in rows:
        sid,gid,fid=r['LX Sistemi'],r['Alt grup ID'],r['A2 İşlev ID']
        if fid in seen or not gid.startswith(sid+'.G') or not fid.startswith(gid+'.F'):
            raise ValueError('duplicate or malformed source identity')
        seen.add(fid)
        mod=systems.setdefault(sid,{'id':sid,'title':r['Sistem adı'],'groups':{}})
        if mod['title']!=r['Sistem adı']:raise ValueError('module title drift')
        group=mod['groups'].setdefault(gid,{'id':gid,'title':r['Alt grup adı'],'features':[]})
        if group['title']!=r['Alt grup adı']:raise ValueError('group title drift')
        group['features'].append({'id':fid,'title':r['Özgün işlev başlığı'],'accepted':False})
    if len(systems)!=14 or sum(len(m['groups']) for m in systems.values())!=69 or len(seen)!=453:
        raise ValueError('source inventory coverage mismatch')
    return systems
