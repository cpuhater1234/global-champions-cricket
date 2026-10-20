import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from '../offline_game_host.mjs';
const rows=[];
for(const fixture of ['foundation','checkpoint-2019']){
 const h=loadGame('game/gcc_v8_microscopic.html',3803,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/stabilisation/fixtures/'+fixture+'.json','utf8')]]),{strictIds:true}),X=h.context.GCC8,s=h.G.state,D=h.context.Dynasty,read=h.context.GCC8_ENGINE_READ;assert(X.dispatch('continue'));assert(X.dispatch('offseason'));const own=s.userClub.abbr;
 const metric=()=>{const rs=s.teams[own].map(h.G.byId);return {sumOverall:rs.reduce((n,p)=>n+p.overall,0),xiSum:h.G.bestXI(rs).reduce((n,p)=>n+p.overall,0),profile:read.squadProfile(rs),roster:rs.map(p=>({id:p.id,name:p.name,overall:p.overall}))}};
 const before=metric(),deals=[];let attempts=0;const seen=new Set();
 for(let step=0;step<12;step++){
  const candidates=[];for(const club of s.league.filter(c=>c.abbr!==own))for(const off of s.teams[own].map(h.G.byId))for(const target of s.teams[club.abbr].map(h.G.byId)){
   if(target.overall<=off.overall||read.tradeBlock(club.abbr,target.id,off.id)||seen.has(off.id+':'+target.id))continue;
   const bid=D.tradeValue(off,club.abbr),ask=D.tradeValue(target,own);if(bid<ask*.96)continue;
   candidates.push({club:club.abbr,off,target,bid,ask,gain:target.overall-off.overall});}
  candidates.sort((a,b)=>b.gain-a.gain||b.bid/b.ask-a.bid/a.ask);let accepted=false;
  for(const c of candidates.slice(0,12)){seen.add(c.off.id+':'+c.target.id);attempts++;assert(X.dispatch('trade'));Object.assign(X.ui,{tradeClub:c.club,tradeTarget:c.target.id,tradeOffer:c.off.id,tradePick:'',tradeMid:false});assert(X.dispatch('propose'));assert(X.dispatch('confirmTrade'));if(s.teams[own].includes(c.target.id)){deals.push({club:c.club,offer:{name:c.off.name,overall:c.off.overall},target:{name:c.target.name,overall:c.target.overall},bid:c.bid,ask:c.ask,gain:c.gain});accepted=true;break;}if(attempts>=40)break;}
  if(!accepted||attempts>=40)break;
 }
 D.drawDraftOrder();rows.push({fixture,year:s.year,club:own,before,after:metric(),attempts,deals,picks:{lottery:s.dynasty.offseason.lottery,ownR1:read.ownsPick('R1'),ownR2:read.ownsPick('R2'),R1value:read.pickValue('R1'),R2value:read.pickValue('R2')},errors:h.errors});
}
fs.writeFileSync('qa/player-journey-20261020/trade-balance-results.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(({before,after,...r})=>({...r,before:{sumOverall:before.sumOverall,xiSum:before.xiSum,profileOverall:before.profile.overall},after:{sumOverall:after.sumOverall,xiSum:after.xiSum,profileOverall:after.profile.overall}})),null,2));
