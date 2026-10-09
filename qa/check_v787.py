#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys,re,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_7_brutal_qa.html'
EXPECTED='8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v787.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED:
    raise SystemExit(f'v7.8.7 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
    "v7.8.7-brutal-qa",
    "v7.8.7 FINAL BRUTAL QA",
    "team-needs-picks",
    "SWIPE ACROSS ALL 8 CLUBS",
    "v7.8.6 HOME REBUILD",
    "function voluntaryCutLimit(){return Math.max(0,4-userRetirementCount())}"
]
missing=[x for x in required if x not in text]
if missing:
    raise SystemExit('Missing v7.8.7 markers: '+', '.join(missing))
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
print(f'v7.8.7 static checks OK {got}')
