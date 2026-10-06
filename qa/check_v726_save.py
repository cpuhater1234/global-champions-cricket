#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_5_draw_transition_hardening.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_6_foundation_save_continuity.html'
EXPECTED_SOURCE='ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2'
EXPECTED_TARGET='58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v726.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.5 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.6 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]: fail.append(f'Protected core/data script block {i} changed')
    if sa[7].replace('v7.2.5-draw-transition-hardening','v7.2.6-foundation-save-continuity',1)!=sb[7]:
        fail.append('Presentation layer changed beyond UI-version marker')

required=[
    "SAVE_VERSION='7.2.0'",
    "foundationWatchTimer",
    "function markFoundationScreen(id)",
    "function saveFoundation(id=currentScreen)",
    "function stopFoundationWatch()",
    "function watchFoundation(kind)",
    "saveFoundation('clubs')",
    "saveFoundation('recruit')",
    "saveFoundation('draft')",
    "saveFoundation('team')",
    "G.runRecruitment=(...args)=>",
    "G.skipRecruitment=(...args)=>",
    "G.beginDraft=(...args)=>",
    "G.skipToMyPick=(...args)=>",
    "G.userDraft=(...args)=>",
    "G.enterTeamRoom=(...args)=>",
    "for(const name of ['toggleXI','removeXI','replaceXI','moveBattingPlayer','selectRecommendedXI','clearXI','autoOrderXI'])",
    "if(state.recruit){state.recruit.running=false;state.recruit.timer=null}",
    "else if(state.pickIndex>=120||state.draftFinished)currentScreen='team'",
    "else if(state.draftOrder?.length)currentScreen='draft'",
    "else if(state.userClub)currentScreen='recruit'",
    "else if(state.league?.length===8)currentScreen='clubs'",
    "else if(currentScreen==='clubs'){base.finishLeagueReveal();markFoundationScreen('clubs')}",
    "else if(currentScreen==='draft'){base.beginDraft();markFoundationScreen('draft');watchFoundation('draft')}",
    "v7.2.6-foundation-save-continuity"
]
for marker in required:
    if marker not in b: fail.append('Missing save-continuity marker: '+marker)

for forbidden in ["SAVE_VERSION='7.2.1'","SAVE_VERSION='7.2.6'"]:
    if forbidden in b: fail.append('Unexpected save schema/version bump: '+forbidden)

# The core game block must remain byte-identical: no recruitment, Draft, XI, season or simulation logic changes.
if len(sa)==9 and len(sb)==9 and sa[5]!=sb[5]:
    fail.append('Core GCC game logic changed')

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.6 Foundation save-continuity guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.6 Foundation save-continuity guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core game/data/AI blocks unchanged: yes')
print('Save schema remains 7.2.0: yes')
