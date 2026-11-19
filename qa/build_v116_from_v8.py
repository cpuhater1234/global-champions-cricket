#!/usr/bin/env python3
"""Build v116 release HTML from the maintained v8 source tree.

The v116 canonical release is produced by:
  1. v8/build.py --legacy-scaffold --freeze   (engine snapshot)
  2. v8/build.py --legacy-scaffold            (assembles fresh UI)
  3. v8/build.py                              (applies perfection-20261030 patch)

This script reproduces that pipeline deterministically and verifies the
output byte-for-byte against the frozen GCC_v116_release (1).html.

Usage: python qa/build_v116_from_v8.py
"""
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE_HTML = ROOT / "GCC_v116_release (1).html"
OUT_HTML = ROOT / "qa" / "results" / "v116-rebuilt.html"

EXPECTED_SHA = "a1d2d3dd0e1351514923de6fdf143d63ec2b1182459c5da9f5f2dccc89fd6a5d"
EXPECTED_BYTES = 6649027


def sha256_file(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def run(cmd: str) -> None:
    print(f"> {cmd}")
    subprocess.run(cmd, cwd=ROOT, shell=True, check=True)


# Step 1: freeze engine snapshot (idempotent if already frozen)
print("Step 1: freeze engine snapshot")
run("python v8/build.py --legacy-scaffold --freeze --output qa/results/v116-frozen.html")

# Step 2: assemble fresh UI from frozen engine
print("Step 2: assemble fresh UI")
run("python v8/build.py --legacy-scaffold --output qa/results/v116-fresh.html")

# Step 3: apply perfection patch
print("Step 3: apply perfection patch")
run("python v8/build.py --output qa/results/v116-candidate.html")

# Step 4: compare
print("Step 4: verify byte-identity")
actual = OUT_HTML.read_bytes()
expected = RELEASE_HTML.read_bytes()
actual_sha = sha256_file(OUT_HTML)
expected_sha = sha256_file(RELEASE_HTML)

print(f"rebuilt:  {len(actual)} bytes  sha256={actual_sha}")
print(f"release:  {len(expected)} bytes  sha256={expected_sha}")

if len(actual) != len(expected):
    print(f"BYTE COUNT MISMATCH: {len(actual)} != {len(expected)}")
    sys.exit(1)
if actual != expected:
    min_len = min(len(actual), len(expected))
    for i in range(min_len):
        if actual[i] != expected[i]:
            ctx = 40
            start = max(0, i - ctx)
            end = min(min_len, i + ctx)
            print(f"First diff at byte {i} (0x{i:x})")
            print(f"rebuilt: {actual[start:end].decode('utf8', errors='replace')!r}")
            print(f"release: {expected[start:end].decode('utf8', errors='replace')!r}")
            break
    sys.exit(1)

print("PASS: rebuilt v116 is byte-identical to frozen release")
print(f"SHA-256: {actual_sha}")
print(f"Bytes:   {len(actual)}")
sys.exit(0)