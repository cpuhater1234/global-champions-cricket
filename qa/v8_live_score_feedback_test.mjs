import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html',raw=fs.readFileSync(process.env.GCC8_FEEDBACK_SAVE||'qa/stabilisation/fixtures/foundation.json','utf8');
const h=loadGame(file,616,new Map([['gcc_dynasty_v8',raw]]),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
assert(X.dispatch('continue'));let checks=0,failures=[];const check=(v,m)=>{checks++;if(!v)failures.push(m);};
const matches=[...s.results,...(s.finals?.semis||[]),s.finals?.gf].filter(Boolean);
let noBalls=0,allOuts=0;
for(const r of matches){
 const frames=X.deliveryFrames(r);X.ui.result=r;
 for(let index=0;index<frames.length;index++){
  const f=frames[index];if(f.tie||f.kind!=='ball')continue;
  const card=r.scorecard.innings[f.innings],data=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings,log=data.deliveries.slice(0,f.logIndex+1),last=f.event;
  if(last.extra==='noBalls'&&last.nextStrikerId){
   noBalls++;X.ui.match={presentationVersion:3,count:index+1,running:false};const html=X.ballReveal(),id=last.nextStrikerId,p=h.G.byId(id),events=log.filter(d=>d.batterId===id),runs=events.reduce((n,d)=>n+d.batRuns,0),balls=events.filter(d=>d.extra!=='wides').length;
   check(html.includes(`<span>${X.esc(p.name)} *</span><b>${runs}<small> (${balls})</small></b>`),'Live batter balls include no-balls: '+p.name+' round '+r.round);
  }
  if(last.wickets===10&&f.innings===1){
   allOuts++;X.ui.match={presentationVersion:3,count:index+1,running:false};check(!X.ballReveal().includes(' · Required rate '),'An all-out chase has no live required rate');
  }
 }
}
check(noBalls>0,'Fixture exercises no-balls');check(allOuts>0,'Fixture exercises all-out chases');
// Presentation-only overlay: use real engine-generated Super Over innings and show their own scores.
const base=matches[0],superOver=h.context.GCC8_FOUNDATION_READ.simulateSuperOver(base.home,base.away,h.G.matchGroundForFixture({home:base.home,round:1}));
const r={...base,superOver},frames=X.deliveryFrames(r),index=frames.findIndex(f=>f.tie&&f.innings===3&&f.kind==='ball');
X.ui.result=r;X.ui.match={presentationVersion:3,count:index+1,running:false};const first=superOver.rounds[0].innings[0];
check(X.ballReveal().includes(`<b>${X.esc(first.club.abbr)}</b> · ${first.total}/${first.wickets} <small>`),'Super Over scoreboard uses tie-break totals instead of regulation totals');
console.log(JSON.stringify({checks,noBalls,allOuts,failures},null,2));assert.equal(failures.length,0,failures.join('\n'));
