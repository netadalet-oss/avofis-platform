#!/usr/bin/env python3
"""Read-only, fail-closed Android identity and cross-product config check.

Static scans cannot prove independent endpoints or technical/legal acceptance.
No secret values are printed.
"""
import argparse
import json
from pathlib import Path
import re
import sys

EXPECTED = 'nl.larenlex.app'
UNSAFE = re.compile(r'avofis-platform|avofis[._/-](?:api|portal|admin)|lexlingo|uyap-cep-ofis|aurum',re.I)
APP_ID = re.compile(r'\bapplicationId\s*(?:=\s*)?["\x27]([^"\x27]+)["\x27]')
PASSWORD = re.compile(r'\b(?:storePassword|keyPassword)\s*(?:=\s*)?["\x27][^"\x27]+["\x27]')
IGNORED = {'.git', '.gradle', 'build', 'node_modules', '.next', 'dist'}


def verify(root):
    root=Path(root)
    reasons=[]
    if not root.is_dir():
        return {'result':'BLOCKED_SOURCE','reasons':['ANDROID_PROJECT_ROOT_UNAVAILABLE'],'inspected_files':0}
    builds=list(root.rglob('build.gradle'))+list(root.rglob('build.gradle.kts'))
    builds=[f for f in builds if not IGNORED.intersection(f.relative_to(root).parts)]
    settings=[p for p in [root/'settings.gradle',root/'settings.gradle.kts'] if p.is_file()]
    manifests=[p for p in root.rglob('AndroidManifest.xml') if not IGNORED.intersection(p.relative_to(root).parts)]
    if not (builds and settings and manifests):
        reasons.append('REQUIRED_ANDROID_PROJECT_FILES_MISSING')
    ids=[]
    for f in builds:
        if f.stat().st_size>1_000_000:
            reasons.append('OVERSIZE_BUILD_FILE'); continue
        text=f.read_text(encoding='utf-8')
        ids.extend(APP_ID.findall(text))
        if PASSWORD.search(text):
            reasons.append('LITERAL_SIGNING_PASSWORD_IN_BUILD_SCRIPT')
        if UNSAFE.search(text):
            reasons.append('OTHER_PRODUCT_REFERENCE_IN_BUILD_SCRIPT')
    if not ids:
        reasons.append('STATIC_APPLICATION_ID_UNAVAILABLE')
    elif EXPECTED not in ids or any(id != EXPECTED for id in ids):
        reasons.append('APPLICATION_ID_MISMATCH_OR_AMBIGUITY')
    configfiles=[p for p in root.rglob('*') if p.is_file() and p.suffix in ('.properties','.json','.xml') and not IGNORED.intersection(p.relative_to(root).parts)]
    for p in configfiles[:1000]:
        if p.stat().st_size > 1_000_000:continue
        if UNSAFE.search(p.read_text(encoding='utf-8', errors='replace')):
            reasons.append('OTHER_PRODUCT_REFERENCE_IN_CONFIGURATION')
    if len(configfiles)>1000:
        reasons.append('CONFIG_SCAN_INCOMPLETE')
    return {'result':'FAIL' if reasons else 'STATIC_GATES_PASS_NOT_ACCEPTANCE',
            'reasons':sorted(set(reasons)), 'inspected_files':len(builds)+len(configfiles),
            'application_id_static': sorted(set(ids)),
            'backend_independence':'NOT_PROVEN_STATIC_ONLY','git_history':'NOT_PROVEN_STATIC_ONLY',
            'gradle_or_device_test':'NOT_RUN','live_acceptance':'NOT_ESTABLISHED'}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--source-root',required=True,type=Path)
    a=ap.parse_args()
    result=verify(a.source_root)
    print(json.dumps(result,ensure_ascii=False,sort_keys=True))
    return 0 if result['result']=='STATIC_GATES_PASS_NOT_ACCEPTANCE' else 1


if __name__=='__main__':sys.exit(main())
