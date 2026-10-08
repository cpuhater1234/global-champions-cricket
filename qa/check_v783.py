#!/usr/bin/env python3
from pathlib import Path
import hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'/'global_champions_cricket_v7_8_3_hard_playtest_visual.html'
EXPECTED='a178e2fc9f4881d22b107b8e69d91e8db377f8c196f46c42d164ba8e3078168c'

if not GAME.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v783.py')],cwd=ROOT,check=True)
raw=GAME.read_bytes(); got=hashlib.sha256(raw).hexdigest()
if got!=EXPECTED:
    raise SystemExit(f'v7.8.3 SHA mismatch: {got}')
text=raw.decode('utf-8')

required=[
    "v7.8.3-hard-playtest-visual",
    "if (!document.querySelector('#draft.screen.active')) return;",
    "hasLive=careerInMemory()",
    "homeContinue.classList.toggle('primary',has)",
    "function openLauncher(){base.go('world')",
    "function confirmFreshCareer(){G.closeModal();return clearSaveAndRestart()}",
    "dynasty-final-list-mode",
    "LOCKED IN",
    "const semiPreview=",
    "shell.dataset.outcome=finalsTone",
    "v7.8.3 HARD PLAYTEST VISUAL PASS"
]
missing=[x for x in required if x not in text]
if missing:
    raise SystemExit('Missing v7.8.3 markers: '+', '.join(missing))

forbidden=[
    "function confirmFreshCareer(){G.closeModal();return startFreshWorld()}",
]
for old in forbidden:
    if old in text:
        raise SystemExit(f'Old v7.8.2 flow still present: {old}')

print(f'v7.8.3 static checks OK {got}')
