#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V760=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
EXPECTED='3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V760.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v760.py')],cwd=ROOT,check=True)

actual=sha(V760)
if actual!=EXPECTED:
    raise SystemExit(f'v7.6 release-hardening baseline SHA mismatch: {actual}')

subprocess.run([sys.executable,str(ROOT/'qa'/'check_v760.py')],cwd=ROOT,check=True)

print('v7.7 release-hardening baseline OK')
print('Frozen v7.6 SHA-256',EXPECTED)
print('No v7.7 game-code change has been introduced.')
