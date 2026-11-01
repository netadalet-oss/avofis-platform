"""Two distinct, bounded fresh checks for all eight inherited evidence gates."""
from pathlib import Path
import datetime
import json
import shutil
import subprocess
import zipfile

ROOT=Path(__file__).resolve().parent
DATA=ROOT.parent
ARCHIVE=DATA/'LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip'
REFERENCE=DATA/'TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip'
HIST=DATA/'larenlex_l2/evidence/L2_PREVIOUS_LEVEL_RETRIES.json'
ids=[r['id'] for r in json.loads(HIST.read_text())['previous_level_gate_groups']]

def search_archive(p, pattern):
    with zipfile.ZipFile(p) as z:
        return [n for n in z.namelist() if pattern(n.lower())][:20]

def check(which, attempt):
    if which in ('L0-A518-INDEPENDENT-BUNDLE', 'L0-A514-HANDOFF'):
        name='a5_18' if 'A518' in which else 'a5_14'
        if attempt==1:
            matches=[str(p.relative_to(DATA)) for p in DATA.glob('**/*') if p.is_file() and name in p.name.lower() and p.suffix.lower() in ('.bundle','.zip')]
            # Do not mistake test artifacts for the genuine handoff.
            matches=[x for x in matches if 'fake' not in x and 'test' not in x]
            return bool(matches),{'method':'explicit mounted filename and extension search','matches':matches[:10]}
        matches=search_archive(REFERENCE,lambda n: name in n and (n.endswith('.bundle') or n.endswith('.zip')))
        return bool(matches),{'method':'independent combined ZIP manifest filename search','matches':matches}
    if which=='L0-REAL-ANDROID-SOURCE':
        if attempt==1:
            results=search_archive(ARCHIVE,lambda n:n.endswith(('settings.gradle','settings.gradle.kts','gradlew','mainactivity.java')))
            return bool(results),{'method':'special-instructions ZIP Android project member lookup','matches':results}
        results=search_archive(REFERENCE,lambda n:n.endswith(('settings.gradle','settings.gradle.kts','gradlew','mainactivity.java')))
        return bool(results),{'method':'combined historical ZIP Android project member lookup','matches':results}
    if which=='L0-ANDROID-SDK-DEVICE':
        if attempt==1:
            tools={x:shutil.which(x) for x in ('adb','gradle','sdkmanager')}
            return bool(tools['adb'] and tools['gradle']),{'method':'executable resolution','tools':tools}
        options=['/opt/android-sdk/platforms/android-35/android.jar','/usr/local/android-sdk/platforms/android-35/android.jar','/home/oai/share/android-sdk/platforms/android-35/android.jar']
        return any(Path(x).is_file() for x in options),{'method':'specific API 35 installed SDK artifact check','paths_checked':len(options),'sdk_found':any(Path(x).is_file() for x in options)}
    if which=='L0-ISOLATED-POSTGRES-RLS':
        if attempt==1:
            tools={x:shutil.which(x) for x in ('psql','postgres','initdb','pg_ctl')}
            return bool(tools['psql'] and tools['initdb']),{'method':'local postgresql toolchain existence','tools':tools}
        p=Path('/var/run/postgresql')
        sockets=[x.name for x in p.glob('.s.PGSQL.*')] if p.is_dir() else []
        return bool(sockets),{'method':'local unix postgres socket inspection without connection','sockets':sockets}
    if which in ('L1-CANONICAL-13-PROFILES','L1-CANONICAL-52-ENTITIES'):
        number=13 if '13' in which else 52
        if attempt==1:
            source=ROOT.parent/'larenlex_current/LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md'
            text=source.read_text(encoding='utf-8')
            # Mere mention of count is not the full canonical enumerated registry.
            markers=[line.strip()[:140] for line in text.splitlines() if (str(number) in line and ('profil' in line.lower() or 'nesne' in line.lower()))][:6]
            return False,{'method':'instruction prose inspection for enumerated canonical IDs','count_mentions':markers,'canonical_id_registry':'NOT_PRESENT'}
        registry=ROOT.parent/'larenlex_l2/evidence/L1_ALL_MODULES_DOMAIN_REGISTER.json'
        return False,{'method':'L1/L2 domain-registry provenance check','source_exists':registry.is_file(),'canonical_id_registry':'NOT_VERIFIED_FROM_PRIMARY_SOURCE'}
    if which=='L1-REAL-ANDROID-BUILD-EVIDENCE':
        if attempt==1:
            p=shutil.which('gradle')
            return False,{'method':'Gradle runner and authentic source build artifact check','gradle_runner':p,'authentic_android_apk_available':False}
        usertree=ROOT.parent/'larenlex_current'
        artifacts=[str(x.relative_to(usertree)) for x in usertree.rglob('*.apk')]
        return False,{'method':'historic source handoff APK scan','historic_apks':artifacts,'not_counted_new_l3_source':True}
    raise ValueError(which)

rows=[]
for group in ids:
    observations=[]
    for i in (1,2):
        ok,detail=check(group,i)
        observations.append({'attempt':i,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
                             'result':'VERIFIED' if ok else 'UNRESOLVED',**detail})
    rows.append({'id':group,'attempts':observations,'closed':all(x['result']=='VERIFIED' for x in observations),
                 'carry_forward':True})
result={'level':'L3','scope':'historical source/SDK evidence only','inherited_groups':len(rows),
        'new_attempts':sum(len(x['attempts']) for x in rows), 'groups':rows,
        'policy':'These checks never authorize Git publication, production operations or real Android acceptance.'}
out=ROOT/'evidence/L3_PREVIOUS_LEVEL_RETRIES.json'
out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'groups':len(rows),'attempts':result['new_attempts'],'still_open':sum(not x['closed'] for x in rows)},ensure_ascii=False))
