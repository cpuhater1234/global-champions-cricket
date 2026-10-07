#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_4_0_league_history.html'
B=GAME/'global_champions_cricket_v7_4_1_form_symmetry.html'
EA='6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb'
EB='34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v741.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'target SHA mismatch: {sha(B)}')

a=A.read_text('utf-8')
b=B.read_text('utf-8')

required=[
    "document.body.dataset.uiVersion = 'v7.4.1-form-symmetry';",
    "function formNegRoll(playerId)",
    "const s=`${state.weatherSeed||1}:${state.year}:${state.round}:${playerId}:form-neg`;",
    "let move=signal>=.75?1:(signal<=-.45&&formNegRoll(p.id)<.50)?-1:0;",
]
for n in required:
    if n not in b: raise SystemExit(f'missing v7.4.1 marker: {n}')

forbidden=[
    "document.body.dataset.uiVersion = 'v7.4.0-league-history';",
    "let move=signal>=.75?1:signal<=-.5?-1:0;",
    "let move=signal>=.75?1:signal<=-.45?-1:0;",
]
for n in forbidden:
    if n in b: raise SystemExit(f'rejected form behavior survived: {n}')

ids_a=set(re.findall(r'\bid="([^"]+)"',a))
ids_b=set(re.findall(r'\bid="([^"]+)"',b))
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

scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts)!=9: raise SystemExit(f'unexpected script count: {len(scripts)}')
for body in scripts:
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as fh:
        fh.write(body)
        p=fh.name
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

for fn in [
    'applyCareerYear','retirementsForYear','arrivalsForYear','tradeValue',
    'injuryChance','processInjuries','cpuDraftPick','userAnnualDraft',
    'simulateMatch','resolveCpuFinalsOffscreen'
]:
    if extract(a,fn)!=extract(b,fn):
        raise SystemExit(f'protected function changed: {fn}')

fa=extract(a,'updateFormForMatch')
fb=extract(b,'updateFormForMatch')
expected_fb=fa.replace(
    "let move=signal>=.75?1:signal<=-.5?-1:0;",
    "let move=signal>=.75?1:(signal<=-.45&&formNegRoll(p.id)<.50)?-1:0;"
)
if expected_fb!=fb:
    raise SystemExit('updateFormForMatch changed outside the intended two-sided form rule')
if fa.count('rng()')!=1 or fb.count('rng()')!=1:
    raise SystemExit('global match RNG usage changed inside updateFormForMatch')

helper=extract(b,'formNegRoll')
expected_helper="""function formNegRoll(playerId) {
    let h=2166136261;
    const s=`${state.weatherSeed||1}:${state.year}:${state.round}:${playerId}:form-neg`;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0)/4294967296;
  }"""
if helper!=expected_helper:
    raise SystemExit('formNegRoll differs from the accepted deterministic helper')
if 'formNegRoll' in a:
    raise SystemExit('formNegRoll unexpectedly exists in parent build')

print('v7.4.1 Two-Sided Form guardrail OK')
print('Source SHA-256',EA)
print('Target SHA-256',EB)
print('Match RNG stream unchanged: yes')
print('Ratings / careers / Draft / trade / injury / match systems unchanged: yes')
print('Static product copy and DOM unchanged: yes')
