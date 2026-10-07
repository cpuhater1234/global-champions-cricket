#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_15_match_day_conditions.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_16_launcher_fast_path.html'
EXPECTED_SOURCE='b8eea1a14caee62fb4a09755729d9e077eb0994724e7d6a643fcfe1c5c8d3915'
EXPECTED_TARGET='53269fdcc452720a959b94ab83b4759c2e875b53407360365f86ba90aae035fa'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t):return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)
if not TARGET.exists():subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7216.py')],cwd=ROOT,check=True)
fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE:fail.append('v7.2.15 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET:fail.append(f'v7.2.16 target SHA mismatch: {sha(TARGET)}')
a=SOURCE.read_text('utf-8');b=TARGET.read_text('utf-8');sa=scripts(a);sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    for i in range(7):
        if sa[i]!=sb[i]:fail.append(f'Protected core script block {i} changed')
    if sa[7].replace('v7.2.15-match-day-conditions','v7.2.16-launcher-fast-path',1)!=sb[7]:
        fail.append('Presentation block changed beyond UI-version marker')
    old_storage="function safeStorageRemove(key){try{localStorage.removeItem(key);return true}catch(e){console.warn('GCC storage remove failed',e);return false}}\n  function storedSaveKey(){if(safeStorageGet(META_KEY))return SAVE_KEY;try{if(localStorage.getItem(SAVE_KEY))return SAVE_KEY;if(localStorage.getItem(LEGACY_SAVE_KEY))return LEGACY_SAVE_KEY}catch(e){console.warn('GCC save detection failed',e)}return null}"
    new_storage="function safeStorageRemove(key){try{localStorage.removeItem(key);return true}catch(e){console.warn('GCC storage remove failed',e);return false}}\n  function storageHasKey(key){try{for(let i=0;i<localStorage.length;i++)if(localStorage.key(i)===key)return true;return false}catch(e){console.warn('GCC storage key check failed',e);return false}}\n  function storedSaveKey(){if(safeStorageGet(META_KEY))return SAVE_KEY;if(storageHasKey(SAVE_KEY))return SAVE_KEY;if(storageHasKey(LEGACY_SAVE_KEY))return LEGACY_SAVE_KEY;return null}"
    expected=sa[8].replace(old_storage,new_storage,1)
    expected=expected.replace(
      "function detectLegacySaveAfterPaint(){const run=()=>{let legacy=false;try{legacy=!safeStorageGet(META_KEY)&&!localStorage.getItem(SAVE_KEY)&&!!localStorage.getItem(LEGACY_SAVE_KEY)}catch(e){}if(legacy)renderLauncher({legacyDetected:true})};",
      "function detectLegacySaveAfterPaint(){const run=()=>{const legacy=!safeStorageGet(META_KEY)&&!storageHasKey(SAVE_KEY)&&storageHasKey(LEGACY_SAVE_KEY);if(legacy)renderLauncher({legacyDetected:true})};",1)
    expected=expected.replace("renderLauncher({legacyDetected:!!safeStorageGet(LEGACY_SAVE_KEY)})","renderLauncher({legacyDetected:storageHasKey(LEGACY_SAVE_KEY)})",1)
    expected=expected.replace(
      "function startFreshWorld(args=[]){const r=base.newWorld(...args);state.dynasty=freshDynasty();initDynastyData();saveFoundation('clubs');return r}",
      "function startFreshWorld(args=[]){const e=launcherEls();if(e.launcher)e.launcher.hidden=true;if(e.hero)e.hero.hidden=true;const r=base.newWorld(...args);state.dynasty=freshDynasty();initDynastyData();saveFoundation('clubs');return r}",1)
    expected=expected.replace(
      "function requestNewDynasty(){if(careerInMemory())return openExistingSaveGuard();if(storedSaveExists())return openExistingSaveGuard();return showFoundationIntro()}",
      "function requestNewDynasty(){if(careerInMemory())return openExistingSaveGuard();if(storedSaveExists())return openExistingSaveGuard();return startFreshWorld()}",1)
    expected=expected.replace(
      "safeStorageRemove(META_KEY);base.closeModal();showFoundationIntro()}",
      "safeStorageRemove(META_KEY);base.closeModal();return startFreshWorld()}",1)
    if expected!=sb[8]:fail.append('Dynasty block changed beyond launcher fast-path and key-only save detection')
for marker in [
  "function storageHasKey(key)",
  "return startFreshWorld()}",
  "renderLauncher({legacyDetected:storageHasKey(LEGACY_SAVE_KEY)})",
  "if(e.hero)e.hero.hidden=true;const r=base.newWorld",
  "document.body.dataset.uiVersion = 'v7.2.16-launcher-fast-path';"
]:
    if marker not in b:fail.append('Missing launcher fast-path marker: '+marker)
for forbidden in [
  "if(localStorage.getItem(SAVE_KEY))return SAVE_KEY",
  "if(localStorage.getItem(LEGACY_SAVE_KEY))return LEGACY_SAVE_KEY",
  "return showFoundationIntro()}\n  function confirmFreshCareer"
]:
    if forbidden in b:fail.append('Slow/old launcher path remains: '+forbidden)
node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js';p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode:fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')
if fail:
    print('v7.2.16 Launcher Fast Path guardrail FAILED');[print('- '+x) for x in fail];raise SystemExit(1)
print('v7.2.16 Launcher Fast Path guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Core simulation/data blocks unchanged: yes')
print('Normal New Dynasty skips the heavy story/home scene: yes')
print('Legacy save existence checks avoid reading full save blobs: yes')
