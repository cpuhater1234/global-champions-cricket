import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {loadLogicGame} from '../logic_game_host.mjs';import {careerTruth,selectManualXI,scorebook} from '../club-expansion-20261027/helpers.mjs';
const file='qa/limits-20261027/candidate.html',report={sha:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),cases:[]};
for(const club of ['GLA','GT']){
 const raw=fs.readFileSync(`qa/club-expansion-20261027/fixtures/${club}-review.gcc.json`,'utf8'),a=loadLogicGame('qa/limits-20261027/baseline.html',99),b=loadLogicGame(file,99);
 try{
 for(const h of [a,b]){vm.runInContext('Math.random=()=>0.5',h.context);assert(h.context.GCC8.read.restoreBackup(raw));}
 const stages=[];const equal=stage=>{assert.deepEqual(careerTruth(a.G.state,{restored:true}),careerTruth(b.G.state,{restored:true}),stage);stages.push(stage)};equal('cold restore');
 for(const h of[a,b]){
  const D=h.context.Dynasty,s=h.G.state;D.beginOffseason();D.runCpuMarket();D.drawDraftOrder();D.startAnnualDraft();const o=s.dynasty.offseason;
  for(let guard=0;o.phase==='draft';guard++){
   assert(guard<200);D.runCpuDraftUntilUser(true);if(o.phase!=='draft')break;
   const roster=s.teams[club].map(h.G.byId),avail=h.context.GCC8.read.freeAgents().map(h.G.byId),choices=h.context.GCC8_DRAFT_GUARD.candidates(roster,avail,15-roster.length,h.context.GCC8.R);assert(choices.length);
   D.userAnnualDraft(choices.sort((x,y)=>y.overall-x.overall||x.id-y.id)[0].id);
  }
  assert.equal(o.phase,'cuts');D.finishOffseason();assert.equal(o.phase,'ready');D.enterTeamRoom();selectManualXI(h);h.G.startSeason();
 }equal('annual market draft and next season');
 for(let i=1;i<=3;i++){for(const h of[a,b]){selectManualXI(h);h.G.playNextRound();scorebook(h.G.state.results.at(-1));}equal('round '+i);}
 const cold=loadLogicGame(file,101);try{assert(cold.context.GCC8.read.restoreBackup(b.context.GCC8.read.backupRaw()));assert.deepEqual(careerTruth(cold.G.state,{restored:true}),careerTruth(b.G.state,{restored:true}));assert.deepEqual(cold.errors,[]);}finally{cold.dispose()}
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);report.cases.push({club,pass:true,stages,coldRound3Exact:true,year:b.G.state.year});console.log(club,'PASS');
 }finally{a.dispose();b.dispose();fs.writeFileSync('qa/limits-20261027/continuity.json',JSON.stringify(report,null,2));}
}
