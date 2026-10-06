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
        if i==7: continue
        if sa[i]!=sb[i]: fail.append(f'Protected non-presentation script block {i} changed')

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
print('Non-presentation script blocks unchanged: yes')
print('Review calculations/data unchanged: yes')
