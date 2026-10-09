#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'; PATCHES=ROOT/'qa'/'patches'
V786=GAME/'global_champions_cricket_v7_8_6_home_rebuild.html'
V787=GAME/'global_champions_cricket_v7_8_7_brutal_qa.html'
EXPECTED_786='c56e3a639d2411e4669aaffea5bbf20f021fc5730fdd4d120167c1ca28e6db3b'
EXPECTED_787='8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2'
PAYLOAD=PATCHES/'v786_to_v787_brutal_qa.patch.gz.b64'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V786.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v786.py')],cwd=ROOT,check=True)
if sha(V786)!=EXPECTED_786:
    raise SystemExit(f'v7.8.6 parent SHA mismatch: {sha(V786)}')
if not PAYLOAD.exists():
    raise SystemExit(f'Missing v7.8.7 patch payload: {PAYLOAD.name}')
raw=gzip.decompress(base64.b64decode(PAYLOAD.read_text().strip()))
with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
    fh.write(raw); pp=Path(fh.name)
try:
    V787.unlink(missing_ok=True)
    subprocess.run(['patch','--batch','-o',V787.name,V786.name,'-i',str(pp)],cwd=GAME,check=True)
finally:
    pp.unlink(missing_ok=True)
if sha(V787)!=EXPECTED_787:
    raise SystemExit(f'v7.8.7 candidate SHA mismatch: {sha(V787)}')
print(f'v7.8.6 parent OK {EXPECTED_786}')
print(f'v7.8.7 candidate {EXPECTED_787}')
