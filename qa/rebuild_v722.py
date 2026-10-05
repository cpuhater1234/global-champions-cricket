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
V721 = GAME / "global_champions_cricket_v7_2_1_season_hub_structure.html"
V722 = GAME / "global_champions_cricket_v7_2_2_xi_structure.html"

EXPECTED_721 = "e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3"
EXPECTED_722 = "6e1ec524263c1f30366b64be210ae6c6726830ff37dcfaaed4b79e8236d127e6"

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

subprocess.run([sys.executable, str(ROOT / "qa" / "rebuild_v721.py")], cwd=ROOT, check=True)

if not V721.exists():
    raise SystemExit(f"Missing v7.2.1 baseline: {V721.relative_to(ROOT)}")
if sha(V721) != EXPECTED_721:
    raise SystemExit(f"v7.2.1 SHA mismatch: {sha(V721)}")

apply_payload("v721_to_v722_xi.patch.gz.b64", V721, V722)

if not V722.exists():
    raise SystemExit(f"v7.2.2 was not produced: {V722.relative_to(ROOT)}")
if sha(V722) != EXPECTED_722:
    raise SystemExit(f"v7.2.2 SHA mismatch: {sha(V722)}")

print(f"v7.2.1 OK  {EXPECTED_721}")
print(f"v7.2.2 OK  {EXPECTED_722}")
