#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V734=GAME/'global_champions_cricket_v7_3_4_golden_dynasty.html'
V740=GAME/'global_champions_cricket_v7_4_0_league_history.html'
EXPECTED_734='ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc'
EXPECTED_740='6317af10bbda0aa8ee1f61c825d12097c216ec58beef54df2f2524e75f1136eb'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
if not V734.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v734.py')],cwd=ROOT,check=True)
if sha(V734)!=EXPECTED_734:
    raise SystemExit(f'v7.3.4 SHA mismatch: {sha(V734)}')

t=V734.read_text('utf-8')
simulate="""  function simulateFinals() {
    if (!state.finals || state.finals.running) return;
    const f=state.finals;
    if(f.stage==='ready') {
      f.running=true;
      const top=f.top;
      f.semis=[simulateKnockout(top[0],top[3],15),simulateKnockout(top[1],top[2],15)];
      f.stage='semis'; f.running=false; renderFinals(); return;
    }
    if(f.stage==='gf-ready') {
      f.running=true;
      f.gf=simulateKnockout(f.gfPair.home,f.gfPair.away,16);
      state.champion=f.gf.winner;
      f.stage='done'; f.running=false; renderFinals();
    }
  }
"""
resolver=simulate+"""
  function resolveCpuFinalsOffscreen() {
    if (state.round < 14) return null;
    if (state.champion) return state.champion;
    const top = standings().slice(0, 4).map(x => x.club);
    if (top.length !== 4) return null;
    const semis = [simulateKnockout(top[0], top[3], 15), simulateKnockout(top[1], top[2], 15)];
    const seed = c => top.findIndex(x => x.abbr === c.abbr);
    const host = seed(semis[0].winner) < seed(semis[1].winner) ? semis[0].winner : semis[1].winner;
    const away = host.abbr === semis[0].winner.abbr ? semis[1].winner : semis[0].winner;
    const gf = simulateKnockout(host, away, 16);
    state.finals = { top, semis, gf, gfPair:{home:host,away}, stage:'done', running:false };
    state.champion = gf.winner;
    return state.champion;
  }
"""
repls=[
    (simulate,resolver),
    ("    simulateFinals,\n    openSeasonReview,","    simulateFinals,\n    resolveCpuFinalsOffscreen,\n    openSeasonReview,"),
    ("G.proceedPostSeason=(...args)=>{if(state.round>=14&&(state.regularSeasonPosition||99)>4)return G.openSeasonReview();if(blockInvalidFinalsXI())return;",
     "G.proceedPostSeason=(...args)=>{if(state.round>=14&&(state.regularSeasonPosition||99)>4){G.resolveCpuFinalsOffscreen?.();return G.openSeasonReview()}if(blockInvalidFinalsXI())return;"),
    ("document.body.dataset.uiVersion = 'v7.3.4-golden-dynasty';","document.body.dataset.uiVersion = 'v7.4.0-league-history';"),
]
for old,new in repls:
    count=t.count(old)
    if count!=1: raise SystemExit(f'v7.4.0 replacement count {count} for {old[:90]!r}')
    t=t.replace(old,new,1)

V740.write_text(t,'utf-8')
if sha(V740)!=EXPECTED_740:
    raise SystemExit(f'v7.4.0 SHA mismatch: {sha(V740)}')

print(f'v7.3.4 OK  {EXPECTED_734}')
print(f'v7.4.0 OK  {EXPECTED_740}')
