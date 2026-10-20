"""Build the fresh UI with a frozen, DOM-backed cricket engine adapter."""
from pathlib import Path
import re,hashlib,json,argparse,base64
from domain.career_adapter import adapt as adapt_careers
from domain.storage_adapter import adapt as adapt_storage
from domain.delivery_adapter import adapt as adapt_deliveries
ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent/'game/global_champions_cricket_v7_9_3_layout_rebuild.html'
EXPECTED='eddec7bc6d92eb494bef26384e0618ea63d5244c63c8a1c9d84b1f5e16e98926'
def freeze():
 (ROOT/'engine').mkdir(parents=True,exist_ok=True)
 b=BASE.read_bytes();assert hashlib.sha256(b).hexdigest()==EXPECTED
 text=b.decode();scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',text,re.S);assert len(scripts)==10
 names=['players','league','ratings','projections','cpu','foundation','home-motion','events','dynasty','identity']
 for name,script in zip(names,scripts):
  script=script.replace('window.scrollTo','window.GCC8_ENGINE_SCROLL')
  if name=='players':
   script+="\nwindow.GCC_PLAYERS_2008.forEach(window.GCC8_applyIdentity);"
  if name=='ratings':
   script=script.replace('  const battingEligible', "  const isKeeper=p=>!!p&&(p.role==='WK-BAT'||Number(p.keeping||0)>=65);\n  const battingEligible")
   script=script.replace('return {powerplayBat:', 'return {keeperPresent:xi.some(isKeeper),powerplayBat:',1).replace('function emptyProfile(){return {powerplayBat:', 'function emptyProfile(){return {keeperPresent:false,powerplayBat:')
   script=script.replace('return {profile,', 'return {isKeeper,profile,')
   script=script.replace('  function explanation(key,p){', "  function explanation(key,p){if(key==='keeping'&&p.keeping<65&&p.keeperPresent)return 'A recognised keeper is selected, but current glove work is a weakness.';")
   for key,phase,old_score in [('Pp','powerplay',"weightedTop(topSix,p=>batPhaseScore(p,'powerplay'),[1,1,.9,.8,.7,.6])"),('Middle','middle',"weightedTop(topSix,p=>batPhaseScore(p,'middle'),[1,1,.9,.8,.7,.6])"),('Finish','death',"weightedTop(batting,p=>batPhaseScore(p,'death'),[1,1,.75,.55])")]:
    assert old_score in script
    script=script.replace(old_score,"window.GCC8_PHASE_EXPOSURE.battingScore(xi,'"+phase+"',window.GCC_RATINGS)")
   old='if (!p || (p.maxOvers||0)<=0) return null;'
   assert old in script
   script=script.replace(old,old+'\n    const job=window.GCC8_PLAYER_JOBS[p.name];if(job)return job.style;')
  if name=='cpu':
   script=script.replace('function projectedValue(player, year=2008){ const p=projection(player); return p.draftDynasty ?? p.dynasty; }', 'function projectedValue(player, year=2008){ if(player.dynastyCareer)return window.GCC8_CAREERS.value(player,year);const p=projection(player);return p.draftDynasty??p.dynasty; }')
  if name=='foundation':
   # Future debutants are deliberately unavailable, not declined invitations.
   old='const declined = state.pool.filter(p => p.available === false);'
   assert script.count(old)==1
   script=script.replace(old,'const declined = state.pool.filter(p => p.available === false && (p.dynastyCareer?.debutYear ?? 2008) <= 2008);')
   old='${state.pool.length - signed.length} declined.'
   assert script.count(old)==1
   script=script.replace(old,'${declined.length} declined.')
   old='if(!state.orderTouched){\n      order=autoOrderIds'
   assert script.count(old)==1
   script=script.replace(old,'if(!state.orderTouched&&(missing.length||order.length!==(state.battingOrder||[]).length||new Set(order).size!==order.length)){\n      order=autoOrderIds')
   guard_old="const available = state.pool.filter(p => p.available && !p.draftedBy);\n    const roster = (state.teams[t.abbr] || []).map(id => byId(id));"
   guard_new="const roster = (state.teams[t.abbr] || []).map(id => byId(id));\n    const available = window.GCC8_DRAFT_GUARD.candidates(roster,state.pool.filter(p => p.available && !p.draftedBy),15-roster.length,R);"
   assert guard_old in script
   script=script.replace(guard_old,guard_new)
   script=script.replace('p.keeping >= 65 && score > bestKeeperScore','xi.some(R.isKeeper) && score > bestKeeperScore').replace('p.keeping >= 65 && p.oversCapacity >= 20','xi.some(R.isKeeper) && p.oversCapacity >= 20')
   script=script.replace('const draftSpeeds = [520, 260, 90];','const draftSpeeds = [520, 260, 130];')
   marker='  function resolveChase('
   assert marker in script
   script=script.replace(marker,(ROOT/'domain/chase_finish.js').read_text()+'\n'+marker)
   old='let phaseDiff = target - (pp + mid + death);'
   assert old in script
   script=script.replace(old,'const finalScore=winningChaseTotal(target,chasePotential.total,state.seed);\n    let phaseDiff = finalScore - (pp + mid + death);')
   start=script.index('    let phaseDiff = finalScore - (pp + mid + death);')
   end=script.index('    pp=phaseRuns.pp; mid=phaseRuns.mid; death=phaseRuns.death;',start)
   script=script[:start]+'    const phaseRuns=reconcileChasePhases({pp,mid,death},balls,finalScore,target);\n'+script[end:]
   old='total:target, wickets:scaledWickets'
   assert old in script
   script=script.replace(old,'total:finalScore, wickets:scaledWickets')
   # V8 domain additions run inside the foundation closure, beside the real RNG/XIs.
   addition=(ROOT/'domain/super_over.js').read_text()
   marker='  function simulateInningsPair('
   assert marker in script
   script=script.replace(marker,addition+'\n'+marker)
   old='else { tieBreak = true; winner = rng() > .5 ? home : away; }'
   assert old in script
   script=script.replace('    let tieBreak = false;','    let tieBreak = false, superOver = null;')
   script=script.replace(old,'else { tieBreak = true; superOver = simulateSuperOver(secondClub, firstClub, matchGround); winner = superOver.winner; }')
   script=script.replace('return { hi, ai, winner, tieBreak, firstClub','return { hi, ai, winner, tieBreak, superOver, firstClub')
   script=script.replace('tieBreak:pair.tieBreak,','tieBreak:pair.tieBreak, superOver:pair.superOver,')
   script=script.replace("if(tieBreak) return 'after a tied match';","if(tieBreak) return pair?.superOver ? `in a Super Over${pair.superOver.rounds.length>1?' (tie-break '+pair.superOver.rounds.length+')':''}` : 'after a tied match';")
   marker='  return {\n    state,'
   assert marker in script
   script=script.replace(marker,"  window.GCC8_FOUNDATION_READ={roleTags:playerRoleTags,playerNote,groundStory,groundBand,projectedDraftProfile,draftSnapshot,effectiveProfile,simulateSuperOver,winningChaseTotal,reconcileChasePhases,teamAverages:userTeamAverages,leagueAverages:leagueInningsAverages,standout:matchStandout,pauseDraft:()=>{clearTimeout(draftAutoTimer);draftAutoTimer=null}};\n"+marker)
   # JSON restores duplicate object references. Resolve signing decisions against
   # the canonical pool so a resumed final day can actually close its window.
   old='const { player, joins } = event;'
   assert script.count(old)==1
   script=script.replace(old,"const player = byId(event.player.id), joins = event.joins;\n    if (!player) throw new Error('Signing decision refers to an unavailable player.');")
  if name=='dynasty':
   marker='  function beginOffseason('
   assert marker in script
   script=script.replace(marker,(ROOT/'domain/cpu_releases.js').read_text()+'\n'+marker)
   guard_old="function cpuDraftPick(abbr){const pool=freeAgentPool();"
   guard_new="function cpuDraftPick(abbr){const o=state.dynasty.offseason,remaining=o?.phase==='draft'?slotsWithSupplement().slice(o.pickCursor).filter(slot=>slot.owner===abbr).length:Math.max(0,15-rosterIds(abbr).length);const pool=window.GCC8_DRAFT_GUARD.candidates(roster(abbr),freeAgentPool(),remaining,R);"
   assert guard_old in script
   script=script.replace(guard_old,guard_new)
   assert '}ensureCpuRosterShape(abbr)}' in script
   script=script.replace('}ensureCpuRosterShape(abbr)}','}}')
   script=script.replace('function addCareerMetaExisting(){for(const p of state.pool){', 'function addCareerMetaExisting(){for(const p of state.pool){window.GCC8_applyIdentity(p);')
   script=script.replace("load=state.xi?.includes(p.id)?1:0","load=state.xi?.includes(p.id)||Object.values(state.cpuXIs||{}).some(ids=>ids.includes(p.id))?1:0")
   script=script.replace('function isKeeper(p){return (p.keeping||0)>=65||p.role===\'WK-BAT\'}','function isKeeper(p){return R.isKeeper(p)}')
   script=script.replace('`${state.seed}|scout-upside|${state.year}|${p.id}`','`${p.birthYear}|scout-upside|${state.year}|${p.id}`')
   script,n=re.subn(r'^  function runCpuMarket\([^\n]*\n',lambda m:(ROOT/'domain/cpu_market.js').read_text(),script,flags=re.M);assert n==1
   # Rolling club agreements: retain by default; every permanent player can be reviewed.
   script=script.replace("log('OFF-SEASON',`${state.year} off-season opens`", "cpuReleaseDecisions();d.offseason.returningIds=rosterIds(state.userClub.abbr).slice();log('OFF-SEASON',`${state.year} off-season opens`")
   script,n=re.subn(r'^  function contractCycle\(p\).*?\n','',script,flags=re.M);assert n==1
   script,n=re.subn(r'^  function contractDue\(p\).*?\n',"  function contractDue(p){return !!p&&!p.dynastyRetired&&!p.dynastyReplacement;}\n",script,flags=re.M);assert n==1
   script=script.replace('function applyCareerYear(p,year){const m=', 'function applyCareerYear(p,year){window.GCC8_JOB_MODEL.prepare(p,year);const m=')
   script=script.replace("if(state.userClub)saveFoundation('recruit');","if(state.userClub){addCareerMetaExisting();saveFoundation('recruit');}")
   old='if(p.dynastyBase2008){const ageNow='
   assert old in script
   start=script.index(old);end=script.index('\n  function initDynastyData',start)
   script=script[:start]+'if(p.dynastyBase2008){window.GCC8_CAREERS.applyFoundation(p,year,attributeKeys);window.GCC8_JOB_MODEL.finish(p,year);}}'+script[end:]
   old='return Math.round((p.overall||65)*.9+prime+form+runway+injuryPenalty+ground+(forClub?roleNeed(forClub,p):0))'
   assert old in script
   script=script.replace(old,'return Math.round((p.overall||65)*.55+window.GCC8_CAREERS.value(p,state.year)*.35+prime+form+runway*.35+injuryPenalty+ground+(forClub?roleNeed(forClub,p):0))')
   old='tradeValue(p,abbr)+roleNeed(abbr,p)*1.2+prand'
   assert old in script
   script=script.replace(old,'window.GCC_AI.evaluateDraft(clubByAbbr(abbr),p,{year:state.year,roster:roster(abbr),available:pool,pickIndex:state.dynasty.offseason?.pickCursor||0}).score+roleNeed(abbr,p)*.45+prand')
   old='function replacementPoolFor(injured){const pool=freeAgentPool();'
   assert old in script
   script=script.replace(old,'function replacementPoolFor(injured){const pool=freeAgentPool().filter(healthyForSelection);')
   script=script.replace('function replacementPoolFor(injured){const pool=', 'function replacementPoolFor(injured){if(!injured)return [];injured=pById(coverRoot(injured.id));if(!injured)return [];const pool=')
   script,n=re.subn(r'^  function (?:cpuReplacement|signReplacement|resolveReplacementReturn)\([^\n]*\n','',script,flags=re.M)
   assert n==3
   marker='  function openReplacementMarket('
   assert marker in script
   script=script.replace(marker,(ROOT/'domain/injury_cover.js').read_text()+'\n'+marker)
   script,n=re.subn(r'^  function runCpuDraftUntilUser\([^\n]*\n','',script,flags=re.M)
   assert n==1
   marker='  function userAnnualDraft('
   assert marker in script
   script=script.replace(marker,(ROOT/'domain/annual_draft_pace.js').read_text()+'\n'+marker)
   script=script.replace('runCpuDraftUntilUser();renderOffseason();autoSave()', 'runCpuDraftUntilUser(false);renderOffseason();autoSave()')
   script=script.replace('function resumeSave(){const previous', 'function resumeSave(){clearTimeout(annualDraftTimer);annualDraftTimer=null;const previous')
   # Forced departures beyond four are filled after the ordinary snake rounds.
   old='maxRounds=Math.max(0,...Object.values(needs));'
   assert old in script
   script=script.replace(old,'maxRounds=Math.min(4,Math.max(0,...Object.values(needs)));')
   start=script.index('  function draftSlots(){');end=script.index('\n\n  function freeAgentPool',start)
   script=script[:start]+script[end:]
   start=script.index('  function slotsWithSupplement(){');end=script.index('\n\n  function draftOwner',start)
   script=script[:start]+script[end:]
   script,n=re.subn(r'^  function userOwnsPick\([^\n]*\n','',script,flags=re.M);assert n==1
   marker='  function freeAgentPool('
   script=script.replace(marker,(ROOT/'domain/draft_slots.js').read_text()+'\n'+marker,1)
   old='o.lottery=[...state.league].sort('
   assert script.count(old)==1
   script=script.replace(old,'o.releasePickPolicy=1;'+old)

   script=script.replace(',exportSave,importSave,clearSaveAndRestart',',clearSaveAndRestart')
   # Product saves stay in browser storage; no import/export controls or download commands.
   script=re.sub(r'  function (?:exportSave|importSave)\(\).*?\n','',script)
   script=script.replace('Save failed on this device. Export your dynasty before closing.','This browser could not save your progress. Keep this game open to continue playing.')
   script=script.replace("return base.toast('No dynasty save found')","base.toast('No dynasty save found');return false")
   script=script.replace("else base.toast(`Dynasty restored · ${state.year}`)}catch(e)","else base.toast(`Dynasty restored · ${state.year}`);return true}catch(e)")
   script=script.replace("base.toast('Could not restore this save')}}","base.toast('Could not restore this save');return false}}")
   # Restore failures are transactional, including unexpected rendering errors.
   script=script.replace("function resumeSave(){const status", "function resumeSave(){const previous=JSON.stringify(state),previousScreen=currentScreen;const status")
   script=script.replace("catch(e){console.error(e);if(status)status.textContent='This save could not be opened.'", "catch(e){for(const k of Object.keys(state))delete state[k];restoreObject(state,JSON.parse(previous));currentScreen=previousScreen;base.go(previousScreen);console.error(e);if(status)status.textContent='This save could not be opened.'")
   # Reject malformed storage before it can mutate the current career or replace its save.
   script=script.replace("const save=migrateLoadedSave(JSON.parse(stored.raw));if(!validSave(save))throw new Error('Invalid GCC save');", "let save=JSON.parse(stored.raw);if(!validSave(save))throw new Error('Invalid GCC save');save=migrateLoadedSave(save);")
   old="  function validSave(save){return !!(save&&typeof save==='object'&&save.state&&typeof save.state==='object')}"
   new=(ROOT/'domain/save_validation.js').read_text().strip()
   assert old in script
   script=script.replace(old,new)
   script=script.replace('return Math.max(0,4-userRetirementCount())','return Math.min(2,Math.max(0,4-userRetirementCount()))')
   script=script.replace("SAVE_KEY='gcc_dynasty_v7_2'","SAVE_KEY='gcc_dynasty_v8'").replace("META_KEY='gcc_dynasty_meta_v7_2'","META_KEY='gcc_dynasty_meta_v8'").replace("LEGACY_SAVE_KEY='gcc_dynasty_v7_0'","LEGACY_SAVE_KEY='gcc_dynasty_v7_2'")
   marker='  window.Dynasty={beginOffseason'
   assert marker in script
   script=script.replace(marker,"  window.GCC8_ENGINE_READ={coverStatus,fitPlayer:id=>withFitnessContext(()=>({...pById(id)})),squadProfile:ps=>withFitnessContext(()=>window.GCC8_FOUNDATION_READ.projectedDraftProfile(ps)),matchProfile:c=>withFitnessContext(()=>window.GCC8_FOUNDATION_READ.effectiveProfile(c)),tradeBlock:(abbr,target,offer)=>cpuTradeBlockReason(abbr,pById(target),pById(offer)),pickValue:r=>pickAssetValue(r),contractCandidates:()=>contractDecisionPlayers().map(p=>p.id),pickSlots:()=>slotsWithSupplement().map(x=>({...x})),cutBudget:()=>({limit:voluntaryCutLimit(),retired:userRetirementCount()}),freeAgents:()=>freeAgentPool().map(p=>p.id),replacements:id=>replacementPoolFor(pById(id)).map(p=>p.id),save:()=>autoSave(),xiProblem:()=>userXIProblem(),fresh:()=>{stopFoundationWatch();return startFreshWorld()},archive:()=>archiveSeason(),ownsPick:r=>userOwnsPick(r),scout:id=>{const p=pById(id);return p?{outlook:developmentRead(p),standing:scoutingLevel(p,state.userClub?.abbr),fit:scoutingFit(p,state.userClub?.abbr),recent:recentSeasonRead(p),contractDue:contractDue(p)}:null},records:()=>archiveRecords(),honours:()=>archiveClubHonours(),legends:()=>archiveUserLegends(),legacyRating:()=>managerScore()};\n"+marker)
  script=adapt_careers(name,script)
  script=adapt_storage(name,script)
  script=adapt_deliveries(name,script)
  (ROOT/'engine'/f'{name}.js').write_text(script)
 body=re.search(r'<body[^>]*>(.*?)</body>',text,re.S)[1]
 body=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',body,flags=re.I)
 body=re.sub(r'<button\b[^>]*onclick="Dynasty\.(?:exportSave|importSave)\(\)"[^>]*>.*?</button>','',body,flags=re.S)
 body=re.sub(r'src="data:image/[^\"]+"','',body)
 (ROOT/'engine/bridge.html').write_text(body)
 (ROOT/'engine/manifest.json').write_text(json.dumps({'reference_sha256':EXPECTED,'reference_version':'v7.9.3','adapter':'Original rendering runs in an inert hidden host. The fresh visible UI uses state and commands. No old stylesheets are shipped. Domain extraction remains transitional.'},indent=2)+'\n')
def build(output):
 template=(ROOT/'ui/shell.html').read_text()
 # Start the selected home photograph before parsing styles, media and engine.
 # Keep its identity so the visible home uses precisely this request.
 photos=json.loads((ROOT/'assets/venue_photos.json').read_text())
 clubs=re.findall(r"abbr:'([^']+)'",(ROOT/'engine/league.js').read_text())
 home_sources=[{'abbr':abbr,'src':None if abbr=='STA' else photos[abbr]['url'].replace('width=1280','width=960')} for abbr in clubs]
 startup='<script id="g8homephoto">(()=>{const choices='+json.dumps(home_sources)+';const chosen=choices[Math.floor(Math.random()*choices.length)];window.GCC8_HOME_PHOTO=chosen;if(chosen.src&&typeof Image!=="undefined"){const img=new Image();img.decoding="async";img.fetchPriority="high";img.referrerPolicy="no-referrer";chosen.image=img;img.src=chosen.src;}})();</script>'
 template=template.replace('<title>',startup+'<title>',1)
 symbols=[]
 for path in sorted((ROOT/'assets/tabler').glob('*.svg')):
  svg=path.read_text();body=re.search(r'<svg\b[^>]*>(.*?)</svg>',svg,re.S)[1]
  symbols.append(f'<symbol id="g8icon-{path.stem}" viewBox="0 0 24 24">{body}</symbol>')
 licence=(ROOT/'assets/tabler/LICENSE.txt').read_text()
 media='<script>window.GCC8_MEDIA='+json.dumps({'stadium':'data:image/jpeg;base64,'+base64.b64encode((ROOT/'assets/mcg-under-lights-source.jpg').read_bytes()).decode(),'venues':json.loads((ROOT/'assets/venue_photos.json').read_text())})+';</script>'
 assets='<!-- Photo source and licence notices (unmodified photos): '+json.dumps(json.loads((ROOT/'assets/venue_photos.json').read_text()))+' -->'+'<!-- Tabler Icons: '+licence+' -->'+ '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="g8iconsprite">'+''.join(symbols)+'</svg>'+media
 template=template.replace('@@ASSETS@@',assets)
 styles=(ROOT/'ui/game.css').read_text()+'\n'+(ROOT/'ui/workspace.css').read_text()
 template=template.replace('@@CSS@@',styles).replace('@@BRIDGE@@',(ROOT/'engine/bridge.html').read_text())
 # Omit the old home motion, moment overlays and visual identity scripts.
 # Their DOM side effects would escape the inert host; none owns cricket state.
 binding='const {setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,cancelAnimationFrame}=window.GCC8_CLOCK;const MutationObserver=class{observe(){}disconnect(){}};'
 codec='/* '+(ROOT/'vendor/lz-string-LICENSE.txt').read_text()+' */\n'+(ROOT/'vendor/lz-string-1.5.0.js').read_text()+'\n'+(ROOT/'domain/save_codec.js').read_text()+'\n'
 engine='<script>'+codec+'window.GCC8_IDENTITIES='+json.dumps(json.loads((ROOT/'domain/player_identity.json').read_text()))+';'+ 'window.GCC8_PROFILE_CATALOG='+json.dumps(json.loads((ROOT/'domain/player_profiles.json').read_text()))+';'+(ROOT/'domain/player_profiles.js').read_text()+'\n'+(ROOT/'domain/career_outcomes.js').read_text()+'\n'+(ROOT/'domain/career_state.js').read_text()+'\n'+(ROOT/'domain/scouting.js').read_text()+'\n'+(ROOT/'domain/development_feedback.js').read_text()+'\n'+ (ROOT/'domain/player_identity.js').read_text()+'\n'+(ROOT/'domain/phase_exposure.js').read_text()+'\n'+(ROOT/'domain/draft_guard.js').read_text()+'\n'+(ROOT/'domain/career_paths.js').read_text()+'\n'+(ROOT/'domain/player_jobs.js').read_text()+'\n'+(ROOT/'domain/delivery_engine.js').read_text()+'</script><script>window.GCC8_ENGINE_SCROLL=()=>{};'+(ROOT/'ui/clock.js').read_text()+'</script>'+ '\n'.join('<script>(()=>{'+binding+(ROOT/'engine'/f'{name}.js').read_text()+'})();</script>' for name in ['players','league','ratings','projections','cpu','foundation','dynasty'])
 ui='\n'.join('<script>'+ (ROOT/'ui'/f'{name}.js').read_text()+'</script>' for name in ['components','data','roles','venues','match_story','offseason','screens','dom','controller'])
 build_id=hashlib.sha256((styles+ui+engine+assets).encode()).hexdigest()[:16]
 template=template.replace('id="g8app"',f'id="g8app" data-build="{build_id}"')
 result=template.replace('@@ENGINE@@',engine).replace('@@UI@@',ui)
 output.parent.mkdir(parents=True,exist_ok=True);output.write_text(result)
 print(output,len(result.encode()),hashlib.sha256(result.encode()).hexdigest())
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--freeze',action='store_true');p.add_argument('--output',type=Path,default=ROOT.parent/'game/global_champions_cricket_v8_fresh_game.html');a=p.parse_args()
 if a.freeze:freeze()
 if all((ROOT/'ui'/f).exists() for f in ['shell.html','game.css','components.js','screens.js','controller.js']):build(a.output)
 else:print('Engine snapshot available; fresh UI scaffold is unfinished. No playable v8 build produced.')
