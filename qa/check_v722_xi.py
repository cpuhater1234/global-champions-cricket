#!/usr/bin/env python3
from pathlib import Path
import hashlib
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "game" / "global_champions_cricket_v7_2_2_xi_structure.html"
EXPECTED_SHA = "6e1ec524263c1f30366b64be210ae6c6726830ff37dcfaaed4b79e8236d127e6"

if not TARGET.exists():
    subprocess.run([sys.executable, str(ROOT / "qa" / "rebuild_v722.py")], cwd=ROOT, check=True)

data = TARGET.read_bytes()
text = data.decode("utf-8")
actual = hashlib.sha256(data).hexdigest()

failures = []

if actual != EXPECTED_SHA:
    failures.append(f"SHA mismatch: {actual}")

required = [
    "selectRecommendedXI",
    "showManualXI",
    "clearXI",
    "USE RECOMMENDED XI",
    "BUILD MANUALLY",
    "NO XI SELECTED",
    "xiEssentials",
    "teamDetailRead",
    "Bowling cover",
    "manualXIVisible",
    "status!=='OUT'",
    "Pick the eleven for Round 1, then set the batting order.",
    "v7.2.2",
]

for marker in required:
    if marker not in text:
        failures.append(f"Missing required marker: {marker}")

for forbidden in [
    "LIKELY XI",
]:
    if forbidden in text:
        failures.append(f"Forbidden legacy marker still present: {forbidden}")

if "roster.filter(p=>state.dynasty?.injuries?.[p.id]?.status!=='OUT')" not in text:
    failures.append("Recommended XI injury exclusion path is missing")

if failures:
    print("v7.2.2 XI structural guardrail FAILED")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("v7.2.2 XI structural guardrail OK")
print(f"SHA-256 {EXPECTED_SHA}")
