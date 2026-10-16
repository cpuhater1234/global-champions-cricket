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
