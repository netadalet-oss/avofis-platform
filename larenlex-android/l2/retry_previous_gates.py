"""Reassess unresolved L0/L1 source/environment gates twice, with real checks.

Failure is NOT a hard stop for L2 development; no pretend source or live writes.
"""
import importlib.util
import json
import os
from datetime import datetime, timezone
from pathlib import Path
import shutil
import zipfile

ROOT=Path('/mnt/data')
SOURCES=[ROOT/'LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip',
         ROOT/'TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip']


def stamp():return datetime.now(timezone.utc).isoformat()


def scan_files(patterns):
    found=[]
    for root, dirs, files in os.walk(ROOT):
        dirs[:]=[d for d in dirs if d not in ('__pycache__','.git','node_modules','build')]
        for file in files:
            name=file.lower()
            if any(p in name for p in patterns):found.append(str(Path(root)/file))
    return found


def zip_scan(patterns):
    found=[]
    for archive in SOURCES:
        with zipfile.ZipFile(archive) as z:
            for name in z.namelist():
                if any(p in name.lower() for p in patterns):
                    found.append({'archive':archive.name,'member':name})
                if name.lower().endswith('.zip'):
                    import io
                    try:
                        with zipfile.ZipFile(io.BytesIO(z.read(name))) as nested:
                            for n in nested.namelist():
                                if any(p in n.lower() for p in patterns):
                                    found.append({'archive':archive.name,'nested':name,'member':n})
                    except zipfile.BadZipFile:pass
    return found


def tools(names):return {x:bool(shutil.which(x)) for x in names}

def records(kind,first,second):
    return {'id':kind,'attempts':[
        {'utc':stamp(),'method':first[0],'evidence':first[1],
         'result':'FOUND' if first[2] else 'BLOCKED_OR_UNAVAILABLE','exit_code':0 if first[2] else 2},
        {'utc':stamp(),'method':second[0],'evidence':second[1],
         'result':'FOUND' if second[2] else 'BLOCKED_OR_UNAVAILABLE','exit_code':0 if second[2] else 2}],
        'open_after_attempts':not(first[2] and second[2]),
        'carried_to_next_level_if_open':True}


def audit():
    items=[]
    specs=[
        ('L0-A518-INDEPENDENT-BUNDLE',['.bundle','larenlex_a5_18']),
        ('L0-A514-HANDOFF',['larenlex_devir_a5_14']),
        ('L0-REAL-ANDROID-SOURCE',['gradlew','settings.gradle','.git']),
    ]
    for kind,patterns in specs:
        a=scan_files(patterns);b=zip_scan(patterns)
        # Some unrelated project references and text names can match; a candidate
        # is never equated to a verified source. Only expected actual file types count.
        if kind=='L0-REAL-ANDROID-SOURCE':
            a=[p for p in a if p.endswith(('gradlew','settings.gradle','settings.gradle.kts')) and 'larenlex' in p.lower()]
            b=[x for x in b if x['member'].endswith(('gradlew','settings.gradle','settings.gradle.kts'))]
        if kind=='L0-A518-INDEPENDENT-BUNDLE':
            a=[p for p in a if Path(p).name.lower()=='larenlex_a5_18_bagimsiz_git_v2.8.0.bundle']
            b=[x for x in b if Path(x['member']).name.lower()=='larenlex_a5_18_bagimsiz_git_v2.8.0.bundle']
        if kind=='L0-A514-HANDOFF':
            a=[p for p in a if 'larenlex_devir_a5_14' in p.lower() and p.lower().endswith('.zip')]
            b=[x for x in b if 'larenlex_devir_a5_14' in x['member'].lower() and x['member'].endswith('.zip')]
        items.append(records(kind,('isolated mounted directory concrete file search',a,bool(a)),
                                ('authoritative ZIP nested-member concrete file search',b,bool(b))))
    commands=tools(['adb','gradle','sdkmanager','emulator'])
    sdk={k:bool(os.environ.get(k) and Path(os.environ[k]).is_dir()) for k in ('ANDROID_HOME','ANDROID_SDK_ROOT')}
    items.append(records('L0-ANDROID-SDK-DEVICE',('OS executable availability',commands,all(commands.values())),
                        ('SDK environment paths',sdk,any(sdk.values()))))
    pg=tools(['psql','postgres','initdb','pg_ctl'])
    runtime=tools(['docker','podman'])
    items.append(records('L0-ISOLATED-POSTGRES-RLS',('PostgreSQL executables',pg,all(pg.values())),
                         ('container runtime availability only',runtime,any(runtime.values()))))
    # Separate follow-ups inherited from L1; nothing probes production services.
    roles=scan_files(['a4_13_role','a4_profiles'])
    entities=scan_files(['a4_52_entit','a4_entities'])
    zip_roles=zip_scan(['a4_13_role','a4_profiles'])
    zip_entities=zip_scan(['a4_52_entit','a4_entities'])
    items.append(records('L1-CANONICAL-13-PROFILES',('local canonical filename search',roles,bool(roles)),
                         ('nested ZIP canonical filename search',zip_roles,bool(zip_roles))))
    items.append(records('L1-CANONICAL-52-ENTITIES',('local canonical filename search',entities,bool(entities)),
                         ('nested ZIP canonical filename search',zip_entities,bool(zip_entities))))
    # CI, legal, actual identity remain external: distinct concrete evidence check.
    apk=scan_files(['.apk'])
    toolchain=tools(['java','kotlinc'])
    items.append(records('L1-REAL-ANDROID-BUILD-EVIDENCE',('APK file existence scan',[p for p in apk if p.endswith('.apk')],bool(apk)),
                         ('toolchain binaries (insufficient alone)',toolchain,all(toolchain.values()))))
    return {'date':stamp(),'product':'LarenLex Android','level':'L2',
            'note':'Two distinct inspections per carried gate. Candidate references do not prove accepted real source. No secret inspection, live or external writes.',
            'previous_level_gate_groups':items,
            'all_prior_gates_resolved':all(not x['open_after_attempts'] for x in items),
            'next_attempt_minimum_per_open_gate':2}

if __name__=='__main__':
    report=audit()
    out=Path(__file__).parent/'evidence/L2_PREVIOUS_LEVEL_RETRIES.json'
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({x['id']:[a['result'] for a in x['attempts']] for x in report['previous_level_gate_groups']},ensure_ascii=False))
