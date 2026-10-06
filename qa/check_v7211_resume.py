#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_10_review_hierarchy.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_11_dynasty_resume_continuity.html'
EXPECTED_SOURCE='e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70'
EXPECTED_TARGET='abe4236e5ee6664f2191b1898d31a7566a8bcc5d672e8fab4bc375c10d32a25c'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7211.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.10 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.2.11 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]:fail.append(f'Protected script block {i} changed')
    if sa[7].replace('v7.2.10-review-hierarchy','v7.2.11-dynasty-resume-continuity',1)!=sb[7]:
        fail.append('Presentation block changed beyond UI-version marker')
    expected=sa[8].replace(
        "currentScreen=save.currentScreen||state.dynasty?.lastScreen||'team';if(state.fullSchedule?.length)currentScreen='season';else if(state.pickIndex>=120||state.draftFinished)currentScreen='team';",
        "currentScreen=save.currentScreen||state.dynasty?.lastScreen||'team';if(state.dynasty?.offseason)currentScreen='dynasty';else if(state.fullSchedule?.length)currentScreen='season';else if(state.pickIndex>=120||state.draftFinished)currentScreen='team';",
        1
    )
    if expected!=sb[8]:fail.append('Dynasty script changed beyond offseason resume precedence')
for marker in ["if(state.dynasty?.offseason)currentScreen='dynasty'","v7.2.11-dynasty-resume-continuity"]:
    if marker not in b:fail.append('Missing resume marker: '+marker)
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.11 Dynasty resume guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.2.11 Dynasty resume guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core simulation/data blocks unchanged: yes')
print('Only offseason resume precedence changed: yes')
