/* Highlights use completed scorecard facts. No invented deliveries or intermediate wickets. */
(() => {
 const X=window.GCC8,{esc}=X;
 X.resultHeadline=r=>{
  if(!r)return 'The scorebook is ready.';const own=X.G.state.userClub?.abbr,involved=[r.home.abbr,r.away.abbr].includes(own);
  if(!involved)return `${r.winner.name} take the honours.`;
  const won=r.winner.abbr===own,chased=r.battingSecond?.abbr===own;
  if(r.superOver)return won?'Held your nerve in the Super Over.':'The Super Over goes against you.';
  if(won)return chased?'The chase is complete.':r.marginText?.includes('run')?'The attack defends the total.':'The points are yours.';
  return chased?'The chase falls short.':'They get home against your attack.';
 };
 X.matchBeatCount=r=>r?.superOver?9:8;
 X.matchProgress=m=>m?.presentationVersion===2?m.count:(m?.count>=3?m.count+1:m?.count||0);
 X.inningsSpotlight=i=>{
  const bat=i.batting.filter(b=>!b.dnb).slice().sort((a,b)=>b.runs-a.runs||b.sixes-a.sixes)[0];
  const credited=i.bowling.filter(b=>b.wickets>0).slice().sort((a,b)=>b.wickets-a.wickets||a.economy-b.economy),bow=credited[0]||i.bowling.filter(b=>b.balls>=6).slice().sort((a,b)=>a.economy-b.economy||b.balls-a.balls)[0]||i.bowling[0];
  return `<div class="g8spotlights">${bat?`<article class="g8spotlight g8batspot"><span class="g8eyebrow">LED THE INNINGS</span><h3>${esc(bat.player.name)}</h3><strong>${bat.runs}${bat.dismissal==='not out'?'*':''}<small> from ${bat.balls} balls</small></strong><p>${bat.fours} fours · ${bat.sixes} sixes</p></article>`:''}${bow?`<article class="g8spotlight g8bowlspot"><span class="g8eyebrow">${bow.wickets?'BOWLING IMPACT':'TIGHTEST SPELL'}</span><h3>${esc(bow.player.name)}</h3><strong>${bow.wickets}/${bow.runs}<small> in ${Math.floor(bow.balls/6)}.${bow.balls%6} overs</small></strong><p>${esc([X.bowlingType(bow.player)==='Batting specialist'?'Emergency bowling option':X.bowlingType(bow.player),X.bowlingJob(bow.player)].filter(Boolean).join(' · '))}</p></article>`:''}</div>`;
 };
 X.matchBeat=(m,r)=>{
  const count=X.matchProgress(m);if(!count)return 'The players are ready.';if(count===9&&r?.superOver)return 'The Super Over decides it.';
  if(count===4||count===8)return 'The players behind the innings.';
  return ['Powerplay','Middle overs','Death overs'][(count-1)%4]+' in the book.';
 };
})();
/* Playback reads the causal delivery ledger; presentation never consumes cricket RNG. */
(()=>{
 const X=window.GCC8,{esc,btn,badge,G}=X,cache=new WeakMap();
 X.hasBallLog=r=>!!r&&[r.homeInnings,r.awayInnings].every(i=>i?.deliveryVersion===1&&Array.isArray(i.deliveries)&&i.deliveries.length);
 X.deliveryFrames=r=>{
  if(!X.hasBallLog(r))return [];if(cache.has(r))return cache.get(r);
  const frames=[];
  r.scorecard.innings.forEach((card,n)=>{
   const data=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings,target=n?r.scorecard.innings[0].total+1:null;
   frames.push({kind:'notice',type:'inningsStart',text:n?`${card.club.name} need ${target}.`:`${card.club.name} begin their innings. Four overs of opening powerplay.`,innings:n,logIndex:-1,target,club:card.club});
   const notices=data.notices||[],addNotices=after=>{for(const notice of notices.filter(v=>v.after===after))frames.push({...notice,kind:'notice',innings:n,logIndex:after-1,target,club:card.club});};
   addNotices(0);data.deliveries.forEach((event,index)=>{frames.push({kind:'ball',event,innings:n,logIndex:index,target,club:card.club});addNotices(index+1);});
  });
  for(const [roundIndex,round]of (r.superOver?.rounds||[]).entries())for(const [n,inn]of round.innings.entries()){
   const target=n?round.innings[0].total+1:null;let total=0,wickets=0,striker=0,nonStriker=1;
   frames.push({kind:'notice',type:'superOverStart',text:`Super Over ${roundIndex+1}. ${inn.club.name}${target?' need '+target: ' bat first'}.`,tie:true,club:inn.club,target,innings:2+roundIndex*2+n,logIndex:-1});
   for(const d of inn.deliveries){const partner=inn.batters[nonStriker]?.id;total+=d.runs;if(d.wicket){wickets++;if(wickets===1)striker=2;}else if(d.runs%2)[striker,nonStriker]=[nonStriker,striker];frames.push({kind:'ball',tie:true,club:inn.club,innings:2+roundIndex*2+n,target,logIndex:d.ball-1,event:{...d,over:1,legal:true,batRuns:d.runs,nonStrikerId:partner,bowlerId:inn.bowler.id,total,wickets,balls:d.ball,nextStrikerId:wickets<2?inn.batters[striker]?.id:null,nextNonStrikerId:wickets<2?inn.batters[nonStriker]?.id:null}});}
  }
  cache.set(r,frames);return frames;
 };
 const legacyCount=X.matchBeatCount,legacyBeat=X.matchBeat,legacyProgress=X.matchProgress;
 X.matchBeatCount=r=>X.hasBallLog(r)?X.deliveryFrames(r).length:legacyCount(r);
 X.matchProgress=m=>m?.presentationVersion===3?Math.max(0,Math.floor(Number(m.count)||0)):legacyProgress(m);
 X.matchBeat=(m,r)=>m?.presentationVersion===3?(X.deliveryFrames(r)[Math.max(0,X.matchProgress(m)-1)]?.text||'Every delivery counts.'):legacyBeat(m,r);
 X.matchDelay=(m,r)=>{if(m?.presentationVersion!==3)return [1500,750,375][m?.speedIndex||0];const next=X.deliveryFrames(r)[X.matchProgress(m)];return [700,350,175,88][m.speedIndex||0]*(next?.kind==='notice'?1.8:1);};
 X.ballReveal=()=>{
  const r=X.ui.result,m=X.ui.match,frames=X.deliveryFrames(r),count=Math.min(frames.length,X.matchProgress(m)),f=frames[Math.max(0,count-1)],n=f?.innings||0,card=r.scorecard.innings[Math.min(1,n)],data=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings;
  const log=f?.tie?frames.slice(0,count).filter(x=>x.tie&&x.innings===n&&x.event).map(x=>x.event):data.deliveries.slice(0,(f?.logIndex??-1)+1),last=log.at(-1),total=last?.total||0,wickets=last?.wickets||0,balls=last?.balls||0,batClub=f?.club||card.club;
  const overText=`${Math.floor(balls/6)}.${balls%6}`,phase=f?.tie?'SUPER OVER':f?.type==='inningsEnd'?'INNINGS COMPLETE':f?.type==='surgeEnd'?'SURGE COMPLETE':f?.type==='surgeStart'?'POWER SURGE':last?.surge?'POWER SURGE':balls<24?'OPENING POWERPLAY':balls<90?'MIDDLE OVERS':'DEATH OVERS';
  const stats=id=>{const a=log.filter(d=>d.batterId===id);return {runs:a.reduce((v,d)=>v+(d.batRuns??d.runs??0),0),balls:a.filter(d=>d.extra!=='wides').length};};
  const tieInn=f?.tie?r.superOver.rounds[Math.floor((n-2)/2)]?.innings[(n-2)%2]:null;
  const ids=[last?.nextStrikerId||last?.batterId||tieInn?.batters[0]?.id||card.batting[0]?.player.id,last?.nextNonStrikerId||last?.nonStrikerId||tieInn?.batters[1]?.id||card.batting[1]?.player.id].filter((id,i,a)=>id!=null&&a.indexOf(id)===i);
  const batterRows=ids.map((id,i)=>{const p=G.byId(id),s=stats(id);return `<div class="g8livebatter"><span>${esc(p?.name||'Batter')}${i===0&&wickets<(f?.tie?2:10)?' *':''}</span><b>${s.runs}<small> (${s.balls})</small></b></div>`;}).join('');
  const bowler=last?G.byId(last.bowlerId):null,bowlLog=log.filter(d=>d.bowlerId===last?.bowlerId),bowled=bowlLog.filter(d=>d.legal!==false).length,conceded=bowlLog.reduce((v,d)=>v+(d.batRuns??d.runs??0)+(['wides','noBalls'].includes(d.extra)?d.extraRuns:0),0),credited=bowlLog.filter(d=>d.wicket&&!d.dismissal?.startsWith('run out')).length;
  const name=G.byId(last?.batterId)?.name||'The batter',phrases=last?.batRuns===4?['Four! Finds the gap.','Driven away for four.','Beats the field. Four runs.']:last?.batRuns===6?['Six! Clears the rope.','Into the stands for six.','A clean strike. Six runs.']:last?.batRuns===0?['Dot ball. Pressure building.','No run. The field holds.','Good ball. Nothing added.']:['Working the gaps.','Keeps the scoreboard moving.','Runs taken between the wickets.'];
  const commentary=f?.kind==='notice'?f.text:last?.wicket?`${name}: ${last.dismissal||'out'}.`:last?.extra?`${last.extra==='wides'?'Wide':last.extra==='noBalls'?'No ball':last.extra==='byes'?'Byes':'Leg byes'} · ${last.runs} added.${last.extra==='noBalls'&&last.nextStrikerId!=null?' Free hit next.':''}`:last?`${name}. ${phrases[log.length%phrases.length]}`:'The players are ready.';
  const fixtureScore=c=>{if(c.abbr===batClub.abbr)return `${total}/${wickets}`;if(f?.tie){const first=r.superOver.rounds[Math.floor((n-2)/2)]?.innings[0];return n%2===1&&first?.club.abbr===c.abbr?`${first.total}/${first.wickets}`:'Yet to bat';}if(n>0){const complete=r.scorecard.innings[0];if(complete.club.abbr===c.abbr)return `${complete.total}/${complete.wickets}`;}return 'Yet to bat';};
  const target=f?.target,required=target?Math.max(0,target-total):null,remaining=Math.max(0,(f?.tie?6:120)-balls),inningsComplete=f?.type==='inningsEnd'||wickets>=(f?.tie?2:10)||remaining===0||target&&required===0;
  return X.heading(`${G.state.year} · ${r.round?'ROUND '+r.round:'FINALS'}`,'Live match','')+`<div class="g8decisionbar g8matchcontrols"><div><span class="g8eyebrow">${phase}</span><p>${m?.running?'Playing':'Paused'} · ${overText} overs</p></div><div class="g8actions">${btn(m?.running?'Pause':'Resume','matchRun',[],'g8primary')}${btn(`Speed ${[1,2,4,8][m?.speedIndex||0]}×`,'matchSpeed',[],'g8ghost')}${btn('Skip to result','matchSkip',[],'g8ghost')}</div></div><div class="g8livefixture"><span><b>${esc(r.home.abbr)}</b> · ${fixtureScore(r.home)} <small>HOME</small></span><span>v</span><span><b>${esc(r.away.abbr)}</b> · ${fixtureScore(r.away)} <small>AWAY</small></span></div><section class="g8ballarena"><div class="g8liveboard"><div class="g8inningsclub">${badge(batClub)}<h2>${esc(batClub.name)}</h2></div><div class="g8liveScore"><strong>${total}/${wickets}</strong><span>${overText} overs</span></div><p>${target?required===0?'Target reached.':inningsComplete?(required===1?'Scores level.':'The chase is over. Target not reached.'):`${required} needed from ${remaining} balls${remaining?' · Required rate '+(required*6/remaining).toFixed(2):''}`:inningsComplete?'The innings is complete.':'Setting the target.'}</p><div class="g8livebatters">${batterRows}</div><p class="g8livebowler">${bowler?`${esc(bowler.name)} · ${credited}/${conceded} (${Math.floor(bowled/6)}.${bowled%6})`:'The bowler is preparing.'}</p></div><div class="g8liveaction"><div class="g8liveground">${X.stadium(r.home)}</div><div class="g8ballmoment" role="status"><span class="g8eyebrow">${f?.kind==='notice'?'MATCH MOMENT':last?`${last.over-1}.${last.ball} · ${last.wicket?'WICKET':last.extra?'EXTRAS':last.batRuns===4?'FOUR':last.batRuns===6?'SIX':'LIVE BALL'}`:'READY TO PLAY'}</span><h2>${esc(commentary)}</h2></div><div class="g8balltrail" aria-label="Recent deliveries">${log.slice(-12).map(d=>`<span class="${d.wicket?'g8ballwicket':d.batRuns>=4?'g8ballboundary':''}" title="${d.over-1}.${d.ball}">${d.wicket?'W':d.extra==='wides'?'WD':d.extra==='noBalls'?'NB':d.extra==='byes'?'B':d.extra==='legByes'?'LB':d.runs===0?'·':d.runs}</span>`).join('')}</div><p class="g8fine">${f?.tie?'Six-ball tie-break.':'The captain chooses surge timing for both teams.'}</p></div></section>`;
 };
})();
