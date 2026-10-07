#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_5_0_dynasty_memory.html'
B=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
EA='abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def extract(src,name):
    m=re.search(r'function\s+'+re.escape(name)+r'\s*\(',src)
    if not m: raise SystemExit(f'missing function {name}')
    i=src.find('{',m.start()); depth=0; j=i; quote=None; escaped=False; tick=chr(96)
    while j<len(src):
        ch=src[j]
        if quote:
            if escaped: escaped=False
            elif ch=='\\': escaped=True
            elif ch==quote: quote=None
        else:
            if ch in ("'",'"',tick): quote=ch
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0: return src[m.start():j+1]
        j+=1
    raise SystemExit(f'unclosed function {name}')

if not B.exists(): subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v760.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'v7.5 parent SHA mismatch: {sha(A)}')
a=A.read_text('utf-8'); b=B.read_text('utf-8')

for marker in [
    "document.body.dataset.uiVersion = 'v7.6.0-matchday-immersion';",
    'function openMatchdayPreview()',
    'MATCHDAY · ROUND',
    'PLAY MATCH',
    'PLAYERS TO WATCH',
]:
    if marker not in b: raise SystemExit(f'missing v7.6 marker: {marker}')

protected=[
  'simulateMatch','innings','phaseScore','bowlingPlan','updateFormForMatch','formNegRoll',
  'playNextRound','simulateSeason','matchWeather','effectiveMatchGround','finishRegularSeason',
  'freshDynasty','serialisable','archiveSeason','applyCareerYear','retirementsForYear','arrivalsForYear',
  'tradeValue','injuryChance','processInjuries','cpuDraftPick','userAnnualDraft','reviewSeasonValue',
  'autoSave','migrateLoadedSave','resumeSave','continueFromLauncher'
]
for fn in protected:
    if extract(a,fn)!=extract(b,fn): raise SystemExit(f'protected function changed: {fn}')

preview=extract(b,'openMatchdayPreview')
for bad in ['simulateMatch(', 'rng()', 'state.results.push(', 'state.round =', 'updateFormForMatch(']:
    if bad in preview: raise SystemExit(f'preview is not read-only: {bad}')
if 'matchWeather(' not in preview or 'standings()' not in preview:
    raise SystemExit('preview is not derived from accepted match context')

ids=re.findall(r'\bid="([^"]+)"',b)
if len(ids)!=len(set(ids)): raise SystemExit('duplicate static DOM IDs detected')
scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts)!=9: raise SystemExit(f'unexpected script count: {len(scripts)}')
for body in scripts:
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as fh:
        fh.write(body); p=fh.name
    try: subprocess.run(['node','--check',p],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    finally: Path(p).unlink(missing_ok=True)

if 'onclick="GCC.openMatchdayPreview()"' not in b: raise SystemExit('manual round button does not enter Matchday')
if 'onclick="GCC.simulateSeason()"' not in b: raise SystemExit('Run Season fast path changed')
print('v7.6 Matchday guardrail OK')
print('Parent SHA-256',EA)
print('Candidate SHA-256',sha(B))
print('Simulation / save / dynasty mechanics unchanged: yes')
print('Matchday preview statically read-only: yes')
print('9 script blocks syntax-clean; duplicate DOM IDs: 0')
