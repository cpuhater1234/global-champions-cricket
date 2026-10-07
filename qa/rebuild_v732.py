#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V731=GAME/'global_champions_cricket_v7_3_1_dynasty_continuity.html'
V732=GAME/'global_champions_cricket_v7_3_2_cricket_language.html'
EXPECTED_731='ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f'
EXPECTED_732='693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def payload(stem):
    parts=sorted(PATCHES.glob(stem+'.part*'))
    if parts:return ''.join(x.read_text() for x in parts).strip()
    p=PATCHES/stem
    if p.exists():return p.read_text().strip()
    raise SystemExit(f'Missing patch payload: {stem}')
def apply(stem,src,dst):
    raw=gzip.decompress(base64.b64decode(payload(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
        fh.write(raw); pp=Path(fh.name)
    try:
        dst.unlink(missing_ok=True)
        subprocess.run(['patch','--batch','-o',dst.name,src.name,'-i',str(pp)],cwd=GAME,check=True)
    finally: pp.unlink(missing_ok=True)
if not V731.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v731.py')],cwd=ROOT,check=True)
if sha(V731)!=EXPECTED_731: raise SystemExit(f'v7.3.1 SHA mismatch: {sha(V731)}')
apply('v731_to_v732_cricket_language.patch.gz.b64',V731,V732)
if sha(V732)!=EXPECTED_732: raise SystemExit(f'v7.3.2 SHA mismatch: {sha(V732)}')
print(f'v7.3.1 OK  {EXPECTED_731}')
print(f'v7.3.2 OK  {EXPECTED_732}')
