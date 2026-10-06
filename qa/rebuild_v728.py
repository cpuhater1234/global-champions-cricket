#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, subprocess, sys, tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V727=GAME/'global_champions_cricket_v7_2_7_team_room_transition.html'
V728=GAME/'global_champions_cricket_v7_2_8_season_result_hierarchy.html'
EXPECTED_727='05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a'
EXPECTED_728='8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f'

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

subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v727.py')],cwd=ROOT,check=True)
if sha(V727)!=EXPECTED_727: raise SystemExit(f'v7.2.7 SHA mismatch: {sha(V727)}')
apply('v727_to_v728_season.patch.gz.b64',V727,V728)
if sha(V728)!=EXPECTED_728: raise SystemExit(f'v7.2.8 SHA mismatch: {sha(V728)}')
print(f'v7.2.7 OK  {EXPECTED_727}')
print(f'v7.2.8 OK  {EXPECTED_728}')
