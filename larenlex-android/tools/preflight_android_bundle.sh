#!/usr/bin/env bash
# A5.18 independent Git bundle preflight. No source is published at target until
# all provenance, ancestry, hash and filesystem checks pass.
set -euo pipefail
EXPECTED_DEVELOP='46338372045277e6856a488c9c01ff5749b3522b'
EXPECTED_MAIN='db796003982e1447969f610efe68de5cd80df268'
EXPECTED_A514='77fffcebc10d8bb49459deadb16a9a50c39498c5'
if (($# != 2)); then
  echo 'Usage: preflight_android_bundle.sh /path/A5_18.bundle /new/isolated/worktree' >&2
  exit 2
fi
bundle="$1"; destination="$2"
if [[ ! -f "$bundle" ]]; then echo 'BLOCKED: missing Git bundle' >&2; exit 2; fi
if [[ -e "$destination" || -L "$destination" ]]; then
  echo 'REFUSED: target already exists' >&2; exit 2
fi
bundle="$(realpath -e -- "$bundle")"
parent="$(dirname -- "$destination")"
mkdir -p -- "$parent"
parent="$(cd -P -- "$parent" && pwd)"
target="$parent/$(basename -- "$destination")"
if [[ -e "$target" || -L "$target" ]]; then echo 'REFUSED: target already exists' >&2; exit 2; fi
work="$(mktemp -d "$parent/.larenlex-a518.XXXXXX")"
trap 'rm -rf -- "$work"' EXIT
# The bare verification repository has no external refs, so an incremental
# bundle cannot masquerade as a complete independent handoff.
git init --bare -q "$work/verification.git"
echo 'CHECK: git bundle verify'
git -C "$work/verification.git" bundle verify "$bundle"
echo 'CHECK: isolated git clone --branch develop'
git clone --quiet --branch develop -- "$bundle" "$work/checkout"
head="$(git -C "$work/checkout" rev-parse --verify HEAD)"
main="$(git -C "$work/checkout" rev-parse --verify refs/remotes/origin/main)"
echo "DEVELOP_SHA=$head"
echo "HISTORICAL_MAIN_SHA=$main"
if [[ "$head" != "$EXPECTED_DEVELOP" || "$main" != "$EXPECTED_MAIN" ]]; then
  echo 'FAIL: Android source refs do not match A5.18 historical handoff' >&2
  exit 1
fi
git -C "$work/checkout" cat-file -e "$EXPECTED_A514^{commit}"
git -C "$work/checkout" merge-base --is-ancestor "$EXPECTED_A514" "$EXPECTED_DEVELOP"
echo 'CHECK: git fsck'
git -C "$work/checkout" fsck --full
test -z "$(git -C "$work/checkout" status --porcelain)" || {
  echo 'FAIL: dirty checkout' >&2; exit 1
}
if [[ ! -f "$work/checkout/scripts/verify-hashes.py" ]]; then
  echo 'FAIL: source hash verifier absent' >&2; exit 1
fi
(cd "$work/checkout" && python3 scripts/verify-hashes.py)
# Stage on destination filesystem. No rejected clone persists at target.
if [[ -e "$target" || -L "$target" ]]; then echo 'REFUSED: target appeared during verification' >&2; exit 2; fi
mv -n -T -- "$work/checkout" "$target"
if [[ -e "$work/checkout" ]]; then echo 'REFUSED: target appeared during promotion' >&2; exit 2; fi
echo "BUNDLE_SHA256=$(sha256sum "$bundle" | awk '{print $1}')"
echo "PASS: A5.18 source provenance verified; Android runtime and release acceptance NOT established"
