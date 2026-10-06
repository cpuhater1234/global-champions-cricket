#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_11_dynasty_resume_continuity.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_12_offseason_transition_isolation.html'
EXPECTED_SOURCE='abe4236e5ee6664f2191b1898d31a7566a8bcc5d672e8fab4bc375c10d32a25c'
EXPECTED_TARGET='10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7212.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.11 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.2.12 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]:fail.append(f'Protected script block {i} changed')
    if sa[7].replace('v7.2.11-dynasty-resume-continuity','v7.2.12-offseason-transition-isolation',1)!=sb[7]:
        fail.append('Presentation block changed beyond UI-version marker')
    expected=sa[8].replace(
        "function enterTeamRoom(){state.dynasty.offseason=null;base.enterTeamRoom();currentScreen='team';if(state.year>2008)renderDynastyNav('team');updateYearCopy();decorateSoon();autoSave()}",
        "function enterTeamRoom(){state.dynasty.offseason=null;$('dynasty')?.classList.remove('active');base.enterTeamRoom();currentScreen='team';if(state.year>2008)renderDynastyNav('team');updateYearCopy();decorateSoon();autoSave()}",
        1
    )
    if expected!=sb[8]:fail.append('Dynasty script changed beyond offseason-screen deactivation')
for marker in ["$('dynasty')?.classList.remove('active');base.enterTeamRoom()","v7.2.12-offseason-transition-isolation"]:
    if marker not in b:fail.append('Missing transition marker: '+marker)
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.12 Offseason transition guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.2.12 Offseason transition guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core simulation/data blocks unchanged: yes')
print('Only dynasty-screen deactivation changed: yes')
