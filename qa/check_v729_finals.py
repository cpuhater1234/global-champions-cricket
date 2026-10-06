#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_8_season_result_hierarchy.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_9_finals_hierarchy.html'
EXPECTED_SOURCE='8840a74bf804e6f06cf2efe9cf0cde3544d7d09509cafbcc766e52b95f10cd2f'
EXPECTED_TARGET='cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v729.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.8 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.9 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(9):
        if i==7: continue
        if sa[i]!=sb[i]: fail.append(f'Protected non-presentation script block {i} changed')

for marker in [
    'v7.2.9-finals-hierarchy',
    'The finals page itself reveals the Grand Final pairing',
    'only a genuine championship win earns a ceremony moment',
    "showMoment({eyebrow:'GLOBAL CHAMPIONS CRICKET',title:'GLOBAL CHAMPIONS'"
]:
    if marker not in b: fail.append('Missing Finals hierarchy marker: '+marker)

for forbidden in [
    "eyebrow:'GRAND FINAL SET'",
    "eyebrow:'SEMI-FINAL',title:won?'Grand Final bound.'",
    "eyebrow:'GRAND FINAL',title:'One match short.'"
]:
    if forbidden in b: fail.append('Redundant finals bulletin remains: '+forbidden)

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js'; p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.9 Finals hierarchy guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.9 Finals hierarchy guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Non-presentation script blocks unchanged: yes')
print('Finals simulation/data logic unchanged: yes')
