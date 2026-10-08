#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_1_player_experience.html'
EXPECTED='6be011326dc44b67f113a9a9c2e242285c3fe7e2dfe490bde507701027342596'
if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v781.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED: raise SystemExit(f'v7.8.1 SHA mismatch: {got}')
text=raw.decode('utf-8')
required=[
    "v7.8.1-player-experience",
    "dynasty-event-mode",
    "function arrivalScoutRead",
    "ONE MORE YEAR",
    "function recentSeasonRead",
    "deal-read-band",
    "ENTER ${state.year} DRAFT ROOM",
    "function offseasonTurnoverUsed",
    "OFF-SEASON DEPARTURES",
    "annual-board-premium",
    "match-loss",
    "finals-event-card"
]
missing=[x for x in required if x not in text]
if missing: raise SystemExit('Missing v7.8.1 markers: '+', '.join(missing))
print(f'v7.8.1 static checks OK {got}')
