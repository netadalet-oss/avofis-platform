import datetime,hashlib,json,platform,shutil,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
res={'date_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'product':'LarenLex Android','level':'L5',
'local_test_suite':'10/10 PASS using localhost WSGI synthetic SQLite (see L5_TEST_LOG.txt)',
'local_http_positive':453,'local_http_BOLA_negative':453,'all_modules':14,
'chromium':'mobile+desktop, 14 modules, Arabic RTL, no horizontal overflow or JS errors',
'python':sys.version,'platform':platform.platform(),
'available_tools':{n:bool(shutil.which(n)) for n in ('git','python3','javac','java','chromium','gradle','adb','sdkmanager','psql','postgres')},
'android_apk_device_build':'NOT_TESTED','real_postgres_rls':'NOT_TESTED',
'independent_auth_jwt':'NOT_TESTED','CI_successful_run_id':None,
'real_accepted_A2':0,'required_new_real_accepted_A2':46,
'local_release_or_production_writes':False,
'preview_sha256':digest(root/'preview/LARENLEX_ANDROID_L5_BUTUN_UYGULAMA_ONIZLEME.html'),
'unverified_historical_bundle':'A5.18 not supplied; new snapshot bundle never substitutes it'}
(root/'evidence/L5_TECHNICAL_EVIDENCE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
print(res['preview_sha256'])
