#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_4_0_league_history.html'
B=GAME/'global_champions_cricket_v7_4_1_form_symmetry.html'
EA='6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb'
EB='87a8746df03711c6fc8a0b8c37f3756034f0dd4fca5c06311478303ee4211dad'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v741.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'target SHA mismatch: {sha(B)}')

a=A.read_text('utf-8'); b=B.read_text('utf-8')

required=[
    "document.body.dataset.uiVersion = 'v7.4.1-form-symmetry';",
    "let move=signal>=.75?1:signal<=-.45?-1:0;",
]
for n in required:
    if n not in b: raise SystemExit(f'missing v7.4.1 marker: {n}')
for n in [
    "document.body.dataset.uiVersion = 'v7.4.0-league-history';",
    "let move=signal>=.75?1:signal<=-.5?-1:0;",
]:
    if n in b: raise SystemExit(f'old form behavior survived: {n}')

ids_a=set(re.findall(r'\bid="([^"]+)"',a)); ids_b=set(re.findall(r'\bid="([^"]+)"',b))
if ids_a!=ids_b: raise SystemExit('DOM id set changed')
if a.count('<button')!=b.count('<button'): raise SystemExit('button count changed')

def static_visible(s):
    s=re.sub(r'<style[\s\S]*?</style>','',s,count=1)
    s=re.sub(r'<script(?:[^>]*)>[\s\S]*?</script>','',s)
    s=re.sub(r'<svg class="svg-sprite"[\s\S]*?</svg>','',s,count=1)
    s=re.sub(r'<[^>]+>',' ',s)
    return re.sub(r'\s+',' ',s).strip()
if static_visible(a)!=static_visible(b): raise SystemExit('static visible copy changed')

scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts)!=9: raise SystemExit(f'unexpected script count: {len(scripts)}')
for body in scripts:
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as fh:
        fh.write(body); p=fh.name
    try:
        subprocess.run(['node','--check',p],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    finally:
        Path(p).unlink(missing_ok=True)

def extract(src,name):
    m=re.search(r'function\s+'+re.escape(name)+r'\s*\(',src)
    if not m: raise SystemExit(f'missing function {name}')
    i=src.find('{',m.start()); depth=0; j=i; quote=None; esc=False; tick=chr(96)
    while j<len(src):
        ch=src[j]
        if quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        else:
            if ch in ("'",'"',tick): quote=ch
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0: return src[m.start():j+1]
        j+=1
    raise SystemExit(f'unclosed function {name}')

# Only updateFormForMatch and the UI version label may change.
for fn in [
    'applyCareerYear','retirementsForYear','arrivalsForYear','tradeValue',
    'injuryChance','processInjuries','cpuDraftPick','userAnnualDraft',
    'simulateMatch','resolveCpuFinalsOffscreen'
]:
    if extract(a,fn)!=extract(b,fn):
        raise SystemExit(f'protected function changed: {fn}')

fa=extract(a,'updateFormForMatch')
fb=extract(b,'updateFormForMatch')
if fa.replace("signal<=-.5","signal<=-.45")!=fb:
    raise SystemExit('updateFormForMatch changed outside the intended negative threshold')

# Model-level symmetry gate.
def move(signal):
    return 1 if signal>=.75 else (-1 if signal<=-.45 else 0)
assert move(1.0)==1
assert move(-.45)==-1
assert move(.55)==0
assert move(-.44)==0

print('v7.4.1 Form Symmetry guardrail OK')
print('Source SHA-256',EA)
print('Target SHA-256',EB)
print('Only negative form threshold changed: yes')
print('Static product copy and DOM unchanged: yes')
