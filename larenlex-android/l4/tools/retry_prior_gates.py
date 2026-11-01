"""Exactly two fresh bounded source/environment checks per inherited open group.
Does not touch production, Git refs, Android device or user data.
"""
import datetime,json,shutil,zipfile,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT.parent
SPECIAL=DATA/'LARENLEX_ANDROID_AYRI_TALIMATNAME_TESLIM.zip'
COMBINED=DATA/'TUM_DOSYALAR_AVOFIS_PORTAL_LARENLEX_ANDROID_TAM_TESLIM.zip'
TEXT=(DATA/'larenlex_current/LARENLEX_ANDROID_TEKIL_ANA_TALIMATNAME.md').read_text(encoding='utf-8')
GROUPS=[x['id'] for x in json.loads((DATA/'larenlex_l3/evidence/L3_PREVIOUS_LEVEL_RETRIES.json').read_text())['groups']]+['L4-ORIGINAL-12-ISSUE-ROUTES','L4-CANONICAL-GUIDE-PAGE-LIST-METADATA']

def zipnames(path):
    with zipfile.ZipFile(path) as z:return z.namelist()

def check(key,number):
    if key=='L0-A518-INDEPENDENT-BUNDLE':
        if number==1: return {'method':'mounted authentic bundle extension check', 'matches':[str(x) for x in DATA.rglob('*.bundle') if 'fake' not in x.name.lower()][:5]}
        return {'method':'special ZIP source member check','matches':[x for x in zipnames(SPECIAL) if x.lower().endswith('.bundle')]}
    if key=='L0-A514-HANDOFF':
        if number==1:return {'method':'mounted handoff ZIP filename check','matches':[str(x.name) for x in DATA.rglob('*A5_14*.zip')]}
        return {'method':'combined archive historic handoff manifest check','matches':[x for x in zipnames(COMBINED) if 'A5_14' in x and x.endswith('.zip')]}
    if key=='L0-REAL-ANDROID-SOURCE':
        archive=SPECIAL if number==1 else COMBINED
        return {'method':'special ZIP source inspection' if number==1 else 'combined ZIP source inspection','matches':[x for x in zipnames(archive) if x.endswith(('gradlew','settings.gradle','MainActivity.java'))]}
    if key=='L0-ANDROID-SDK-DEVICE':
        if number==1:return {'method':'tool executable availability','tools':{x:bool(shutil.which(x)) for x in ['gradle','adb','sdkmanager']}}
        return {'method':'Android API-35 SDK platform archive inspection','matches':[str(x) for x in ['/opt/android-sdk/platforms/android-35/android.jar','/usr/local/android-sdk/platforms/android-35/android.jar'] if Path(x).is_file()]}
    if key=='L0-ISOLATED-POSTGRES-RLS':
        if number==1:return {'method':'PostgreSQL local executables','tools':{x:bool(shutil.which(x)) for x in ['postgres','initdb','pg_ctl','psql']}}
        return {'method':'local PostgreSQL service socket presence','matches':[str(x) for x in Path('/var/run/postgresql').glob('.s.PGSQL.*')]}
    if key=='L1-CANONICAL-13-PROFILES':
        if number==1:return {'method':'primary special manual profile ID enumeration','matches':re.findall(r'^\s*(?:ROLE|PROFILE)[-_]\d+\b.*$',TEXT,re.M)[:13]}
        return {'method':'source archive profile registry filename search','matches':[x for x in zipnames(SPECIAL) if 'profil' in x.lower() and x.lower().endswith(('.json','.csv'))]}
    if key=='L1-CANONICAL-52-ENTITIES':
        if number==1:return {'method':'primary special manual data entity ID enumeration','matches':re.findall(r'^\s*(?:ENTITY|DATA)[-_]\d+\b.*$',TEXT,re.M)[:52]}
        return {'method':'source archive entity registry filename search','matches':[x for x in zipnames(SPECIAL) if 'entity' in x.lower() and x.lower().endswith(('.json','.csv'))]}
    if key=='L1-REAL-ANDROID-BUILD-EVIDENCE':
        if number==1:return {'method':'authentic LarenLex APK presence in original package','matches':[x for x in zipnames(SPECIAL) if x.endswith('.apk')]}
        return {'method':'actual SDK and ADB tooling presence','tools':{'gradle':bool(shutil.which('gradle')),'adb':bool(shutil.which('adb'))}}
    if key=='L4-ORIGINAL-12-ISSUE-ROUTES':
        if number==1:return {'method':'special manual 12-issue original slug enumeration','matches':re.findall(r'^\d+\. `[^`]+` — [^\n]*sorun[^\n]*$',TEXT,re.M)[:12]}
        with zipfile.ZipFile(COMBINED) as z:
            original=z.read('02_YUKLENEN_ORIJINAL_DOSYALAR/AVOFIS_LARENLEX_KATEGORIK_KAYIPSIZ_TEKIL_ANA_TALIMATNAME_v3.md').decode()
        return {'method':'historical merged manual distinct 12-route IDs','matches':re.findall(r'(?m)^\s*\d+\. `sorun-[^`]+`',original)[:12]}
    if key=='L4-CANONICAL-GUIDE-PAGE-LIST-METADATA':
        if number==1:return {'method':'special ZIP explicit source inventory file search','matches':[x for x in zipnames(SPECIAL) if any(k in x.lower() for k in ('rehber','guide','corporate_pages'))]}
        return {'method':'primary manual named guide records with URL+review metadata','matches':re.findall(r'(?m)^GUIDE-\d+\s*\|\s*https://[^\n]+',TEXT)[:16]}
    raise ValueError(key)

def resolved(d):
    if 'matches' in d:return bool(d['matches'])
    if 'tools' in d:return all(d['tools'].values())
    return False

if __name__=='__main__':
    rows=[]
    for key in GROUPS:
        attempts=[]
        for number in (1,2):
            observation=check(key,number)
            attempts.append({'attempt':number,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'result':'PRESENT_REQUIRES_VALIDATION' if resolved(observation) else 'UNRESOLVED',**observation})
        rows.append({'id':key,'new_l4_attempts':attempts,'resolved':False,'carry_to_l5':True})
    output={'product':'LarenLex Android','level':'L4','inherited_open_groups':8,'new_l4_legal_provenance_groups':2,'total_new_attempts':len(rows)*2,'groups':rows,'closure':'No missing artefact silently accepted; unresolved tasks do not stop other module development'}
    target=ROOT/'evidence/L4_OPEN_CONDITIONS_AND_RETRIES.json';target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('L4 RETRIES',len(rows),output['total_new_attempts'], 'all carried forward')
