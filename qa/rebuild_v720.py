#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, shutil, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'game'
PATCHES = ROOT / 'qa' / 'patches'
BASE = GAME / 'global_champions_cricket_v7_1_2_premium_polish_candidate.html'
V720 = GAME / 'global_champions_cricket_v7_2_0_launcher_architecture.html'
EXPECTED_BASE = '6c07526259b85723eedd216fca513f6e57b59ce98de23b2e7575af849a73c74b'
EXPECTED_720 = '365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef'

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
    raise SystemExit(f'Missing v7.1.2 baseline: {BASE.relative_to(ROOT)}')
if sha(BASE) != EXPECTED_BASE:
    raise SystemExit(f'v7.1.2 SHA mismatch: {sha(BASE)}')

apply_payload('v712_to_v720_launcher.patch.gz.b64', BASE, V720)
if sha(V720) != EXPECTED_720:
    raise SystemExit(f'v7.2.0 SHA mismatch: {sha(V720)}')

print(f'v7.1.2 OK  {EXPECTED_BASE}')
print(f'v7.2.0 OK  {EXPECTED_720}')
