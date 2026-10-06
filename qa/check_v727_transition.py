#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_6_foundation_save_continuity.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_7_team_room_transition.html'
EXPECTED_SOURCE='58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c'
EXPECTED_TARGET='05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v727.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.6 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.7 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(9):
        if i==7: continue
        if sa[i]!=sb[i]: fail.append(f'Protected script block {i} changed')
    expected=sa[7].replace('v7.2.6-foundation-save-continuity','v7.2.7-team-room-transition',1)
    old="""  function clearMoment(){
    clearTimeout(momentTimer);
    if(pendingMomentTimer){ clearTimeout(pendingMomentTimer); pendingMomentTimer=null; }
    momentSeq++;
    layer.classList.remove('show');
    layer.className='gcc-moment-layer';
    const toastEl=document.getElementById('toast');
    if(toastEl){ clearTimeout(toastEl._hideTimer); toastEl.classList.remove('show'); toastEl.textContent=''; }
  }
"""
    new="""  function clearMoment(){
    clearTimeout(momentTimer);
    if(pendingMomentTimer){ clearTimeout(pendingMomentTimer); pendingMomentTimer=null; }
    momentSeq++;
    // A screen transition is a hard boundary: do not let the previous bulletin fade across the next screen.
    const priorTransition=layer.style.transition;
    layer.style.transition='none';
    layer.classList.remove('show');
    layer.className='gcc-moment-layer';
    layer.setAttribute('aria-hidden','true');
    void layer.offsetWidth;
    layer.style.transition=priorTransition;
    const toastEl=document.getElementById('toast');
    if(toastEl){ clearTimeout(toastEl._hideTimer); toastEl.classList.remove('show'); toastEl.textContent=''; }
  }
"""
    expected=expected.replace(old,new,1)
    if expected!=sb[7]: fail.append('Presentation block changed beyond hard clearMoment + UI-version marker')

for marker in [
    "v7.2.7-team-room-transition",
    "A screen transition is a hard boundary",
    "layer.style.transition='none'",
    "void layer.offsetWidth",
    "layer.style.transition=priorTransition"
]:
    if marker not in b: fail.append('Missing transition marker: '+marker)

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js'; p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.7 Team Room transition guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.7 Team Room transition guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Non-presentation script blocks unchanged: yes')
print('Save continuity layer unchanged: yes')
