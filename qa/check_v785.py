#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys,re,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_5_visual_hardening.html'
EXPECTED='d7ae7d1f1799cb4aedde7cbb90f4d9557c5c93214dfb4cab39a52947f55a6f45'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v785.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED:
    raise SystemExit(f'v7.8.5 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
    "v7.8.5-visual-hardening",
    "v7.8.5 HUMAN VISUAL HARDENING",
    ".gcc-moment-layer:not(.ceremony)",
    "@media(max-width:1120px)",
    "#draft .draft-layout{grid-template-columns:1fr!important}",
    "@media(max-width:1240px)",
    "#team .team-layout{grid-template-columns:1fr!important}",
    "#dynasty .annual-draft-side{order:0!important}",
    "#dynasty .final-player-card div>span{font-size:9px!important"
]
missing=[x for x in required if x not in text]
if missing:
    raise SystemExit('Missing v7.8.5 markers: '+', '.join(missing))
if "document.body.dataset.uiVersion = 'v7.8.4-hardening';" in text:
    raise SystemExit('Old v7.8.4 runtime marker still present')
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
print(f'v7.8.5 static checks OK {got}')
