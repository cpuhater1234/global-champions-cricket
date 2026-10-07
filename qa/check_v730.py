#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_16_launcher_fast_path.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_3_0_core_game_experience.html'
EXPECTED_SOURCE='dbf8dc746207c970c11ab650cf13cbca0adae87b641dc63c159f02db0090af2b'
EXPECTED_TARGET='88e1c5cde4200de3d3a352f85b7bd701476e2c73f3465df4172b7e9e96dcb743'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v730.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.16 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.3.0 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in [0,1,2,3,4,6]:
        if sa[i]!=sb[i]:fail.append(f'Protected core script block {i} changed')
for marker in [
  "document.body.dataset.uiVersion = 'v7.3.0-core-game-experience';",
  "Your picks are ordered naturally unless you change them.",
  "const selectionBlocked=unavailableSelected.length>0;",
  "quickStart.textContent=selectionBlocked?'CHANGE REQUIRED'",
  "startButton.disabled = !complete||selectionBlocked",
  "base.renderTeam();decorateSoon();return base.toast(issue)",
  "base.renderTeam();decorateSoon();base.toast(selectionIssue)",
  "actionLabel='PICK'",
  "$('xiList').innerHTML = roster.map",
  "const selectionIssue=userXIProblem();if(selectionIssue){autoTimer=null;specialGo('team')",
  "All 15 stay in view. Pick the side",
  "The full 15 stays visible. Use SWAP on the bench"
]:
    if marker not in b:fail.append('Missing v7.3.0 marker: '+marker)
for forbidden in [
  'Start from the recommended side or build it yourself.',
  'Start with the recommendation',
  "showMoment({eyebrow:'XI CHANGE'",
  'function autoRepairXI(){',
  '>USE RECOMMENDED XI<',
  '>BUILD MANUALLY<',
  "autoRepairXI();const before=state.round",
  "const available=roster.filter(p=>!state.xi.includes(p.id))",
  "Start from the recommended side",
  "Start with the recommendation",
  'content:"SELECTION SHEET"'
]:
    if forbidden in b:fail.append('Rejected v7.2 selection behaviour remains: '+forbidden)
# Product guardrail: implementation can retain the internal recommendation helper for CPU/legacy testing,
# but there must be no user-facing callsite in Team Room markup.
team_html=re.search(r'<section id="team".*?</section>\s*<section id="season"',b,re.S)
if not team_html: fail.append('Team Room HTML not found')
elif 'selectRecommendedXI' in team_html.group(0): fail.append('Team Room still exposes one-click recommended XI')
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.3.0 Core Game Experience guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.3.0 Core Game Experience guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Protected data/simulation script blocks unchanged: yes')
print('Human XI selection remains visible across all 15 players: yes')
print('One-click complete recommended XI removed from Team Room: yes')
print('Human season auto-run now stops for invalid XI decisions: yes')
