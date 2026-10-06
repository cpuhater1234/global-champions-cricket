#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V7213=GAME/'global_champions_cricket_v7_2_13_midseason_trade_window.html'
V7214=GAME/'global_champions_cricket_v7_2_14_year_shell_continuity.html'
EXPECTED_7213='21788e247134133ea2aaa998d864b82384526f27dac2ef8cc72c4ed33c00ea99'
EXPECTED_7214='70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d'
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
subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7213.py')],cwd=ROOT,check=True)
if sha(V7213)!=EXPECTED_7213: raise SystemExit(f'v7.2.13 SHA mismatch: {sha(V7213)}')
apply('v7213_to_v7214_year_shell.patch.gz.b64',V7213,V7214)
if sha(V7214)!=EXPECTED_7214: raise SystemExit(f'v7.2.14 SHA mismatch: {sha(V7214)}')
print(f'v7.2.13 OK  {EXPECTED_7213}')
print(f'v7.2.14 OK  {EXPECTED_7214}')
