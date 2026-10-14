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
