#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V729=GAME/'global_champions_cricket_v7_2_9_finals_hierarchy.html'
V7210=GAME/'global_champions_cricket_v7_2_10_review_hierarchy.html'
EXPECTED_729='cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8'
EXPECTED_7210='e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
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

subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v729.py')],cwd=ROOT,check=True)
if sha(V729)!=EXPECTED_729: raise SystemExit(f'v7.2.9 SHA mismatch: {sha(V729)}')
apply('v729_to_v7210_review.patch.gz.b64',V729,V7210)
if sha(V7210)!=EXPECTED_7210: raise SystemExit(f'v7.2.10 SHA mismatch: {sha(V7210)}')
print(f'v7.2.9 OK  {EXPECTED_729}')
print(f'v7.2.10 OK  {EXPECTED_7210}')
