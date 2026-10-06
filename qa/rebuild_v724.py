#!/usr/bin/env python3
from pathlib import Path
import base64
import gzip
import hashlib
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'game'
PATCHES = ROOT / 'qa' / 'patches'
V723 = GAME / 'global_champions_cricket_v7_2_3_draft_structure.html'
V724 = GAME / 'global_champions_cricket_v7_2_4_signing_week_structure.html'
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
    raw = gzip.decompress(base64.b64decode(payload_text(stem)))
    with tempfile.NamedTemporaryFile(suffix='.patch', delete=False) as fh:
        fh.write(raw)
        patch_path = Path(fh.name)
    try:
        target.unlink(missing_ok=True)
        subprocess.run(['patch', '--batch', '-o', target.name, source.name, '-i', str(patch_path)], cwd=GAME, check=True)
    finally:
        patch_path.unlink(missing_ok=True)

subprocess.run([sys.executable, str(ROOT / 'qa' / 'rebuild_v723.py')], cwd=ROOT, check=True)
if not V723.exists() or sha(V723) != EXPECTED_723:
    raise SystemExit(f'v7.2.3 SHA mismatch: {sha(V723) if V723.exists() else "missing"}')

apply_payload('v723_to_v724_signing.patch.gz.b64', V723, V724)
print(f'v7.2.3 OK  {EXPECTED_723}')
print(f'v7.2.4 CANDIDATE  {sha(V724)}')
