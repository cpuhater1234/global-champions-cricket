#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V785=GAME/'global_champions_cricket_v7_8_5_visual_hardening.html'
V786=GAME/'global_champions_cricket_v7_8_6_home_rebuild.html'
EXPECTED_785='d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45'
EXPECTED_786='c56e3a639d2411e4669aaffea5bbf20f021fc5730fdd4d120167c1ca28e6db3b'
PAYLOAD=PATCHES/'v785_to_v786_home_rebuild.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V785.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v785.py')],cwd=ROOT,check=True)
if sha(V785)!=EXPECTED_785:
    raise SystemExit(f'v7.8.5 parent SHA mismatch: {sha(V785)}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V786.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V786.name,V785.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V786)!=EXPECTED_786:
    raise SystemExit(f'v7.8.6 candidate SHA mismatch: {sha(V786)}')
print(f'v7.8.5 parent OK {EXPECTED_785}')
print(f'v7.8.6 candidate {EXPECTED_786}')
