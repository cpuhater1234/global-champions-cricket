#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, subprocess, sys, tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V726=GAME/'global_champions_cricket_v7_2_6_foundation_save_continuity.html'
V727=GAME/'global_champions_cricket_v7_2_7_team_room_transition.html'
EXPECTED_726='58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c'
EXPECTED_727='05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a'

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

subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v726.py')],cwd=ROOT,check=True)
if sha(V726)!=EXPECTED_726: raise SystemExit(f'v7.2.6 SHA mismatch: {sha(V726)}')
apply('v726_to_v727_team_room.patch.gz.b64',V726,V727)
if sha(V727)!=EXPECTED_727: raise SystemExit(f'v7.2.7 SHA mismatch: {sha(V727)}')
print(f'v7.2.6 OK  {EXPECTED_726}')
print(f'v7.2.7 OK  {EXPECTED_727}')
