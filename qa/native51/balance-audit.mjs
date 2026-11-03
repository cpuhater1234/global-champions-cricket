import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft} from '../club-expansion-20261027/helpers.mjs';
const input=process.argv[2]||'qa/perfection-20261030/candidate.html';
const out='qa/native51/balance-results.json',temp='qa/native51/balance-adapter.html';
const inputBytes=fs.readFileSync(input);let html=inputBytes.toString('utf8');
const marker='window.GCC8_FOUNDATION_READ={';assert.equal(html.split(marker).length,2);
html=html.replace(marker,'window.GCC8_BALANCE_AUDIT={simulateInningsPair,clubXI,matchBattingOrder};'+marker);
fs.writeFileSync(temp,html);
let h;try{h=loadGame(temp,101,new Map(),{strictIds:true});}finally{fs.unlinkSync(temp);}
startDraft(h);h.timers.clear();
const s=h.G.state,R=h.context.GCC_RATINGS,A=h.context.GCC8_BALANCE_AUDIT;
const pool=s.pool.filter(p=>p.available&&!p.dynastyRetired&&p.entryYear<=2008).map(p=>({...p,form:0}));
assert(pool.length>80,'real foundation player pool');
const team=(target,used)=>{
 const selected=[];function take(test,n){const choices=pool.filter(p=>!used.has(p.id)&&test(p)).sort((a,b)=>Math.abs(a.overall-target)-Math.abs(b.overall-target)||a.id-b.id);assert(choices.length>=n,'role availability');for(const p of choices.slice(0,n)){selected.push(p);used.add(p.id);}}
 take(p=>R.isKeeper(p)&&p.bat>=50,1);
 take(p=>!R.isKeeper(p)&&p.role==='BAT'&&R.battingRoleBand(p)==='OPEN',2);
 take(p=>!R.isKeeper(p)&&p.role==='BAT'&&['TOP','MIDDLE','LOWER'].includes(R.battingRoleBand(p)),3);
 take(p=>p.role==='AR'&&p.bat>=50&&R.bowlingWorkload(p)>=4,1);
 take(p=>p.role==='BOWL'&&R.bowlingStyle(p)==='PACE'&&R.bowlingWorkload(p)>=4,3);
 take(p=>p.role==='BOWL'&&R.bowlingStyle(p)==='SPIN'&&R.bowlingWorkload(p)>=4,1);
 assert.equal(selected.length,11);assert(R.oversCapacity(selected)>=20);
 return R.battingOrder(selected);
};
const targets=[[86,86],[82,82],[78,78],[74,74],[86,78],[78,86],[84,80],[80,84],[92,70],[70,92]],pairs=[];
for(let i=0;i<targets.length;i++){const used=new Set(),a=team(targets[i][0],used),b=team(targets[i][1],used);pairs.push({id:i+1,targets:targets[i],homeClub:s.league[i%s.league.length],awayClub:s.league[(i+1)%s.league.length],home:a,away:b});}
// Preserve all underlying real player attributes, freezing form only. No careers are advanced.
const originals=new Map(s.pool.map(p=>[p.id,p]));for(const p of pool)Object.assign(originals.get(p.id),{form:0});
s.dynasty.injuries={};s.dynasty.v8Management={};s.teamGames=Object.fromEntries(s.league.map(c=>[c.abbr,0]));s.round=0;s.orderTouched=true;s.weatherSeed=606;
const describe=ps=>({ids:ps.map(p=>p.id),names:ps.map(p=>p.name),meanOverall:ps.reduce((n,p)=>n+p.overall,0)/11,keeperCount:ps.filter(R.isKeeper).length,oversCapacity:R.oversCapacity(ps),profile:R.profile(ps,{matchesTogether:0})});
const fixedPairs=pairs.map(p=>({id:p.id,targets:p.targets,homeClub:p.homeClub.abbr,awayClub:p.awayClub.abbr,home:describe(p.home),away:describe(p.away)}));
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const signature=r=>({home:{total:r.hi.total,wickets:r.hi.wickets,balls:r.hi.balls,deliveries:r.hi.deliveries},away:{total:r.ai.total,wickets:r.ai.wickets,balls:r.ai.balls,deliveries:r.ai.deliveries},winner:r.winner.abbr,toss:r.toss});
const records=[],mismatches=[],profileByPair=new Map();let profileMismatch=0;
for(const year of [2008,2009])for(let seedIndex=1;seedIndex<=20;seedIndex++)for(const pair of pairs){
 const home=pair.homeClub,away=pair.awayClub;
 const rngSeed=(100003+seedIndex*7919+pair.id*101)>>>0;
 s.year=year;s.teams[home.abbr]=pair.home.map(p=>p.id);s.teams[away.abbr]=pair.away.map(p=>p.id);
 const views=[];
 for(const user of [home,away]){
  s.userClub=user;const own=user.abbr===home.abbr?pair.home:pair.away;
  s.xi=own.map(p=>p.id);s.battingOrder=[...s.xi];s.cpuXIs={[home.abbr]:pair.home.map(p=>p.id),[away.abbr]:pair.away.map(p=>p.id)};
  const homeOrder=A.matchBattingOrder(home).map(p=>p.id),awayOrder=A.matchBattingOrder(away).map(p=>p.id);assert.deepEqual(Array.from(homeOrder),Array.from(pair.home,p=>p.id));assert.deepEqual(Array.from(awayOrder),Array.from(pair.away,p=>p.id));
  const profiles={home:h.context.GCC8_FOUNDATION_READ.effectiveProfile(home),away:h.context.GCC8_FOUNDATION_READ.effectiveProfile(away)};
  s.seed=rngSeed;const result=A.simulateInningsPair(home,away,1);for(const inn of [result.hi,result.ai]){assert.equal(inn.total,inn.deliveries.reduce((n,d)=>n+d.runs,0));assert.equal(inn.balls,inn.deliveries.filter(d=>d.legal).length);assert.equal(inn.wickets,inn.deliveries.filter(d=>d.wicket).length);const workload=new Map();for(const d of inn.deliveries)if(d.legal)workload.set(d.bowlerId,(workload.get(d.bowlerId)||0)+1);assert([...workload.values()].every(n=>n<=24));}views.push({user:user.abbr,endSeed:s.seed,profiles,result,digest:digest(signature(result))});
 }
 if(JSON.stringify(views[0].profiles)!==JSON.stringify(views[1].profiles))profileMismatch++;
 if(views[0].digest!==views[1].digest||views[0].endSeed!==views[1].endSeed)mismatches.push({year,seedIndex,pair:pair.id,hashes:views.map(v=>v.digest),profilesEqual:JSON.stringify(views[0].profiles)===JSON.stringify(views[1].profiles)});
 const profileKey=pair.id,profiles=views[0].profiles;if(!profileByPair.has(profileKey))profileByPair.set(profileKey,profiles);else assert.equal(digest(profileByPair.get(profileKey)),digest(profiles),'fixed inputs retain same effective profiles');
 const r=views[0].result,firstIsHome=r.firstClub.abbr===home.abbr,bp=firstIsHome?profiles.home:profiles.away,op=firstIsHome?profiles.away:profiles.home,edge=(bp.powerplayBat+bp.middleBat+bp.finishing-op.newBall-op.middleBowl-op.death)/3;assert(Number.isFinite(edge));records.push({year,seedIndex,rngSeed,pair:pair.id,homeOrder:pair.home.map(p=>p.id),awayOrder:pair.away.map(p=>p.id),profilePair:pair.id,firstInningsRatingEdge:edge,identityExact:views[0].digest===views[1].digest,home:{runs:r.hi.total,wickets:r.hi.wickets,balls:r.hi.balls},away:{runs:r.ai.total,wickets:r.ai.wickets,balls:r.ai.balls},homeClub:home.abbr,awayClub:away.abbr,firstSide:r.firstClub.abbr===home.abbr?'home':'away',battingFirst:r.firstClub.abbr,tieBreak:r.tieBreak,winner:r.winner.abbr,weather:r.weather,ground:r.matchGround.ground,conditions:r.matchGround.conditions});
 if(records.length%100===0)console.log('Completed '+records.length+' paired fixtures');
}
function summarize(xs){if(!xs.length)return {fixtures:0,innings:0};const first=xs.map(r=>r.firstSide==='home'?r.home:r.away),both=xs.flatMap(r=>[r.home,r.away]),avg=a=>a.reduce((n,x)=>n+x,0)/a.length;return {fixtures:xs.length,innings:both.length,firstInningsMean:avg(first.map(i=>i.runs)),firstInningsBelow80:first.filter(i=>i.runs<80).length,firstInningsBelow100:first.filter(i=>i.runs<100).length,firstInningsAllOut:first.filter(i=>i.wickets===10).length,allInningsAllOut:both.filter(i=>i.wickets===10).length,minFirstInnings:Math.min(...first.map(i=>i.runs)),maxFirstInnings:Math.max(...first.map(i=>i.runs))};}
for(const r of records){const first=r.firstSide==='home'?r.home:r.away,second=r.firstSide==='home'?r.away:r.home;r.margin=r.tieBreak?{type:'superOver',value:0}:r.winner===r.battingFirst?{type:'runs',value:first.runs-second.runs}:{type:'wickets',value:10-second.wickets,ballsRemaining:120-second.balls};}
for(const p of fixedPairs)p.effectiveProfiles=profileByPair.get(p.id);
const edgeBands={underdog:records.filter(r=>r.firstInningsRatingEdge< -5),similar:records.filter(r=>Math.abs(r.firstInningsRatingEdge)<=5),favoured:records.filter(r=>r.firstInningsRatingEdge>5)};
const result={input,inputSha256:crypto.createHash('sha256').update(inputBytes).digest('hex'),method:{years:[2008,2009],seeds:20,pairs:10,fixtures:records.length,simulations:records.length*2,weatherSeed:606,actualCareerTransition:false,formFrozen:0,injuriesFrozenEmpty:true,clubSelection:'rotating actual club/venue pairs from seed101 eight-club world',realPlayerPool:'seed101 2008 available foundation players',profileMismatch,identityMismatch:mismatches.length,cpuSelectionComparison:'not run; fixed XI identity control only',limits:['Does not reproduce the native saved Punjab career.','Year changes weather context but does not age fixed player ratings.','Low-total rates are descriptive; no era-matched real-world benchmark loaded.','Private functions exposed in a temporary QA copy; function bodies and product sources unchanged.']},fixedPairs,summary:summarize(records),byYear:Object.fromEntries([2008,2009].map(y=>[y,summarize(records.filter(r=>r.year===y))])),byFirstInningsRatingEdge:Object.fromEntries(Object.entries(edgeBands).map(([k,v])=>[k,summarize(v)])),byPair:Object.fromEntries(pairs.map(p=>[p.id,summarize(records.filter(r=>r.pair===p.id))])),mismatches,records};
assert.deepEqual(h.errors,[]);fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');fs.writeFileSync('qa/native51/balance-summary.json',JSON.stringify({...result,fixedPairs:undefined,records:undefined},null,2)+'\n');assert.equal(mismatches.length,0,'identity reversal must preserve exact delivery ledgers and RNG');assert.equal(profileMismatch,0,'identity reversal must preserve effective profiles');console.log(JSON.stringify({summary:result.summary,profileMismatch,identityMismatch:mismatches.length,output:out},null,2));
