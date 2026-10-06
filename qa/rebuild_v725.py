#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, subprocess, sys, tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V724=GAME/'global_champions_cricket_v7_2_4_signing_week_structure.html'
V725=GAME/'global_champions_cricket_v7_2_5_draw_transition_hardening.html'
EXPECTED_724='477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3'
EXPECTED_725='ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2'

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def payload(stem):
    parts=sorted(PATCHES.glob(stem+'.part*'))
    if parts: return ''.join(x.read_text() for x in parts).strip()
    p=PATCHES/stem
    if p.exists(): return p.read_text().strip()
    raise SystemExit(f'Missing patch payload: {stem}')
def apply(stem,src,dst):
    raw=gzip.decompress(base64.b64decode(payload(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
        fh.write(raw); pp=Path(fh.name)
    try:
        dst.unlink(missing_ok=True)
        subprocess.run(['patch','--batch','-o',dst.name,src.name,'-i',str(pp)],cwd=GAME,check=True)
    finally:
        pp.unlink(missing_ok=True)

subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v724.py')],cwd=ROOT,check=True)
if sha(V724)!=EXPECTED_724: raise SystemExit(f'v7.2.4 SHA mismatch: {sha(V724)}')
apply('v724_to_v725_draw.patch.gz.b64',V724,V725)
if sha(V725)!=EXPECTED_725: raise SystemExit(f'v7.2.5 SHA mismatch: {sha(V725)}')
print(f'v7.2.4 OK  {EXPECTED_724}')
print(f'v7.2.5 OK  {EXPECTED_725}')
