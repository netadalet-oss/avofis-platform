#!/usr/bin/env bash
# Read-only provenance preflight for a separately supplied LarenLex Git bundle.
# No customer data, production API, credentials, or remote GitHub writes.
set -euo pipefail
EXPECTED_DEVELOP='46338372045277e6856a488c9c01ff5749b3522b'
EXPECTED_MAIN='db796003982e1447969f610efe68de5cd80df268'
EXPECTED_A514='77fffcebc10d8bb49459deadb16a9a50c39498c5'
if (($# != 2)); then
  echo 'Usage: preflight_android_bundle.sh /path/A5_18.bundle /new/isolated/worktree' >&2
  exit 2
fi
bundle="$1"; target="$2"
if [[ ! -f "$bundle" ]]; then echo "BLOCKED: missing Git bundle: $bundle" >&2; exit 2; fi
if [[ -e "$target" ]]; then echo "REFUSED: target already exists: $target" >&2; exit 2; fi
bundle="$(realpath "$bundle")"
mkdir -p "$(dirname "$target")"
work="$(mktemp -d)"
trap 'rm -rf -- "$work"' EXIT
git init --bare -q "$work/verification.git"
echo 'CHECK: git bundle verify'
git -C "$work/verification.git" bundle verify "$bundle"
echo 'CHECK: git clone --branch develop'
git clone --quiet --branch develop -- "$bundle" "$target"
head="$(git -C "$target" rev-parse HEAD)"
main="$(git -C "$target" rev-parse refs/remotes/origin/main)"
echo "DEVELOP_SHA=$head"
echo "HISTORICAL_MAIN_SHA=$main"
if [[ "$head" != "$EXPECTED_DEVELOP" || "$main" != "$EXPECTED_MAIN" ]]; then
  echo 'FAIL: Android source refs do not match A5.18 historical handoff' >&2
  exit 1
fi
git -C "$target" cat-file -e "$EXPECTED_A514^{commit}"
git -C "$target" merge-base --is-ancestor "$EXPECTED_A514" "$EXPECTED_DEVELOP"
echo 'CHECK: git fsck'
git -C "$target" fsck --full
test -z "$(git -C "$target" status --porcelain)" || { echo 'FAIL: dirty clone' >&2; exit 1; }
if [[ ! -f "$target/scripts/verify-hashes.py" ]]; then
  echo 'FAIL: source hash verifier absent' >&2; exit 1
fi
(cd "$target" && python3 scripts/verify-hashes.py)
echo "BUNDLE_SHA256=$(sha256sum "$bundle" | awk '{print $1}')"
echo "PASS: A5.18 source bundle provenance verified; not Android device or production acceptance"
