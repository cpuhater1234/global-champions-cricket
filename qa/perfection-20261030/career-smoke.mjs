import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,scorebook} from '../club-expansion-20261027/helpers.mjs';
const seed=Number(process.env.SEED||101),h=loadGame('qa/perfection-20261030/candidate.html',seed,new Map(),{strictIds:true});
const X=h.context.GCC8,G=h.G,D=h.context.Dynasty,s=G.state,report={seed,seasons:[],complete:false};
const reportPath=process.env.REPORT_PATH||'qa/perfection-20261030/career-smoke.json';
const checkpoint=()=>fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
function rosterCheck(){const used=new Set();for(const c of s.league){const ids=s.teams[c.abbr];assert.equal(ids.length,15,c.abbr+' roster size');assert(ids.some(id=>X.R.isKeeper(G.byId(id))),c.abbr+' keeper');for(const id of ids){assert(!used.has(id),'duplicate ownership '+id);used.add(id);assert(G.byId(id),'known player');}}}
try{
 startDraft(h);finishDraft(h);
 for(let year=2008;year<=2026;year++){
  assert.equal(s.year,year);rosterCheck();selectManualXI(h);G.startSeason();
  for(let round=0;round<14;round++){if(X.read.xiProblem())selectManualXI(h);G.playNextRound();assert.equal(s.round,round+1,'league progression');scorebook(s.results.at(-1));}
  if(s.regularSeasonPosition<=4&&X.read.xiProblem())selectManualXI(h);G.proceedPostSeason();for(let guard=0;!s.champion&&guard<8;guard++){if(['ready','gf-ready'].includes(s.finals?.stage)){if(X.read.xiProblem())selectManualXI(h);G.simulateFinals();}else if(s.finals?.stage==='semis')G.advanceFinals();else throw Error('Unexpected finals stage '+s.finals?.stage);}
  assert(s.champion,'champion decided');for(const r of [...(s.finals?.semis||[]),s.finals?.gf].filter(Boolean))scorebook(r);G.openSeasonReview();assert(s.dynasty.archivedYears[year],'archived year');assert.deepEqual(h.errors,[]);
  report.seasons.push({year,leagueGames:s.results.length,position:s.regularSeasonPosition,champion:s.champion.abbr});checkpoint();console.log(JSON.stringify(report.seasons.at(-1)));
  if(year===2026){D.finishCareer();assert(s.dynasty.careerClosed,'career closes at 2026');report.complete=true;checkpoint();break;}
  D.beginOffseason();D.drawDraftOrder();D.startAnnualDraft();
  for(let guard=0;s.dynasty.offseason?.phase==='draft'&&guard<160;guard++){
   D.runCpuDraftUntilUser(true);if(s.dynasty.offseason.phase!=='draft')break;
   const current=X.draftCurrent(true);assert.equal(current?.club.abbr,s.userClub.abbr,'user draft turn');const mine=X.roster(),pool=X.pool(true),legal=h.context.GCC8_DRAFT_GUARD.candidates(mine,pool,15-mine.length,X.R);assert(legal.length,'legal replacement remains');
   const choices=legal.map(p=>({p,score:h.context.GCC_AI.evaluateDraft(s.userClub,p,{year:s.year,roster:mine,available:legal,pickIndex:s.dynasty.offseason.pickCursor}).score})).sort((a,b)=>b.score-a.score||a.p.id-b.p.id);
   const before=s.teams[s.userClub.abbr].length;D.userAnnualDraft(choices[0].p.id);assert.equal(s.teams[s.userClub.abbr].length,before+1,'annual pick applied');
  }
  assert.equal(s.dynasty.offseason.phase,'cuts','annual draft terminates');D.finishOffseason();assert.equal(s.dynasty.offseason.phase,'ready');D.enterTeamRoom();h.timers.clear();
 }
}catch(error){report.failure={year:s.year,round:s.round,phase:s.dynasty?.offseason?.phase,message:error.message,xiProblem:X.read.xiProblem(),position:s.regularSeasonPosition};checkpoint();throw error;}
