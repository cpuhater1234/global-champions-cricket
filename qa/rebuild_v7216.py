#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V7215=GAME/'global_champions_cricket_v7_2_15_match_day_conditions.html'
V7216=GAME/'global_champions_cricket_v7_2_16_launcher_fast_path.html'
EXPECTED_7215='b8eea1a14caee62fb4a09755729d9e077eb0994724e7d6a643fcfe1c5c8d3915'
EXPECTED_7216='53269fdcc452720a959b94ab83b4759c2e875b53407360365f86ba90aae035fa'
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
subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7215.py')],cwd=ROOT,check=True)
if sha(V7215)!=EXPECTED_7215: raise SystemExit(f'v7.2.15 SHA mismatch: {sha(V7215)}')
apply('v7215_to_v7216_launcher.patch.gz.b64',V7215,V7216)
if sha(V7216)!=EXPECTED_7216: raise SystemExit(f'v7.2.16 SHA mismatch: {sha(V7216)}')
print(f'v7.2.15 OK  {EXPECTED_7215}')
print(f'v7.2.16 OK  {EXPECTED_7216}')
