#!/usr/bin/env python3
from pathlib import Path
import hashlib
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "game" / "global_champions_cricket_v7_2_1_season_hub_structure.html"
EXPECTED_SHA = "e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3"

if not TARGET.exists():
    subprocess.run([sys.executable, str(ROOT / "qa" / "rebuild_v721.py")], cwd=ROOT, check=True)

data = TARGET.read_bytes()
text = data.decode("utf-8")
actual = hashlib.sha256(data).hexdigest()

failures = []

if actual != EXPECTED_SHA:
    failures.append(f"SHA mismatch: {actual}")

required = [
    "setSeasonView",
    "renderSeasonOverview",
    "renderSeasonFixtures",
    "renderSeasonLadder",
    "RUN REST OF SEASON",
    "Overview",
    "Fixtures",
    "Ladder",
    "Analysis",
    "Players",
    "dismissMoment",
    "seasonActions",
    "v7.2.1 structural season hub",
]

for marker in required:
    if marker not in text:
        failures.append(f"Missing required marker: {marker}")

for forbidden in [
    "KEEP SEASON RUNNING",
]:
    if forbidden in text:
        failures.append(f"Forbidden legacy marker still present: {forbidden}")

# Guard against accidentally restoring the old always-on season wall.
overview_pos = text.find("renderSeasonOverview")
fixtures_pos = text.find("renderSeasonFixtures")
ladder_pos = text.find("renderSeasonLadder")
view_pos = text.find("setSeasonView")
if min(overview_pos, fixtures_pos, ladder_pos, view_pos) < 0:
    failures.append("Season view architecture could not be located")

if failures:
    print("v7.2.1 Season Hub guardrail FAILED")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("v7.2.1 Season Hub guardrail OK")
print(f"SHA-256 {EXPECTED_SHA}")
