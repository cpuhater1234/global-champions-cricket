#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_3_4_golden_dynasty.html'
B=GAME/'global_champions_cricket_v7_4_0_league_history.html'
EA='ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc'
EB='6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v740.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'target SHA mismatch: {sha(B)}')

a=A.read_text('utf-8'); b=B.read_text('utf-8')

required=[
    "document.body.dataset.uiVersion = 'v7.4.0-league-history';",
    "function resolveCpuFinalsOffscreen()",
    "const semis = [simulateKnockout(top[0], top[3], 15), simulateKnockout(top[1], top[2], 15)];",
    "state.champion = gf.winner;",
    "resolveCpuFinalsOffscreen,",
    "G.resolveCpuFinalsOffscreen?.();return G.openSeasonReview()",
]
for n in required:
    if n not in b: raise SystemExit(f'missing v7.4.0 marker: {n}')

forbidden=[
    "document.body.dataset.uiVersion = 'v7.3.4-golden-dynasty';",
    "if(state.round>=14&&(state.regularSeasonPosition||99)>4)return G.openSeasonReview();",
]
for n in forbidden:
    if n in b: raise SystemExit(f'old league-history behavior survived: {n}')

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
for i,body in enumerate(scripts,1):
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as fh:
        fh.write(body); p=fh.name
    try:
        subprocess.run(['node','--check',p],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    finally:
        Path(p).unlink(missing_ok=True)

def extract(src,name):
    m=re.search(r'function\s+'+re.escape(name)+r'\s*\(',src)
    if not m: raise SystemExit(f'missing protected function {name}')
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

for fn in [
    'applyCareerYear','retirementsForYear','arrivalsForYear','tradeValue',
    'injuryChance','processInjuries','cpuDraftPick','userAnnualDraft'
]:
    if extract(a,fn)!=extract(b,fn):
        raise SystemExit(f'protected long-term function changed: {fn}')

print('v7.4.0 League History guardrail OK')
print('Source SHA-256',EA)
print('Target SHA-256',EB)
print('Ratings / Draft / trade / injury systems unchanged: yes')
print('Static product copy and DOM unchanged: yes')
