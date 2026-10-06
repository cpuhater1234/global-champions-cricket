#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_9_finals_hierarchy.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_10_review_hierarchy.html'
EXPECTED_SOURCE='cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8'
EXPECTED_TARGET='e6a93cf831a548c2dfd44c5c8d6af9c35166accf007c428bdde286e4b860fe70'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7210.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.9 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.10 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(9):
        if i in (5,7): continue
        if sa[i]!=sb[i]: fail.append(f'Protected script block {i} changed')

    old_header="""    const moments={
      champion:['CHAMPIONS','You won the first GCC title.','The first season ends with your club on top.'],
      'runner-up':['RUNNERS-UP','Grand Final','You made the Grand Final and lost the last one.'],
      'wooden-spoon':['WOODEN SPOON','Eighth.','The table leaves no argument.'],
      finalist:['SEMI-FINAL EXIT','Finals','You made the four. The season ended there.'],
      'near-miss':['FIFTH','5th','Four teams made the finals. You were next.'],
      midtable:['SEASON OVER',`${ordinal(pos)} after 14 rounds.`,'The table and the scorecards tell the story.']
    };
    const m=moments[mood];
    $('reviewOutcome').innerHTML=`<span>${m[0]}</span><b>${m[1]}</b><small>${m[2]}</small>`;
    $('reviewTitle').textContent = champion ? 'First GCC champions.' : runnerUp ? 'One win short.' : woodenSpoon ? 'Eighth. Start again.' : pos<=4 ? 'Finals made. Semi‑final lost.' : pos===5 ? 'Fifth. One place short.' : '2008 in the books.';
"""
    new_header="""    const moments={
      champion:['CHAMPIONS','The first title is yours.','Draft night to Grand Final, the plan held.'],
      'runner-up':['RUNNERS-UP','One match short.','The season ended in the Grand Final.'],
      'wooden-spoon':['WOODEN SPOON','Eighth.','The rebuild starts with the scorecards.'],
      finalist:['SEMI-FINAL EXIT','The four, then out.','The knockout ended the run.'],
      'near-miss':['FIFTH','One place outside.','Four teams made the finals. You were next.'],
      midtable:['SEASON OVER',`${ordinal(pos)} after 14 rounds.`,'The table is final. The scorecards explain it.']
    };
    const m=moments[mood];
    $('reviewOutcome').innerHTML=`<span>${m[0]}</span><b>${m[1]}</b><small>${m[2]}</small>`;
    $('reviewTitle').textContent = champion ? 'How the title was won.' : runnerUp ? 'Where the Grand Final got away.' : woodenSpoon ? 'Why it finished eighth.' : pos<=4 ? 'Where the semi-final got away.' : pos===5 ? 'Where the top four got away.' : 'What the season exposed.';
"""
    old_narrative="""    const base = champion ? `You won the first Global Champions Cricket title after finishing ${ordinal(pos)} in the regular season.` : reachedFinal ? `You reached the first GCC Grand Final after finishing ${ordinal(pos)} in the regular season.` : pos <= 4 ? `You reached the finals from ${ordinal(pos)}, but the knockout stage ended the run.` : `You finished ${ordinal(pos)} and missed the top four.`;
    const leaders = [];
    if (topBat) leaders.push(`${topBat.p.name} led the batting with ${topBat.st.runs} runs at ${stat1(battingAverage(topBat.st))}`);
    if (topBowl) leaders.push(`${topBowl.p.name} led the attack with ${topBowl.st.wickets} wickets at ${stat1(bowlingAverage(topBowl.st))}`);
    const player = leaders.length ? ` ${leaders.join('; ')}.` : '';
    const structural = profile.roleFit < 84 ? ' Too many players were doing jobs that did not suit them.' : profile.xiShape < 76 ? ' The XI had enough talent. The batting order and bowling attack did not fit together.' : profile.death < 70 ? ' The death overs were the weak point.' : profile.keeping < 65 ? ' You played without a recognised keeper and paid for it behind the stumps.' : profile.bowlingResources < 70 ? ' The attack ran short of trustworthy overs.' : profile.finishing < 72 ? ' The batting did not have enough at the back end.' : ' The XI was balanced. From there, it came down to execution, matchups and form.';
    return base + player + structural;
"""
    new_narrative="""    const leaders = [];
    if (topBat) leaders.push(`${topBat.p.name} led the batting with ${topBat.st.runs} runs at ${stat1(battingAverage(topBat.st))}`);
    if (topBowl) leaders.push(`${topBowl.p.name} led the attack with ${topBowl.st.wickets} wickets at ${stat1(bowlingAverage(topBowl.st))}`);
    const player = leaders.length ? `${leaders.join('; ')}.` : 'The scorecards are in.';
    const structural = profile.roleFit < 84 ? ' Too many players were doing jobs that did not suit them.' : profile.xiShape < 76 ? ' The XI had enough talent. The batting order and bowling attack did not fit together.' : profile.death < 70 ? ' The death overs were the weak point.' : profile.keeping < 65 ? ' You played without a recognised keeper and paid for it behind the stumps.' : profile.bowlingResources < 70 ? ' The attack ran short of trustworthy overs.' : profile.finishing < 72 ? ' The batting did not have enough at the back end.' : ' The XI was balanced. From there, it came down to execution, matchups and form.';
    return player + structural;
"""
    expected5=sa[5].replace(old_header,new_header,1).replace(old_narrative,new_narrative,1)
    if expected5!=sb[5]: fail.append('Core review script changed beyond the intended copy hierarchy delta')
    expected7=sa[7].replace('v7.2.9-finals-hierarchy','v7.2.10-review-hierarchy',1)
    if expected7!=sb[7]: fail.append('Presentation script changed beyond the UI-version marker')

for marker in [
    'v7.2.10-review-hierarchy',
    "champion:['CHAMPIONS','The first title is yours.'",
    "'How the title was won.'",
    "const player = leaders.length ? `${leaders.join('; ')}.` : 'The scorecards are in.';"
]:
    if marker not in b: fail.append('Missing review hierarchy marker: '+marker)

for forbidden in [
    "champion:['CHAMPIONS','You won the first GCC title.'",
    "'First GCC champions.'",
    "`You won the first Global Champions Cricket title after finishing ${ordinal(pos)} in the regular season.`"
]:
    if forbidden in b: fail.append('Redundant review copy remains: '+forbidden)

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js'; p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.10 Season Review hierarchy guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.10 Season Review hierarchy guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('All non-review script blocks unchanged: yes')
print('Review calculations/data unchanged: yes')
