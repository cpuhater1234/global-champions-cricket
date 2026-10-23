import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_microscopic.html',h=loadGame(file,20261020,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/stabilisation/fixtures/foundation.json','utf8')]]),{strictIds:true}),X=h.context.GCC8,s=h.G.state;assert(X.dispatch('continue'));const failures=[];let checks=0;const check=(v,m)=>{checks++;if(!v)failures.push(m)};
const truth=()=>JSON.stringify({teams:s.teams,xi:s.xi,order:s.battingOrder,seed:s.seed,results:s.results}),before=truth();
for(const [key,label,fn]of [['keeping','Keeping',p=>p.keeping],['powerplayBat','Powerplay batting',p=>X.R.batPhaseScore(p,'powerplay')],['middleBowl','Middle bowling',p=>X.R.bowlPhaseScore(p,'middle')]]){
 X.ui.sort=key;const p=s.pool.find(p=>X.R.bowlingWorkload(p)>0);const html=X.playerCard(p,'inspect','Scout',false,true);const phase=html.match(/class="g8phasevalue"[^>]*>([\s\S]*?)<\/span><\/span>/)?.[1]||'';const visible=phase.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();check(visible===`${label} ${Math.round(fn(p))}`,'Draft card exposes selected '+key+' metric beside its label');
}
X.ui.sort='overall';X.ui.view='team';check(X.views.team().includes('Select a name to edit batting order.'),'Full XI retains batting-order instruction');
check(typeof X.resultSummary==='function','Result has a compact factual summary');
if(X.resultSummary){
 const r=s.results.find(r=>r.winner.abbr!==s.userClub.abbr)||s.results[0],own=s.userClub.abbr,op=r.home.abbr===own?r.away:r.home;
 const mine={total:130,wickets:6,balls:120,pp:30,mid:60,death:40,phaseBalls:{pp:36,mid:54,death:30}},theirs={total:150,wickets:5,balls:120,pp:50,mid:60,death:40,phaseBalls:{pp:36,mid:54,death:30}},sample={...r,superOver:null,home:s.userClub,away:op,homeInnings:mine,awayInnings:theirs,battingSecond:s.userClub,winner:op};
 const html=X.resultSummary(sample);check(html.includes('5.00')&&html.includes('8.33'),'Summary compares actual phase rates on equal denominators');check(!/caused|because|guarantee/.test(html),'Descriptive evidence does not invent causal certainty');
 const short={...mine,balls:0,total:1,pp:1,mid:0,death:0,phaseBalls:{pp:0,mid:0,death:0}};const zero=X.resultSummary({...sample,homeInnings:short,winner:s.userClub});check(!/NaN|Infinity/.test(zero),'Zero-legal-ball result remains finite');check(zero.includes('No phase has six legal balls in both innings'),'Short innings does not imply an unsupported phase comparison');
 const neutral={...sample,home:op,away:s.league.find(c=>![own,op.abbr].includes(c.abbr))};check(X.resultSummary(neutral)==='','Watching neutral finals does not claim the user played');
 check(X.resultSummary({...sample,superOver:r.superOver||{rounds:[]}}).includes('Super Over'),'Tied regulation innings identifies tie-break rather than phase causation');
 X.ui.result=r;X.ui.view='result';const view=X.views.result();check(view.indexOf('g8matchsummary')<view.indexOf('<details'),'Factual match summary is visible before optional analysis');
}
check(before===truth(),'Presentation reads do not mutate cricket truth');check(!h.errors.length,'No script errors');X.ui.view='review';X.G.go('review');assert(X.dispatch('offseason'));
const analysis=X.teamRead(true);check(analysis.includes('PROJECTED XI'),'Squad analysis explicitly names projection');check(!analysis.includes('The attack has enough reliable options to cover a full innings.'),'Workload feedback does not contradict capacity warning');
const arrivals=s.dynasty.offseason.arrivals.map(X.G.byId).filter(Boolean),market=X.offseasonMarket();check(arrivals.every(p=>market.includes(X.esc(p.name))),'Every new arrival can be scouted, including beyond first12');check(market.includes('New arrivals'),'Arrivals are not mislabeled as the whole draft class');
assert(X.dispatch('trade',[false,X.roster()[0].id]));check(h.get('g8dialogContent').innerHTML.includes('after the order draw'),'Pre-draw trading explains when picks become available');assert(X.dispatch('close'));
const keeper=X.roster().find(X.R.isKeeper);if(keeper&&X.roster().filter(X.R.isKeeper).length===1)check(X.releaseImpact(keeper.id).warning.includes('trading or the draft'),'Last keeper warning explains both replacement routes');
console.log(JSON.stringify({checks,failures},null,2));assert.equal(failures.length,0);
