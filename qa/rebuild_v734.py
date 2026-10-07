#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V733=GAME/'global_champions_cricket_v7_3_3_visual_identity.html'
V734=GAME/'global_champions_cricket_v7_3_4_golden_dynasty.html'
EXPECTED_733='88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650'
EXPECTED_734='3b29b1f3b90ddb4e4728487ef280df0bcee9345c571c3979904b8a8b98b9f19e'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not V733.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v733.py')],cwd=ROOT,check=True)
if sha(V733)!=EXPECTED_733:
    raise SystemExit(f'v7.3.3 SHA mismatch: {sha(V733)}')

t=V733.read_text('utf-8')
repls=[
("document.body.dataset.uiVersion = 'v7.3.3-visual-identity';","document.body.dataset.uiVersion = 'v7.3.4-golden-dynasty';"),
("function renderLauncher({legacyDetected=false}={}){const e=launcherEls();if(!e.launcher)return;const meta=readSaveMeta(),hasNew=!!safeStorageGet(META_KEY),hasLegacy=legacyDetected;e.launcher.hidden=false;if(e.hero)e.hero.hidden=true;const has=hasNew||hasLegacy;if(e.cont)e.cont.hidden=!has;if(e.career)e.career.hidden=!has;if(has){const clubName=meta?.club?.name||'Dynasty save found';if(e.club)e.club.textContent=clubName;if(e.detail)e.detail.textContent=launcherDetail(meta);if(e.cont)e.cont.textContent=meta?.club?.name?\`CONTINUE \${meta.club.name.toUpperCase()}\`:'CONTINUE DYNASTY';if(e.title)e.title.textContent='Back to the club.';if(e.summary)e.summary.textContent='Continue your saved dynasty, or start a different 2008 world.';}else{if(e.title)e.title.textContent='Your cricket world.';if(e.summary)e.summary.textContent='Take charge of one club from the foundation season through 2026.';if(e.status)e.status.textContent='';}}",
"function renderLauncher({legacyDetected=false}={}){const e=launcherEls();if(!e.launcher)return;const meta=readSaveMeta(),hasNew=!!safeStorageGet(META_KEY),hasLegacy=legacyDetected,stamp=$('seasonStamp'),nav=$('nav');e.launcher.hidden=false;if(e.hero)e.hero.hidden=true;const has=hasNew||hasLegacy;if(e.cont)e.cont.hidden=!has;if(e.career)e.career.hidden=!has;if(has){if(stamp)stamp.textContent=String(meta?.year||2008);if(nav)nav.hidden=true;const clubName=meta?.club?.name||'Dynasty save found';if(e.club)e.club.textContent=clubName;if(e.detail)e.detail.textContent=launcherDetail(meta);if(e.cont)e.cont.textContent=meta?.club?.name?\`CONTINUE \${meta.club.name.toUpperCase()}\`:'CONTINUE DYNASTY';if(e.title)e.title.textContent='Back to the club.';if(e.summary)e.summary.textContent='Continue your saved dynasty, or start a different 2008 world.';}else{if(stamp)stamp.textContent='2008';if(nav)nav.hidden=false;if(e.title)e.title.textContent='Your cricket world.';if(e.summary)e.summary.textContent='Take charge of one club from the foundation season through 2026.';if(e.status)e.status.textContent='';}}"),
("function showFoundationIntro(){const e=launcherEls();if(e.launcher)e.launcher.hidden=true;if(e.hero)e.hero.hidden=false;updateYearCopy();decorateSoon();window.scrollTo({top:0,behavior:'auto'})}",
"function showFoundationIntro(){const e=launcherEls(),nav=$('nav'),stamp=$('seasonStamp');if(e.launcher)e.launcher.hidden=true;if(e.hero)e.hero.hidden=false;if(nav)nav.hidden=false;if(stamp)stamp.textContent='2008';updateYearCopy();decorateSoon();window.scrollTo({top:0,behavior:'auto'})}"),
("function startFreshWorld(args=[]){const e=launcherEls();if(e.launcher)e.launcher.hidden=true;if(e.hero)e.hero.hidden=true;const r=base.newWorld(...args);state.dynasty=freshDynasty();initDynastyData();saveFoundation('clubs');return r}",
"function startFreshWorld(args=[]){const e=launcherEls(),nav=$('nav'),stamp=$('seasonStamp');if(e.launcher)e.launcher.hidden=true;if(e.hero)e.hero.hidden=true;if(nav)nav.hidden=false;if(stamp)stamp.textContent='2008';const r=base.newWorld(...args);state.dynasty=freshDynasty();initDynastyData();saveFoundation('clubs');return r}"),
("function resumeSave(){const status=$('launcherStatus');if(status)status.textContent='Opening dynasty…';try{const stored=rawStoredSave();",
"function resumeSave(){const status=$('launcherStatus'),nav=$('nav');if(status)status.textContent='Opening dynasty…';try{const stored=rawStoredSave();"),
("restoreObject(state,save.state);initDynastyData();stopFoundationWatch();",
"restoreObject(state,save.state);if(nav)nav.hidden=false;initDynastyData();stopFoundationWatch();"),
]
for old,new in repls:
    count=t.count(old)
    if count!=1: raise SystemExit(f'v7.3.4 replacement count {count} for {old[:90]!r}')
    t=t.replace(old,new,1)

V734.write_text(t,'utf-8')
if sha(V734)!=EXPECTED_734:
    raise SystemExit(f'v7.3.4 SHA mismatch: {sha(V734)}')

print(f'v7.3.3 OK  {EXPECTED_733}')
print(f'v7.3.4 OK  {EXPECTED_734}')
