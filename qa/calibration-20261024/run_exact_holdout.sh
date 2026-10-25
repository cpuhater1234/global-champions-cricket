#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CAL="$ROOT/qa/calibration-20261024"
FIN="$ROOT/qa/finish-pass"
GAME="${GCC8_CALIBRATION_BASELINE:-$CAL/published-baseline.html}"
VENV="${GCC8_CALIB_VENV:-$ROOT/.tmp/gcc-v8-calibration-venv}"

cd "$ROOT"
mkdir -p "$CAL/sources" "$(dirname "$VENV")"

fail(){ printf '%s\n' "ERROR: $*" >&2; exit 1; }
hash_file(){ sha256sum "$1" | awk '{print $1}'; }

python3 - <<'PY'
import hashlib,json,pathlib
root=pathlib.Path('qa/calibration-20261024')
pre=json.loads((root/'preregistration.json').read_text())
assert pre['heldOutMetricsObserved'] is False, 'preregistration no longer marks holdout unopened'
model=hashlib.sha256((root/'model.py').read_bytes()).hexdigest()
ids=hashlib.sha256((root/'identities.json').read_bytes()).hexdigest()
assert model==pre['modelCodeSha256'], (model,pre['modelCodeSha256'])
assert ids==pre['identityMappingSha256'], (ids,pre['identityMappingSha256'])
assert pre['validationYears']==[2020,2021,2022]
assert pre['lockedTestYears']==[2023,2024,2025,2026]
print('preregistration/model/identity: OK')
PY

EXPECTED_GAME="3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf"
[ -f "$GAME" ] || fail "missing frozen baseline; restore pinned3973116 game as documented:: $GAME"
[ "$(hash_file "$GAME")" = "$EXPECTED_GAME" ] || fail "frozen baseline hash mismatch"
printf '%s\n' "frozen baseline: OK"

fetch_exact(){
  rel="$1"; url="$2"; expected="$3"
  path="$ROOT/$rel"
  mkdir -p "$(dirname "$path")"
  if [ -f "$path" ]; then
    got="$(hash_file "$path")"
    [ "$got" = "$expected" ] || fail "existing source hash mismatch for $rel: $got"
    printf '%s\n' "source OK: $rel"
    return
  fi
  tmp="$path.download.$$"
  trap 'rm -f "$tmp"' RETURN
  curl -fL --retry 3 --retry-delay 2 -o "$tmp" "$url"
  got="$(hash_file "$tmp")"
  [ "$got" = "$expected" ] || fail "downloaded source hash mismatch for $rel: $got"
  mv "$tmp" "$path"
  trap - RETURN
  printf '%s\n' "source recovered: $rel"
}

fetch_exact "qa/finish-pass/bbl_json.zip" "https://cricsheet.org/downloads/bbl_json.zip" "7946b113c55ff4be695b2f0f7fccd12b8ce8afd652a67784a81bd6109f9b5907"
fetch_exact "qa/finish-pass/ipl_json.zip" "https://cricsheet.org/downloads/ipl_json.zip" "5757e04287179767ff8495f02902bd13812b9572ec8fa2ac1347ec2e9c6d4709"
fetch_exact "qa/finish-pass/ntb_json.zip" "https://cricsheet.org/downloads/ntb_json.zip" "a9461d44a3209ce29ed7012cb3e2046725633e37fa7016d82f58c57ad8df307a"
fetch_exact "qa/finish-pass/t20s_male_json.zip" "https://cricsheet.org/downloads/t20s_male_json.zip" "95305bc2dae8dcce7b8da7755f3992521874b14598ea5828129f37834e8b860a"

fetch_exact "qa/calibration-20261024/sources/bpl_male_json.zip" "https://cricsheet.org/downloads/bpl_male_json.zip" "4b1a314300ca105fa5396c426ac060db6a1db1541f97d9fadcddeb5bb09bd736"
fetch_exact "qa/calibration-20261024/sources/cpl_male_json.zip" "https://cricsheet.org/downloads/cpl_male_json.zip" "67752aff53de41e844d16c37de4d3767d8f9e7fbe1e544c5de5e4efaec76c430"
fetch_exact "qa/calibration-20261024/sources/ctc_male_json.zip" "https://cricsheet.org/downloads/ctc_male_json.zip" "ca259cbc6ab5cf2bb3c5650f3ff9fbe848a4ee1da28547b13d7bdf29d5bac170"
fetch_exact "qa/calibration-20261024/sources/ilt_male_json.zip" "https://cricsheet.org/downloads/ilt_male_json.zip" "5630f1640d8e982f01b6abe2b5449108d9b0c6f11ca88d720b99b7eef485a88d"
fetch_exact "qa/calibration-20261024/sources/lpl_male_json.zip" "https://cricsheet.org/downloads/lpl_male_json.zip" "5dc76095dc40c55c538ac977f500810a3eb20db4aceb30f7f5d39cc1c4b87cbd"
fetch_exact "qa/calibration-20261024/sources/mlc_male_json.zip" "https://cricsheet.org/downloads/mlc_male_json.zip" "bbf66eb5178dfcea928747efc7801fe75ad71ddca6f1c17962ac34487e2ff90e"
fetch_exact "qa/calibration-20261024/sources/psl_male_json.zip" "https://cricsheet.org/downloads/psl_male_json.zip" "e8172deb1f97fa23230bd717a88c8af689fdb374f6f9e2ce5be88a718d909401"
fetch_exact "qa/calibration-20261024/sources/sat_male_json.zip" "https://cricsheet.org/downloads/sat_male_json.zip" "284adb5fa7f2b510bec440a40fad648c376ecea52781d22e983fc9a8a79c3cb7"
fetch_exact "qa/calibration-20261024/sources/sma_male_json.zip" "https://cricsheet.org/downloads/sma_male_json.zip" "14ebfdc1541d6211a8041249d5c8cc9b460fb729a27169959f0de68971444455"
fetch_exact "qa/calibration-20261024/sources/ssm_male_json.zip" "https://cricsheet.org/downloads/ssm_male_json.zip" "a9ea24a3f09dd15fab83848d25dd3e99f20c7a7303ac83a219cd022347b8b7d5"

if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
fi
"$VENV/bin/python" -m pip install --disable-pip-version-check --no-input   "numpy==2.1.3" "scipy==1.14.1" "scikit-learn==1.5.2"

"$VENV/bin/python" "$CAL/test_pipeline.py"
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 "$VENV/bin/python" "$CAL/test_model.py"

OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 "$VENV/bin/python" "$CAL/ingest.py" | tee "$CAL/exact-ingest.log"

"$VENV/bin/python" - <<'PY'
import hashlib,json,pathlib
root=pathlib.Path('qa/calibration-20261024')
pre=json.loads((root/'preregistration.json').read_text())
report=json.loads((root/'ingest-report.json').read_text())
db=root/'deliveries.sqlite'
got=hashlib.sha256(db.read_bytes()).hexdigest()
assert got==report['datasetSha256'], (got,report['datasetSha256'])
assert got==pre['datasetSha256'], (got,pre['datasetSha256'])
assert report['totals']['matches']==9422
assert report['totals']['deliveries']==2219067
assert report['totals']['legal']==2135468
assert report['totals']['faced']==2144863
print('frozen dataset: OK',got)
PY

GCC8_TEST_BUILD="$GAME" node "$FIN/numeric-audit.mjs" | tee "$CAL/exact-numeric-audit.log"
"$VENV/bin/python" - <<'PY'
import json
d=json.load(open('qa/finish-pass/numeric-audit.json'))
assert d['hash']=='3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf'
assert d['summary']['uniquePlayers']==412
assert d['summary']['playerSeasons']==5149
print('game numeric baseline: OK')
PY

printf '%s\n' "ALL PRE-HOLDOUT GATES PASSED. Opening frozen 2023-2026 evaluation now."
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 "$VENV/bin/python" "$CAL/model.py" 2>&1 | tee "$CAL/exact-model.log"

"$VENV/bin/python" - <<'PY'
import json,math
p='qa/calibration-20261024/heldout-report.json'
r=json.load(open(p))
for block in ['walkForwardHeldOut','locked2022HeldOut']:
    for fam in ['bat','bowl']:
        x=r[block][fam]
        vals=[x['modelSpearman'],x['legacySpearman'],*x['gainInterval975']]
        assert all(math.isfinite(v) for v in vals),(block,fam,vals)
print(json.dumps({
    'chosen':r['chosen'],
    'promotionGates':r['promotionGates'],
    'walkForwardHeldOut':r['walkForwardHeldOut'],
    'locked2022HeldOut':r['locked2022HeldOut']
},indent=2))
print('NO PRODUCTION FILE WAS MODIFIED. Review evidence before any promotion.')
PY
