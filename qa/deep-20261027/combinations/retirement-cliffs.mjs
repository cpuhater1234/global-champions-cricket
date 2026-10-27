import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import{loadLogicGame}from'../../logic_game_host.mjs';import{careerTruth}from'../../club-expansion-20261027/helpers.mjs';
const file=process.env.GCC8_TEST_BUILD||'qa/deep-20261027/baseline.html',dir='qa/deep-20261027/combinations',raw=fs.readFileSync('qa/club-expansion-20261027/fixtures/PBKS-review.gcc.json','utf8'),rows=[];
for(const retireCount of(process.env.RETIREMENTS||'0,1,3,4,5,8,12').split(',').map(Number)){
 let h=loadLogicGame(file,9921),D=h.context.Dynasty,X=h.context.GCC8;assert(X.read.restoreBackup(raw));let s=h.G.state;const own=s.userClub.abbr;
 // Synthetic stress fixture only: move existing owned players' retirement boundary.
 const forced=s.teams[own].slice(0,retireCount);for(const id of forced)h.G.byId(id).dynastyCareer.exitYear=2008;
 const rival=s.league.find(c=>c.abbr!==own);for(const id of s.teams[rival.abbr].slice(0,5))h.G.byId(id).dynastyCareer.exitYear=2008;
 D.beginOffseason();let o=s.dynasty.offseason;assert.equal(s.year,2009);assert(forced.every(id=>!s.teams[own].includes(id)&&h.G.byId(id).dynastyRetired));
 const retired=o.retirements.filter(r=>r.owner===own).length,budget=X.read.cutBudget(),expectedLimit=Math.min(2,Math.max(0,4-retired));assert.equal(budget.limit,expectedLimit);
 for(let i=0;i<expectedLimit;i++){const id=X.read.contractCandidates().at(-1);assert(id);D.releaseContractPlayer(id);}
 assert.equal(o.voluntaryCuts.length,expectedLimit);const before=s.teams[own].length;D.releaseContractPlayer(X.read.contractCandidates().at(-1));assert.equal(s.teams[own].length,before,'extra release refused');
 D.drawDraftOrder();const initialSlots=X.read.pickSlots();assert.equal(o.ordinaryPickCounts[own],Math.min(4,retired));assert(initialSlots.filter(p=>p.owner===own).length>=15-s.teams[own].length);
 // Exercise a legal traded original pick alongside vacancies when an outgoing
 // player is still allowed. Search real proposals; never force CPU acceptance.
 let trade=null;
 if(X.read.departureBudget().remaining>0&&X.read.clubOwnsPick('R1',own))outer:for(const c of s.league.filter(c=>c.abbr!==own)){
  for(const give of [...s.teams[own]].sort((a,b)=>D.tradeValue(h.G.byId(b),c.abbr)-D.tradeValue(h.G.byId(a),c.abbr))){
   for(const take of [...s.teams[c.abbr]].sort((a,b)=>D.tradeValue(h.G.byId(a),own)-D.tradeValue(h.G.byId(b),own))){
    const deal={club:c.abbr,give:[give],take:[take],givePicks:['R1'],takePicks:[],mid:false},result=D.proposePackage(deal);if(result.accepted){trade=deal;assert.equal(o.pickOwners['R1:'+own],c.abbr);break outer;}
   }
  }
 }
 D.startAnnualDraft();let resumed=false,turns=0;
 while(o.phase==='draft'){
  assert(turns++<180,'finite draft');D.runCpuDraftUntilUser(true);if(o.phase!=='draft')break;
  const roster=s.teams[own].map(h.G.byId),available=X.read.freeAgents().map(h.G.byId),choices=h.context.GCC8_DRAFT_GUARD.candidates(roster,available,15-roster.length,X.R);assert(choices.length,'legal selection remains');
  D.userAnnualDraft(choices.sort((a,b)=>b.overall-a.overall)[0].id);
  if(!resumed&&o.phase==='draft'){
   const backup=X.read.backupRaw(),cold=loadLogicGame(file,9921);assert(cold.context.GCC8.read.restoreBackup(backup),'mid-draft backup accepted');assert.deepEqual(careerTruth(cold.G.state,{restored:true}),careerTruth(s,{restored:true}));h.dispose();h=cold;X=h.context.GCC8;D=h.context.Dynasty;s=h.G.state;o=s.dynasty.offseason;resumed=true;
  }
 }
 assert.equal(o.phase,'cuts');D.finishOffseason();assert.equal(o.phase,'ready');
 const all=[];for(const c of s.league){const ids=s.teams[c.abbr];assert.equal(ids.length,15);assert(ids.some(id=>X.R.isKeeper(h.G.byId(id))));assert(X.R.profile(h.context.GCC8_LOGIC_AUDIT.cpuBalancedXI(ids.map(h.G.byId))).oversCapacity>=20);for(const id of ids){assert.equal(h.G.byId(id).draftedBy,c.abbr);all.push(id);}}
 assert.equal(new Set(all).size,120);assert.equal(new Set(o.picks.filter(x=>x.playerId).map(x=>x.playerId)).size,o.picks.filter(x=>x.playerId).length);assert.deepEqual(h.errors,[]);
 rows.push({forcedRetirements:retireCount,actualRetirements:retired,releases:expectedLimit,ordinary:o.ordinaryPickCounts[own],supplementary:X.read.pickSlots().filter(p=>p.owner===own&&p.supplementary).length,tradedPick:!!trade,midDraftColdRestore:resumed,totalDraftSelections:o.picks.length,allEightSquadsLegal:true});h.dispose();fs.writeFileSync(dir+(process.env.RETIREMENTS?'/retirement-extra.json':'/retirement-cliffs.json'),JSON.stringify({sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),scope:'Synthetic retirement boundaries on real saved squads; real offseason/draft/trade APIs. Not observed natural retirement frequencies.',cases:rows},null,2));console.log('PASS',retireCount);
}
