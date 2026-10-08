#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V760=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
V781=GAME/'global_champions_cricket_v7_8_1_player_experience.html'
EXPECTED_760='3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f'
EXPECTED_781='6be011326dc44b67f113a9a9c2e242285c3fe7e2dfe490bde507701027342596'
PAYLOAD=PATCHES/'v760_to_v781_player_experience.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V760.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v760.py')],cwd=ROOT,check=True)
if sha(V760)!=EXPECTED_760:
    raise SystemExit(f'v7.6 parent SHA mismatch: {sha(V760)}')
if not PAYLOAD.exists():
    raise SystemExit(f'Missing v7.8.1 patch payload: {PAYLOAD.name}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V781.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V781.name,V760.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V781)!=EXPECTED_781:
    raise SystemExit(f'v7.8.1 candidate SHA mismatch: {sha(V781)}')
print(f'v7.6 parent OK   {EXPECTED_760}')
print(f'v7.8.1 candidate {EXPECTED_781}')
