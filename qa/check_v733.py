#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_3_2_cricket_language.html'
B=GAME/'global_champions_cricket_v7_3_3_visual_identity.html'
EA='693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da'
EB='67d509ff1386df6b95fcb5582d659e48f1baccea6c46e34a7ae9a27a51a703e2'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v733.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'target SHA mismatch: {sha(B)}')

a=A.read_text('utf-8')
b=B.read_text('utf-8')

scripts_a=re.findall(r'<script(?:[^>]*)>(.*?)</script>',a,re.S)
scripts_b=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts_a)!=9 or len(scripts_b)!=9:
    raise SystemExit(f'unexpected script block count: {len(scripts_a)} / {len(scripts_b)}')
for i,(x,y) in enumerate(zip(scripts_a,scripts_b),1):
    if i==8:
        x=x.replace("document.body.dataset.uiVersion = 'v7.3.2-cricket-language';","document.body.dataset.uiVersion = 'v7.3.3-visual-identity';")
    if x!=y:
        raise SystemExit(f'protected script block changed: {i}')

ids_a=set(re.findall(r'\bid="([^"]+)"',a))
ids_b=set(re.findall(r'\bid="([^"]+)"',b))
if ids_a!=ids_b:
    raise SystemExit(f'DOM id set changed; removed={sorted(ids_a-ids_b)} added={sorted(ids_b-ids_a)}')
if a.count('<button')!=b.count('<button'):
    raise SystemExit('button count changed')

# Visible wording should remain identical. Remove CSS, scripts and SVG sprites before comparing text.
def visible_text(s):
    s=re.sub(r'<style[\s\S]*?</style>','',s,count=1)
    s=re.sub(r'<script(?:[^>]*)>[\s\S]*?</script>','',s)
    s=re.sub(r'<svg class="svg-sprite"[\s\S]*?</svg>','',s,count=1)
    s=re.sub(r'<span class="brand-mark"[\s\S]*?</span>','',s,count=1)
    s=re.sub(r'<[^>]+>',' ',s)
    return re.sub(r'\s+',' ',s).strip()
if visible_text(a)!=visible_text(b):
    raise SystemExit('visible product copy changed during visual-only pass')

required=[
    "document.body.dataset.uiVersion = 'v7.3.3-visual-identity';",
    '/* v7.3.3 VISUAL IDENTITY',
    '.topbar::after{display:none}',
    '.launcher-kicker{display:none}',
    '.section-head::after{background:var(--identity-rule);opacity:1}',
    '.button.primary{background:var(--deep);border-color:var(--deep);box-shadow:none!important}',
    '#team .team-selection-panel::before{display:none}',
    '<symbol id="gcc-crest" viewBox="0 0 72 64">',
    '<circle cx="56" cy="39" r="9"',
    '<svg class="gcc-brand-symbol" viewBox="0 0 72 64"><use href="#gcc-crest"></use></svg>',
]
for needle in required:
    if needle not in b: raise SystemExit(f'missing v7.3.3 visual identity marker: {needle}')

forbidden=[
    '<span class="brand-mark"><img src="data:image/png;base64,',
]
for needle in forbidden:
    if needle in b: raise SystemExit(f'legacy identity survived: {needle[:70]}')

if len(B.read_bytes()) >= len(A.read_bytes())-250000:
    raise SystemExit('expected substantial raster-logo size reduction was not achieved')

print('v7.3.3 Visual Identity guardrail OK')
print('Source SHA-256',EA)
print('Target SHA-256',EB)
print('Protected JS blocks unchanged: yes')
print('Visible copy unchanged: yes')
print('DOM ids/buttons unchanged: yes')
print('Raster header badge removed: yes')
