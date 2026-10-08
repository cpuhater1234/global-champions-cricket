#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
B=GAME/'global_champions_cricket_v7_7_0_release_hardened.html'
EA='3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f'
EB='57051db6a677b3721e4d19bb414e9098144116c64f7e78e0a9ab38dac26fcdfc'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v770.py')],cwd=ROOT,check=True)
if sha(A)!=EA: raise SystemExit(f'v7.6 parent SHA mismatch: {sha(A)}')
if sha(B)!=EB: raise SystemExit(f'accepted v7.7 SHA mismatch: {sha(B)}')

a=A.read_text('utf-8'); b=B.read_text('utf-8')
if "document.body.dataset.uiVersion = 'v7.7.0-release-hardened';" not in b:
    raise SystemExit('missing v7.7 UI version')
if 'Order: runs + 25× wickets + 80× seasons + 300× titles.' in b:
    raise SystemExit('raw Archive ranking formula still exposed')
if 'Runs, wickets, longevity and titles shape the order.' not in b:
    raise SystemExit('cricket-language Archive ranking explanation missing')
if "<strong>${h.title?'TITLE':h.finals?'TOP FOUR':'SEASON'}</strong>" in b:
    raise SystemExit('redundant Archive season tail still present')
if 'grid-template-columns:78px minmax(165px,1fr) minmax(230px,1.2fr) 82px' in b:
    raise SystemExit('obsolete four-column Archive timeline grid still present')

ids=re.findall(r'\bid="([^"]+)"',b)
if len(ids)!=len(set(ids)): raise SystemExit('duplicate static DOM IDs detected')
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

protected=[
 'freshDynasty','serialisable','archiveSeason','applyCareerYear','retirementsForYear','arrivalsForYear',
 'tradeValue','injuryChance','processInjuries','cpuDraftPick','userAnnualDraft','simulateMatch',
 'resolveCpuFinalsOffscreen','formNegRoll','updateFormForMatch','reviewSeasonValue','autoSave',
 'migrateLoadedSave','resumeSave','continueFromLauncher','openMatchdayPreview','playNextRound'
]
for fn in protected:
    if extract(a,fn)!=extract(b,fn): raise SystemExit(f'protected function changed: {fn}')

allowed=[
 '#archive .archive-season{border:0;border-bottom:1px solid var(--work-rule-soft);border-radius:0;background:transparent;box-shadow:none;cursor:pointer;transition:background .15s ease;grid-template-columns:78px minmax(165px,1fr) minmax(230px,1.2fr)}',
 "document.body.dataset.uiVersion = 'v7.7.0-release-hardened';",
 'Runs, wickets, longevity and titles shape the order.',
]
for marker in allowed:
    if marker not in b: raise SystemExit(f'missing accepted v7.7 marker: {marker}')

print('v7.7 Release Hardening guardrail OK')
print('Parent v7.6 SHA-256',EA)
print('Accepted v7.7 SHA-256',EB)
print('Protected cricket/save/matchday functions unchanged: yes')
print('9 script blocks syntax-clean; duplicate static DOM IDs: 0')
