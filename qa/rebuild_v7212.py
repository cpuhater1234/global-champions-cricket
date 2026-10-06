#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V7211=GAME/'global_champions_cricket_v7_2_11_dynasty_resume_continuity.html'
V7212=GAME/'global_champions_cricket_v7_2_12_offseason_transition_isolation.html'
EXPECTED_7211='abe4236e5ee6664f2191b1898d31a7566a8bcc5d672e8fab4bc375c10d32a25c'
EXPECTED_7212='10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283'
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
subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7211.py')],cwd=ROOT,check=True)
if sha(V7211)!=EXPECTED_7211: raise SystemExit(f'v7.2.11 SHA mismatch: {sha(V7211)}')
apply('v7211_to_v7212_offseason_transition.patch.gz.b64',V7211,V7212)
if sha(V7212)!=EXPECTED_7212: raise SystemExit(f'v7.2.12 SHA mismatch: {sha(V7212)}')
print(f'v7.2.11 OK  {EXPECTED_7211}')
print(f'v7.2.12 OK  {EXPECTED_7212}')
