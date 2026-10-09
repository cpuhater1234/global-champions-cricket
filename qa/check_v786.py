#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys,re,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_6_home_rebuild.html'
EXPECTED='c56e3a639d2411e4669aaffea5bbf20f021fc5730fdd4d120167c1ca28e6db3b'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v786.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED: raise SystemExit(f'v7.8.6 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
 "v7.8.6-home-rebuild",
 "foundation-wordmark-svg",
 "grid-template-columns:repeat(2,minmax(0,1fr))!important",
 "home-hero .foundation-copy{animation:none!important;opacity:1!important",
 "GLOBAL CHAMPIONS CRICKET"
]
missing=[x for x in required if x not in text]
if missing: raise SystemExit('Missing v7.8.6 markers: '+', '.join(missing))
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',text,re.S|re.I)
for i,code in enumerate(scripts):
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as fh:
        fh.write(code); path=Path(fh.name)
    try:
        r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
        if r.returncode: raise SystemExit(f'Inline script {i} failed node --check: {r.stderr}')
    finally:
        path.unlink(missing_ok=True)
print(f'v7.8.6 static checks OK {got}')
