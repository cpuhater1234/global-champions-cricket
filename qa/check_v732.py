#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys,shutil,tempfile
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
SOURCE=GAME/'global_champions_cricket_v7_3_1_dynasty_continuity.html'
TARGET=GAME/'global_champions_cricket_v7_3_2_cricket_language.html'
EXPECTED_SOURCE='ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f'
EXPECTED_TARGET='693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
def fn(text,name):
    m=re.search(r'function\s+'+re.escape(name)+r'\s*\([^)]*\)\s*\{',text)
    if not m: raise SystemExit(f'Function not found: {name}')
    start=m.start(); i=m.end()-1; depth=0; quote=None; esc=False; template=False
    while i<len(text):
        ch=text[i]
        if quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        elif template:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch=='`': template=False
        else:
            if ch in "'\"": quote=ch
            elif ch=='`': template=True
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0:return text[start:i+1]
        i+=1
    raise SystemExit(f'Unclosed function: {name}')
if not TARGET.exists(): subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v732.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.3.1 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.3.2 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8'); sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9: fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in [0,1,2,3,4,6]:
        if sa[i]!=sb[i]: fail.append(f'Protected script block {i} changed')
for name in ['setupDraft','userDraft','toggleXI','beginSwap','replaceXI','removeXI','autoOrderXI','startSeason','playNextRound','simulateSeason','renderFinals','openSeasonReview','draftSlots','freeAgentPool','slotsWithSupplement','draftOwner','cpuDraftPick','runCpuDraftUntilUser','userAnnualDraft','finishAnnualDraft','cutPlayer','finishOffseason','cpuTradeBlockReason','runCpuMarket','proposeTrade','processInjuries','openReplacementMarket','signReplacement','resolveReplacementReturn']:
    if fn(a,name)!=fn(b,name): fail.append(f'Protected gameplay function changed: {name}')
markers=[
 "document.body.dataset.uiVersion = 'v7.3.2-cricket-language';",
 'Five days decide who enters the Draft.',
 'WHAT IT MEANS FOR THE DRAFT',
 '0/11 selected.',
 'Build a balanced XI. Warnings will flag a missing keeper or insufficient bowling.',
 "statLabel='to release'",
 "statLabel='list lodged'",
 "statLabel='cuts after Draft'",
 'Trade before the Draft Draw',
 'LET OTHER CLUBS TRADE',
 'LIST BALANCE',
 'Add what the list needs most. Search the pool, compare roles and make the pick.',
 'The Draft has taken you over fifteen.',
 '<span>Fitness</span>',
 "'No restrictions'"
]
for x in markers:
    if x not in b: fail.append('Missing v7.3.2 language marker: '+x)
for x in ['WHAT THIS CHANGES','The draft board does not exist yet.','Fitness watch','No managed loads','Shape the squad before the draw','The room will keep a natural batting order','before the draft</span>']:
    if x in b: fail.append('Rejected admin/stale wording remains: '+x)
ids=lambda t: sorted(re.findall(r'\bid="([^"]+)"',t))
if ids(a)!=ids(b): fail.append('DOM id set changed in copy-only build')
if a.count('<button')!=b.count('<button'): fail.append('Button count changed in copy-only build')
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.3.2 Cricket Language guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.3.2 Cricket Language guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Protected gameplay functions unchanged: yes')
print('DOM ids/buttons unchanged: yes')
