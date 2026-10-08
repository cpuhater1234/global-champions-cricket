#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys,re,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_4_hardening.html'
EXPECTED='591c41f9f2282919e56e8ccb7c4f4d0a1790f83471fa180ed0249c8cb6bd6531'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v784.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED:
    raise SystemExit(f'v7.8.4 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
    "v7.8.4-hardening",
    "The contract window is closed.",
    "The Draft has filled your vacancies.",
    "The fifteen below are locked for Round 1.",
    "LOCKED IN",
    "homeContinue.classList.toggle('primary',has)",
    "dynasty-final-list-mode",
    "shell.dataset.outcome=finalsTone"
]
missing=[x for x in required if x not in text]
if missing:
    raise SystemExit('Missing v7.8.4 markers: '+', '.join(missing))
for old in [
    "club cuts remain after",
    "No further release is required. The group below is the squad you take into the season.",
    "v7.8.3-hard-playtest-visual"
]:
    if old in text:
        raise SystemExit(f'Old wording/version marker still present: {old}')
scripts=re.findall(r'<script(?:\\s[^>]*)?>(.*?)</script>',text,re.S|re.I)
for i,code in enumerate(scripts):
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as fh:
        fh.write(code); path=Path(fh.name)
    try:
        r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
        if r.returncode:
            raise SystemExit(f'Inline script {i} failed node --check: {r.stderr}')
    finally:
        path.unlink(missing_ok=True)
print(f'v7.8.4 static checks OK {got}')
