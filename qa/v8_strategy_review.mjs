import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_cricket_experience.html';let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
function fresh(seed){const h=loadGame(file,seed,new Map(),{strictIds:true}),X=h.context.GCC8;for(const [a,args] of [['play',[]],['world',[]],['revealAll',[]],['clubs',[]],['club',[0]],['confirmClub',[]],['signingSkip',[]]])check(X.dispatch(a,args),a);return h;}
const runs=[];
for(const seed of [2101,2111,2129,2141,2153,2161,2179,2197]){
 const h=fresh(seed),X=h.context.GCC8,s=h.G.state,A=h.context.GCC_AI,R=h.context.GCC_RATINGS;const signed=s.pool.filter(p=>p.available===true&&p.entryYear<=2008||p.available===true&&(p.dynastyCareer?.debutYear??2008)===2008).map(p=>p.id).sort((a,b)=>a-b);check(signed.length>=120,'enough signed players');
 for(const a of ['draftDraw','revealAll','beginDraft'])check(X.dispatch(a),a);
 while(s.pickIndex<120){const turn=X.draftCurrent();if(turn.club.abbr!==s.userClub.abbr){check(X.dispatch('skipPick'),'skip to user');continue;}const p=X.pool(false).slice().sort((a,b)=>R.playerDraftValue(b)-R.playerDraftValue(a))[0];check(X.dispatch('draftPlayer',[p.id]),'current-only user strategy');}
 const names=['David Warner','Virat Kohli','AB de Villiers','Shane Watson','Shakib Al Hasan'];const stars=names.map(name=>{const p=s.pool.find(p=>p.name===name),i=s.picks.findIndex(x=>x.player===p?.id);return {name,signed:signed.includes(p?.id),overall:p?.overall,hiddenValue:p?A.projectedValue(p,2008):null,pick:i>=0?i+1:null,owner:p?.draftedBy};});
 const shapes=s.league.filter(c=>c.abbr!==s.userClub.abbr).map(c=>{const ps=s.teams[c.abbr].map(h.G.byId);return {club:c.abbr,keepers:ps.filter(p=>p.keeping>=65||p.role==='WK-BAT').length,bowlingCapacity:ps.reduce((n,p)=>n+R.bowlingWorkload(p),0),openers:ps.filter(p=>p.bat>=55&&p.preferredSlot<=2).length,battingOptions:ps.filter(p=>p.bat>=50).length};});
 check(!h.errors.length,'no unexpected errors');runs.push({seed,signedCount:signed.length,signedIds:signed,league:s.league.map(c=>c.abbr),draftOrder:s.draftOrder.map(c=>c.abbr),stars,cpuShapes:shapes});console.log('draft seed',seed,'complete',JSON.stringify(stars));
}
check(new Set(runs.map(x=>JSON.stringify(x.signedIds))).size===runs.length,'signed pools vary between every tested seed');
// Isolated annual fixture: preserve roles while contrasting hidden ceiling with present strength.
const h=fresh(2203),s=h.G.state,X=h.context.GCC8;for(const a of ['draftDraw','revealAll','beginDraft'])check(X.dispatch(a),a);while(s.pickIndex<120){if(X.draftCurrent().club.abbr!==s.userClub.abbr)check(X.dispatch('skipPick'),'skip');else check(X.dispatch('draftPlayer',[X.pool()[0].id]),'pick');}
const aging=[];for(let year=2008;year<=2026;year++){
 if(year>2008){h.context.Dynasty.beginOffseason();}
 const names=['David Warner','Virat Kohli','AB de Villiers','Matthew Hayden','Shane Warne','Sachin Tendulkar','Jos Buttler','Jasprit Bumrah'];aging.push({year,players:names.map(name=>{const p=s.pool.find(p=>p.name===name);return {name,overall:p?.overall,bat:p?.bat,bowl:p?.bowl,available:p?.available,retired:!!p?.dynastyRetired,career:p?.dynastyCareer};})});
 if(year<2026)s.dynasty.offseason=null;
}
check(aging.find(x=>x.year===2011).players.find(p=>p.name==='Matthew Hayden').retired,'Hayden retires after short foundation window');
const result={scope:'Actual shipped scripts in a VM. Eight complete foundation drafts with current-only user choices; seeded recruitment variation and CPU roster shape. Isolated empty-season advancement fixture measures actual career ratings and retirement, not game outcomes. No native rendering or fun certification.',artifact:file,checks,runs,aging,errors:[]};fs.writeFileSync('qa/v8_strategy_review_results.json',JSON.stringify(result,null,2)+'\n');console.log({checks,errors:[]});
