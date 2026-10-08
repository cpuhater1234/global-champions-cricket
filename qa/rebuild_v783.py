#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V782=GAME/'global_champions_cricket_v7_8_2_draft_turnover_logic.html'
V783=GAME/'global_champions_cricket_v7_8_3_hard_playtest_visual.html'
EXPECTED_782='75209bc8f95c7fa3fcd17481d3d8e1695e217cc376c42d4e9dc21f23c04792b1'
EXPECTED_783='a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d164ba8e3078168c'
PARTS=[PATCHES/f'v783_payload_part_{i:02d}.b64' for i in range(2)]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V782.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v782.py')],cwd=ROOT,check=True)
if sha(V782)!=EXPECTED_782:
    raise SystemExit(f'v7.8.2 parent SHA mismatch: {sha(V782)}')
missing=[p.name for p in PARTS if not p.exists()]
if missing:
    raise SystemExit('Missing v7.8.3 patch payload part(s): '+', '.join(missing))
payload=''.join(p.read_text().strip() for p in PARTS)
raw=gzip.decompress(base64.b64decode(payload))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V783.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V783.name,V782.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V783)!=EXPECTED_783:
    raise SystemExit(f'v7.8.3 candidate SHA mismatch: {sha(V783)}')
print(f'v7.8.2 parent OK {EXPECTED_782}')
print(f'v7.8.3 candidate {EXPECTED_783}')
