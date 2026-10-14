/* Cricket reads derive from the existing model; hidden CPU career truth is not shown. */
(() => {
 const X=window.GCC8,{G,R,read,esc,btn,roster}=X,F=window.GCC8_FOUNDATION_READ,s=G.state;
 let cachedRoster='',cachedProfile=null;
 X.squadProfile=()=>{const ps=roster(),key=JSON.stringify(ps);if(key!==cachedRoster){cachedRoster=key;cachedProfile=F.projectedDraftProfile(ps);}return cachedProfile||R.profile([]);};
 const stat=(l,v)=>`<div class="g8statrow"><span>${esc(l)}</span><b>${esc(v)}</b></div>`;
 X.playerRead=p=>{
  const scout=read.scout(p.id),tags=F.roleTags(p).filter(t=>!t.includes('LOWER MIDDLE')),style=R.bowlingStyle(p),work=R.bowlingWorkload(p),conf=String(p.ratingConfidenceBand||'MEDIUM').toLowerCase();
  return `<div class="g8playerdetail"><p>${esc(F.playerNote(p))}.</p><div class="g8tags">${tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${stat('Career outlook',scout?.outlook||'Still being assessed')}${stat('Scouting confidence',conf)}${stat('Bowling style',style||'Batting specialist')}${stat('Credible bowling ceiling',work?`${work} overs`:'Not a regular option')}${stat('Batting against pace / spin',`${p.pacePlay} / ${p.spinPlay}`)}${stat('Power / control',`${p.power} / ${p.control}`)}${stat('Running / finishing',`${p.running} / ${p.finishing}`)}${stat('Bowling control / variation',`${p.bowlControl} / ${p.variation}`)}${stat('Temperament / leadership',`${p.temperament} / ${p.leadership}`)}${stat('Contract decision',s.dynasty?.offseason?(scout?.contractDue?'Due this offseason':'Not due this offseason'):'Offseason decisions come after the season')}${scout?.recent?`<p>Recent GCC record: ${esc(scout.recent)}</p>`:''}<p class="g8fine">Outlook is a scouting judgement. It does not reveal a guaranteed peak or retirement date.</p></div>`;
 };
 X.teamRead=(squad=false)=>{
  const p=squad?X.squadProfile():X.profile(),ps=squad?roster():s.xi.map(G.byId).filter(Boolean),keeper=ps.slice().sort((a,b)=>b.keeping-a.keeping)[0],partial=!squad&&ps.length<11;
  const note=partial?'Name all eleven before judging the side.':p.roleFit<84?'Several batting jobs sit outside these players’ natural roles.':p.battingResources<65?'Early wickets could expose a thin batting order.':p.attackShape<76?'The bowling quality is not evenly shared between the new ball, middle and death.':p.keeping<65?'There is no recognised keeper. Expect this to cost runs behind the stumps.':p.death<70?'Late-innings bowling is the clearest pressure point.':'The side has options across the innings. Conditions and execution still matter.';
  return `<section class="g8teamread"><span class="g8eyebrow">${squad?'THE SIDE TAKING SHAPE':'YOUR XI'}${squad&&ps.length<11?' · PARTIAL SQUAD':squad?' · PROJECTED XI':''}</span><div class="g8summarytiles">${[['Ability',partial?'–':Math.round(p.overall)],['Keeping',keeper?.keeping>=65?keeper.name:'No recognised keeper'],['Bowling cover',`${p.trustedOversCapacity||0} trusted overs`],['Role fit',partial?'–':Math.round(p.roleFit)]].map(([l,v])=>`<div><small>${esc(l)}</small><b>${esc(v)}</b></div>`).join('')}</div><p>${esc(note)}</p><div class="g8reads">${X.phases.map(([k,l])=>btn(`${l} · ${Math.round(p[k]||0)}`,'rating',[k,squad],'g8read')).join('')}</div>${squad?'<p class="g8fine">Projected combinations help you scout. You still choose the match XI manually.</p>':''}</section>`;
 };
 X.groundDetail=c=>{
  if(!c)return '';const w=c.weather,conditions=c.conditions||{};
  return `<div class="g8pitchread">${[['Pace & carry','pace'],['Spin & grip','spin'],['Boundary','boundary']].map(([label,k])=>stat(label,F.groundBand(conditions[k]||0,k).label)).join('')}<p>${esc(F.groundStory(c))}</p>${w?`<p><b>${esc(w.label)}.</b> ${esc(w.read)}</p>`:''}</div>`;
 };
 X.matchRead=fx=>{
  if(!fx)return '';const home=G.matchGroundForFixture(fx),op=fx.home.abbr===s.userClub.abbr?fx.away:fx.home,mine=F.effectiveProfile(s.userClub),theirs=F.effectiveProfile(op);
  const rows=[['Your powerplay batting',mine.powerplayBat,theirs.newBall],['Your middle-overs batting',mine.middleBat,theirs.middleBowl],['Your death batting',mine.finishing,theirs.death],['Your new-ball attack',mine.newBall,theirs.powerplayBat],['Your middle-overs attack',mine.middleBowl,theirs.middleBat],['Your death attack',mine.death,theirs.finishing]];
  return `<section class="g8matchread"><span class="g8eyebrow">THE CRICKET MATCHUP</span>${rows.map(([l,a,b])=>stat(l,Math.abs(a-b)<4?'Evenly matched':a>b?'Your stronger phase':'Opposition stronger')).join('')}<p class="g8fine">These compare XI ability, not win probabilities. ${esc(home.weather.read)}</p></section>`;
 };
 X.resultRead=r=>{
  if(!r)return '';const mine=r.home.abbr===s.userClub.abbr?r.homeInnings:r.awayInnings,theirs=r.home.abbr===s.userClub.abbr?r.awayInnings:r.homeInnings,star=F.standout(r);
  return `<section class="g8sheet g8resultread"><span class="g8eyebrow">WHERE THE INNINGS TURNED</span><div class="g8phasecards">${[['Powerplay','pp'],['Middle overs','mid'],['Death','death']].map(([l,k])=>`<div><small>${l}</small><b>${mine[k]} <span>v</span> ${theirs[k]}</b><p>${mine[k]>theirs[k]?'You scored more in this phase.':mine[k]<theirs[k]?'They scored more in this phase.':'Level scoring in this phase.'}</p></div>`).join('')}</div><p class="g8fine">Chases can finish early, so phase totals do not always cover the same number of balls.</p>${star?`<p><b>${esc(star.player.name)}</b> · ${esc(star.line)}</p>`:''}${r.weather?`<p>${esc(r.weather.label)} · ${esc(r.weather.read)}</p>`:''}</section>`;
 };
 X.seasonRead=()=>{
  const a=F.teamAverages(),l=F.leagueAverages();if(!a?.matches)return '<p class="g8fine">The first matches will start to show how this XI plays.</p>';
  return `<section class="g8sheet g8seasonread"><span class="g8eyebrow">${a.matches} MATCHES · THE SIDE IN PRACTICE</span><div class="g8summarytiles">${[['Average score',a.avgScore.toFixed(1)],['Scoring rate',a.runRate.toFixed(2)],['Average conceded',a.avgConceded.toFixed(1)],['Economy',a.economy.toFixed(2)]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div><p>${a.avgWicketsTaken.toFixed(1)} wickets taken and ${a.avgWicketsLost.toFixed(1)} wickets lost per match.</p>${l?`<p class="g8fine">Across the scorebooks available here: ${l.avgScore.toFixed(1)} runs per innings. These are your match scorebooks, not every match in the league.</p>`:''}</section>`;
 };
 X.revealControls=(kind,count,label,action)=>`<div class="g8decisionbar g8revealbar g8drawcontrols"><div><span class="g8eyebrow">${kind==='league'?'THE CLUBS':'THE DRAFT ORDER'}</span><p>${count} of 8 revealed · ${count===8?'Draw complete':uiState()}</p></div><div class="g8actions">${count<8?btn(X.ui.reveal?.running?'Pause reveal':'Resume reveal','revealRun',[],'g8ghost'):''}${count<8?btn(`Speed ${[1,2,4][X.ui.reveal?.speedIndex||0]}×`,'revealSpeed',[],'g8ghost'):''}${count<8?btn('Reveal all','revealAll',[],'g8ghost'):btn(label,action,[],'g8primary')}</div></div>`;
 const uiState=()=>X.ui.reveal?.running?'Next name coming up':'Paused';
})();
(() => {
 const X=window.GCC8,{G,esc}=X,s=G.state;
 X.leaders=()=>{
  const rows=Object.entries(s.playerSeasonStats).map(([id,t])=>({p:G.byId(Number(id)),t})).filter(x=>x.p&&x.t.matches),runs=rows.slice().sort((a,b)=>b.t.runs-a.t.runs).slice(0,10),wickets=rows.filter(x=>x.t.bowlBalls).sort((a,b)=>b.t.wickets-a.t.wickets||a.t.runsConceded/a.t.bowlBalls-b.t.runsConceded/b.t.bowlBalls).slice(0,10);
  const table=(title,list,bat)=>`<section class="g8sheet g8tablewrap"><table class="g8table"><caption>${title}</caption><thead><tr><th>Player</th><th>M</th><th>${bat?'Runs':'Wickets'}</th><th>${bat?'SR':'Economy'}</th></tr></thead><tbody>${list.map(({p,t})=>`<tr><td>${esc(p.name)}</td><td>${t.matches}</td><td>${bat?t.runs:t.wickets}</td><td>${bat?(t.balls?t.runs*100/t.balls:0).toFixed(1):(t.bowlBalls?t.runsConceded*6/t.bowlBalls:0).toFixed(2)}</td></tr>`).join('')}</tbody></table></section>`;
  return `<div class="g8finals">${table('Leading runs',runs,true)}${table('Leading wickets',wickets,false)}</div>`;
 };
 const simple=X.averages;
 // Installed after screens.js by controller boot: full batting/bowling records support the compact averages.
 X.installDetailedAverages=()=>{const compact=X.averages;X.averages=()=>compact()+`<section class="g8sheet g8seasonread g8tablewrap"><span class="g8eyebrow">THE FULL PLAYER RECORD</span><table class="g8table"><thead><tr><th>Player</th><th>High score</th><th>4s</th><th>6s</th><th>Bowling avg</th><th>Best bowling</th></tr></thead><tbody>${X.roster().map(p=>{const t=s.playerSeasonStats[p.id]||{};return `<tr><td>${esc(p.name)}</td><td>${t.bestRuns||0}</td><td>${t.fours||0}</td><td>${t.sixes||0}</td><td>${t.wickets?(t.runsConceded/t.wickets).toFixed(1):'–'}</td><td>${t.bowlBalls?`${t.bestWickets||0}/${t.bestBowlingRuns??'–'}`:'–'}</td></tr>`;}).join('')}</tbody></table></section>`;};
})();
(() => {
 const X=window.GCC8,{G,R,read,esc}=X;
 X.phaseOptions=(key,squad=false)=>{
  const ps=squad?X.roster():G.state.xi.map(G.byId).filter(Boolean),scorers={powerplayBat:p=>R.batPhaseScore(p,'powerplay'),middleBat:p=>R.batPhaseScore(p,'middle'),finishing:p=>R.batPhaseScore(p,'death'),newBall:p=>R.bowlPhaseScore(p,'newBall'),middleBowl:p=>R.bowlPhaseScore(p,'middle'),death:p=>R.bowlPhaseScore(p,'death'),fielding:p=>p.fielding,keeping:p=>p.keeping};
  const fn=scorers[key];if(!fn)return '';
  const bowling=['newBall','middleBowl','death'].includes(key),options=ps.filter(p=>!bowling||R.bowlingWorkload(p)>0).map(p=>({p,score:fn(p)})).sort((a,b)=>b.score-a.score).slice(0,3);
  return `<div class="g8phaseoptions"><span class="g8eyebrow">LEADING OPTIONS · ${squad?'SQUAD':'XI'}</span>${options.map(({p,score})=>`<div class="g8statrow"><b>${esc(p.name)}</b><span>${Math.round(score)}</span></div>`).join('')}<p class="g8fine">Individual ability in this phase. Team roles, conditions and workload still affect the match.</p></div>`;
 };
 X.historyRead=()=>{
  const r=read.records(),honours=read.honours(),legends=read.legends();
  const record=(label,p,value)=>`<div class="g8statrow"><span>${label}</span><div><b>${esc(p?.name||'No record yet')}</b><small> ${esc(value)}</small></div></div>`;
  return `<div class="g8finals g8seasonread"><section class="g8sheet"><span class="g8eyebrow">THE LEAGUE RECORD BOOK</span>${record('Career runs',r.careerRuns,r.careerRuns?.runs||0)}${record('Career wickets',r.careerWickets,r.careerWickets?.wickets||0)}${record('Career sixes',r.careerSixes,r.careerSixes?.sixes||0)}${record('Most matches',r.careerMatches,r.careerMatches?.matches||0)}${record('Highest score',r.highScore,r.highScore?.st?.bestRuns||0)}${record('Best bowling',r.bestBowling,r.bestBowling?`${r.bestBowling.st.bestWickets}/${r.bestBowling.st.bestBowlingRuns}`:'–')}${record('Most runs in a season',r.seasonRuns,r.seasonRuns?.st?.runs||0)}${record('Most wickets in a season',r.seasonWickets,r.seasonWickets?.st?.wickets||0)}</section><section class="g8sheet"><span class="g8eyebrow">THE CLUB LEGENDS</span>${legends.slice(0,5).map(p=>`<div class="g8statrow"><b>${esc(p.name)}</b><span>${p.seasons} seasons · ${p.runs} runs · ${p.wickets} wickets</span></div>`).join('')}<span class="g8eyebrow">LEAGUE HONOURS</span>${honours.map(c=>`<div class="g8statrow"><b>${esc(c.name)}</b><span>${c.titles} titles · ${c.wins} wins</span></div>`).join('')}</section></div>`;
 };
})();
(() => {
 const X=window.GCC8;
 X.bowlingChanges=(r,card)=>{
  const innings=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings,plan=innings.bowlingPlan||[],used=plan.slice(0,Math.ceil(card.balls/6));if(!used.length)return '';
  return `<details class="g8moredata"><summary>The bowling changes</summary><p class="g8fine">The model’s over-by-over bowling allocation. The final over may be incomplete when the innings ends.</p><div class="g8overplan">${used.map((id,i)=>`<div><small>OVER ${i+1} · ${i<6?'POWERPLAY':i<15?'MIDDLE':'DEATH'}</small><b>${X.esc(X.G.byId(id)?.name||'Bowler')}</b></div>`).join('')}</div></details>`;
 };
})();
