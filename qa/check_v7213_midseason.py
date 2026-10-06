#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_12_offseason_transition_isolation.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_13_midseason_trade_window.html'
EXPECTED_SOURCE='10e0ea729a0bc5d3bacfbec759b3d91f38eae26caec266913338ac38c7410283'
EXPECTED_TARGET='2b102f1e5a54743d2a3b1dcb9eb2fa2c69c79021235453535512cbb3350a5509'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7213.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.12 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.2.13 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]:fail.append(f'Protected core script block {i} changed')
    if sa[7].replace('v7.2.12-offseason-transition-isolation','v7.2.13-midseason-trade-window',1)!=sb[7]:
        fail.append('Presentation block changed beyond UI-version marker')
    expected=sa[8]
    old1="function proposeTrade(midseason=false){const club=$('tradeClub')?.value,target=pById($('tradeTarget')?.value),offer=pById($('tradeOffer')?.value);if(!club||!target||!offer)return;"
    new1="function proposeTrade(midseason=false){const club=$('tradeClub')?.value,target=pById($('tradeTarget')?.value),offer=pById($('tradeOffer')?.value);if(!club||!target||!offer)return;if(midseason&&state.dynasty.midseasonDone[state.year]){const read=$('tradeRead');if(read){read.className='trade-read bad';read.textContent='This season\\'s mid-season window is already closed.'}return}"
    old2="const accepted=offered>=asked*threshold;$('tradeRead').className=`trade-read ${accepted?'good':'bad'}`;$('tradeRead').textContent=accepted?`${club} accept. ${offer.name} leaves; ${target.name} is yours.`:`${club} reject it. They value ${target.name} more highly than the package you offered.`;if(!accepted)return;const offerCoverId=midseason?state.dynasty.replacementFor[offer.id]:null;"
    new2="const accepted=offered>=asked*threshold;$('tradeRead').className=`trade-read ${accepted?'good':'bad'}`;$('tradeRead').textContent=accepted?`${club} accept. ${offer.name} leaves; ${target.name} is yours.`:`${club} reject it. They value ${target.name} more highly than the package you offered.`;if(!accepted)return;if(midseason)state.dynasty.midseasonDone[state.year]=true;const offerCoverId=midseason?state.dynasty.replacementFor[offer.id]:null;"
    old3="function openMidseasonMarket(){state.dynasty.midseasonDone[state.year]=true;log('TRADE WINDOW',`${state.year} mid-season window opens`,'After Round 7, contenders and struggling clubs get one short chance to reshape the list.');openTradeCentre(true);autoSave()}"
    new3="function openMidseasonMarket(){openTradeCentre(true)}"
    expected=expected.replace(old1,new1,1).replace(old2,new2,1).replace(old3,new3,1)
    if expected!=sb[8]:fail.append('Dynasty script changed beyond mid-season window consumption semantics')
for marker in [
    "if(midseason&&state.dynasty.midseasonDone[state.year])",
    "if(midseason)state.dynasty.midseasonDone[state.year]=true",
    "function openMidseasonMarket(){openTradeCentre(true)}",
    "v7.2.13-midseason-trade-window"
]:
    if marker not in b:fail.append('Missing mid-season marker: '+marker)
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.13 Mid-season trade-window guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.2.13 Mid-season trade-window guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core simulation/data blocks unchanged: yes')
print('Window is consumed only by an accepted mid-season trade: yes')
