#!/usr/bin/env python3
"""Read-only Android identity preflight. Static success is NOT runtime acceptance.

No source contents, environment values or credentials are included in output.
"""
import argparse
import json
import os
from pathlib import Path
import re
import sys

EXPECTED = 'nl.larenlex.app'
UNSAFE = re.compile(r'avofis-platform|avofis[._/-](?:api|portal|admin)|lexlingo|uyap-cep-ofis|aurum', re.I)
APP_ID = re.compile(r'\bapplicationId\s*(?:=\s*)?["\']([^"\']+)["\']')
PASSWORD = re.compile(r'\b(?:storePassword|keyPassword)\s*(?:=\s*)?["\'][^"\']+["\']')
IGNORED = {'.git', '.gradle', 'build', 'node_modules', '.next', 'dist', '.idea'}
SCAN_EXTENSIONS = {'.kt', '.java', '.gradle', '.kts', '.json', '.xml', '.properties', '.toml', '.yaml', '.yml'}
MAX_SOURCE_FILES = 5000
MAX_FILE_BYTES = 1024 * 1024
SECRET_FILES = {'.jks', '.keystore', '.p12', '.pfx', '.pem'}
SENSITIVE_ENV = {'.env', '.env.local', '.env.production', '.env.development', '.env.test'}
PASSWORD_KV = re.compile(r'(?im)^\s*(?:storePassword|keyPassword)\s*[:=]\s*(?![$][{])[^\s#]+')


def verify(root):
    root = Path(root)
    if root.is_symlink() or not root.is_dir():
        return {'result': 'BLOCKED_SOURCE', 'reasons': ['ANDROID_PROJECT_ROOT_UNAVAILABLE_OR_LINKED'], 'inspected_files': 0}
    reasons, files = [], []
    builds, ids, settings, manifests = [], [], [], []
    # Never follow links: a malicious input tree cannot cause local file reads
    # outside the explicitly supplied source directory.
    for base, dirs, names in os.walk(root, followlinks=False):
        base = Path(base)
        for directory in list(dirs):
            if directory in IGNORED:
                dirs.remove(directory)
            elif (base / directory).is_symlink():
                reasons.append('LINKED_SOURCE_PATH_REVIEW_REQUIRED')
                dirs.remove(directory)
        for name in names:
            path = base / name
            if path.is_symlink():
                reasons.append('LINKED_SOURCE_PATH_REVIEW_REQUIRED')
                continue
            if path.suffix.lower() in SECRET_FILES:
                reasons.append('SIGNING_KEY_MATERIAL_IN_SOURCE_TREE')
                continue
            if name not in {'build.gradle', 'build.gradle.kts', 'settings.gradle', 'settings.gradle.kts'} and name not in SENSITIVE_ENV and path.suffix not in SCAN_EXTENSIONS:
                continue
            files.append(path)
            if len(files) > MAX_SOURCE_FILES:
                reasons.append('SOURCE_SCAN_LIMIT_EXCEEDED')
                break
        if len(files) > MAX_SOURCE_FILES:
            break
    files = sorted(files, key=lambda p: str(p.relative_to(root)))
    for path in files:
        name = path.name
        if name in {'build.gradle', 'build.gradle.kts'}:
            builds.append(path)
        if name in {'settings.gradle', 'settings.gradle.kts'} and path.parent == root:
            settings.append(path)
        if name == 'AndroidManifest.xml':
            manifests.append(path)
        if name in SENSITIVE_ENV:
            reasons.append('LOCAL_ENV_FILE_MUST_NOT_ENTER_SOURCE_SCAN')
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                reasons.append('SOURCE_FILE_TOO_LARGE_TO_VERIFY')
                continue
            contents = path.read_text(encoding='utf-8')
        except (OSError, UnicodeError):
            reasons.append('UNREADABLE_SOURCE_FILE')
            continue
        if name in {'build.gradle', 'build.gradle.kts'}:
            ids.extend(APP_ID.findall(contents))
            if PASSWORD.search(contents):
                reasons.append('LITERAL_SIGNING_PASSWORD_IN_BUILD_SCRIPT')
        if path.suffix == '.properties' and PASSWORD_KV.search(contents):
            reasons.append('LITERAL_SIGNING_PASSWORD_IN_CONFIGURATION')
        if UNSAFE.search(contents):
            if name in {'build.gradle', 'build.gradle.kts'}:
                reasons.append('OTHER_PRODUCT_REFERENCE_IN_BUILD_SCRIPT')
            elif path.suffix in {'.kt', '.java'}:
                reasons.append('OTHER_PRODUCT_REFERENCE_IN_APP_SOURCE')
            else:
                reasons.append('OTHER_PRODUCT_REFERENCE_IN_CONFIGURATION')
    if not (builds and settings and manifests):
        reasons.append('REQUIRED_ANDROID_PROJECT_FILES_MISSING')
    if not ids:
        reasons.append('STATIC_APPLICATION_ID_UNAVAILABLE')
    elif EXPECTED not in ids or any(value != EXPECTED for value in ids):
        reasons.append('APPLICATION_ID_MISMATCH_OR_AMBIGUITY')
    return {'result': 'FAIL' if reasons else 'STATIC_GATES_PASS_NOT_ACCEPTANCE',
            'reasons': sorted(set(reasons)), 'inspected_files': len(files),
            'application_id_static': sorted(set(ids)),
            'backend_independence': 'NOT_PROVEN_STATIC_ONLY',
            'git_history': 'NOT_PROVEN_STATIC_ONLY', 'gradle_or_device_test': 'NOT_RUN',
            'live_acceptance': 'NOT_ESTABLISHED'}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    result = verify(parser.parse_args().source_root)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result['result'] == 'STATIC_GATES_PASS_NOT_ACCEPTANCE' else 1


if __name__ == '__main__':
    sys.exit(main())
