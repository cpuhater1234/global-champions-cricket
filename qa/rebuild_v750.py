#!/usr/bin/env python3
from pathlib import Path
import base64,gzip,hashlib,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
PATCHES=ROOT/'qa'/'patches'
V741=GAME/'global_champions_cricket_v7_4_1_form_symmetry.html'
V750=GAME/'global_champions_cricket_v7_5_0_dynasty_memory.html'
EXPECTED_741='34f3095daeceb732629e443499aa905a553d79aa3045c9d41d2d5e80b2b29643'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def payload(name):
    p=PATCHES/name
    if not p.exists(): raise SystemExit(f'Missing v7.5 payload: {name}')
    return gzip.decompress(base64.b64decode(p.read_text().strip())).decode('utf-8')

def replace_once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'{label} anchor count {n}')
    return text.replace(old,new,1)

if not V741.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v741.py')],cwd=ROOT,check=True)
if sha(V741)!=EXPECTED_741:
    raise SystemExit(f'v7.4.1 SHA mismatch: {sha(V741)}')

t=V741.read_text('utf-8')

css=payload('v750_archive_css.gz.b64')
style_end=t.index('</style>')
t=t[:style_end]+css+'\n'+t[style_end:]

helpers=payload('v750_archive_helpers.gz.b64')
render=payload('v750_archive_render.gz.b64')
start=t.index('  function renderArchive(){')
end=t.index('  function managerScore(){',start)
t=t[:start]+helpers+render+t[end:]

start=t.index('  function finishCareer(){')
end=t.index('  function serialisable(){',start)
old_finish=t[start:end]
needle="pw=Object.values(d.playerCareer).sort((a,b)=>b.wickets-a.wickets)[0]"
legacy_data=",records=archiveRecords(),honours=archiveClubHonours(),legends=archiveUserLegends(),topClub=honours[0]||null,topLegend=legends[0]||null"
if old_finish.count(needle)!=1: raise SystemExit('finishCareer data anchor mismatch')
new_finish=old_finish.replace(needle,needle+legacy_data,1)
legacy_anchor='<div class="legacy-grid">'
legacy_world=payload('v750_legacy_world.gz.b64')
if new_finish.count(legacy_anchor)!=1: raise SystemExit('legacy grid anchor mismatch')
new_finish=new_finish.replace(legacy_anchor,legacy_world+legacy_anchor,1)
t=t[:start]+new_finish+t[end:]

t=replace_once(t,'Every season, title, player career and move becomes part of the world you are building.','Every season, title and player record becomes part of the world you are building.','Archive intro copy')
t=replace_once(t,'    openSeasonReview,\n    renderTeam,','    openSeasonReview,\n    reviewSeasonValue,\n    renderTeam,','GCC review value export')
t=replace_once(t,'openArchive,backFromArchive,finishCareer','openArchive,openArchiveSeason,backFromArchive,finishCareer','Dynasty export')
t=replace_once(t,"document.body.dataset.uiVersion = 'v7.4.1-form-symmetry';","document.body.dataset.uiVersion = 'v7.5.0-dynasty-memory';",'UI version')

V750.write_text(t,'utf-8')
print(f'v7.4.1 OK  {EXPECTED_741}')
print(f'v7.5.0 built {sha(V750)}')
