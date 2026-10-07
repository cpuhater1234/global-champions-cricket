#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V7214=GAME/'global_champions_cricket_v7_2_14_year_shell_continuity.html'
V7215=GAME/'global_champions_cricket_v7_2_15_match_day_conditions.html'
EXPECTED_7214='70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d'
EXPECTED_BASE_7215='9c3199f12db3e2273f6fe667d79a141a6a7fb506ab73b1c881a2650b56c55bec'
EXPECTED_CONTEXT_7215='e27df5c1bb6e7f26419fc08893b6b6a8a686aa098d206eb1edc1a7724b05049f'
EXPECTED_COPY_7215='90821b2cd6756fc2649e3a579b210935d5a3439d4e721f543b274f192b6a552e'
EXPECTED_WEATHER_7215='770fb8f811038b60db6f9282a496f71eba06a990ea33cb43380ae184279586d7'
EXPECTED_7215='b8eea1a14caee62fb4a09755729d9e077eb0994724e7d6a643fcfe1c5c8d3915'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def payload(stem):
    parts=sorted(PATCHES.glob(stem+'.part*'))
    if parts:
        return ''.join(x.read_text() for x in parts).strip()
    p=PATCHES/stem
    if p.exists():
        return p.read_text().strip()
    raise SystemExit(f'Missing patch payload: {stem}')

def patch_bytes(stem):
    return gzip.decompress(base64.b64decode(payload(stem)))

def apply(stem,src,dst):
    raw=patch_bytes(stem)
    with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
        fh.write(raw)
        pp=Path(fh.name)
    try:
        dst.unlink(missing_ok=True)
        subprocess.run(['patch','--batch','-o',dst.name,src.name,'-i',str(pp)],cwd=GAME,check=True)
    finally:
        pp.unlink(missing_ok=True)

def apply_inplace(stem,dst):
    raw=patch_bytes(stem)
    with tempfile.NamedTemporaryFile(suffix='.patch',delete=False) as fh:
        fh.write(raw)
        pp=Path(fh.name)
    try:
        subprocess.run(['patch','--batch',dst.name,'-i',str(pp)],cwd=GAME,check=True)
    finally:
        pp.unlink(missing_ok=True)

subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7214.py')],cwd=ROOT,check=True)
if sha(V7214)!=EXPECTED_7214:
    raise SystemExit(f'v7.2.14 SHA mismatch: {sha(V7214)}')

apply('v7214_to_v7215_match_day.patch.gz.b64',V7214,V7215)
if sha(V7215)!=EXPECTED_BASE_7215:
    raise SystemExit(f'v7.2.15 base SHA mismatch: {sha(V7215)}')

apply_inplace('v7215_preselection_context.patch.gz.b64',V7215)
if sha(V7215)!=EXPECTED_CONTEXT_7215:
    raise SystemExit(f'v7.2.15 context SHA mismatch: {sha(V7215)}')
apply_inplace('v7215_selection_copy_punctuation.patch.gz.b64',V7215)
if sha(V7215)!=EXPECTED_COPY_7215:
    raise SystemExit(f'v7.2.15 copy SHA mismatch: {sha(V7215)}')
apply_inplace('v7215_stable_weather_seed.patch.gz.b64',V7215)
if sha(V7215)!=EXPECTED_WEATHER_7215:
    raise SystemExit(f'v7.2.15 weather SHA mismatch: {sha(V7215)}')
apply_inplace('v7215_midseason_team_header.patch.gz.b64',V7215)
if sha(V7215)!=EXPECTED_7215:
    raise SystemExit(f'v7.2.15 SHA mismatch: {sha(V7215)}')

print(f'v7.2.14 OK  {EXPECTED_7214}')
print(f'v7.2.15 BASE OK  {EXPECTED_BASE_7215}')
print(f'v7.2.15 CONTEXT OK  {EXPECTED_CONTEXT_7215}')
print(f'v7.2.15 COPY OK  {EXPECTED_COPY_7215}')
print(f'v7.2.15 WEATHER OK  {EXPECTED_WEATHER_7215}')
print(f'v7.2.15 TEAM CONTEXT OK  {EXPECTED_TEAM_CONTEXT_7215}')
print(f'v7.2.15 OK  {EXPECTED_7215}')
