import assert from 'node:assert/strict';import crypto from 'node:crypto';
import fs from 'node:fs';
import {loadGame} from '../offline_game_host.mjs';
const reportDir=process.env.GCC8_TEST_REPORT_DIR||'qa/structural-risk/world-101';fs.mkdirSync(reportDir,{recursive:true});
const lastYear=Number(process.env.GCC8_TEST_LAST_YEAR||2026);
const path=process.env.GCC8_TEST_BUILD||'game/gcc_v8_product_candidate.html';
const host=loadGame(path,Number(process.env.GCC8_TEST_SEED||101),new Map([['gcc_dynasty_v8',fs.readFileSync(process.env.GCC8_RESUME_FIXTURE||'qa/career-experience/world-202/checkpoint-2020.json','utf8')]]),{strictIds:true,storageLimitBytes:Number(process.env.GCC8_STORAGE_LIMIT_BYTES)||undefined}),{G,context,get}=host,X=context.GCC8,s=G.state;
const observations=[], actionLog=[], draftChoices=[];
function observe(){const ps=X.roster(),dev=s.dynasty.developmentByYear?.[s.year]||[];observations.push({year:s.year,position:s.regularSeasonPosition,champion:s.champion?.abbr,user:s.userClub.abbr,table:Object.fromEntries(Object.entries(s.table).map(([k,t])=>[k,{wins:t.w,losses:t.l,points:t.pts}])),teams:Object.fromEntries(s.league.map(c=>[c.abbr,s.teams[c.abbr].map(id=>{const p=G.byId(id);return {id,name:p.name,role:p.role,overall:p.overall,age:s.year-p.birthYear};})])),development:dev,annualActions:actionLog.filter(a=>a.year===s.year&&['dynasty','team'].includes(a.view)),choices:draftChoices.filter(p=>p.year===s.year)});fs.writeFileSync(reportDir+'/observations.json',JSON.stringify(observations,null,2));}
const coverage={reloads:[],finals:0,injurySelections:0,injuryCovers:0,superOvers:0,clubs:[]};const scorebooks=[];const markup={};let checks=0;const check=(test,msg)=>{assert.ok(test,msg);checks++;};
const doIt=(name,...args)=>{actionLog.push({year:s.year,view:X.ui.view,action:name});if(name==='draftPlayer'){const p=G.byId(args[0]),pool=X.pool(s.year>2008);draftChoices.push({year:s.year,id:p.id,name:p.name,role:p.role,overall:p.overall,alternatives:pool.length,top:pool.slice(0,5).map(p=>({id:p.id,name:p.name,overall:p.overall,role:p.role})),entryYears:Object.fromEntries([...new Set(pool.map(p=>p.dynastyCareer?.debutYear||2008))].map(y=>[y,pool.filter(p=>(p.dynastyCareer?.debutYear||2008)===y).length]))});}const ok=X.dispatch(name,args);check(ok,`${name}: ${get('g8feedback').textContent}`);const key=X.ui.view+(X.ui.view==='dynasty'?'-'+s.dynasty.offseason?.phase:'')+(X.ui.modal?'-'+X.ui.modal:'');if(!markup[key])markup[key]={stage:get('g8stage').innerHTML,hud:get('g8hud').innerHTML,dialog:X.ui.modal?get('g8dialogContent').innerHTML:''};if(X.ui.view==='matchReveal'){check(X.dispatch('matchSkip'),'instant match completion');}};
function captureScorebook(r){scorebooks.push({year:s.year,round:r.round||null,home:r.home.abbr,away:r.away.abbr,winner:r.winner.abbr,battingFirst:r.battingFirst.abbr,battingSecond:r.battingSecond.abbr,marginText:r.marginText,superOver:!!r.superOver,innings:r.scorecard.innings.map(i=>({club:i.club.abbr,total:i.total,wickets:i.wickets,balls:i.balls,extras:i.extras,extrasBreakdown:i.extrasBreakdown,phases:i.phases,batting:i.batting.map(b=>({id:b.player.id,name:b.player.name,runs:b.runs,balls:b.balls,fours:b.fours,sixes:b.sixes,dismissal:b.dismissal,dnb:b.dnb})),bowling:i.bowling.map(b=>({id:b.player.id,name:b.player.name,balls:b.balls,runs:b.runs,wickets:b.wickets})),plan:(i.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings).bowlingPlan}))});}
function auditScorebook(r){
 if(r.superOver){coverage.superOvers++;check(r.tieBreak&&r.homeInnings.total===r.awayInnings.total,'Super Over only follows tied regulation scores');
  check(r.superOver.winner.abbr===r.winner.abbr,'tie-break winner owns the match result');
  for(const [index,round] of r.superOver.rounds.entries()){
   for(const i of round.innings){check(i.balls>=1&&i.balls<=6&&i.wickets<=2,'Super Over delivery/wicket bounds');check(i.deliveries.reduce((n,d)=>n+d.runs,0)===i.total&&i.deliveries.filter(d=>d.wicket).length===i.wickets,'Super Over ledger reconciles');check(i.batters.reduce((n,b)=>n+b.balls,0)===i.balls&&i.batters.reduce((n,b)=>n+b.runs,0)===i.total,'tie-break batters reconcile');check(s.teams[i.club.abbr].includes(i.batters[0].id),'tie-break hitter belongs to playing club');}
   const [a,b]=round.innings;check(index===r.superOver.rounds.length-1?a.total!==b.total:a.total===b.total,'only tied overs repeat');
  }
  check(X.resultCard(r).includes('SUPER OVER'),'result explains tie-break');
 }

 for(const i of r.scorecard.innings){
  check(Number.isInteger(i.total)&&i.total>=0&&i.wickets>=0&&i.wickets<=10,'innings bounds');
  const sourceInnings=i.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings;check(i.balls>=0&&i.balls<=120,'innings legal ball bounds include a chase won on extras before a legal ball');if(sourceInnings.deliveries){check(sourceInnings.deliveries.filter(d=>d.legal).length===i.balls,'delivery legal balls reconcile');check(i.batting.reduce((n,b)=>n+b.balls,0)===sourceInnings.deliveries.filter(d=>d.extra!=='wides').length,'batter balls faced include no-balls and exclude wides');}else check(i.batting.reduce((n,b)=>n+b.balls,0)===i.balls,'legacy legal balls reconcile');
  check(i.bowling.reduce((n,b)=>n+b.balls,0)===i.balls&&i.bowling.every(b=>b.balls<=24),'bowling overs and four-over cap');
  check(Object.values(i.phases).reduce((a,b)=>a+b,0)===i.total,'phase scores reconcile');
  check(i.batting.filter(b=>!b.dnb&&b.dismissal!=='not out').length===i.wickets,'dismissals reconcile');
  check(i.batting.every(b=>b.fours*4+b.sixes*6<=b.runs),'boundaries reconcile');
  const e=i.extrasBreakdown;check(e.wides+e.noBalls+e.byes+e.legByes===i.extras,'extras reconcile');
  check(i.bowling.reduce((n,b)=>n+b.runs,0)===i.total-e.byes-e.legByes,'bowler runs exclude byes');
  check(i.bowling.reduce((n,b)=>n+b.wickets,0)<=i.wickets,'bowling wickets exclude run-outs');
  const inn=i.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings,overCount=inn.deliveries?new Set(inn.deliveries.map(d=>d.over)).size:Math.ceil(i.balls/6),plan=inn.bowlingPlan.slice(0,overCount);check(plan.length===overCount&&plan.every((id,n)=>!n||id!==plan[n-1]),'bowling sequence has no consecutive overs');
  check(i.bowling.every(b=>b.balls===0?b.economy===null&&b.wickets===0:Number.isFinite(b.economy)&&Math.abs(b.economy-b.runs*6/b.balls)<1e-9),'economy uses legal balls');
 }
 for(const row of Object.values(s.table)){check(Math.abs(row.nrr-(row.ballsFor?row.runsFor*6/row.ballsFor-row.runsAgainst*6/row.ballsAgainst:0))<1e-9,'net run rate formula');}for(const row of Object.values(s.table))check(row.p===row.w+row.l&&row.pts===row.w*2&&Number.isFinite(row.nrr),'ladder arithmetic');
}
function checkpoint(label){
 const raw=host.storage.get('gcc_dynasty_v8'),cold=loadGame(path,777,new Map([['gcc_dynasty_v8',raw]]),{strictIds:true}),Y=cold.context.GCC8;
 check(Y.dispatch('continue'),label+' cold Continue');
 const core=t=>JSON.stringify({year:t.year,seed:t.seed,user:t.userClub?.abbr,teams:t.teams,xi:t.xi,order:t.battingOrder,results:t.results,table:t.table,round:t.round,pick:t.pickIndex,offseason:t.dynasty.offseason});
 check(core(cold.G.state)===core(s),label+' preserves career truth');check(cold.errors.length===0,label+' no restore errors');check(Y.ui.view===X.ui.view,label+' restores view');coverage.reloads.push({year:s.year,label});
}
function manualXI(){
 // Tests choose a balanced XI, but use only the exposed manual selection commands.
 let available=X.roster().filter(p=>s.dynasty.injuries?.[p.id]?.status!=='OUT');
 // Multiple natural injuries can leave fewer than eleven healthy players. Exercise
 // the same manual cover market a player must use, rather than failing the harness.
 while(available.length<11){const injured=X.roster().find(p=>s.dynasty.injuries?.[p.id]?.status==='OUT'&&!s.dynasty.replacementFor[p.id]&&context.GCC8_ENGINE_READ.replacements(p.id).length);check(!!injured,'injury cover available for depleted side');doIt('cover',injured.id);doIt('signCover',context.GCC8_ENGINE_READ.replacements(injured.id)[0]);coverage.injuryCovers++;available=X.roster().filter(p=>s.dynasty.injuries?.[p.id]?.status!=='OUT');}

 const best=G.bestXI(available);doIt('clearXI');for(const p of best)doIt('select',p.id);
 check(s.xi.length===11,'manual XI complete');check(new Set(s.battingOrder).size===11,'unique batting order');
}
function finishSeason(){
 for(let round=s.round+1;round<=14;round++){
  if(X.ui.view==='result')doIt('matchday');
  if(context.GCC8_ENGINE_READ.xiProblem()){coverage.injurySelections++;doIt('editXI');manualXI();doIt('lodge');}
  doIt('prepare');doIt('playMatch',round);
  check(s.round===round,'one match per action');
  const r=s.results.at(-1);captureScorebook(r);auditScorebook(r);check(r.scorecard.innings.every(i=>i.batting.reduce((n,b)=>n+b.runs,0)+i.extras===i.total),'scorebook reconciles');
  doIt('resultScorecard');doIt('close');
 }
 doIt('matchday');doIt('postSeason');
 if(X.ui.view==='team'){manualXI();doIt('lodge');doIt('postSeason');}
 if(X.ui.view==='finals'){coverage.finals++;checkpoint('finals-ready');
  doIt('simulateFinals');s.finals.semis.forEach(r=>{auditScorebook(r);captureScorebook(r);});check(s.finals.stage==='semis','semi finals completed');doIt('finalScorecard','semis',0);doIt('close');doIt('advanceFinals');checkpoint('grand-final-ready');
  if([s.finals.gfPair.home.abbr,s.finals.gfPair.away.abbr].includes(s.userClub.abbr)&&context.GCC8_ENGINE_READ.xiProblem()){doIt('editXI','finals');manualXI();doIt('lodge');}
  doIt('simulateFinals');auditScorebook(s.finals.gf);captureScorebook(s.finals.gf);doIt('review');
 }
 observe();check(X.ui.view==='review',`season review: year ${s.year}, view ${X.ui.view}, hidden ${X.screen()}, position ${s.regularSeasonPosition}, XI issue ${context.GCC8_ENGINE_READ.xiProblem()}`);check(s.dynasty.history.some(h=>h.year===s.year),'current season archived');
}
doIt('continue');const resumedFromYear=s.year;check(X.ui.view==='review','resumes at actual season review');
for(let year=resumedFromYear+1;year<=lastYear;year++){
 doIt('offseason');check(s.year===year,'annual year advances');
 const budget=context.GCC8_ENGINE_READ.cutBudget(),eligible=context.GCC8_ENGINE_READ.contractCandidates();
 if(year===2009&&budget.limit&&eligible.length){doIt('release',eligible[0]);doIt('confirmRelease',eligible[0]);}
 doIt('cpuMarket');doIt('annualDraw');doIt('revealAll');checkpoint('annual-order');doIt('annualDraft');
 for(let guard=0;s.dynasty.offseason?.phase==='draft'&&guard<30;guard++){
  doIt('skipPick');if(s.dynasty.offseason?.phase!=='draft')break;
  const free=X.pool(true),rs=X.roster();const p=free.find(p=>p.role==='WK-BAT'&&!rs.some(p=>p.role==='WK-BAT'))||free.find(p=>p.maxOvers>=4&&rs.filter(p=>p.maxOvers>=4).length<6)||free[0];check(!!p,'annual player pool');if(guard===0)checkpoint('annual-user-pick');doIt('inspect',p.id);doIt('draftPlayer',p.id);
 }
 check(X.ui.view==='team'&&!s.dynasty.offseason,'annual draft automatically enters team room');doIt('lodgeList');check(Object.values(s.teams).every(ids=>ids.length===15),'annual lists fifteen');
 for(const c of s.league.filter(c=>c.abbr!==s.userClub.abbr))check(s.teams[c.abbr].map(G.byId).some(p=>p.role==='WK-BAT'||p.keeping>=65),'CPU keeper integrity');
 doIt('annualTeam');manualXI();doIt('lodge');finishSeason();fs.writeFileSync(reportDir+'/checkpoint-'+year+'.json',host.storage.get('gcc_dynasty_v8'));console.log('Closed season',year);
}
if(lastYear===2026){doIt('finishCareer');check(X.ui.view==='legacy','2026 ending');check(s.dynasty.history.length===19,'nineteen seasons archived');check(!X.dispatch('offseason'),'career cannot enter 2027');}
check(host.errors.length===0,JSON.stringify(host.errors));
if(process.env.GCC8_TEST_SCOREBOOKS)fs.writeFileSync(reportDir+'/v8_scorebooks.json',JSON.stringify(scorebooks));
const saved=host.storage.get('gcc_dynasty_v8');if(lastYear!==2026)fs.writeFileSync(reportDir+'/v8_smoke_save.json',saved);check(!!saved,'separate v8 save');check(!host.storage.has('gcc_dynasty_v7_2'),'v7 save not overwritten');
const resumed=loadGame(path,202,new Map([['gcc_dynasty_v8',saved]]),{strictIds:true});check(resumed.context.GCC8.dispatch('continue'),'reload continues');check(resumed.context.GCC8.ui.view===(lastYear===2026?'legacy':'review'),'reload reaches saved career stage');
fs.writeFileSync(reportDir+'/v8_markup_snapshot.json',JSON.stringify(markup,null,2));
if(process.env.GCC8_TEST_KEEP_FINAL_SAVE)fs.writeFileSync(reportDir+'/v8_final_save.json',saved);
const results={artifactSha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),resumedFromYear,exercisedSeasons:lastYear-resumedFromYear,scope:'Resumed career on final artifact: real cricket engine + UI dispatch in a VM DOM stub. Archived nineteen-season total includes previously played years; exercisedSeasons identifies this run. No browser, visual, geometry, focus or latency certification.',seed:Number(process.env.GCC8_TEST_SEED||101),club:s.userClub.abbr,coverage,checks,seasons:s.dynasty.history.length,regularSeasonMatches:s.dynasty.manager.matches,storageStats:host.storageStats,errors:host.errors};
fs.writeFileSync(reportDir+(lastYear===2026?'/v8_game_results.json':'/v8_smoke_results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
