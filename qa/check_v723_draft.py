#!/usr/bin/env python3
from pathlib import Path
import hashlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'game' / 'global_champions_cricket_v7_2_2_xi_structure.html'
TARGET = ROOT / 'game' / 'global_champions_cricket_v7_2_3_draft_structure.html'
EXPECTED_SOURCE = '6b9ee248228a677e48ef644aa30aa4d8d7ed520404f9e0b32941d6961b13623f'
EXPECTED_TARGET = 'ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32'
ALLOWED_CHANGED_FUNCTIONS = {
    'resetState','setupDraft','beginDraft','setFilter','renderDraftTransit','renderDraft',
    'renderPlayers','renderSquadMini','draftPriorityRead','renderDraftBoard',
}
EXPECTED_NEW_FUNCTIONS = {'showMoreDraftPlayers','toggleDraftBoard','renderDraftWorkspace'}

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def scripts(text): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', text, re.S | re.I)
def function_names(text): return set(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(', text))

def extract_function(text, name):
    m = re.search(r'\bfunction\s+' + re.escape(name) + r'\s*\(', text)
    if not m: return None
    brace = text.find('{', m.end())
    if brace < 0: return None
    depth=0; i=brace; quote=None; escaped=False; line_comment=False; block_comment=False
    while i < len(text):
        c=text[i]; n=text[i+1] if i+1 < len(text) else ''
        if line_comment:
            if c=='\n': line_comment=False
        elif block_comment:
            if c=='*' and n=='/': block_comment=False; i+=1
        elif quote:
            if escaped: escaped=False
            elif c=='\\': escaped=True
            elif c==quote: quote=None
        elif c=='/' and n=='/': line_comment=True; i+=1
        elif c=='/' and n=='*': block_comment=True; i+=1
        elif c in ("'", '"', chr(96)): quote=c
        elif c=='{': depth+=1
        elif c=='}':
            depth-=1
            if depth==0: return text[m.start():i+1]
        i+=1
    return None

if not TARGET.exists():
    subprocess.run([sys.executable, str(ROOT/'qa'/'rebuild_v723.py')], cwd=ROOT, check=True)

fail=[]
if not SOURCE.exists() or sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.2 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.3 SHA mismatch: {sha(TARGET)}')
source_text=SOURCE.read_text(encoding='utf-8'); target_text=TARGET.read_text(encoding='utf-8')

required=[
    'v7.2.3 structural draft room','draftPoolLimit = 24','draftPoolStep = 24','SHOW MORE',
    'VIEW DRAFT BOARD','BACK TO PLAYER POOL','draftBoardPanel','draftWorkspace','draftPoolControls',
    'FIRST READ','NEXT READ','Bowling cover is the priority','FULL DRAFT BOARD','v7.2.3-draft-structure'
]
for marker in required:
    if marker not in target_text: fail.append(f'Missing marker: {marker}')
for forbidden in ['list.slice(0, 90)']:
    if forbidden in target_text: fail.append(f'Legacy draft density marker remains: {forbidden}')
if "if (!state.draftOrder.length || !draftBoardVisible) return;" not in target_text:
    fail.append('Draft board is not gated behind the secondary view')

ids=re.findall(r'\bid=["\']([^"\']+)["\']', target_text)
dups=sorted({x for x in ids if ids.count(x)>1})
if dups: fail.append('Duplicate DOM IDs: '+', '.join(dups))

ss=scripts(source_text); ts=scripts(target_text)
if len(ss)!=9 or len(ts)!=9: fail.append(f'Expected 9 script blocks, got source={len(ss)} target={len(ts)}')
else:
    for i in [0,1,2,3,4,6,8]:
        if ss[i] != ts[i]: fail.append(f'Protected script block {i} changed')
    if ss[7].replace('v7.1.2-premium-polish-candidate','v7.2.3-draft-structure') != ts[7]:
        fail.append('Presentation choreography block changed beyond the UI-version marker')

source_names=function_names(source_text); target_names=function_names(target_text)
missing=source_names-target_names
if missing: fail.append('Named functions removed: '+', '.join(sorted(missing)))
new=target_names-source_names
if new != EXPECTED_NEW_FUNCTIONS: fail.append('Unexpected new functions: '+', '.join(sorted(new)))
for name in sorted(source_names - ALLOWED_CHANGED_FUNCTIONS):
    a=extract_function(source_text,name); b=extract_function(target_text,name)
    if a is None or b is None: fail.append(f'Could not extract protected function: {name}')
    elif a != b: fail.append(f'Protected function changed: {name}')

node=shutil.which('node')
if node:
    with tempfile.TemporaryDirectory() as td:
        for i,js in enumerate(ts):
            p=Path(td)/f'script_{i}.js'; p.write_text(js,encoding='utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
else:
    print('WARN node unavailable; syntax gate skipped')

if fail:
    print('v7.2.3 Draft structural guardrail FAILED')
    for x in fail: print('- '+x)
    raise SystemExit(1)
print('v7.2.3 Draft structural guardrail OK')
print('Source SHA-256', EXPECTED_SOURCE)
print('Target SHA-256', EXPECTED_TARGET)
print('Default player pool: 24')
print('Protected non-draft functions unchanged: yes')
