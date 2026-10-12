import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadGame} from './offline_game_host.mjs';
import {foundation,selectXI} from './offline_game_scenarios.mjs';
const file=process.argv[2]||'game/global_champions_cricket_v7_9_2_audited_candidate.html';
const report={source:file,checks:[],failures:[],scope:'Real game APIs and explicitly selected queued timers; DOM remains a render stub.'};
const check=(name,fn)=>{try{fn();report.checks.push(name);}catch(e){report.failures.push({name,error:e.message});}};
function autoTimers(h){return [...h.timers].filter(([,t])=>t.fn.name==='runAutoSeasonTick');}
function tick(h){const item=autoTimers(h)[0];assert.ok(item,'An autoplay tick must exist');h.timers.delete(item[0]);item[1].fn();}
function saved(h){return JSON.parse(h.storage.get('gcc_dynasty_v7_2'));}
const h=foundation(loadGame(file,151,new Map(),{strictIds:true})),G=h.G,s=G.state,D=h.context.Dynasty;
const baseline=new Map(h.storage);
function fresh(){const h=loadGame(file,151,new Map(baseline),{strictIds:true});h.context.Dynasty.resumeSave();return h;}
for(const kind of ['foreign','injured','unknown']){
 const h=fresh(),s=h.G.state,out=s.xi[0],bench=s.teams[s.userClub.abbr].find(id=>!s.xi.includes(id));h.G.removeXI(out);
 const id=kind==='foreign'?Object.entries(s.teams).find(([a])=>a!==s.userClub.abbr)[1][0]:kind==='unknown'?-999:bench;
 if(kind==='injured')s.dynasty.injuries[id]={status:'OUT',roundsLeft:4};
 h.G.toggleXI(id);check(kind+' player rejected by XI selection',()=>{assert.equal(s.xi.length,10);assert.ok(!s.xi.includes(id));});
}
{const h=fresh(),s=h.G.state,out=s.xi[0],bench=s.teams[s.userClub.abbr].find(id=>!s.xi.includes(id));h.G.beginSwap(bench);s.dynasty.injuries[bench]={status:'OUT',roundsLeft:4};h.G.replaceXI(out);check('stale injured swap rejected atomically',()=>{assert.ok(s.xi.includes(out));assert.ok(!s.xi.includes(bench));assert.equal(s.xi.length,11);assert.equal(s.pendingSwapIn,null);});const order=[...s.battingOrder];h.G.moveBattingPlayer(order[0],NaN);check('invalid order direction cannot corrupt the XI',()=>assert.deepEqual([...s.battingOrder],order));}
function runControls(year){
 const round=s.round;G.simulateSeason();
 check(year+' run sets correct visible controls',()=>{assert.equal(s.seasonRunning,true);assert.equal(h.get('simulateSeason').textContent,'PAUSE SEASON');assert.equal(h.get('playRound').disabled,true);assert.equal(h.get('seasonPace').hidden,false);assert.equal(autoTimers(h).length,1);});
 G.playNextRound();check(year+' manual match blocked during run',()=>assert.equal(s.round,round));
 G.cycleSeasonPace();check(year+' pace replaces one timer',()=>{assert.equal(autoTimers(h).length,1);assert.equal(autoTimers(h)[0][1].delay,80);});
 tick(h);check(year+' timed match advances and saves exactly once',()=>{assert.equal(s.round,round+1);assert.equal(saved(h).state.round,s.round);assert.equal(autoTimers(h).length,1);});
 G.openScorecard(s.round);check(year+' opening scorecard pauses run',()=>{assert.equal(s.seasonRunning,false);assert.equal(autoTimers(h).length,0);});G.closeModal();G.simulateSeason();
 G.simulateSeason();check(year+' pause cancels timer and restores controls',()=>{assert.equal(s.seasonRunning,false);assert.equal(autoTimers(h).length,0);assert.equal(h.get('playRound').disabled,false);assert.equal(h.get('seasonPace').hidden,true);});
 G.simulateSeason();G.go('team');check(year+' navigation to XI pauses the run',()=>{assert.equal(s.seasonRunning,false);assert.equal(autoTimers(h).length,0);assert.equal(saved(h).currentScreen,'team');});
 G.go('season');G.simulateSeason();D.resumeSave();check(year+' restore returns paused without stale timer',()=>{assert.equal(s.seasonRunning,false);assert.equal(autoTimers(h).length,0);assert.equal(saved(h).currentScreen,'season');});
}
G.startSeason();runControls(2008);
while(s.round<14){selectXI(G);G.playNextRound();}
G.proceedPostSeason();if(s.finals)G.enterFinalsFromModal();
if(s.finals){D.openArchive();D.backFromArchive();check('archive returns to current Finals',()=>assert.equal(saved(h).currentScreen,'finals'));}
G.resolveCpuFinalsOffscreen();G.openSeasonReview();D.openArchive();D.backFromArchive();check('archive returns to current Review',()=>assert.equal(saved(h).currentScreen,'review'));
D.finishCareer();check('early career cannot be closed',()=>assert.equal(h.document.body.classList.contains('gcc-dynasty-ended'),false));
D.beginOffseason();D.openArchive();D.backFromArchive();check('archive returns to Off-season',()=>assert.equal(saved(h).currentScreen,'dynasty'));
G.go('season');check('off-season prevents stale Season view',()=>assert.equal(saved(h).currentScreen,'dynasty'));
check('off-season navigation offers correct destinations',()=>{assert.match(h.get('nav').innerHTML,/OFF-SEASON/);assert.ok(!h.get('nav').innerHTML.includes("GCC.go('season')"));});
D.drawDraftOrder();D.startAnnualDraft();while(s.dynasty.offseason.phase==='draft'){const used=new Set(Object.values(s.teams).flat()),p=s.pool.find(p=>p.available!==false&&!p.dynastyRetired&&!p.draftedBy&&!used.has(p.id));assert.ok(p);D.userAnnualDraft(p.id);}D.finishOffseason();D.enterTeamRoom();selectXI(G);G.startSeason();runControls(2009);
G.simulateSeason();const before=s.round,id=s.xi[0];s.dynasty.injuries[id]={status:'OUT',roundsLeft:4};tick(h);check('autoplay stops before an unavailable XI plays',()=>{assert.equal(s.round,before);assert.equal(s.seasonRunning,false);assert.equal(autoTimers(h).length,0);assert.equal(saved(h).currentScreen,'team');});
check('control scenarios have no game console errors',()=>assert.equal(h.errors.length,0));
fs.writeFileSync(process.argv[3]||'qa/v792_hard_controls_results.json',JSON.stringify(report,null,2)+'\n');console.log(`${report.checks.length} passed; ${report.failures.length} failed`);if(report.failures.length){console.log(report.failures);process.exitCode=1;}
