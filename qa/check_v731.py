#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_3_0_core_game_experience.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_3_1_dynasty_continuity.html'
EXPECTED_SOURCE='a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c'
EXPECTED_TARGET='ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
def func(text,name):
    marker=f'function {name}('
    start=text.find(marker)
    if start<0: raise ValueError(f'missing function {name}')
    brace=text.find('{',start)
    depth=0; quote=None; esc=False; i=brace
    while i<len(text):
        ch=text[i]
        if quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        else:
            if ch in "'\"\x60": quote=ch
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0:return text[start:i+1]
        i+=1
    raise ValueError(f'unclosed function {name}')
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v731.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.3.0 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.3.1 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in [0,1,2,3,4,5,6]:
        if sa[i]!=sb[i]:fail.append(f'Protected script block {i} changed')
for name in ['draftSlots','freeAgentPool','slotsWithSupplement','draftOwner','cpuDraftPick','runCpuDraftUntilUser','userAnnualDraft','annualDraftBoard','finishAnnualDraft']:
    try:
        if func(a,name)!=func(b,name): fail.append(f'Protected annual Draft logic changed: {name}')
    except ValueError as e: fail.append(str(e))
for marker in [
  "document.body.dataset.uiVersion = 'v7.3.1-dynasty-continuity';",
  "let annualDraftFilter='ALL', annualDraftSearch='', annualDraftPoolLimit=24, annualDraftBoardVisible=false;",
  "function annualDraftFilteredPool()",
  "function renderAnnualDraftPoolOnly()",
  "function toggleAnnualDraftBoard(show)",
  'Search player or country',
  'VIEW DRAFT BOARD',
  'BACK TO PLAYER POOL',
  "annualDraftPoolLimit+=24",
  "class=\"player-card score-${R.grade(p.overall)}",
  'LIST CHECK',
  'Strengthen the fifteen.'
]:
    if marker not in b: fail.append('Missing v7.3.1 marker: '+marker)
annual_region=b[b.find('function annualRoleName'):b.find('function finishAnnualDraft')]
for forbidden in [
  'freeAgentPool().slice(0,36)',
  'class="dynasty-player-card"',
  'class="annual-draft-board">${annualDraftBoard()}</div>${mine?'
]:
    if forbidden in annual_region: fail.append('Rejected annual Draft behaviour remains: '+forbidden)
if 'annualDraftBoardVisible' not in annual_region: fail.append('Annual Draft Board is not secondary state')
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.3.1 Dynasty Continuity guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.3.1 Dynasty Continuity guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Foundation Draft/core data and simulation blocks unchanged: yes')
print('Protected annual Draft rules/CPU logic unchanged: yes')
print('Annual Draft uses canonical player-pool interaction: yes')
print('Annual Draft Board is secondary: yes')
