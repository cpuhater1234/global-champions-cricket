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
GAME = ROOT / 'game'
PATCHES = ROOT / 'qa' / 'patches'
V722 = GAME / 'global_champions_cricket_v7_2_2_xi_structure.html'
V723 = GAME / 'global_champions_cricket_v7_2_3_draft_structure.html'
EXPECTED_722 = '6b9ee248228a677e48ef644aa30aa4d8d7ed520404f9e0b32941d6961b13623f'
EXPECTED_723 = 'ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def payload_text(stem):
    parts = sorted(PATCHES.glob(stem + '.part*'))
    if not parts:
        single = PATCHES / stem
        if single.exists():
            return single.read_text().strip()
        raise SystemExit(f'Missing patch payload: {stem}')
    return ''.join(p.read_text() for p in parts).strip()

def apply_payload(stem, source, target):
    shutil.copy2(source, target)
    raw = gzip.decompress(base64.b64decode(payload_text(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch', delete=False) as fh:
        fh.write(raw)
        patch_path = Path(fh.name)
    try:
        subprocess.run(['patch', '-p0', '--forward', '--batch', '-i', str(patch_path)], cwd=ROOT, check=True)
    finally:
        patch_path.unlink(missing_ok=True)

subprocess.run([sys.executable, str(ROOT / 'qa' / 'rebuild_v722.py')], cwd=ROOT, check=True)
if not V722.exists() or sha(V722) != EXPECTED_722:
    raise SystemExit(f'v7.2.2 SHA mismatch: {sha(V722) if V722.exists() else "missing"}')

apply_payload('v722_to_v723_draft.patch.gz.b64', V722, V723)
if not V723.exists() or sha(V723) != EXPECTED_723:
    raise SystemExit(f'v7.2.3 SHA mismatch: {sha(V723) if V723.exists() else "missing"}')

print(f'v7.2.2 OK  {EXPECTED_722}')
print(f'v7.2.3 OK  {EXPECTED_723}')
