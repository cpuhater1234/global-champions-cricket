"""Source-owned career integration into the transitional frozen engine adapter."""
def adapt(name, script):
    if name == 'cpu':
        start=script.index('  function fallbackProjection(')
        end=script.index('  function groundFit(',start)
        script=script[:start]+"""  function projection(player,year=window.GCC?.state?.year||2008){const S=window.GCC8_SCOUTING,v=S.publicView(player,year),future=S.value(v);return {dynasty:future,draftDynasty:future,arrivalYears:Math.max(0,(window.GCC8_PROFILES.lookup(player.name)?.expectedPeakYear||year)-year),peak:Math.max(player.overall,future),confidence:v.confidence==='MEDIUM'?.72:.5,longevity:clamp((38-v.age)/12,0,1),ageCurve:'estimated-career'};}
  function scoutProjection(player,year){return projection(player,year);}
  function projectedValue(player,year=2008){return window.GCC8_SCOUTING.value(window.GCC8_SCOUTING.publicView(player,year));}

"""+script[end:]
        script=script.replace('Hidden dynasty truth is deliberately stronger than 2008 user-facing scouting.','Expected upside is shared with user scouting; realised futures remain private.').replace('hidden career value is a first-class draft input','estimated career value is a first-class draft input')
    if name == 'foundation':
        script = script.replace('    state.recruit.universeSize=state.pool.length;', '    window.GCC8_SEED_FOUNDATION();\n    state.recruit.universeSize=state.pool.length;')
    if name == 'dynasty':
        trade='state.teams[club]=rosterIds(club).filter(id=>id!==target.id).concat(offer.id);'
        assert script.count(trade)==1
        script=script.replace(trade,trade+'target.draftedBy=state.userClub.abbr;offer.draftedBy=club;')
        script=script.replace("log('CONTRACT',", "log('RELEASE',").replace('Contract not renewed · one Draft selection opened.', 'Player released · one draft place opened.')
        script = script.replace('function applyCareerYear(p,year){window.GCC8_JOB_MODEL.prepare', 'function applyExpectedCareerYear(p,year){window.GCC8_JOB_MODEL.prepare', 1)
        old = 'function initDynastyData(){ensureDynasty();addCareerMetaExisting();seedArrivalUniverse();for(const p of state.pool)if(activePlayer(p,state.year))applyCareerYear(p,state.year)}'
        assert old in script
        script = script.replace(old, "function applyCareerYear(p,year){if(p.careerOutcome)return window.GCC8_CAREER_STATE.applyYear(p,year);return applyExpectedCareerYear(p,year)}\n  function initDynastyData(mode='loaded'){ensureDynasty();addCareerMetaExisting();if(mode==='new')seedArrivalUniverse();window.GCC8_CAREER_STATE.initialise(state,mode,applyExpectedCareerYear);for(const p of state.pool)if(activePlayer(p,state.year))applyCareerYear(p,state.year)}")
        script = script.replace("  function existingNames()", "  function existingNames()")
        marker='  const existingNames='
        assert marker in script
        script=script.replace(marker,"  window.GCC8_SEED_FOUNDATION=()=>{let next=Math.max(0,...state.pool.map(p=>p.id))+1;for(const profile of window.GCC8_PROFILES.all()){const m=profile.addition;if(m&&m.debutYear<=2008&&!state.pool.some(p=>p.name===m.name)){const p=template(m,next++);p.available=null;state.pool.push(p);}}};\n"+marker)
        script = script.replace('state.dynasty=freshDynasty();initDynastyData();', "state.dynasty=freshDynasty();initDynastyData('new');")
        script = script.replace('for(const m of arrivalMeta){', 'for(const m of [...arrivalMeta,...window.GCC8_PROFILES.all().filter(p=>p.addition).map(p=>p.addition)]){', 1)
        script = script.replace('const p=template(m,next++);p.available=false;', 'const p=template(m,next++);p.available=m.debutYear<=2008;', 1)
        script = script.replace("if(state.userClub){addCareerMetaExisting();saveFoundation('recruit');}", "if(state.userClub){initDynastyData('new');saveFoundation('recruit');}")
        script=script.replace('window.GCC8_CAREERS.value(p,state.year)', 'window.GCC_AI.projectedValue(p,state.year)')
        start=script.index('  function developmentRead(');end=script.index('\n',start)
        script=script[:start]+"  function developmentRead(p){return window.GCC8_SCOUTING.outlook(window.GCC8_SCOUTING.publicView(p,state.year)).label;}"+script[end:]
        script=script.replace('initDynastyData();state.year++;', 'initDynastyData();const careerBefore=window.GCC8_DEVELOPMENT.captureBefore(state.pool,state.year,state.teams);state.year++;')
        script=script.replace('const arrivals=arrivalsForYear(state.year);d.injuries={};', "const arrivals=arrivalsForYear(state.year);d.developmentByYear??={};if(!d.developmentByYear[state.year])d.developmentByYear[state.year]=window.GCC8_DEVELOPMENT.rows(careerBefore,state.pool,state.year);d.injuries={};")
        script=script.replace('restoreObject(state,JSON.parse(previous));currentScreen=', "restoreObject(state,JSON.parse(previous));if(state.dynasty?.careerStore)window.GCC8_CAREER_STATE.initialise(state,'loaded',applyExpectedCareerYear);currentScreen=")
    return script
