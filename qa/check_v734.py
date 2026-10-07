#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_3_3_visual_identity.html'
B=GAME/'global_champions_cricket_v7_3_4_golden_dynasty.html'
EA='88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650'
EB='3b29b1f3b90ddb4e4728487ef280df0bcee9345c571c3979904b8a8b98b9f19e'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v734.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'target SHA mismatch: {sha(B)}')

a=A.read_text('utf-8'); b=B.read_text('utf-8')
scripts_a=re.findall(r'<script(?:[^>]*)>(.*?)</script>',a,re.S)
scripts_b=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts_a)!=9 or len(scripts_b)!=9:
    raise SystemExit(f'unexpected script count {len(scripts_a)} / {len(scripts_b)}')

# Only the dynasty wrapper script may change. All simulation / ratings / UI foundations remain exact.
for i,(x,y) in enumerate(zip(scripts_a,scripts_b),1):
    if i!=8 and x!=y:
        raise SystemExit(f'protected script block changed: {i}')

required=[
    "document.body.dataset.uiVersion = 'v7.3.4-golden-dynasty';",
    "if(stamp)stamp.textContent=String(meta?.year||2008);if(nav)nav.hidden=true;",
    "if(stamp)stamp.textContent='2008';if(nav)nav.hidden=false;",
    "restoreObject(state,save.state);if(nav)nav.hidden=false;",
]
for n in required:
    if n not in b: raise SystemExit(f'missing launcher continuity marker: {n}')

# The actual static product structure and copy remain unchanged.
ids_a=set(re.findall(r'\bid="([^"]+)"',a)); ids_b=set(re.findall(r'\bid="([^"]+)"',b))
if ids_a!=ids_b: raise SystemExit('DOM id set changed')
if a.count('<button')!=b.count('<button'): raise SystemExit('button count changed')

def static_visible(s):
    s=re.sub(r'<style[\s\S]*?</style>','',s,count=1)
    s=re.sub(r'<script(?:[^>]*)>[\s\S]*?</script>','',s)
    s=re.sub(r'<svg class="svg-sprite"[\s\S]*?</svg>','',s,count=1)
    s=re.sub(r'<[^>]+>',' ',s)
    return re.sub(r'\s+',' ',s).strip()
if static_visible(a)!=static_visible(b):
    raise SystemExit('static visible copy changed')

# Explicitly reject the contradiction Golden Dynasty found.
if "document.body.dataset.uiVersion = 'v7.3.3-visual-identity';" in b:
    raise SystemExit('old UI version survived')

print('v7.3.4 Golden Dynasty product guardrail OK')
print('Source SHA-256',EA)
print('Target SHA-256',EB)
print('Core script blocks unchanged: yes')
print('Static product copy unchanged: yes')
print('Launcher continuity fix isolated to dynasty wrapper: yes')
