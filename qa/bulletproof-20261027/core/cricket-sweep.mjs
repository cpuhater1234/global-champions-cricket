import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {loadLogicGame} from '../../logic_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_product_candidate.html';
const h=loadLogicGame(file,17171,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/club-expansion-20261027/fixtures/PBKS-review.gcc.json','utf8')]]));
assert(h.context.GCC8.dispatch('continue'));
const X=h.context.GCC8,s=h.G.state,M=h.context.GCC8_MATCH_AUDIT;
const clubs=h.context.GCC_DATA.clubs,home=s.league.find(c=>c.abbr===s.userClub.abbr),away=s.league.find(c=>c.abbr!==home.abbr);
s.cpuXIs[away.abbr]=h.context.GCC8_LOGIC_AUDIT.cpuBalancedXI(s.teams[away.abbr].map(h.G.byId),away).map(p=>p.id);
let checks=0,deliveries=0,pairs=0,ties=0;const rows=[];
const check=(x,m)=>{assert(x,m);checks++;};
function finiteTree(v,path='result'){if(typeof v==='number')check(Number.isFinite(v),path+' finite');else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))finiteTree(x,path+'.'+k);}
function innings(inn){const ds=inn.deliveries;check(Array.isArray(ds)&&ds.length>0&&ds.length<300,'finite deliveries');deliveries+=ds.length;
 check(ds.reduce((n,d)=>n+d.runs,0)===inn.total,'runs reconcile');check(ds.filter(d=>d.legal).length===inn.balls,'legal balls reconcile');check(ds.filter(d=>d.wicket).length===inn.wickets,'wickets reconcile');check(inn.wickets>=0&&inn.wickets<=10,'wicket limits');check(inn.balls>=0&&inn.balls<=120,'ball limits');
 check(inn.bowlingPlan.every((id,i,a)=>!i||id!==a[i-1]),'no consecutive overs');
 let total=0,wickets=0,balls=0,freeHit=false;for(const d of ds){total+=d.runs;wickets+=d.wicket?1:0;balls+=d.legal?1:0;check(d.total===total&&d.wickets===wickets&&d.balls===balls,'cumulative delivery ledger');check(d.batterId!==d.nonStrikerId,'distinct active bats');check(d.runs===d.batRuns+(d.extraRuns||0),'bat and extras');check(!d.wicket||!d.freeHit||d.dismissal?.startsWith('run out'),'free hit dismissal');freeHit=d.freeHit;}
 const card=inn.card;if(card){check(card.batting.reduce((n,b)=>n+b.runs,0)+card.extras===inn.total,'bat scorecard');check(card.bowling.every(b=>b.balls<=24),'bowler four-over ceiling');check(card.bowling.reduce((n,b)=>n+b.balls,0)===inn.balls,'bowling scorecard balls');}
 finiteTree(inn);
}
try{
 for(const venue of clubs){let runs=0,wins=0;for(let i=0;i<40;i++){
 // Controlled venue counterfactual: same legal squads, actual innings-pair engine,
 // actual catalogue ground priors. Club identities remain the fixture's owners.
 home.ground=venue.ground;home.conditions={...venue.conditions};s.seed=100003+i*811+rows.length*7919;
 const result=M.simulateInningsPair(home,away,1);innings(result.hi);innings(result.ai);check(!!result.winner,'pair resolves a winner');check(result.hi.total!==result.ai.total||result.superOver||result.tieBreak||result.winner,'tie resolved');if(result.hi.total===result.ai.total)ties++;
 const chasing=result.secondInnings;
 // Endpoints are verified in both innings without assuming a toss-field schema.
 for(const inn of[result.hi,result.ai])if(inn===chasing){check(inn.deliveries.slice(0,-1).every(d=>d.total<result.firstInnings.total+1),'no play after chase won');}
 runs+=result.hi.total;wins+=result.winner.abbr===home.abbr?1:0;pairs++;
 }rows.push({venue:venue.abbr,pairs:40,homeRuns:runs,homeWins:wins});fs.writeFileSync('qa/bulletproof-20261027/core/cricket-sweep-progress.json',JSON.stringify({pairs,deliveries,checks,rows}));console.log('PASS',venue.abbr,pairs);}
 check(!h.errors.length,'no VM runtime errors');
 const report={artifactSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),pairs,innings:pairs*2,deliveries,checks,tiedRegulationPairs:ties,rows,scope:'Controlled catalogue venue counterfactuals with existing legal fixture squads, actual unchanged innings-pair engine. Not 1440 full season matches, historical rating certification, or empirical venue calibration.'};
 fs.writeFileSync('qa/bulletproof-20261027/core/cricket-sweep.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({pairs,deliveries,checks}));
}catch(e){fs.writeFileSync('qa/bulletproof-20261027/core/cricket-sweep-error.json',JSON.stringify({message:e.message,stack:e.stack,pairs,checks}));throw e;}finally{h.dispose();}
