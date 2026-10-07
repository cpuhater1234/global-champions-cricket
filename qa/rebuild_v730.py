#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V7216=GAME/'global_champions_cricket_v7_2_16_launcher_fast_path.html'
V730=GAME/'global_champions_cricket_v7_3_0_core_game_experience.html'
EXPECTED_7216='dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b'
EXPECTED_730='3dedc12f16d810ad034f44014e19ef10b64e3c39faab3d5f918c6066836dcd80'
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
def apply_in_place(stem,target):
    raw=gzip.decompress(base64.b64decode(payload(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
        fh.write(raw); pp=Path(fh.name)
    try:
        subprocess.run(['patch','--batch',target.name,'-i',str(pp)],cwd=GAME,check=True)
    finally: pp.unlink(missing_ok=True)
subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7216.py')],cwd=ROOT,check=True)
if sha(V7216)!=EXPECTED_7216: raise SystemExit(f'v7.2.16 SHA mismatch: {sha(V7216)}')
apply('v7216_to_v730_core.patch.gz.b64',V7216,V730)
apply_in_place('v730_copy_fix.patch.gz.b64',V730)
if sha(V730)!=EXPECTED_730: raise SystemExit(f'v7.3.0 SHA mismatch: {sha(V730)}')
print(f'v7.2.16 OK  {EXPECTED_7216}')
print(f'v7.3.0 OK  {EXPECTED_730}')
