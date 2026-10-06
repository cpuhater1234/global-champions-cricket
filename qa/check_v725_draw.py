#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_4_signing_week_structure.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_5_draw_transition_hardening.html'
EXPECTED_SOURCE='477493c2610715ecb474e3042ec1e10ffc5015e202ac754a9f95c891dc7153a3'
EXPECTED_TARGET='ed7767c447fb1e0ed48b14bf93f69ec6e5af6f4307611c869b6182996b9291f2'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists(): subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v725.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.4 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append('v7.2.5 target SHA mismatch')
a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
required=[
"wrap('setupDraft',(original,args)=>{",
"clearMoment();",
"v7.2.5-draw-transition-hardening",
"do not carry a stale signing/club bulletin into the draw"
]
for x in required:
    if x not in b: fail.append('Missing marker: '+x)
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9: fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(8):
        if i==7: continue
        if sa[i]!=sb[i]: fail.append(f'Protected script block {i} changed')
    expected=sa[7].replace('v7.2.4-signing-structure','v7.2.5-draw-transition-hardening',1)
    anchor="  // The core enterTeamRoom() calls its private go(), so clear the Draft bulletin explicitly."
    insert="  // Core setupDraft() uses its private go(), so do not carry a stale signing/club bulletin into the draw.\n  wrap('setupDraft',(original,args)=>{\n    clearMoment();\n    return original(...args);\n  });\n\n"
    expected=expected.replace(anchor,insert+anchor,1)
    if expected!=sb[7]: fail.append('UI choreography changed beyond the intended setupDraft clear + version marker')
node=shutil.which('node')
if node:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.5 Draw transition guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)
print('v7.2.5 Draw transition guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Game-code delta: UI choreography only')
