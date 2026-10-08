#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V783=GAME/'global_champions_cricket_v7_8_3_hard_playtest_visual.html'
V784=GAME/'global_champions_cricket_v7_8_4_hardening.html'
EXPECTED_783='a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d164ba8e3078168c'
EXPECTED_784='591c41f9f2282919e56e8ccb7c4f4d0a1790f83471fa180ed0249c8cb6bd6531'
PAYLOAD=PATCHES/'v783_to_v784_hardening.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V783.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v783.py')],cwd=ROOT,check=True)
if sha(V783)!=EXPECTED_783:
    raise SystemExit(f'v7.8.3 parent SHA mismatch: {sha(V783)}')
if not PAYLOAD.exists():
    raise SystemExit(f'Missing v7.8.4 patch payload: {PAYLOAD.name}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V784.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V784.name,V783.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V784)!=EXPECTED_784:
    raise SystemExit(f'v7.8.4 candidate SHA mismatch: {sha(V784)}')
print(f'v7.8.3 parent OK {EXPECTED_783}')
print(f'v7.8.4 candidate {EXPECTED_784}')
