#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V730=GAME/'global_champions_cricket_v7_3_0_core_game_experience.html'
V731=GAME/'global_champions_cricket_v7_3_1_dynasty_continuity.html'
EXPECTED_730='a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c'
EXPECTED_731='ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f'
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
if not V730.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v730.py')],cwd=ROOT,check=True)
if sha(V730)!=EXPECTED_730: raise SystemExit(f'v7.3.0 SHA mismatch: {sha(V730)}')
apply('v730_to_v731_dynasty_continuity.patch.gz.b64',V730,V731)
if sha(V731)!=EXPECTED_731: raise SystemExit(f'v7.3.1 SHA mismatch: {sha(V731)}')
print(f'v7.3.0 OK  {EXPECTED_730}')
print(f'v7.3.1 OK  {EXPECTED_731}')
