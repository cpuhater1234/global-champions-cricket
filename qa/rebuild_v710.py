#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, shutil, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'game'
PATCHES = ROOT / 'qa' / 'patches'
BASE = GAME / 'global_champions_cricket_v7_0_14_mobile_interaction_hardened.html'
V7023 = GAME / 'global_champions_cricket_v7_0_23_release_candidate.html'
V710 = GAME / 'global_champions_cricket_v7_1_0_premium_polish_candidate.html'
EXPECTED_7023 = '47861e9c0328ae2f57c9f3cc0c05184c7c48e3ec7bd8b1c642f5f3e01e0f42ce'
EXPECTED_710 = '233821a47c876c4a847a67b3d421bc002b03efa8e128ea1292958445f60fc3a0'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def payload_text(stem):
    parts = sorted(PATCHES.glob(stem + '.part*'))
    if not parts:
        single = PATCHES / stem
        if single.exists():
            return single.read_text().strip()
        raise SystemExit(f'Missing patch payload: {stem}')
    return ''.join(x.read_text() for x in parts).strip()

def apply_payload(stem, source, target):
    shutil.copy2(source, target)
    raw = gzip.decompress(base64.b64decode(payload_text(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch', delete=False) as f:
        f.write(raw)
        patch_path = Path(f.name)
    try:
        subprocess.run(['patch', '-p0', '--forward', '--batch', '-i', str(patch_path)], cwd=ROOT, check=True)
    finally:
        patch_path.unlink(missing_ok=True)

if not BASE.exists():
    raise SystemExit(f'Missing protected baseline: {BASE.relative_to(ROOT)}')

apply_payload('v7014_to_v7023.patch.gz.b64', BASE, V7023)
if sha(V7023) != EXPECTED_7023:
    raise SystemExit(f'v7.0.23 SHA mismatch: {sha(V7023)}')

apply_payload('v7023_to_v710.patch.gz.b64', V7023, V710)
if sha(V710) != EXPECTED_710:
    raise SystemExit(f'v7.1.0 SHA mismatch: {sha(V710)}')

print(f'v7.0.23 OK  {EXPECTED_7023}')
print(f'v7.1.0 OK   {EXPECTED_710}')
