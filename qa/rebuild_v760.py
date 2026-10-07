#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V750=GAME/'global_champions_cricket_v7_5_0_dynasty_memory.html'
V760=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
EXPECTED_750='abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6'
EXPECTED_760='3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f'
PAYLOAD=PATCHES/'v750_to_v760_matchday.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V750.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v750.py')],cwd=ROOT,check=True)
if sha(V750)!=EXPECTED_750:
    raise SystemExit(f'v7.5 parent SHA mismatch: {sha(V750)}')
if not PAYLOAD.exists():
    raise SystemExit(f'Missing v7.6 patch payload: {PAYLOAD.name}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V760.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V760.name,V750.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V760)!=EXPECTED_760:
    raise SystemExit(f'v7.6 candidate SHA mismatch: {sha(V760)}')
print(f'v7.5 parent OK  {EXPECTED_750}')
print(f'v7.6 candidate  {EXPECTED_760}')
