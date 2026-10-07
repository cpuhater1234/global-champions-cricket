#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V740=GAME/'global_champions_cricket_v7_4_0_league_history.html'
V741=GAME/'global_champions_cricket_v7_4_1_form_symmetry.html'
EXPECTED_740='6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb'
EXPECTED_741='34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V740.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v740.py')],cwd=ROOT,check=True)
if sha(V740)!=EXPECTED_740:
    raise SystemExit(f'v7.4.0 SHA mismatch: {sha(V740)}')

t=V740.read_text('utf-8')

anchor="  function updateFormForMatch(home, away, scorecard) {"
helper="""  function formNegRoll(playerId) {
    let h=2166136261;
    const s=`${state.weatherSeed||1}:${state.year}:${state.round}:${playerId}:form-neg`;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0)/4294967296;
  }
"""
if t.count(anchor)!=1:
    raise SystemExit('updateFormForMatch anchor mismatch')
t=t.replace(anchor,helper+anchor,1)

repls=[
    ("let move=signal>=.75?1:signal<=-.5?-1:0;",
     "let move=signal>=.75?1:(signal<=-.45&&formNegRoll(p.id)<.50)?-1:0;"),
    ("document.body.dataset.uiVersion = 'v7.4.0-league-history';",
     "document.body.dataset.uiVersion = 'v7.4.1-form-symmetry';"),
]
for old,new in repls:
    count=t.count(old)
    if count!=1:
        raise SystemExit(f'v7.4.1 replacement count {count} for {old!r}')
    t=t.replace(old,new,1)

V741.write_text(t,'utf-8')
if sha(V741)!=EXPECTED_741:
    raise SystemExit(f'v7.4.1 SHA mismatch: {sha(V741)}')

print(f'v7.4.0 OK  {EXPECTED_740}')
print(f'v7.4.1 OK  {EXPECTED_741}')
