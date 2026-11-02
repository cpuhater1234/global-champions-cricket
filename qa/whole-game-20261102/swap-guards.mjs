import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const file=process.env.GCC_FILE||'qa/perfection-20261030/candidate.html';
const h=loadGame(file,101,new Map(),{strictIds:true});
startDraft(h);finishDraft(h);selectManualXI(h);
const X=h.context.GCC8,s=h.G.state,results=[];
X.ui.view='team';
const baseline=JSON.parse(JSON.stringify({xi:s.xi,order:s.battingOrder}));
const incoming=X.roster().find(p=>!s.xi.includes(p.id)).id;
const test=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
for(const action of ['naturalOrder','clearXI']){
 s.xi=[...baseline.xi];s.battingOrder=[...baseline.order].reverse();s.pendingSwapIn=incoming;X.ui.teamPane='xi';
 test(`${action}: rendered control disabled during swap`,()=>{
  const tag=[...X.views.team().matchAll(/<button\b[^>]*>/g)].map(m=>m[0]).find(t=>t.includes(`data-action="${action}"`));
  assert(tag,'tool remains discoverable');assert.match(tag,/\sdisabled(?:\s|>)/);
 });
 const before=JSON.stringify({xi:s.xi,order:s.battingOrder,pending:s.pendingSwapIn});
 test(`${action}: dispatch rejects during swap`,()=>assert.equal(X.dispatch(action,[]),false));
 test(`${action}: pending selection is unchanged`,()=>assert.equal(JSON.stringify({xi:s.xi,order:s.battingOrder,pending:s.pendingSwapIn}),before));
}
// A temporary cover player is still a squad selection decision. Model its
// engine-assigned flag and injury record without needing a random injury run.
s.xi=[...baseline.xi];s.battingOrder=[...baseline.order];s.pendingSwapIn=null;
const cover=h.G.byId(incoming);cover.dynastyReplacement=true;
s.dynasty.injuries[incoming]={status:'OUT',type:'finger injury',roundsLeft:2};
test('OUT temporary cover row exposes its medical status',()=>{
 const row=[...X.views.team().matchAll(/<article class="gccuiBenchRow[\s\S]*?<\/article>/g)].map(m=>m[0]).find(t=>t.includes(`id="g8select-${incoming}"`));
 assert(row,'temporary cover remains in squad');assert.match(row,/\sdisabled(?:\s|>)/,'OUT cover selection is disabled');assert.match(row,/>OUT</,'disabled selection explains medical status');
});
console.log(JSON.stringify({file,results},null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
