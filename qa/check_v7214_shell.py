#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_13_midseason_trade_window.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_14_year_shell_continuity.html'
EXPECTED_SOURCE='21788e247134133ea2aaa998d864b82384526f27dac2ef8cc72c4ed33c00ea99'
EXPECTED_TARGET='70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7214.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.13 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.2.14 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]:fail.append(f'Protected core script block {i} changed')
    if sa[7].replace('v7.2.13-midseason-trade-window','v7.2.14-year-shell-continuity',1)!=sb[7]:
        fail.append('Presentation block changed beyond UI-version marker')
    expected=sa[8].replace(
        "G.openSeasonReview=(...args)=>{const r=base.openSeasonReview(...args);currentScreen='review';state.dynasty.lastScreen='review';updateYearCopy();archiveSeason();",
        "G.openSeasonReview=(...args)=>{const r=base.openSeasonReview(...args);currentScreen='review';state.dynasty.lastScreen='review';updateYearCopy();if(state.year>2008)renderDynastyNav('review');archiveSeason();",
        1
    )
    if expected!=sb[8]:fail.append('Dynasty script changed beyond post-foundation Review navigation continuity')
for marker in ["if(state.year>2008)renderDynastyNav('review')","v7.2.14-year-shell-continuity"]:
    if marker not in b:fail.append('Missing year-shell marker: '+marker)
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.14 Year shell continuity guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.2.14 Year shell continuity guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core simulation/data blocks unchanged: yes')
print('Only post-foundation Review navigation continuity changed: yes')
