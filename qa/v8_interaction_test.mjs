import assert from 'node:assert/strict';import fs from 'node:fs';import {loadGame} from './offline_game_host.mjs';
const saved=fs.readFileSync('qa/v8_smoke_save.json','utf8'),h=loadGame(process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_fresh_game.html',303,new Map([['gcc_dynasty_v8',saved]]),{strictIds:true}),X=h.context.GCC8,G=h.G,s=G.state,read=h.context.GCC8_ENGINE_READ;
let checks=0;const call=(a,...args)=>{assert.ok(X.dispatch(a,args),a+': '+h.get('g8feedback').textContent);checks++;};
call('continue');call('offseason');
const used=new Set(Object.values(s.teams).flat());assert.ok(read.freeAgents().every(id=>!used.has(id)));checks++;
call('trade',false);assert.equal(X.ui.modal,'trade');call('inspect',X.ui.tradeTarget);call('close');assert.equal(X.ui.modal,'trade');checks++;call('close');
call('annualDraw');call('revealAll');call('trade',false);
const offer=X.roster().filter(p=>p.role!=='WK-BAT').sort((a,b)=>b.overall-a.overall)[0];
const wanted=s.league.filter(c=>c.abbr!==s.userClub.abbr).flatMap(c=>s.teams[c.abbr].map(G.byId).filter(p=>p.role===offer.role).map(p=>({p,c}))).sort((a,b)=>a.p.overall-b.p.overall)[0];
X.ui.tradeOffer=offer.id;X.ui.tradeTarget=wanted.p.id;X.ui.tradeClub=wanted.c.abbr;
const pick=['R1','R2'].find(read.ownsPick);X.ui.tradePick=pick||'';
call('propose');assert.ok(h.get('g8tradeReply').textContent);checks++;
const accepted=s.teams[s.userClub.abbr].includes(wanted.p.id);
if(accepted){assert.ok(!s.teams[s.userClub.abbr].includes(offer.id));assert.ok(s.teams[wanted.c.abbr].includes(offer.id));if(pick)assert.ok(!read.ownsPick(pick));checks++;}
call('close');call('annualDraft');
while(s.dynasty.offseason?.phase==='draft'){call('skipPick');if(s.dynasty.offseason?.phase!=='draft')break;
 const rs=X.roster(),pool=X.pool(true),p=pool.find(p=>p.role==='WK-BAT'&&!rs.some(p=>p.role==='WK-BAT'))||pool[0];call('inspect',p.id);call('draftPlayer',p.id);
}
assert.equal(X.roster().length,15);checks++;call('lodgeList');call('annualTeam');
// Exercise the injury-cover boundary with a fixture representing an OUT player.
const injured=X.roster()[0];s.dynasty.injuries[injured.id]={status:'OUT',roundsLeft:2};
const cover=read.replacements(injured.id)[0];assert.ok(cover);call('cover',injured.id);call('signCover',cover);
assert.equal(s.dynasty.replacementFor[injured.id],cover);assert.ok(X.roster().some(p=>p.id===cover));checks++;
assert.ok(!X.dispatch('select',[injured.id]));checks++;
call('select',cover);assert.ok(s.xi.includes(cover));checks++;
call('home');assert.ok(h.context.GCC8_CLOCK.paused);call('play');call('fresh');call('world');assert.equal(s.year,2008);assert.equal(s.userClub,null);assert.equal(s.dynasty.history.length,0);checks++;
assert.equal(h.errors.length,0);
const result={scope:'VM dispatch + real trade, supplementary pick and replacement rules. Injury availability fixture is injected, not naturally simulated; no browser validation.',checks,tradeAccepted:accepted,pickIncluded:pick||null,errors:h.errors};fs.writeFileSync('qa/v8_interaction_results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
