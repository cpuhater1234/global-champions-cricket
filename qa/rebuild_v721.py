#!/usr/bin/env python3
from pathlib import Path
import base64
import gzip
import hashlib
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "game"
PATCHES = ROOT / "qa" / "patches"
V720 = GAME / "global_champions_cricket_v7_2_0_launcher_architecture.html"
V721 = GAME / "global_champions_cricket_v7_2_1_season_hub_structure.html"

EXPECTED_720 = "365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef"
EXPECTED_721 = "e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3"

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def payload_text(stem):
    parts = sorted(PATCHES.glob(stem + ".part*"))
    if not parts:
        single = PATCHES / stem
        if single.exists():
            return single.read_text().strip()
        raise SystemExit(f"Missing patch payload: {stem}")
    return "".join(p.read_text() for p in parts).strip()

def apply_payload(stem, source, target):
    shutil.copy2(source, target)
    raw = gzip.decompress(base64.b64decode(payload_text(stem)))
    with tempfile.NamedTemporaryFile(suffix=".patch", delete=False) as fh:
        fh.write(raw)
        patch_path = Path(fh.name)
    try:
        subprocess.run(
            ["patch", "-p0", "--forward", "--batch", "-i", str(patch_path)],
            cwd=ROOT,
            check=True,
        )
    finally:
        patch_path.unlink(missing_ok=True)

# Rebuild the tested launcher baseline first.
subprocess.run([sys.executable, str(ROOT / "qa" / "rebuild_v720.py")], cwd=ROOT, check=True)

if not V720.exists():
    raise SystemExit(f"Missing v7.2.0 baseline: {V720.relative_to(ROOT)}")
if sha(V720) != EXPECTED_720:
    raise SystemExit(f"v7.2.0 SHA mismatch: {sha(V720)}")

apply_payload("v720_to_v721_season_hub.patch.gz.b64", V720, V721)

if not V721.exists():
    raise SystemExit(f"v7.2.1 was not produced: {V721.relative_to(ROOT)}")
if sha(V721) != EXPECTED_721:
    raise SystemExit(f"v7.2.1 SHA mismatch: {sha(V721)}")

print(f"v7.2.0 OK  {EXPECTED_720}")
print(f"v7.2.1 OK  {EXPECTED_721}")
