import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_arcade_flow.html',h=loadGame(file,101),X=h.context.GCC8,G=h.G,s=G.state;
let checks=0;const call=(a,...args)=>{assert.ok(X.dispatch(a,args),`${a}: ${h.get('g8feedback').textContent}`);checks++;};
call('play');call('world');const seed=s.seed;assert.equal(X.ui.reveal.count,0);h.advance(1500);assert.equal(X.ui.reveal.count,1);checks++;
call('revealRun');h.advance(3000);assert.equal(X.ui.reveal.count,1);checks++;call('revealSpeed');call('revealRun');h.advance(750);assert.equal(X.ui.reveal.count,2);checks++;
call('how');h.advance(3000);assert.equal(X.ui.reveal.count,2);checks++;call('close');h.advance(750);assert.equal(X.ui.reveal.count,3);checks++;
call('home');assert.ok(h.context.GCC8_CLOCK.paused);call('continue');assert.equal(X.ui.view,'leagueDraw');assert.equal(X.ui.reveal.count,3);checks++;
call('revealAll');assert.equal(s.seed,seed);checks++;call('clubs');call('club',0);call('confirmClub');call('signingSkip');call('draftDraw');const order=s.draftOrder.map(c=>c.abbr).join('|'),draftSeed=s.seed;
h.advance(1500);assert.equal(X.ui.reveal.count,1);checks++;call('home');call('continue');assert.equal(X.ui.view,'draftDraw');assert.equal(X.ui.reveal.count,1);assert.equal(s.pickIndex,0);checks++;
call('revealSpeed');call('revealSpeed');h.advance(375);assert.equal(X.ui.reveal.count,2);assert.equal(s.pickIndex,0);checks++;call('revealAll');assert.equal(s.seed,draftSeed);assert.equal(s.draftOrder.map(c=>c.abbr).join('|'),order);checks++;call('beginDraft');assert.ok(!X.ui.reveal);checks++;
// Roster and player reads must be read-only; calling them repeatedly cannot reroll cricket truth.
const p=X.pool()[0],before=JSON.stringify(s);for(let i=0;i<10;i++)X.playerRead(p);assert.equal(JSON.stringify(s),before);checks++;
assert.ok(!X.commands.includes('import'));assert.ok(!X.views.home().includes('Import dynasty'));checks++;
const late=loadGame(file,202,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/v8_smoke_save.json','utf8')]])),Y=late.context.GCC8;
assert.ok(Y.dispatch('continue'));assert.ok(Y.dispatch('offseason'));assert.ok(Y.dispatch('annualDraw'));assert.ok(Y.dispatch('revealAll'));assert.ok(Y.dispatch('home'));assert.ok(Y.dispatch('continue'));assert.equal(Y.ui.reveal.count,8);assert.ok(Y.dispatch('annualDraft'));checks++;
// Explicit user rule: at most two optional releases, and no more than four total controllable departures.
for(const n of [0,1,2,3,4,6]){late.G.state.dynasty.offseason.retirements=Array.from({length:n},(_,i)=>({id:i,owner:late.G.state.userClub.abbr}));assert.equal(late.context.GCC8_ENGINE_READ.cutBudget().limit,Math.min(2,Math.max(0,4-n)));checks++;}
assert.equal(h.errors.length+late.errors.length,0);assert.ok(h.timers.size<=1);checks++;
const r={scope:'VM clock and command tests; proves reveal sequencing/save guards and unchanged draw order, not rendered smoothness.',checks,errors:[]};fs.writeFileSync('qa/v8_reveal_results.json',JSON.stringify(r,null,2)+'\n');console.log(r);
