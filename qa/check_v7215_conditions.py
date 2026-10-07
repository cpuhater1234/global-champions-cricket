#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,shutil,subprocess,sys,tempfile

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'game'/'global_champions_cricket_v7_2_14_year_shell_continuity.html'
TARGET=ROOT/'game'/'global_champions_cricket_v7_2_15_match_day_conditions.html'
EXPECTED_SOURCE='70810a1d6771c283f9f143d7707a0df90fd5594dfe321677f6f7fe51e6f48e8d'
EXPECTED_TARGET='b8eea1a14caee62fb4a09755729d9e077eb0994724e7d6a643fcfe1c5c8d3915'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def scripts(t): return re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',t,re.S|re.I)

if not TARGET.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v7215.py')],cwd=ROOT,check=True)

fail=[]
if sha(SOURCE)!=EXPECTED_SOURCE: fail.append('v7.2.14 source SHA mismatch')
if sha(TARGET)!=EXPECTED_TARGET: fail.append(f'v7.2.15 target SHA mismatch: {sha(TARGET)}')

a=SOURCE.read_text('utf-8'); b=TARGET.read_text('utf-8')
sa=scripts(a); sb=scripts(b)
if len(sa)!=9 or len(sb)!=9:
    fail.append(f'Expected 9 script blocks, got {len(sa)} and {len(sb)}')
else:
    changed=[i for i,(x,y) in enumerate(zip(sa,sb)) if x!=y]
    if changed!=[5,7,8]: fail.append(f'Unexpected changed script blocks: {changed}')
    for i in [0,1,2,3,4,6]:
        if sa[i]!=sb[i]: fail.append(f'Protected script block {i} changed')
    expected7=sa[7].replace('v7.2.14-year-shell-continuity','v7.2.15-match-day-conditions',1)
    if expected7!=sb[7]: fail.append('Presentation block changed beyond UI-version marker')

    old_nv="function nextVenueFor(c){const fixtures=state.fullSchedule?.[state.round]||[];const fx=fixtures.find(f=>f.home?.abbr===c.abbr||f.away?.abbr===c.abbr);return fx?.home||c}"
    new_nv="function nextVenueFor(c){const fixtures=state.fullSchedule?.[state.round]||[];const fx=fixtures.find(f=>f.home?.abbr===c.abbr||f.away?.abbr===c.abbr);return fx?(G.matchGroundForFixture?G.matchGroundForFixture(fx):fx.home):c}"
    old_ss="if(!state.userClub)return base.toast('Choose your club first');if(state.xi.length!==11)"
    new_ss="if(!state.userClub)return base.toast('Choose your club first');if(state.fullSchedule?.length){specialGo('season');return}if(state.xi.length!==11)"
    old_mig="function migrateLoadedSave(save){if(!save.state.dynasty)save.state.dynasty=freshDynasty();save.state.dynasty.version=SAVE_VERSION;return save}"
    new_mig="function migrateLoadedSave(save){if(!save.state.dynasty)save.state.dynasty=freshDynasty();if(!Number.isFinite(save.state.weatherSeed))save.state.weatherSeed=(Number(save.state.seed)>>>0)||1;save.state.dynasty.version=SAVE_VERSION;return save}"
    expected8=sa[8].replace(old_nv,new_nv,1).replace(old_ss,new_ss,1).replace(old_mig,new_mig,1)
    if expected8!=sb[8]: fail.append('Dynasty block changed beyond CPU next-venue weather parity + active-season Team Room guard + weather-seed migration')

required=[
"const WEATHER_TYPES = Object.freeze({",
"OVERCAST:Object.freeze({code:'OVERCAST',label:'Overcast',newBallPace:1.10,middleSpin:0,boundary:0",
"COOL_DAMP:Object.freeze({code:'COOL_DAMP',label:'Cool & damp',newBallPace:.85,middleSpin:0,boundary:-.55",
"HOT_DRY:Object.freeze({code:'HOT_DRY',label:'Hot & dry',newBallPace:0,middleSpin:.80,boundary:.35",
"if(home.ground==='Docklands Stadium') return [['SETTLED',1]];",
"weatherSeed: 1,",
"state.weatherSeed = state.seed;",
"const stableSeed=Number.isFinite(state.weatherSeed)?state.weatherSeed:((Number(state.seed)>>>0)||1);",
"const roll=detailRng(`${stableSeed}|weather|${year}|${round}|${home.abbr}`)();",
"if(!Number.isFinite(save.state.weatherSeed))save.state.weatherSeed=(Number(save.state.seed)>>>0)||1;",
"if(teamHeading) teamHeading.textContent=`Set your Round ${nextRound} XI`;",
"if(teamIntro) teamIntro.textContent=`Review the eleven for Round ${nextRound}. Adjust for form, fitness and conditions, then return to the Season Hub.`;",
"baseConditions:base,",
"pace:(base.pace||0)+weather.newBallPace",
"spin:(base.spin||0)+weather.middleSpin",
"boundary:(base.boundary||0)+weather.boundary",
"const weatherCondition=style==='SPIN'?(phase==='middle'?(weather.middleSpin||0):0):(phase==='newBall'?(weather.newBallPace||0):0);",
"const firstInnings = innings(firstClub, secondClub, matchGround,{weather:matchGround.weather});",
"weather:pair.weather",
"const nextFx=nextUserFixture();",
"const fixtureRead=nextFx&&nextOpp?`${nextHome?'Home':'Away'} · ${nextOpp.name} · ${nextGround.ground} · ${nextGround.trait} · ${nextGround.weather.label}. ${nextGround.weather.read}`:'';",
"copy.textContent=fixtureRead?`${fixtureRead} ${actionCopy}`:actionCopy;",
"selectionKicker.textContent=`ROUND ${nextRound} SELECTION`;",
"quickStart.textContent=state.fullSchedule?.length?'RETURN TO SEASON':'START SEASON'",
"if (state.fullSchedule?.length) { renderSeason(); go('season'); return; }",
"const weather=res?.weather||(next?matchWeather(f.home,f.round,state.year||2008):null);",
"const weatherRead=weather?` · ${weather.label}`:'';",
"${f.home.ground} · ${f.home.trait}${weatherRead}",
"f.semis=[simulateKnockout(top[0],top[3],15),simulateKnockout(top[1],top[2],15)];",
"f.gf=simulateKnockout(f.gfPair.home,f.gfPair.away,16);",
"function simulateKnockout(home, away, weatherRound=15)",
"const semiConditions=`${semiHost.ground} · ${semiWeather.label}`;",
"const gfConditions=`${f.gfPair.home.ground} · ${gfWeather.label}`;",
"${nextFx.home.ground} · ${nextFx.home.trait} · ${matchWeather(nextFx.home,nextFx.round,state.year||2008).label}",
"ROUND ${res.round} · ${res.home.ground} · ${(res.weather||matchWeather(res.home,res.round,state.year||2008)).label}",
"scorecard-meta\">${res.home.ground} · ${(res.weather||matchWeather(res.home,res.round||15,state.year||2008)).label}",
"nextUserFixture,",
"matchWeather,",
"matchGroundForFixture,",
"document.body.dataset.uiVersion = 'v7.2.15-match-day-conditions';"
]
for marker in required:
    if marker not in b: fail.append('Missing match-day marker: '+marker)

for forbidden in [
    'humidityBonus','humidity bonus','DLS','Duckworth','abandoned due to rain','rain-shortened','weatherReroll',
    'detailRng(`${state.seed}|weather|'
]:
    script_text='\n'.join(sb).lower() if sb else ''
    if forbidden.lower() in script_text: fail.append('Unapproved weather mechanic present: '+forbidden)

# Weather must not rewrite the permanent club-ground database.
if len(sa)==9 and len(sb)==9 and sa[0]!=sb[0]:
    fail.append('Player/club database block changed')

node=shutil.which('node')
if node and len(sb)==9:
    with tempfile.TemporaryDirectory() as td:
        for i,s in enumerate(sb):
            p=Path(td)/f's{i}.js'; p.write_text(s,'utf-8')
            r=subprocess.run([node,'--check',str(p)],capture_output=True,text=True)
            if r.returncode: fail.append(f'JavaScript syntax failure in block {i}: {r.stderr.strip()}')

if fail:
    print('v7.2.15 Match-Day Conditions guardrail FAILED')
    [print('- '+x) for x in fail]
    raise SystemExit(1)

print('v7.2.15 Match-Day Conditions guardrail OK')
print('Source SHA-256',EXPECTED_SOURCE)
print('Target SHA-256',EXPECTED_TARGET)
print('Changed script blocks: 5, 7, 8 only')
print('Player/club database unchanged: yes')
print('CPU next-venue context uses the same effective match ground: yes')
print('Active season cannot be reset from Team Room: yes')
print('Weather identity is independent of live match RNG: yes')
print('Legacy saves receive a persistent weather seed on migration: yes')
print('Mid-season Team Room heading follows the actual next round: yes')
print('No DLS / abandonment / humidity shortcut introduced: yes')
