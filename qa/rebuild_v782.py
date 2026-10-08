#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V781=GAME/'global_champions_cricket_v7_8_1_player_experience.html'
V782=GAME/'global_champions_cricket_v7_8_2_draft_turnover_logic.html'
EXPECTED_781='6be011326dc44b67f113a9a9c2e242285c3fe7e2dfe490bde507701027342596'
EXPECTED_782='75209bc8f95c7fa3fcd17481d3d8e1695e217cc376c42d4e9dc21f23c04792b1'
PARTS=[PATCHES/f'v782_payload_part_{i:02d}.b64' for i in range(3)]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V781.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v781.py')],cwd=ROOT,check=True)
if sha(V781)!=EXPECTED_781:
    raise SystemExit(f'v7.8.1 parent SHA mismatch: {sha(V781)}')
missing=[p.name for p in PARTS if not p.exists()]
if missing:
    raise SystemExit('Missing v7.8.2 patch payload part(s): '+', '.join(missing))
payload=''.join(p.read_text().strip() for p in PARTS)
raw=gzip.decompress(base64.b64decode(payload))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V782.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V782.name,V781.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V782)!=EXPECTED_782:
    raise SystemExit(f'v7.8.2 candidate SHA mismatch: {sha(V782)}')
print(f'v7.8.1 parent OK {EXPECTED_781}')
print(f'v7.8.2 candidate {EXPECTED_782}')
