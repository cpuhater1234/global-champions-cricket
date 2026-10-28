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
 X.overRows=log=>{
  const rows=[];for(const d of log){let row=rows.at(-1);if(!row||row.over!==d.over){row={over:d.over,events:[],runs:0,wickets:0,legal:0,total:0,lost:0};rows.push(row);}row.events.push(d);row.runs+=Number(d.runs||0);row.wickets+=Number(!!d.wicket);row.legal+=d.legal===false?0:1;row.total=d.total;row.lost=d.wickets;}return rows;
 };
 X.overFeed=log=>{
  const rows=X.overRows(log),render=row=>`<article class="g8overrow" data-over="${row.over}"><header><h3>Over ${row.over}</h3><span>${row.runs} ${row.runs===1?'run':'runs'}${row.wickets?` · ${row.wickets} ${row.wickets===1?'wicket':'wickets'}`:''}</span><strong>${row.total}/${row.lost}</strong></header><div class="g8overdeliveries" aria-label="Deliveries in over ${row.over}">${row.events.map(d=>{const extra=d.extra==='wides'?'WD':d.extra==='noBalls'?'NB':d.extra==='byes'?'B':d.extra==='legByes'?'LB':null,label=d.wicket?(d.runs?'W+'+d.runs:'W'):extra?extra+' '+d.runs:d.runs===0?'·':d.runs;return `<span class="${d.wicket?'g8ballwicket':d.batRuns>=4?'g8ballboundary':''}" aria-label="${d.over-1}.${d.ball}: ${d.wicket?'wicket, ':''}${d.runs} runs${extra?', '+extra:''}${d.legal===false?', not a legal ball':''}">${label}</span>`;}).join('')}</div><footer>${row.legal===6?'Over complete':`${row.legal} of 6 legal balls`}</footer></article>`;
  return `<section class="g8overfeed" aria-label="Innings over-by-over feed"><h2>Over by over <small>Latest first</small></h2>${rows.slice(-4).reverse().map(render).join('')||'<p>The first over is about to begin.</p>'}${rows.length>4?`<details class="g8earlierovers"><summary>Earlier overs · ${rows.length-4}</summary>${rows.slice(0,-4).reverse().map(render).join('')}</details>`:''}</section>`;
 };
 X.matchMoment=(frames,count)=>{
  for(let i=Math.min(count,frames.length)-1;i>=0;i--){const f=frames[i],d=f.event;if(f.kind==='notice'&&f.type!=='overEnd')return {label:'Match moment',text:f.text};if(!d||!d.wicket&&d.batRuns!==4&&d.batRuns!==6&&d.extra!=='noBalls')continue;const name=G.byId(d.batterId)?.name||'Batter',tag=d.wicket?'Wicket':d.batRuns===6?'Six':d.batRuns===4?'Four':'No ball',text=d.wicket?`${name}: ${d.dismissal||'out'}.`:d.extra==='noBalls'?`No ball.${d.nextStrikerId!=null?' Free hit next.':''}`:`${name} · ${d.batRuns} runs.`;return {label:`${d.over-1}.${d.ball} · ${tag}`,text};}
  return null;
 };
 X.ballReveal=()=>{
  const r=X.ui.result,m=X.ui.match,frames=X.deliveryFrames(r),count=Math.min(frames.length,X.matchProgress(m)),f=frames[Math.max(0,count-1)],n=f?.innings||0,card=r.scorecard.innings[Math.min(1,n)],data=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings;
  const log=f?.tie?frames.slice(0,count).filter(x=>x.tie&&x.innings===n&&x.event).map(x=>x.event):data.deliveries.slice(0,(f?.logIndex??-1)+1),last=log.at(-1),total=last?.total||0,wickets=last?.wickets||0,balls=last?.balls||0,batClub=f?.club||card.club;
  const overText=`${Math.floor(balls/6)}.${balls%6}`,phase=f?.tie?'SUPER OVER':f?.type==='inningsEnd'?'INNINGS COMPLETE':f?.type==='surgeEnd'?'SURGE COMPLETE':f?.type==='surgeStart'?'POWER SURGE':last?.surge?'POWER SURGE':balls<24?'OPENING POWERPLAY':balls<90?'MIDDLE OVERS':'DEATH OVERS';
  const stats=id=>{const a=log.filter(d=>d.batterId===id);return {runs:a.reduce((v,d)=>v+(d.batRuns??d.runs??0),0),balls:a.filter(d=>d.extra!=='wides').length};};
  const tieInn=f?.tie?r.superOver.rounds[Math.floor((n-2)/2)]?.innings[(n-2)%2]:null;
  const ids=[last?.nextStrikerId||last?.batterId||tieInn?.batters[0]?.id||card.batting[0]?.player.id,last?.nextNonStrikerId||last?.nonStrikerId||tieInn?.batters[1]?.id||card.batting[1]?.player.id].filter((id,i,a)=>id!=null&&a.indexOf(id)===i);
  const batterRows=ids.map((id,i)=>{const p=G.byId(id),s=stats(id);return `<div class="g8livebatter"><span>${esc(p?.name||'Batter')}${i===0&&wickets<(f?.tie?2:10)?' *':''}</span><b>${s.runs}<small> (${s.balls})</small></b></div>`;}).join('');
  const bowler=last?G.byId(last.bowlerId):null,bowlLog=log.filter(d=>d.bowlerId===last?.bowlerId),bowled=bowlLog.filter(d=>d.legal!==false).length,conceded=bowlLog.reduce((v,d)=>v+(d.batRuns??d.runs??0)+(['wides','noBalls'].includes(d.extra)?d.extraRuns:0),0),credited=bowlLog.filter(d=>d.wicket&&!d.dismissal?.startsWith('run out')).length;
  const moment=X.matchMoment(frames,count);
  const fixtureScore=c=>{if(c.abbr===batClub.abbr)return `${total}/${wickets}`;if(f?.tie){const first=r.superOver.rounds[Math.floor((n-2)/2)]?.innings[0];return n%2===1&&first?.club.abbr===c.abbr?`${first.total}/${first.wickets}`:'Yet to bat';}if(n>0){const complete=r.scorecard.innings[0];if(complete.club.abbr===c.abbr)return `${complete.total}/${complete.wickets}`;}return 'Yet to bat';};
  const target=f?.target,required=target?Math.max(0,target-total):null,remaining=Math.max(0,(f?.tie?6:120)-balls),inningsComplete=f?.type==='inningsEnd'||wickets>=(f?.tie?2:10)||remaining===0||target&&required===0;
  const scoreContext=target?required===0?'Target reached.':inningsComplete?(required===1?'Scores level.':'The chase is over. Target not reached.'):`${required} needed from ${remaining} balls${remaining?' · Required rate '+(required*6/remaining).toFixed(2):''}`:inningsComplete?'The innings is complete.':'Setting the target.';
  const activeOver=X.overRows(log).at(-1),tag=f?.kind==='notice'?'LIVE':last?.wicket?'W':last?.batRuns===6?'6':last?.batRuns===4?'4':last?.extra?last.extra==='wides'?'WD':last.extra==='noBalls'?'NB':'EX':last?String(last.runs):'READY',tone=f?.kind==='notice'?'normal':last?.wicket?'wicket':last?.batRuns===6?'six':last?.batRuns===4?'four':'normal';
  const currentText=f?.kind==='notice'?f.text:last?`${G.byId(last.bowlerId)?.name||'Bowler'} to ${G.byId(last.batterId)?.name||'batter'}: ${last.wicket?last.dismissal||'out':last.extra?last.runs+' extras':last.runs===0?'dot ball':last.runs+' runs'}.`:'The players are ready.';
  const opposition=batClub.abbr===r.home.abbr?r.away:r.home;
  return `<section class="g8ballarena gcc-broadcast"><header class="gcc-scorebug"><div><span class="g8eyebrow">${phase}</span><h2>${badge(batClub)}${esc(batClub.name)}</h2><span class="gcc-opposition">v ${esc(opposition.name)} · ${fixtureScore(opposition)}</span></div><div class="gcc-total"><strong>${total}/${wickets}</strong><span>${overText} overs · CRR ${balls?(total*6/balls).toFixed(2):'0.00'}</span></div><p class="gcc-equation">${esc(scoreContext)}</p></header><div class="g8playbackcontrols"><span>${m?.running?'● Playing':'Ⅱ Paused'}</span><div class="g8actions">${btn(m?.running?'Pause':'Resume','matchRun',[],'g8primary')}${btn(`Speed ${[1,2,4,8][m?.speedIndex||0]}×`,'matchSpeed',[],'g8ghost')}${btn('Skip to result','matchSkip',[],'g8ghost')}</div></div><div class="gcc-livegrid"><section class="gcc-delivery"><div class="gcc-moment gcc-${tone}" data-key="delivery-${n}-${count}" role="status" aria-atomic="true"><span class="g8liveread gcc-sr">${esc(batClub.name)}: ${total} for ${wickets} after ${overText} overs. ${esc(scoreContext)}</span><strong class="gcc-event ${tag.length>2?'gcc-word':''}" aria-hidden="true">${tag}</strong><div><span class="g8eyebrow">${f?.kind==='notice'?'MATCH UPDATE':last?`${last.over-1}.${last.ball} · LATEST DELIVERY`:'AT THE CREASE'}</span><h2>${esc(currentText)}</h2></div></div><div class="gcc-currentover"><h3>This over${activeOver?' · '+activeOver.over:''}</h3><div>${activeOver?activeOver.events.map(d=>`<span class="${d.wicket?'gcc-wicket':d.batRuns===6?'gcc-six':d.batRuns===4?'gcc-four':''}">${d.wicket?'W':d.extra==='wides'?'WD':d.extra==='noBalls'?'NB':d.runs||'·'}</span>`).join(''):'<p>Waiting for the first ball.</p>'}</div></div></section><section class="gcc-crease"><h2>${inningsComplete?'At innings close':'In the middle'}</h2><table><thead><tr><th>Batter</th><th>R</th><th>B</th><th>SR</th></tr></thead><tbody>${ids.map((id,i)=>{const p=G.byId(id),b=stats(id);return `<tr><th>${esc(p?.name||'Batter')}${i===0&&!inningsComplete?' *':''}</th><td><b>${b.runs}</b></td><td>${b.balls}</td><td>${b.balls?(b.runs*100/b.balls).toFixed(0):'–'}</td></tr>`;}).join('')}</tbody></table><div class="gcc-bowler"><span class="g8eyebrow">BOWLING</span><h3>${esc(bowler?.name||'Bowler preparing')}</h3><strong>${credited}/${conceded} <small>(${Math.floor(bowled/6)}.${bowled%6})</small></strong></div><p class="g8fine">${esc(r.home.ground)}</p></section></div>${activeOver&&log.some(d=>d.over!==activeOver.over)?`<div class="gcc-history">${X.overFeed(log.filter(d=>d.over!==activeOver.over))}</div>`:''}</section>`;
 };
})();

/* Presentation-only match reporting. Reads completed scorecards; never consumes RNG. */
(()=>{
 const X=window.GCC8,{esc}=X,overs=b=>`${Math.floor(b/6)}.${b%6}`;
 X.awardsData=r=>{
  const innings=r?.scorecard?.innings||[],bat=innings.flatMap(i=>i.batting.filter(b=>!b.dnb).map(b=>({...b,club:i.club}))),bowl=innings.flatMap(i=>i.bowling.map(b=>({...b,club:innings.find(j=>j!==i)?.club}))),sr=b=>b.balls?b.runs*100/b.balls:0;
  const bestBat=bat.slice().sort((a,b)=>b.runs-a.runs||sr(b)-sr(a)||a.player.id-b.player.id)[0];
  const bestBowl=bowl.filter(b=>b.balls>0).sort((a,b)=>b.wickets-a.wickets||a.runs-b.runs||b.balls-a.balls||a.player.id-b.player.id)[0];
  const players=new Map();for(const b of bat)players.set(b.player.id,{player:b.player,club:b.club,bat:b,score:b.runs+(b.runs>=20?Math.min(15,Math.max(0,(sr(b)-100)/5)):0)});
  for(const b of bowl){let p=players.get(b.player.id);if(!p){p={player:b.player,club:b.club,score:0};players.set(b.player.id,p);}p.bowl=b;p.score+=b.wickets*25+(b.balls>=12?Math.min(15,Math.max(0,(8-b.runs*6/b.balls)*3)):0);}
  const mom=[...players.values()].sort((a,b)=>(b.score+(b.club?.abbr===r.winner?.abbr?5:0))-(a.score+(a.club?.abbr===r.winner?.abbr?5:0))||a.player.id-b.player.id)[0];
  return {bestBat,bestBowl,mom};
 };
 X.matchAwards=r=>{const a=X.awardsData(r),bat=b=>`${b.runs}${b.dismissal==='not out'?'*':''} <small>(${b.balls})</small>`,bowl=b=>`${b.wickets}/${b.runs} <small>${overs(b.balls)} overs</small>`;return `<section class="gcc-awards" aria-label="Match awards">${[['Man of the Match','trophy',a.mom?.player,a.mom?[a.mom.bat?bat(a.mom.bat):'',a.mom.bowl?bowl(a.mom.bowl):''].filter(Boolean).join(' · '):''],['Best batting','cricket',a.bestBat?.player,a.bestBat?bat(a.bestBat):''],['Best bowling','cricket-ball',a.bestBowl?.player,a.bestBowl?bowl(a.bestBowl):'']].map(([label,icon,p,fig],i)=>`<article class="gcc-award gcc-award-${i}"><span class="g8eyebrow">${X.icon(icon)}${label}</span><h2>${esc(p?.name||'Not available')}</h2><strong>${fig}</strong></article>`).join('')}</section>`;};
 X.wormData=r=>(r?.scorecard?.innings||[]).map(i=>{const inn=i.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings;return {club:i.club,points:inn?.deliveryVersion===1&&inn.deliveries?.length?[{balls:0,runs:0},...inn.deliveries.map(d=>({balls:d.balls,runs:d.total,wicket:!!d.wicket}))]:null};});
 X.matchWorm=r=>{const data=X.wormData(r);if(data.length!==2||data.some(d=>!d.points))return '<section class="gcc-worm"><h2>Match worm</h2><p>Delivery detail is unavailable for this older match.</p></section>';const maxRun=Math.max(50,Math.ceil(Math.max(...data.flatMap(d=>d.points.map(p=>p.runs)))/50)*50),maxBall=Math.max(30,Math.ceil(Math.max(...data.flatMap(d=>d.points.map(p=>p.balls)))/30)*30),px=b=>48+b/maxBall*680,py=v=>218-v/maxRun*190;
  return `<section class="gcc-worm"><header><h2>Match worm</h2><div class="gcc-wormlegend">${data.map((d,i)=>`<span><i style="border-color:${esc(d.club.c)};border-top-style:${i?'dashed':'solid'}"></i>${esc(d.club.name)}</span>`).join('')}</div></header><svg viewBox="0 0 760 260" role="img" aria-label="Cumulative runs for ${esc(data.map(d=>d.club.name).join(' and '))}. Wicket markers shown on each line.">${Array.from({length:maxRun/50+1},(_,i)=>`<line x1="48" x2="728" y1="${py(i*50)}" y2="${py(i*50)}" stroke="#46505a"/><text x="36" y="${py(i*50)+4}" text-anchor="end">${i*50}</text>`).join('')}${Array.from({length:maxBall/30+1},(_,i)=>`<text x="${px(i*30)}" y="242" text-anchor="middle">${i*5}</text>`).join('')}<text x="730" y="257" text-anchor="end">Overs</text>${data.map((d,i)=>{const path=d.points.map(p=>`${px(p.balls)},${py(p.runs)}`).join(' '),dash=i?'stroke-dasharray="11 6"':'';return `<polyline points="${path}" fill="none" stroke="#fff" stroke-width="6" ${dash}/><polyline class="gcc-wormline" points="${path}" fill="none" stroke="${esc(d.club.c)}" stroke-width="3" ${dash}/>${d.points.filter(p=>p.wicket).map(p=>`<circle cx="${px(p.balls)}" cy="${py(p.runs)}" r="4" fill="${esc(d.club.c)}" stroke="white"><title>${esc(d.club.name)} wicket at ${p.runs}, ${overs(p.balls)} overs</title></circle>`).join('')}`;}).join('')}</svg></section>`;
 };
 X.fowData=(r,i)=>{const inn=i.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings;if(inn?.deliveryVersion!==1||!inn.deliveries)return null;return inn.deliveries.filter(d=>d.wicket).map(d=>({wicket:d.wickets,runs:d.total,balls:d.balls}));};
 X.matchScorecard=r=>r.scorecard.innings.map(i=>{const rows=i.batting.filter(b=>!b.dnb),dnb=i.batting.filter(b=>b.dnb),fow=X.fowData(r,i);return `<section class="gcc-scoreinnings"><header><h2>${esc(i.club.name)}</h2><strong>${i.total}/${i.wickets} <small>(${i.overs} overs)</small></strong></header><div class="g8tablewrap"><table class="g8table gcc-batting"><caption>Batting</caption><thead><tr><th scope="col">Batter</th>${['R','B','4','6','SR'].map(v=>`<th scope="col">${v}</th>`).join('')}</tr></thead><tbody>${rows.map(b=>`<tr><th scope="row">${esc(b.player.name)}<small>${esc(b.dismissal)}</small></th><td><b>${b.runs}</b></td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${b.balls?(b.runs*100/b.balls).toFixed(1):'–'}</td></tr>`).join('')}</tbody></table></div><p class="gcc-extras">Extras <b>${i.extras}</b>${dnb.length?' · Did not bat: '+dnb.map(b=>esc(b.player.name)).join(', '):''}</p><div class="gcc-fow"><h3>Fall of wickets</h3><p>${fow===null?'Delivery detail unavailable for this older match.':fow.length?fow.map(w=>`<span>${w.wicket}–${w.runs} <small>(${overs(w.balls)})</small></span>`).join(' '):'No wickets fell.'}</p></div><div class="g8tablewrap"><table class="g8table"><caption>Bowling</caption><thead><tr>${['Bowler','O','R','W','Econ'].map(v=>`<th scope="col">${v}</th>`).join('')}</tr></thead><tbody>${i.bowling.map(b=>`<tr><th scope="row">${esc(b.player.name)}</th><td>${overs(b.balls)}</td><td>${b.runs}</td><td><b>${b.wickets}</b></td><td>${b.balls?(b.runs*6/b.balls).toFixed(2):'–'}</td></tr>`).join('')}</tbody></table></div></section>`;}).join('')+X.superOverRead(r);
})();
