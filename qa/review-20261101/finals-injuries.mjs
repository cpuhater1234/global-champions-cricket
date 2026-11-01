import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';

// Deliberate later-year fixture: real foundation draft and season initialization,
// then advance the calendar/round directly. This isolates finals injury timing;
// it does not claim to exercise a complete 2009 career or browser behavior.
const file=process.argv[2]||'qa/perfection-20261030/candidate.html';
const h=loadGame(file,101),G=h.G,s=G.state;
startDraft(h);finishDraft(h);selectManualXI(h);G.startSeason();
s.year=2009;s.round=14;s.champion=null;
const top=[s.userClub,...s.league.filter(c=>c.abbr!==s.userClub.abbr).slice(0,3)];
s.finals={top,semis:[],gf:null,gfPair:null,stage:'ready',running:false};
s.regularSeasonPosition=1;
const selected=new Set(s.cpuXIs[top[1].abbr]||[]);
const recovering=s.teams[top[1].abbr].find(id=>!selected.has(id));
assert(recovering,'CPU finalist has a bench player for recovery fixture');
s.dynasty.injuries={
 [recovering]:{status:'OUT',roundsLeft:2,type:'calf tightness'}
};
const initial=JSON.stringify(s),failures=[],checks=[];
function check(label,fn){try{fn();checks.push(label);}catch(e){failures.push({label,error:e.message});}}
function rounds(){return s.dynasty.injuries[recovering]?.roundsLeft??0;}
function exposure(label,before,matches){
 const played=new Set(matches.flatMap(m=>m.scorecard.innings.flatMap(i=>i.batting.map(b=>b.player.id))));
 const added=Object.keys(s.dynasty.injuries).map(Number).filter(id=>!before.has(id));
 check(label,()=>assert.deepEqual(added.filter(id=>!played.has(id)),[],'new injuries may only affect players who played this finals round'));
 return added;
}
const beforeSemis=new Set(Object.keys(s.dynasty.injuries).map(Number));
G.simulateFinals();assert.equal(s.finals.stage,'semis');
check('semifinal round advances recovery exactly once',()=>assert.equal(rounds(),1,'two-round injury must have one round remaining after both semifinals'));
const semiAdded=exposure('semifinal injury exposure is participants only',beforeSemis,s.finals.semis);
const afterSemis=JSON.stringify(s.dynasty.injuries);
G.simulateFinals();
check('repeated semifinal simulation does not tick injuries',()=>assert.equal(JSON.stringify(s.dynasty.injuries),afterSemis));
G.advanceFinals();assert.equal(s.finals.stage,'gf-ready');
const afterAdvance=JSON.stringify(s.dynasty.injuries);G.advanceFinals();
check('advancing the finals bracket does not tick injuries',()=>assert.equal(afterAdvance,afterSemis));
check('repeated bracket advance does not tick injuries',()=>assert.equal(JSON.stringify(s.dynasty.injuries),afterSemis));
const beforeGF=new Set(Object.keys(s.dynasty.injuries).map(Number));
G.simulateFinals();assert.equal(s.finals.stage,'done');
check('grand final advances recovery once and clears injury',()=>assert.equal(s.dynasty.injuries[recovering],undefined,'two completed finals rounds must clear a two-round injury'));
const gfAdded=exposure('grand final injury exposure is participants only',beforeGF,[s.finals.gf]);
const afterGF=JSON.stringify(s.dynasty.injuries);G.simulateFinals();G.advanceFinals();
check('repeated completed-finals actions do not tick injuries',()=>assert.equal(JSON.stringify(s.dynasty.injuries),afterGF));
const visible={injuries:JSON.parse(afterGF),champion:s.champion.abbr};

// Reset the same fixture in place because the game keeps references to state.
// The offscreen resolver is the public production API used for nonqualifiers.
Object.assign(s,JSON.parse(initial));
assert.equal(typeof G.resolveCpuFinalsOffscreen,'function');
G.resolveCpuFinalsOffscreen();
check('offscreen finals also complete both recovery rounds',()=>assert.equal(s.dynasty.injuries[recovering],undefined));
check('visible and offscreen finals have identical injury outcomes',()=>assert.deepEqual(JSON.parse(JSON.stringify(s.dynasty.injuries)),visible.injuries));
check('visible and offscreen finals retain result parity',()=>assert.equal(s.champion.abbr,visible.champion));
const offscreenAfter=JSON.stringify(s.dynasty.injuries);G.resolveCpuFinalsOffscreen();
check('repeated offscreen resolution does not tick injuries',()=>assert.equal(JSON.stringify(s.dynasty.injuries),offscreenAfter));
// Reuse the drafted world across bounded deterministic fixtures. Half of each
// selected XI starts MANAGING; the other half can sustain new injuries. The
// nonfinalists also retain selected XIs, making participant scoping observable.
const skillKeys=['bat','bowl','power','control','pacePlay','spinPlay','running','finishing','newBall','death','bowlControl','variation','spin','pace','fielding','keeping','overall'];
const skills=()=>JSON.stringify(s.pool.map(p=>[p.id,...skillKeys.map(k=>p[k])]));
const sweep={seeds:[],semiNew:0,gfNew:0,aggravations:0,managedRecoveries:0};
function auditRound(seed,label,play,getMatches){
 const before=JSON.parse(JSON.stringify(s.dynasty.injuries)),beforeSkills=skills();
 play();const matches=getMatches(),played=new Set(matches.flatMap(m=>m.scorecard.innings.flatMap(i=>i.batting.map(b=>b.player.id))));
 const added=Object.keys(s.dynasty.injuries).map(Number).filter(id=>!before[id]);
 sweep[label==='semis'?'semiNew':'gfNew']+=added.length;
 check(`seed ${seed} ${label}: new injuries exclude nonparticipants`,()=>assert.deepEqual(added.filter(id=>!played.has(id)),[]));
 const aggravated=Object.entries(before).filter(([id,i])=>i.status==='MANAGING'&&s.dynasty.injuries[id]?.status==='OUT').map(([id])=>Number(id));
 sweep.aggravations+=aggravated.length;
 check(`seed ${seed} ${label}: aggravations exclude nonparticipants`,()=>assert.deepEqual(aggravated.filter(id=>!played.has(id)),[]));
 for(const[id,i]of Object.entries(before))if(i.status==='MANAGING'){
  const after=s.dynasty.injuries[id];
  if(!after)sweep.managedRecoveries++;
  check(`seed ${seed} ${label}: managed injury ${id} has valid recovery or aggravation`,()=>{
   if(after?.status==='OUT'){assert(played.has(Number(id)));assert(after.roundsLeft>=2&&after.roundsLeft<=4);}
   else if(i.roundsLeft===1)assert.equal(after,undefined);
   else {assert.equal(after?.status,'MANAGING');assert.equal(after.roundsLeft,i.roundsLeft-1);}
  });
 }
 check(`seed ${seed} ${label}: temporary fitness restores permanent skills`,()=>assert.equal(skills(),beforeSkills));
}
for(let seed=1;seed<=30;seed++){
 Object.assign(s,JSON.parse(initial));s.seed=seed;s.dynasty.injuries={};
 for(const c of s.league){const xi=c.abbr===s.userClub.abbr?s.xi:s.cpuXIs[c.abbr];xi.forEach((id,i)=>{if(i%2===0)s.dynasty.injuries[id]={status:'MANAGING',roundsLeft:2,type:'shoulder soreness'};});}
 auditRound(seed,'semis',()=>G.simulateFinals(),()=>s.finals.semis);
 assert.equal(s.finals.stage,'semis');G.advanceFinals();
 // A genuine semifinal injury can require the user to name a replacement.
 if([s.finals.gfPair.home.abbr,s.finals.gfPair.away.abbr].includes(s.userClub.abbr))selectManualXI(h);
 auditRound(seed,'gf',()=>G.simulateFinals(),()=>[s.finals.gf]);
 assert.equal(s.finals.stage,'done');sweep.seeds.push(seed);
 if(seed>=6&&sweep.semiNew&&sweep.gfNew&&sweep.aggravations&&sweep.managedRecoveries)break;
}
check('deterministic sweep observes actual semifinal injuries',()=>assert(sweep.semiNew>0));
check('deterministic sweep observes actual GF injuries',()=>assert(sweep.gfNew>0));
check('deterministic sweep observes actual managed aggravation',()=>assert(sweep.aggravations>0));
check('deterministic sweep observes actual managed recovery',()=>assert(sweep.managedRecoveries>0));
check('offline host has no runtime errors',()=>assert.deepEqual(h.errors,[]));
console.log(JSON.stringify({pass:!failures.length,file,fixture:{year:2009,seed:101,recovering:G.byId(recovering).name,initialRounds:2,finalists:top.map(c=>c.abbr)},checkCount:checks.length,checks:checks.slice(0,13),exposure:{semiAdded,gfAdded},sweep,failures},null,2));
if(failures.length)process.exitCode=1;
