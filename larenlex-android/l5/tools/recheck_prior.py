"""Exactly two bounded NEW checks for each inherited open group, no production access."""
from datetime import datetime,timezone
from pathlib import Path
import json
import shutil
import zipfile
import os
import re

ROOT=Path(__file__).resolve().parents[1]
DATA=Path('/mnt/data')
SRC=Path('/mnt/data/larenlex_current/LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md')
ZIPS=[DATA/'LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip', DATA/'TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip']
PREVIOUS=Path('/mnt/data/larenlex_l4/evidence/L4_OPEN_CONDITIONS_AND_RETRIES.json')


def event(method, matched):
    return {'method':method,'result':'OPEN' if not matched else 'CANDIDATE_NOT_YET_ACCEPTED',
            'evidence':matched,'time_utc':datetime.now(timezone.utc).isoformat()}


def run():
    with zipfile.ZipFile(ZIPS[0]) as z1, zipfile.ZipFile(ZIPS[1]) as z2:
        names1=z1.namelist();names2=z2.namelist()
    manual=SRC.read_text(encoding='utf-8')
    keys=[x['id'] for x in json.loads(PREVIOUS.read_text())['groups']]
    result=[]
    for k in keys:
        checks=[]
        if 'A518' in k:
            checks=[event('A5.18 explicit file names',[p.name for p in DATA.rglob('*.bundle') if 'A5_18' in p.name]),
                    event('ZIP Git bundle members',[x for x in names1+names2 if re.search(r'A5_18.*\.bundle$',x,re.I)])]
        elif 'A514' in k:
            checks=[event('A5.14 ZIP on local drive',[p.name for p in DATA.rglob('*A5_14*.zip')]),
                    event('A5.14 source archive members',[x for x in names1+names2 if re.search(r'(A5_14.*zip|DEVIR_A5_14)',x,re.I)])]
        elif 'REAL-ANDROID-SOURCE' in k:
            checks=[event('independent Android .git evidence',[str(p) for p in DATA.glob('**/.git/HEAD') if 'larenlex' in str(p).lower()]),
                    event('authentic Android bundle references',[x for x in names1+names2 if x.endswith('.bundle')])]
        elif 'ANDROID-SDK' in k or 'ANDROID-BUILD' in k:
            checks=[event('Android build executables',[n for n in ('adb','gradle','sdkmanager') if shutil.which(n)]),
                    event('Android SDK platform files',[str(x) for x in (Path('/opt/android-sdk'),Path('/usr/local/lib/android/sdk'),Path.home()/'Android/Sdk') if x.exists()])]
        elif 'POSTGRES' in k:
            checks=[event('PostgreSQL executables',[n for n in ('psql','postgres','initdb','pg_ctl') if shutil.which(n)]),
                    event('local Postgres unix sockets',[str(x) for x in (Path('/var/run/postgresql'),Path('/tmp/.s.PGSQL.5432')) if x.exists()])]
        elif '13-PROFILES' in k:
            checks=[event('primary manual profile inventory',re.findall(r'13\s+(?:kanonik\s+)?(?:rol|profil)\w*\s*(?:kimli|listesi|kaydı)',manual,re.I)[:5]),
                    event('ZIP profile registry filenames',[x for x in names1 if '13' in x and ('PROFILE' in x.upper() or 'PROFIL' in x.upper())])]
        elif '52-ENTITIES' in k:
            checks=[event('primary manual 52 entity roster headings',[x for x in manual.splitlines() if re.search(r'52\s+(?:mantıksal\s+)?(?:entit|varlık)',x,re.I)][:4]),
                    event('canonical entity registry member names',[x for x in names1 if re.search(r'(ENTITY|VARLIK)_?(52)?',x,re.I)])]
        elif '12-ISSUE' in k:
            checks=[event('L4 catalog route IDs',[x for x in names1 if '12_SORUN' in x]),
                    event('manual v18 slug enumeration',[x for x in manual.splitlines() if re.match(r'^\s*[-*]\s*/[a-z-]+/sorun/',x)][:6])]
        elif 'GUIDE-PAGE' in k:
            checks=[event('ZIP canonical guide URL catalog',[x for x in names1 if re.search(r'(GUIDE|REHBER|KURUMSALSAYFA).*CSV',x,re.I)]),
                    event('primary manual 16 guide complete URL definitions',[x for x in manual.splitlines() if 'rehber/' in x and 'https://' in x][:6])]
        else:
            checks=[event('primary source text search',[x for x in manual.splitlines() if k in x][:4]),
                    event('source archive path search',[x for x in names1 if k in x][:4])]
        assert len(checks)==2
        result.append({'id':k,'l5_attempts':checks,'status':'CARRY_FORWARD_NOT_ACCEPTED',
                       'note':'Potential references never close the blocker without canonical source and runtime evidence'})
    result.sort(key=lambda x:x['id'])
    out={'level':'L5','new_attempts':sum(len(x['l5_attempts']) for x in result),
         'groups':result,'independent_acceptance':False}
    (ROOT/'evidence/L5_PREVIOUS_BLOCKERS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    return out

if __name__=='__main__':
    data=run();print('groups',len(data['groups']),'attempts',data['new_attempts'])
