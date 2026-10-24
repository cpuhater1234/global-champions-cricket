#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CAL="$ROOT/qa/calibration-20261024"
FIN="$ROOT/qa/finish-pass"
GAME="$ROOT/game/gcc_v8_product_candidate.html"
VENV="${GCC8_CALIB_VENV:-$ROOT/.tmp/gcc-v8-calibration-venv}"
INPUT="${1:-${GCC8_FROZEN_DB:-}}"
EXPECTED_DB="60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9"
EXPECTED_GAME="3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf"

fail(){ printf '%s\n' "ERROR: $*" >&2; exit 1; }
hash_file(){ sha256sum "$1" | awk '{print $1}'; }

[ -n "$INPUT" ] || fail "pass the hash-identical frozen deliveries.sqlite path as argument 1 or GCC8_FROZEN_DB"
[ -f "$INPUT" ] || fail "frozen database not found: $INPUT"
cd "$ROOT"

python3 - <<'PY'
import hashlib,json,pathlib
root=pathlib.Path('qa/calibration-20261024')
pre=json.loads((root/'preregistration.json').read_text())
assert pre['heldOutMetricsObserved'] is False
assert pre['validationYears']==[2020,2021,2022]
assert pre['lockedTestYears']==[2023,2024,2025,2026]
assert hashlib.sha256((root/'model.py').read_bytes()).hexdigest()==pre['modelCodeSha256']
assert hashlib.sha256((root/'identities.json').read_bytes()).hexdigest()==pre['identityMappingSha256']
print('preregistration/model/identity: OK')
PY

[ -f "$GAME" ] || fail "missing canonical playable"
[ "$(hash_file "$GAME")" = "$EXPECTED_GAME" ] || fail "canonical playable hash mismatch"
[ "$(hash_file "$INPUT")" = "$EXPECTED_DB" ] || fail "frozen database hash mismatch"

python3 - "$INPUT" <<'PY'
import sqlite3,sys
p=sys.argv[1]
c=sqlite3.connect(f'file:{p}?mode=ro',uri=True)
assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
tables={r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'")}
assert {'records','matches','states','appearances','fielding'} <= tables, tables
assert c.execute('SELECT COUNT(*) FROM matches').fetchone()[0]==9422
print('frozen database integrity/schema/match count: OK')
PY

mkdir -p "$CAL" "$(dirname "$VENV")"
tmp="$CAL/deliveries.sqlite.import.$$"
cp "$INPUT" "$tmp"
[ "$(hash_file "$tmp")" = "$EXPECTED_DB" ] || fail "copied database hash mismatch"
mv "$tmp" "$CAL/deliveries.sqlite"

if [ ! -x "$VENV/bin/python" ]; then python3 -m venv "$VENV"; fi
"$VENV/bin/python" -m pip install --disable-pip-version-check --no-input "numpy==2.1.3" "scipy==1.14.1" "scikit-learn==1.5.2"

"$VENV/bin/python" "$CAL/test_pipeline.py"
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 "$VENV/bin/python" "$CAL/test_model.py"

GCC8_TEST_BUILD="$GAME" node "$FIN/numeric-audit.mjs" | tee "$CAL/exact-db-numeric-audit.log"
"$VENV/bin/python" - <<'PY'
import json
d=json.load(open('qa/finish-pass/numeric-audit.json'))
assert d['hash']=='3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf'
assert d['summary']['uniquePlayers']==412
assert d['summary']['playerSeasons']==5149
print('game numeric baseline: OK')
PY

printf '%s\n' "ALL PRE-HOLDOUT GATES PASSED FROM HASH-IDENTICAL SQLITE. Opening frozen 2023-2026 evaluation now."
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 "$VENV/bin/python" "$CAL/model.py" 2>&1 | tee "$CAL/exact-db-model.log"

"$VENV/bin/python" - <<'PY'
import json,math
r=json.load(open('qa/calibration-20261024/heldout-report.json'))
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
