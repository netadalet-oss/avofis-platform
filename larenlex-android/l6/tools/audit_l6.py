#!/usr/bin/env python3
"""Static Android source and optional APK examination; not device acceptance."""
import argparse, json, re, hashlib, zipfile, shutil, subprocess
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'android/app'

def audit(apk=None):
    gradle=(APP/'build.gradle').read_text(encoding='utf-8')
    manifest=(APP/'src/main/AndroidManifest.xml').read_text(encoding='utf-8')
    debug=(APP/'src/debug/AndroidManifest.xml').read_text(encoding='utf-8')
    static={
      'package_id':bool(re.search(r"applicationId\s+['\"]nl\.larenlex\.app['\"]",gradle)),
      'target_sdk_35':bool(re.search(r'targetSdk\s+35\b',gradle)),
      'min_sdk_26':bool(re.search(r'minSdk\s+26\b',gradle)),
      'compile_sdk_35':bool(re.search(r'compileSdk\s+35\b',gradle)),
      'java_17':bool(re.search(r'JavaVersion\.VERSION_17',gradle)),
      'release_manifest_no_internet':'android.permission.INTERNET' not in manifest,
      'debug_only_internet':'android.permission.INTERNET' in debug,
      'backup_disabled':'android:allowBackup="false"' in manifest,
      'cleartext_disabled':'android:usesCleartextTraffic="false"' in manifest,
      'l6_activity_nonexported':'android:name=".L6ReadinessActivity" android:exported="false"' in manifest,
      'no_signing_config_in_gradle':'signingConfigs' not in gradle and 'storePassword' not in gradle and 'keyPassword' not in gradle,
      'source_no_jks_or_keystore':not any(APP.rglob('*.jks')) and not any(APP.rglob('*.keystore')),
    }
    readiness=json.loads((APP/'src/main/assets/l6_readiness.json').read_text(encoding='utf-8'))
    static['all_14_modules']=len(readiness['modules'])==14
    static['all_12_scenarios_deferred']=len(readiness['scenarios'])==12 and all(x['actual_execution']=='NOT_RUN' for x in readiness['scenarios'])
    status={'status':'BLOCKED_NO_APK','path_sha256':None,'zip_integrity':None,'signature_verified':False,'package_verified':False}
    if apk is not None:
        apk=Path(apk)
        if not apk.is_file():
            status['status']='BLOCKED_APK_NOT_FOUND'
        else:
            status['path_sha256']=hashlib.sha256(apk.read_bytes()).hexdigest()
            try:
                with zipfile.ZipFile(apk) as z:
                    status['zip_integrity']=z.testzip() is None and 'AndroidManifest.xml' in z.namelist() and any(
                        x.startswith('classes') and x.endswith('.dex') for x in z.namelist())
            except zipfile.BadZipFile:
                status['zip_integrity']=False
            if status['zip_integrity'] and shutil.which('apksigner') and shutil.which('aapt'):
                sign=subprocess.run(['apksigner','verify','--verbose',str(apk)],capture_output=True,timeout=60)
                badge=subprocess.run(['aapt','dump','badging',str(apk)],capture_output=True,timeout=60)
                status['signature_verified']=sign.returncode==0
                text=badge.stdout.decode('utf-8','replace')
                status['package_verified']=badge.returncode==0 and "package: name='nl.larenlex.app'" in text
                status['status']='STATIC_APK_INSPECTED_NOT_DEVICE_ACCEPTANCE' if (
                    status['signature_verified'] and status['package_verified']) else 'APK_INSPECTION_FAILED'
            else:
                status['status']='APK_SIGNATURE_AND_ID_NOT_VERIFIED'
    return {'level':'L6','updated_utc':datetime.now(timezone.utc).isoformat(),
       'static_controls':static,'static_all_pass':all(static.values()),'apk':status,
       'device_test':'NOT_RUN','legal_acceptance':'NOT_ESTABLISHED','production_signing':'NOT_AUTHORIZED',
       'store_upload':'NOT_AUTHORIZED','L6_independent_technical_acceptance':False,
       'interpretation':'Static source only; not Android SDK/APK, device, Auth, RLS or legal acceptance.'}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--apk',type=Path)
    p.add_argument('--output',type=Path,default=ROOT/'evidence/L6_STATIC_APK_AUDIT.json')
    a=p.parse_args();result=audit(a.apk)
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'static_all_pass':result['static_all_pass'],'apk_status':result['apk']['status'],'independent_acceptance':False}))
    return 0 if result['static_all_pass'] else 1
if __name__=='__main__':
    raise SystemExit(main())
