#!/usr/bin/env python3
"""Fail-closed, offline L0 release gate for LarenLex; never touches production.

A source audit alone cannot establish independent L0 technical acceptance.
Missing Android sources block technical acceptance, NOT the user's permission to
continue to a deeper all-module development level with outstanding debts.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import sys


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def call(cmd, *, seconds=100):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=seconds, check=False)
        return {'status': 'PASS' if result.returncode == 0 else 'FAIL',
                'exit_code': result.returncode, 'command_tool': Path(cmd[0]).name}
    except (OSError, subprocess.TimeoutExpired):
        return {'status': 'UNAVAILABLE', 'exit_code': None,
                'command_tool': Path(cmd[0]).name}


def run(source, reference, bundle, a514, checkout, output, tools_dir=None):
    tools_dir = Path(tools_dir) if tools_dir is not None else Path(__file__).resolve().parent
    output = Path(output)
    if checkout is not None and (Path(checkout).exists() or Path(checkout).is_symlink()):
        raise ValueError('Checkout target must not exist; source preservation required')
    result = {'product': 'LarenLex Android', 'level': 'L0',
              'updated_utc': datetime.now(timezone.utc).isoformat(),
              'decision': 'BLOCKED_NOT_COMPLETE', 'L1_transition_authorized': False,
              'development_progression': 'MAY_CONTINUE_WITH_DEBT_ON_USER_APPROVAL',
              'technical_acceptance_separate_from_level_progress': True,
              'source_only_is_not_android_acceptance': True, 'gates': {}}
    gates = result['gates']
    for name, path in [('larenlex_zip', source), ('reference_zip', reference),
                       ('android_git_bundle', bundle), ('a514_handoff', a514)]:
        p = Path(path) if path is not None else None
        gates[name] = {'status': 'PRESENT_NOT_YET_VERIFIED', 'sha256': digest(p)} if p and p.is_file() else {'status': 'BLOCKED_MISSING'}
    if all(gates[k]['status'] == 'PRESENT_NOT_YET_VERIFIED' for k in ('larenlex_zip', 'reference_zip')):
        gates['offline_source_audit'] = call([sys.executable, str(tools_dir / 'verify_l0.py'),
            '--larenlex-zip', str(source), '--combined-reference-zip', str(reference),
            '--output', str(output.parent / 'source_audit')])
    else:
        gates['offline_source_audit'] = {'status': 'BLOCKED_MISSING_INPUT'}
    if gates['larenlex_zip']['status'] == 'PRESENT_NOT_YET_VERIFIED':
        gates['offline_trace_register'] = call([sys.executable, str(tools_dir / 'build_l0_trace.py'),
            '--source', str(source), '--out', str(output.parent / 'trace.json')])
    else:
        gates['offline_trace_register'] = {'status': 'BLOCKED_MISSING_INPUT'}
    if gates['android_git_bundle']['status'] == 'PRESENT_NOT_YET_VERIFIED' and checkout:
        gates['android_git_provenance'] = call(['bash', str(tools_dir / 'preflight_android_bundle.sh'),
                                              str(bundle), str(checkout)])
    else:
        gates['android_git_provenance'] = {'status': 'BLOCKED_MISSING_INPUT'}
    if gates['android_git_provenance']['status'] == 'PASS' and checkout:
        gates['android_app_id_static'] = call([sys.executable, str(tools_dir / 'check_android_identity.py'),
            '--source-root', str(checkout)])
    else:
        gates['android_app_id_static'] = {'status': 'BLOCKED_GIT_PROVENANCE'}
    for gate in ('a1_a4_architecture', 'a5_regression_on_verified_head',
                 'independent_backend_and_tenant_security', 'current_ci_run_on_head',
                 'current_android_device_evidence', 'independent_legal_acceptance'):
        gates[gate] = {'status': 'NOT_VERIFIED'}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, sort_keys=True, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path)
    parser.add_argument('--reference', type=Path)
    parser.add_argument('--android-bundle', type=Path)
    parser.add_argument('--a514-handoff', type=Path)
    parser.add_argument('--checkout', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = run(args.source, args.reference, args.android_bundle, args.a514_handoff, args.checkout, args.output)
    print(json.dumps({'decision': result['decision'], 'gates': {k: v['status'] for k,v in result['gates'].items()}}, ensure_ascii=False))
    return 2 if result['decision'] == 'BLOCKED_NOT_COMPLETE' else 0


if __name__ == '__main__':
    sys.exit(main())
