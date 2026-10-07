#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
A=GAME/'global_champions_cricket_v7_4_1_form_symmetry.html'
B=GAME/'global_champions_cricket_v7_5_0_dynasty_memory.html'
EA='34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643'
EB='abe0c99338990b5a33f23a62e759b853e9118c2e3a97331c91e37ae23fc571c6'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not B.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v750.py')],cwd=ROOT,check=True)
if sha(A)!=EA:
    raise SystemExit(f'parent SHA mismatch: {sha(A)}')
if sha(B)!=EB:
    raise SystemExit(f'accepted v7.5 SHA mismatch: {sha(B)}')

a=A.read_text('utf-8')
b=B.read_text('utf-8')

for marker in [
    "document.body.dataset.uiVersion = 'v7.5.0-dynasty-memory';",
    'function archiveCareerAggregate()',
    'function archiveSeasonLeaders(record)',
    'function archiveClubHonours()',
    'function archiveUserLegends()',
    'function openArchiveSeason(year)',
    'LEAGUE HONOURS',
    'GCC RECORD BOOK',
    'YOUR CLUB LEGENDS',
    'SEASON BY SEASON',
    'class="legacy-world"',
]:
    if marker not in b:
        raise SystemExit(f'missing v7.5 marker: {marker}')

ids=re.findall(r'\bid="([^"]+)"',b)
if len(ids)!=len(set(ids)):
    raise SystemExit('duplicate DOM IDs detected')

scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',b,re.S)
if len(scripts)!=9:
    raise SystemExit(f'unexpected script count: {len(scripts)}')
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
    if not m:
        raise SystemExit(f'missing function {name}')
    i=src.find('{',m.start())
    depth=0
    j=i
    quote=None
    escaped=False
    tick=chr(96)
    while j<len(src):
        ch=src[j]
        if quote:
            if escaped:
                escaped=False
            elif ch=='\\':
                escaped=True
            elif ch==quote:
                quote=None
        else:
            if ch in ("'",'"',tick):
                quote=ch
            elif ch=='{':
                depth+=1
            elif ch=='}':
                depth-=1
                if depth==0:
                    return src[m.start():j+1]
        j+=1
    raise SystemExit(f'unclosed function {name}')

protected=[
    'freshDynasty',
    'serialisable',
    'archiveSeason',
    'applyCareerYear',
    'retirementsForYear',
    'arrivalsForYear',
    'tradeValue',
    'injuryChance',
    'processInjuries',
    'cpuDraftPick',
    'userAnnualDraft',
    'simulateMatch',
    'resolveCpuFinalsOffscreen',
    'formNegRoll',
    'updateFormForMatch',
    'reviewSeasonValue',
    'autoSave',
    'migrateLoadedSave',
    'resumeSave',
    'continueFromLauncher',
]
for fn in protected:
    if extract(a,fn)!=extract(b,fn):
        raise SystemExit(f'protected function changed: {fn}')

if 'playerStats' not in extract(b,'archiveSeasonPlayers') or 'archiveSeasonPlayers' not in extract(b,'archiveCareerAggregate'):
    raise SystemExit('career records are not derived from archived playerStats')
if 'G.reviewSeasonValue' not in extract(b,'archiveSeasonLeaders'):
    raise SystemExit('season standout does not reuse accepted reviewSeasonValue')
if 'reviewSeasonValue,' not in b:
    raise SystemExit('accepted reviewSeasonValue is not exposed read-only to Dynasty Archive')

helper_blob='\n'.join(extract(b,n) for n in [
    'archiveCareerAggregate',
    'archiveSeasonLeaders',
    'archiveClubHonours',
    'archiveUserLegends',
    'archiveRecords',
    'openArchiveSeason',
])
for bad in ['history.push(','playerCareer[','clubCareer[','archivedYears[']:
    if bad in helper_blob:
        raise SystemExit(f'archive helper writes history: {bad}')

season_helper=extract(b,'archiveSeasonPlayers')
if 'club:' in season_helper or 'clubByAbbr' in season_helper:
    raise SystemExit('historical player rows infer club ownership')

print('v7.5 Dynasty Memory guardrail OK')
print('Parent SHA-256',EA)
print('Accepted v7.5 SHA-256',EB)
print('Save / resume / simulation / balance functions unchanged: yes')
print('Archive helpers derived from existing history only: yes')
print('9 script blocks syntax-clean; duplicate DOM IDs: 0')
