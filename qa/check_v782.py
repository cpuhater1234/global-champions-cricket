#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_2_draft_turnover_logic.html'
EXPECTED='75209bc8f95c7fa3fcd17481d3d8e1695e217cc376c42d4e9dc21f23c04792b1'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v782.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED:
    raise SystemExit(f'v7.8.2 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
    "v7.8.2-draft-turnover-logic",
    "function voluntaryCutLimit(){return Math.max(0,4-userRetirementCount())}",
    "Forced retirements are never deferred.",
    "clubs leave the order as soon as their list is full",
    "o.draftNeeds=Object.fromEntries",
    "function slotsWithSupplement(){return draftSlots()}",
    "NO PICK NEEDED"
]
missing=[x for x in required if x not in text]
for forbidden in ["ONE MORE YEAR","five-player off-season departure cap","At most two voluntary contract releases"]:
    if forbidden in text:
        raise SystemExit(f'Old v7.8.1 turnover rule still present: {forbidden}')
if missing:
    raise SystemExit('Missing v7.8.2 markers: '+', '.join(missing))
print(f'v7.8.2 static checks OK {got}')
