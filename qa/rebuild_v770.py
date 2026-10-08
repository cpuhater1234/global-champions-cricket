#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V760=GAME/'global_champions_cricket_v7_6_0_matchday_immersion.html'
V770=GAME/'global_champions_cricket_v7_7_0_release_hardened.html'
EXPECTED_760='3a8b8bb9b9d67558ea19bda4b595b0ab083209f3ccb0607d209aaad04155b55f'
EXPECTED_770='57051db6a677b3721e4d19bb414e9098144116c64f7e78e0a9ab38dac26fcdfc'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def once(t,a,b,label):
    n=t.count(a)
    if n!=1: raise SystemExit(f'{label} anchor count {n}')
    return t.replace(a,b,1)
if not V760.exists(): subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v760.py')],cwd=ROOT,check=True)
if sha(V760)!=EXPECTED_760: raise SystemExit(f'v7.6 parent SHA mismatch: {sha(V760)}')
t=V760.read_text('utf-8')
t=once(t,"#archive .archive-season{border:0;border-bottom:1px solid var(--work-rule-soft);border-radius:0;background:transparent;box-shadow:none;cursor:pointer;transition:background .15s ease;grid-template-columns:78px minmax(165px,1fr) minmax(230px,1.2fr) 82px}","#archive .archive-season{border:0;border-bottom:1px solid var(--work-rule-soft);border-radius:0;background:transparent;box-shadow:none;cursor:pointer;transition:background .15s ease;grid-template-columns:78px minmax(165px,1fr) minmax(230px,1.2fr)}",'Archive grid')
t=once(t,"<div class=\"archive-year-leaders\"><b>${l.topRuns?esc(l.topRuns.name):'—'}</b> · ${l.topRuns?Number(l.topRuns.st.runs||0):0} runs<br><b>${l.topWickets?esc(l.topWickets.name):'—'}</b> · ${l.topWickets?Number(l.topWickets.st.wickets||0):0} wickets</div><strong>${h.title?'TITLE':h.finals?'TOP FOUR':'SEASON'}</strong></article>","<div class=\"archive-year-leaders\"><b>${l.topRuns?esc(l.topRuns.name):'—'}</b> · ${l.topRuns?Number(l.topRuns.st.runs||0):0} runs<br><b>${l.topWickets?esc(l.topWickets.name):'—'}</b> · ${l.topWickets?Number(l.topWickets.st.wickets||0):0} wickets</div></article>",'Archive timeline tail')
t=once(t,'<p class="archive-method">Order: runs + 25× wickets + 80× seasons + 300× titles.</p>','<p class="archive-method">Runs, wickets, longevity and titles shape the order.</p>','Archive ranking copy')
t=once(t,"document.body.dataset.uiVersion = 'v7.6.0-matchday-immersion';","document.body.dataset.uiVersion = 'v7.7.0-release-hardened';",'UI version')
V770.write_text(t,'utf-8')
actual=sha(V770)
if actual!=EXPECTED_770: raise SystemExit(f'v7.7 SHA mismatch: {actual}')
print(f'v7.6 parent OK  {EXPECTED_760}')
print(f'v7.7 accepted    {EXPECTED_770}')
