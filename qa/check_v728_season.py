#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_7_team_room_transition.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_8_season_result_hierarchy.html'
EXPECTED_SOURCE='05b88d1158efa063a90c9d7dbadfbac5278de08f16129ffe7a419a74f8b7e58a'
EXPECTED_TARGET='8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v728.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.7 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.8 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(9):
        if i==7: continue
        if sa[i]!=sb[i]: fail.append(f'Protected non-presentation script block {i} changed')
    expected=sa[7].replace('v7.2.7-team-room-transition','v7.2.8-season-result-hierarchy',1)
    old_start="""  wrap('startSeason',(original,args)=>{
    const before=state.round||0;
    const club=state.userClub;
    const out=original(...args);
    if(before===0 && club){
      showMoment({eyebrow:'ROUND 1',title:'The season begins.',detail:`${club.name} · XI LOCKED · FOURTEEN MATCHES`,tone:'draft',duration:1050});
    }
    return out;
  });
"""
    new_start="""  wrap('startSeason',(original,args)=>{
    // The Season screen already owns the Round 1 hierarchy. Clear XI feedback at the boundary
    // rather than stacking another floating bulletin over the Season heading.
    clearMoment();
    return original(...args);
  });
"""
    old_result="""  function resultMoment(res){
    if(!res || !state.userClub) return;
    const userHome=res.home.abbr===state.userClub.abbr;
    const mine=userHome?res.homeInnings:res.awayInnings;
    const theirs=userHome?res.awayInnings:res.homeInnings;
    const opp=userHome?res.away:res.home;
    const won=res.winner.abbr===state.userClub.abbr;
    showMoment({
      eyebrow:`ROUND ${res.round} · ${won?'WIN':'LOSS'}`,
      title:`${won?'Won':'Lost'} ${res.marginText||''}`.trim(),
      detail:`${state.userClub.abbr} ${mine.total}/${mine.wickets} · ${opp.abbr} ${theirs.total}/${theirs.wickets}`,
      tone:won?'win':'loss',duration:980
    });
    requestAnimationFrame(()=>{
"""
    new_result="""  function resultMoment(res){
    if(!res || !state.userClub) return;
    // The persistent match story is the result. Keep the landing animation and ladder movement,
    // but do not duplicate the same result in a floating bulletin over the Season heading.
    requestAnimationFrame(()=>{
"""
    expected=expected.replace(old_start,new_start,1).replace(old_result,new_result,1)
    if expected!=sb[7]: fail.append('Presentation block changed beyond the intended Season hierarchy delta')

for marker in [
    'v7.2.8-season-result-hierarchy',
    'The Season screen already owns the Round 1 hierarchy',
    'The persistent match story is the result',
    "wrap('startSeason',(original,args)=>{",
    'function resultMoment(res)'
]:
    if marker not in b: fail.append('Missing Season hierarchy marker: '+marker)

for forbidden in [
    "showMoment({eyebrow:'ROUND 1',title:'The season begins.'",
    "eyebrow:`ROUND ${res.round} · ${won?'WIN':'LOSS'}`"
]:
    if forbidden in b: fail.append('Duplicate Season floating bulletin remains: '+forbidden)

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js'; p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.8 Season result hierarchy guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.8 Season result hierarchy guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Non-presentation script blocks unchanged: yes')
print('Season simulation/data logic unchanged: yes')
