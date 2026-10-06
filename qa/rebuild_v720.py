#!/usr/bin/env python3
from pathlib import Path
import base64, gzip, hashlib, shutil, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / 'game'
PATCHES = ROOT / 'qa' / 'patches'
BASE = GAME / 'global_champions_cricket_v7_1_2_premium_polish_candidate.html'
V720 = GAME / 'global_champions_cricket_v7_2_0_launcher_architecture.html'
EXPECTED_BASE = '6c07526259b85723eedd216fca513f6e57b59ce98de23b2e7575af849a73c74b'
EXPECTED_BASE_NORMALISED = '7776f3fb8422ec75281004b7019de0faf6762351a6a0a69a797dc7c2174f2e72'
EXPECTED_720 = '365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def newline_normalised_sha(path):
    data = path.read_bytes().replace(b'\r', b'').replace(b'\n', b'')
    return hashlib.sha256(data).hexdigest()

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

base_sha = sha(BASE)
if base_sha == EXPECTED_BASE:
    apply_payload('v712_to_v720_launcher.patch.gz.b64', BASE, V720)
elif newline_normalised_sha(BASE) == EXPECTED_BASE_NORMALISED:
    # GitHub's text transfer removed six newline bytes from the tested v7.1.2 file.
    # The non-newline byte stream is identical. In that representation, the exact
    # committed v7.2.0 file is the protected handoff point for later rebuilds.
    if not V720.exists() or sha(V720) != EXPECTED_720:
        raise SystemExit('v7.1.2 is transfer-normalised, but the exact committed v7.2.0 handoff is missing or drifted')
    print(f'v7.1.2 transfer-normalised source OK  {EXPECTED_BASE_NORMALISED}')
else:
    raise SystemExit(f'v7.1.2 content mismatch: {base_sha}')

if sha(V720) != EXPECTED_720:
    raise SystemExit(f'v7.2.0 SHA mismatch: {sha(V720)}')

print(f'v7.2.0 OK  {EXPECTED_720}')
