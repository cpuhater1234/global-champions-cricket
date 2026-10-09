#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V784=GAME/'global_champions_cricket_v7_8_4_hardening.html'
V785=GAME/'global_champions_cricket_v7_8_5_visual_hardening.html'
EXPECTED_784='591c41f9f2282919e56e8ccb7c4f4d0a1790f83471fa180ed0249c8cb6bd6531'
EXPECTED_785='d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45'
PAYLOAD=PATCHES/'v784_to_v785_visual_hardening.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V784.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v784.py')],cwd=ROOT,check=True)
if sha(V784)!=EXPECTED_784:
    raise SystemExit(f'v7.8.4 parent SHA mismatch: {sha(V784)}')
if not PAYLOAD.exists():
    raise SystemExit(f'Missing v7.8.5 patch payload: {PAYLOAD.name}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V785.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V785.name,V784.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V785)!=EXPECTED_785:
    raise SystemExit(f'v7.8.5 candidate SHA mismatch: {sha(V785)}')
print(f'v7.8.4 parent OK {EXPECTED_784}')
print(f'v7.8.5 candidate {EXPECTED_785}')
