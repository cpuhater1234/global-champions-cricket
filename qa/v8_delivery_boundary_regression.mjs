import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const window={};vm.runInNewContext(fs.readFileSync('v8/domain/delivery_engine.js','utf8'),{window});
const model=window.GCC8_DELIVERY;
const players=(prefix)=>Array.from({length:11},(_,i)=>({id:prefix*100+i+1,name:'Player '+prefix+'-'+i,power:75,keeping:i===0?80:0,role:i===0?'WK-BAT':'AR'}));
const bat=players(1),bowl=players(2),home={abbr:'H',name:'Home'},away={abbr:'A',name:'Away'};
const R={bowlingWorkload:()=>4,isKeeper:p=>p.role==='WK-BAT',bowlingStyle:()=> 'FAST',bowlPhaseScore:()=>75,batPhaseScore:()=>75,battingPositionFit:()=>100};
const profile={powerplayBat:75,middleBat:75,finishing:75,newBall:75,middleBowl:75,death:75};
const estimate={pp:45,mid:75,death:50,wickets:5,bowlingPlan:[]};
function rng(seed){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
let found=false;
for(let seed=1;seed<=150;seed++){
 const result=model.play({batClub:home,bowlClub:away,order:bat,bowlers:bowl,estimate,batProfile:profile,bowlProfile:profile,random:rng(seed),R});
 const ds=result.deliveries,noBalls=ds.filter(d=>d.extra==='noBalls'),wides=ds.filter(d=>d.extra==='wides');
 if(!noBalls.length||!wides.length)continue;
 found=true;
 for(const row of result.card.batting){
  const faced=ds.filter(d=>d.batterId===row.player.id&&d.extra!=='wides').length;
  assert.equal(row.balls,faced,'a no-ball counts towards batter balls faced, a wide does not');
  assert.equal(row.sr,row.balls?row.runs*100/row.balls:null,'strike rate uses balls faced');
 }
 const legal=ds.filter(d=>d.legal).length;
 assert.equal(result.balls,legal,'innings legal balls ignore wides and no-balls');
 assert.equal(result.card.bowling.reduce((n,b)=>n+b.balls,0),legal,'bowling legal balls match innings');
 assert.equal(result.deliveries.at(-1).nextStrikerId,null,'terminal innings has no active striker');
 assert.equal(result.deliveries.at(-1).nextNonStrikerId,null,'terminal innings has no active non-striker');
 break;
}
assert.ok(found,'test fixture must exercise both no-ball and wide outcomes');
console.log('PASS delivery extras, striker accounting, legal balls and terminal state');

function completeMatch(seed){
 const first=model.play({batClub:home,bowlClub:away,order:bat,bowlers:bowl,estimate,batProfile:profile,bowlProfile:profile,random:rng(seed),R});
 const second=model.play({batClub:away,bowlClub:home,order:bowl,bowlers:bat,estimate,batProfile:profile,bowlProfile:profile,context:{chasing:true,target:first.total+1},random:rng(seed+10000),R});
 const r={home,away,battingFirst:home,battingSecond:away,homeInnings:first,awayInnings:second};
 r.scorecard=model.scorecard(home,away,first,second,home);
 return r;
}
const ids=new Set([...bat,...bowl].map(p=>p.id));
let checked=0,legacyChecked=0;
for(let seed=151;seed<=250;seed++){
 const result=completeMatch(seed);
 assert.equal(model.validResult(result,ids),true,'new delivery scorecard must pass ledger validator at seed '+seed);
 checked++;
 const old=structuredClone(result);
 let changed=0;
 for(const card of old.scorecard.innings){
  const ds=(card.club.abbr===home.abbr?old.homeInnings:old.awayInnings).deliveries;
  for(const row of card.batting){
   const count=ds.filter(d=>d.batterId===row.player.id&&d.extra==='noBalls').length;
   if(!count)continue;
   row.balls-=count;row.sr=row.balls?row.runs*100/row.balls:null;changed+=count;
  }
 }
 if(changed){
  assert.equal(model.validResult(old,ids),true,'prior no-ball statistics must remain valid without save migration');
  const altered=structuredClone(result);
  const card=altered.scorecard.innings[0];
  const row=card.batting.find(b=>b.balls>0);
  assert.ok(row,'scorecard has a batter who faced a ball');
  row.balls+=2;
  assert.equal(model.validResult(altered,ids),false,'fabricated batter balls must be rejected');
  const wrongRate=structuredClone(result);
  const entry=wrongRate.scorecard.innings[0].batting.find(b=>b.balls>0);
  entry.sr+=3;
  assert.equal(model.validResult(wrongRate,ids),false,'fabricated strike rate must be rejected');
  for(const bad of [NaN,Infinity,-Infinity,null]){
   const badStrike=structuredClone(result);
   badStrike.scorecard.innings[0].batting.find(b=>b.balls>0).sr=bad;
   assert.equal(model.validResult(badStrike,ids),false,'invalid strike rate must be rejected: '+String(bad));
  }
  const badEconomy=structuredClone(result);
  const bowlingRow=badEconomy.scorecard.innings[0].bowling.find(b=>b.balls>0);
  assert.ok(bowlingRow,'innings contains a bowler with legal deliveries');
  bowlingRow.economy=NaN;
  assert.equal(model.validResult(badEconomy,ids),false,'non-finite bowling economy must be rejected');
  const invalidInningsOvers=structuredClone(result);
  invalidInningsOvers.scorecard.innings[0].overs=invalidInningsOvers.scorecard.innings[0].overs==='20.0'?'19.5':'20.0';
  assert.equal(model.validResult(invalidInningsOvers,ids),false,'incorrect total over notation must be rejected');
  const invalidBowlerOvers=structuredClone(result);
  invalidBowlerOvers.scorecard.innings[0].bowling.find(b=>b.balls>0).overs='0.0';
  assert.equal(model.validResult(invalidBowlerOvers,ids),false,'incorrect bowler over notation must be rejected');
  legacyChecked++;
 }
}
assert.ok(checked===100&&legacyChecked>0,'complete new and legacy scorecard fixtures must run');
console.log('PASS two-innings ledger, historic no-ball compatibility and tamper rejection: '+checked+' seeds');
