/* Cricket reads derive from the existing model; hidden CPU career truth is not shown. */
(() => {
 const X=window.GCC8,{G,R,read,esc,btn,roster}=X,F=window.GCC8_FOUNDATION_READ,s=G.state;
 let cachedRoster='',cachedProfile=null;
 X.squadProfile=()=>{const ps=roster().filter(p=>G.state.dynasty?.injuries?.[p.id]?.status!=='OUT'),key=JSON.stringify([ps,ps.map(p=>s.dynasty?.injuries?.[p.id]?.status||null)]);if(key!==cachedRoster){cachedRoster=key;cachedProfile=read.squadProfile(ps);}return cachedProfile||R.profile([]);};
 const stat=(l,v)=>`<div class="g8statrow"><span>${esc(l)}</span><b>${esc(v)}</b></div>`;
 X.clubSeasonRecords=()=>{
  const rows=new Map(),entry=p=>{if(!rows.has(p.id))rows.set(p.id,{p,t:{matches:0,innings:0,runs:0,balls:0,outs:0,fours:0,sixes:0,wickets:0,bowlBalls:0,runsConceded:0,bestRuns:0,bestWickets:0,bestBowlingRuns:null}});return rows.get(p.id).t;};
  roster().forEach(entry);
  const matches=[...s.results,...(s.finals?.semis||[]),s.finals?.gf].filter(r=>r?.scorecard&&[r.home.abbr,r.away.abbr].includes(s.userClub.abbr));
  for(const r of matches){const mine=r.scorecard.innings.find(i=>i.club.abbr===s.userClub.abbr),theirs=r.scorecard.innings.find(i=>i.club.abbr!==s.userClub.abbr);if(!mine||!theirs)continue;
   for(const b of mine.batting){const t=entry(G.byId(b.player.id)||b.player);t.matches++;if(!b.dnb){t.innings++;t.runs+=b.runs;t.balls+=b.balls;t.outs+=b.dismissal==='not out'?0:1;t.fours+=b.fours;t.sixes+=b.sixes;t.bestRuns=Math.max(t.bestRuns,b.runs);}}
   for(const b of theirs.bowling){const t=entry(G.byId(b.player.id)||b.player);t.wickets+=b.wickets;t.bowlBalls+=b.balls;t.runsConceded+=b.runs;if(t.bestBowlingRuns==null||b.wickets>t.bestWickets||b.wickets===t.bestWickets&&b.runs<t.bestBowlingRuns){t.bestWickets=b.wickets;t.bestBowlingRuns=b.runs;}}
  }
  return [...rows.values()];
 };
 X.bowlingRole=p=>{
  if(!R.bowlingWorkload(p)||!R.bowlingStyle(p))return 'Batting specialist';
  const usage=R.bowlingUsagePrior(p);return usage>=3?'Frontline bowler':usage>=1.5?'Supporting bowler':usage>0?'Part-time option':'Occasional option';
 };
 X.playerRecord=p=>{
  const current=s.playerSeasonStats?.[p.id],history=[...(s.dynasty?.history||[])].sort((a,b)=>b.year-a.year).find(h=>Number(h.playerStats?.[p.id]?.matches)>0),record=Number(current?.matches)>0?{year:s.year,stats:current}:history?{year:history.year,stats:history.playerStats[p.id]}:null;
  return `<section class="g8gccrecord"><h3>${X.icon('cricket-ball')}GCC record</h3>${record?`<span class="g8recordyear">${record.year} season</span><div class="g8recordstats">${[['Matches',record.stats.matches],['Runs',record.stats.runs],['Wickets',record.stats.wickets]].map(([label,n])=>`<div><strong>${Number(n||0)}</strong><span>${label}</span></div>`).join('')}</div>`:'<p class="g8recordempty">No GCC appearances recorded.</p>'}</section>`;
 };
 X.playerPhases=p=>{
  const group=(title,icon,values)=>`<section><h3>${X.icon(icon)}${title}</h3><div>${values.map(([label,n])=>`<div class="g8phasetile"><span>${label}</span><strong style="--rating-color:${X.ratingTone(n)}">${Math.round(n)}</strong></div>`).join('')}</div></section>`;
  const batting=[['Powerplay',R.batPhaseScore(p,'powerplay')],['Middle',R.batPhaseScore(p,'middle')],['Death',R.batPhaseScore(p,'death')]],bowling=[['New ball',R.bowlPhaseScore(p,'newBall')],['Middle',R.bowlPhaseScore(p,'middle')],['Death',R.bowlPhaseScore(p,'death')]];
  return X.disclosure('Innings phases',`<div class="g8playerphases">${group('Batting','cricket',batting)}${R.bowlingWorkload(p)>0?group('Bowling','cricket-ball',bowling):''}</div>`);
 };
 X.playerRead=p=>{
  const scout=read.scout(p.id),tags=F.roleTags(p).filter(t=>!t.includes('LOWER MIDDLE')),conf=window.GCC8_SCOUTING.publicView(p,s.year).confidence.toLowerCase(),d=s.dynasty?.developmentByYear?.[s.year]?.find(r=>r.playerId===p.id);
  const groups=[['Batting technique',[['Against pace',p.pacePlay],['Against spin',p.spinPlay],['Shot control',p.control]]],['Strokeplay & running',[['Power hitting',p.power],['Running between wickets',p.running],['Finishing',p.finishing]]],...(R.bowlingWorkload(p)>0?[['Bowling skills',[['Bowling accuracy',p.bowlControl],['Variations',p.variation]]]]:[]),['Mental attributes',[['Temperament',p.temperament],['Leadership',p.leadership]]]];
  if(p.role==='BOWL'){const i=groups.findIndex(([title])=>title==='Bowling skills');if(i>=0)groups.unshift(groups.splice(i,1)[0]);}
  const skills=groups.map(([title,rows])=>`<section class="g8skillcategory g8skill-${title.startsWith('Bowling')?'bowling':title.startsWith('Mental')?'mental':'batting'}"><h3>${esc(title)}</h3>${rows.map(([label,value])=>X.abilityRead(label,value)).join('')}</section>`).join('');
  return `<div class="g8playerdetail"><section class="g8scoutoutlook"><span class="g8eyebrow">CAREER OUTLOOK</span><h3>${esc(scout?.outlook||'Still being assessed')}</h3>${d?`<div class="g8developmentbadge"><b>${d.fromOverall} → ${d.toOverall}</b><span>Overall since last season</span></div>${window.GCC8_DEVELOPMENT.changes(d).length?`<details class="g8moredata"><summary>Skill changes this year</summary><ul class="g8skillchanges">${window.GCC8_DEVELOPMENT.changes(d).map(c=>`<li class="${c.delta>0?'up':'down'}"><span>${esc(c.label)}</span><b>${c.delta>0?'+':''}${c.delta}</b><small>${c.from} → ${c.to}</small></li>`).join('')}</ul></details>`:d.skills?'':'<p class="g8fine">Skill changes were not recorded in this older season.</p>'}`:''}${R.bowlingWorkload(p)>0?`<span class="g8scoutjob">${esc(X.bowlingRole(p))}</span>`:''}${p.dynastyReplacement?`<span class="g8scoutjob">${esc(X.contractStatus(p))}</span>`:''}</section>${X.playerRecord(p)}<details class="g8moredata"><summary>Detailed skills</summary><div class="g8scoutcategories">${skills}</div><p>Scouting confidence · ${esc(conf)}</p></details></div>`;
 };
 X.conditionRead=(label,key,value=0)=>{const band=F.groundBand(value,key),ends=key==='boundary'?['Large','Short']:key==='spin'?['Skids on','Grips']:['Less help','More help'];return `<div class="g8conditionread"><div><b>${esc(label)}</b><strong>${esc(band.label)}</strong></div><div class="g8conditiongauge" role="img" aria-label="${esc(label)}: ${esc(band.label)}"><span style="--position:${Math.max(5,Math.min(95,50+Number(value||0)*10))}%"></span></div><div class="g8conditionends"><span>${ends[0]}</span><span>${key==='boundary'?'Balanced':'Neutral'}</span><span>${ends[1]}</span></div></div>`;};
 X.groundDetail=c=>{
  if(!c)return '';const w=c.weather,conditions=c.conditions||{};
  return `<div class="g8pitchread"><div class="g8conditioncards">${[['Pace & carry','pace'],['Spin & grip','spin'],['Boundary','boundary']].map(([label,k])=>X.conditionRead(label,k,conditions[k]||0)).join('')}</div><section class="g8groundinterpretation"><h3>How the ground plays</h3><p>${esc((window.GCC8_CLUB_EXPANSION?.groundReads[c.abbr]||F.groundStory(c)))}</p></section>${w?`<section class="g8weatherread"><h3>${X.icon('cricket-ball')}${esc(w.label)}</h3><p>${esc(w.read)}</p></section>`:''}</div>`;
 };
 X.matchRead=fx=>{
  if(!fx)return '';const home=G.matchGroundForFixture(fx),op=fx.home.abbr===s.userClub.abbr?fx.away:fx.home,mine=read.matchProfile(s.userClub),theirs=read.matchProfile(op);
  const rows=[['Your powerplay batting',mine.powerplayBat,theirs.newBall],['Your middle-overs batting',mine.middleBat,theirs.middleBowl],['Your death batting',mine.finishing,theirs.death],['Your new-ball attack',mine.newBall,theirs.powerplayBat],['Your middle-overs attack',mine.middleBowl,theirs.middleBat],['Your death attack',mine.death,theirs.finishing]];
  return `<section class="g8matchread"><span class="g8eyebrow">THE CRICKET MATCHUP</span>${rows.map(([l,a,b])=>{const even=Math.abs(a-b)<4,edge=even?'even':a>b?'you':'them',bars=fx.home.abbr===s.userClub.abbr?[[s.userClub,a],[op,b]]:[[op,b],[s.userClub,a]];return `<article class="g8duel"><div><b>${l}</b><strong class="g8edge g8edge-${edge}">${even?'Evenly matched':a>b?'Your edge':'Their edge'}</strong></div><div class="g8duelbars">${bars.map(([club,value])=>`<div class="g8previewrating" data-club="${esc(club.abbr)}" data-rating="${Math.round(value)}" style="--rating-color:${X.ratingTone(Math.round(value))}"><span class="g8previewclub" style="--team-color:${esc(club.c)};--team-ink:${esc(X.clubInk(club))}">${esc(club.abbr)}</span><span class="g8strengthtrack"><span style="--strength:${Math.max(0,Math.min(100,value*100/99))}%"></span></span><b>${Math.round(value)}</b></div>`).join('')}</div></article>`;}).join('')}<p class="g8fine">XI ability, including fitness. Higher ratings are stronger; conditions still matter.</p></section>`;
 };
 X.phaseBalls=(innings,k)=>innings.phaseBalls?innings.phaseBalls[k]||0:k==='pp'?Math.min(36,innings.balls):k==='mid'?Math.max(0,Math.min(54,innings.balls-36)):Math.max(0,innings.balls-90);
 // Describe observed scorebook differences, never inferred causes or hidden ability.
 X.resultSummary=r=>{
  const own=s.userClub?.abbr;if(!r||![r.home.abbr,r.away.abbr].includes(own))return '';
  const mine=r.home.abbr===own?r.homeInnings:r.awayInnings,theirs=r.home.abbr===own?r.awayInnings:r.homeInnings,op=r.home.abbr===own?r.away:r.home;
  const phases=[['Powerplay'+(mine.deliveryVersion===1?' + surge':''),'pp'],['Middle overs','mid'],['Death overs','death']].map(([label,key])=>{const a=X.phaseBalls(mine,key),b=X.phaseBalls(theirs,key);return {label,a,b,for:a?mine[key]*6/a:0,against:b?theirs[key]*6/b:0};}).filter(v=>v.a>=6&&v.b>=6&&Number.isFinite(v.for)&&Number.isFinite(v.against)).sort((a,b)=>Math.abs(b.for-b.against)-Math.abs(a.for-a.against));
  const p=phases[0],line=r.superOver?'Scores were level after the two innings. The Super Over settled the match.':p?`${p.label}: ${own} scored at ${p.for.toFixed(2)} runs/over across ${p.a} balls; ${op.abbr} at ${p.against.toFixed(2)} across ${p.b}.`:'No phase has six legal balls in both innings to compare.';
  return `<section class="g8matchsummary"><h2>${r.superOver?'Decided in the Super Over':'Where the innings differed'}</h2><p>${esc(line)}</p><span>${mine.wickets} wickets lost · ${theirs.wickets} taken</span>${p&&!r.superOver?'<small>Largest rate gap among phases with six or more balls per side. A comparison, not a diagnosis.</small>':''}</section>`;
 };
 X.resultRead=r=>{
  if(!r)return '';const mine=r.home.abbr===s.userClub.abbr?r.homeInnings:r.awayInnings,theirs=r.home.abbr===s.userClub.abbr?r.awayInnings:r.homeInnings,star=F.standout(r);
  const phase=(l,k)=>{const a=X.phaseBalls(mine,k),b=X.phaseBalls(theirs,k),chased=r.battingSecond?.abbr===s.userClub.abbr&&mine.total>theirs.total;
   const note=!a?(chased?'Target reached before this phase.':'Your innings ended before this phase.'):!b?'Their innings ended before this phase.':a!==b?'Different phase lengths; compare the scoring rates.':mine[k]>theirs[k]?'You scored more across the same number of balls.':mine[k]<theirs[k]?'They scored more across the same number of balls.':'Level scoring across the same number of balls.';
   const scale=Math.max(1,mine[k],theirs[k]),op=r.home.abbr===s.userClub.abbr?r.away:r.home;
   return `<article class="g8phasecontest"><span class="g8eyebrow">${l}</span><div class="g8phasescore"><span class="g8phasenametag" style="--team-color:${esc(s.userClub.c)};--team-ink:${esc(X.clubInk(s.userClub))}">${esc(s.userClub.abbr)}</span><b>${a?mine[k]:'–'}</b><span>v</span><b>${b?theirs[k]:'–'}</b><span class="g8phasenametag" style="--team-color:${esc(op.c)};--team-ink:${esc(X.clubInk(op))}">${esc(op.abbr)}</span></div><div class="g8phasebars" aria-hidden="true"><i style="--phase:${mine[k]*100/scale}%;--phase-club:${esc(s.userClub.c)}"></i><i style="--phase:${theirs[k]*100/scale}%;--phase-club:${esc(op.c)}"></i></div><p>${note}</p><details class="g8phasefine"><summary>Balls and scoring rate</summary><span class="g8phasecontext">${a} v ${b} balls · ${a?(mine[k]*6/a).toFixed(2):'–'} v ${b?(theirs[k]*6/b).toFixed(2):'–'} runs/over</span></details></article>`;};
  return `<section class="g8sheet g8resultread"><span class="g8eyebrow">HOW THE INNINGS COMPARED</span><div class="g8phasecards">${[[r.homeInnings?.deliveryVersion===1?'Powerplay + surge':'Powerplay','pp'],['Middle overs','mid'],['Death','death']].map(([l,k])=>phase(l,k)).join('')}</div><p class="g8fine">Your innings is shown first. Scoring rates describe what happened; wickets, targets and conditions also shape the result.</p>${star?`<p><b>${esc(star.player.name)}</b> · ${esc(star.line)}</p>`:''}${r.weather?`<p>${esc(r.weather.label)} · ${esc(r.weather.read)}</p>`:''}</section>`;
 };
 X.superOverRead=r=>{
  if(!r?.superOver)return r?.tieBreak?'<p class="g8fine">This older match used the previous tied-match resolution.</p>':'';
  return `<section class="g8superover"><span class="g8eyebrow">SUPER OVER${r.superOver.rounds.length>1?'S':''}</span>${r.superOver.rounds.map((round,index)=>`<div class="g8tieblock"><h3>Tie-break ${index+1}</h3>${round.innings.map(i=>`<div class="g8statrow"><b>${esc(i.club.name)}</b><span>${i.total}/${i.wickets} · ${i.balls} balls</span></div><p class="g8fine">Bowled by ${esc(i.bowler.name)} · ${i.deliveries.map(d=>d.wicket?'W':d.runs).join(' · ')}</p>`).join('')}</div>`).join('')}<p class="g8fine">Six legal balls or two wickets. A successful chase ends early; tied overs are replayed. Tie-break figures are separate from season statistics.</p></section>`;
 };
 X.draftHints=p=>{
  const strengths=[['PP batting',R.batPhaseScore(p,'powerplay')],['Middle batting',R.batPhaseScore(p,'middle')],['Finishing',R.batPhaseScore(p,'death')],...(R.bowlingWorkload(p)>0?[['New ball',R.bowlPhaseScore(p,'newBall')],['Middle bowling',R.bowlPhaseScore(p,'middle')],['Death bowling',R.bowlPhaseScore(p,'death')]]:[])].sort((a,b)=>b[1]-a[1]).slice(0,2);
  return `<div class="g8drafthints"><span>${esc(R.battingRoleBand(p))} · ${R.isKeeper(p)?'Recognised keeper':R.bowlingStyle(p)||'Batting specialist'}</span><b>${strengths.map(([label,n])=>`${label} ${Math.round(n)}`).join(' · ')}</b><span>${esc(X.bowlingRole(p))}</span></div>`;
 };
 X.draftAdvice=()=>{
  const ps=roster(),p=X.squadProfile();
  const note=!ps.length?'Start with a player you can build around. Then balance your batting and bowling.':!ps.some(R.isKeeper)?'You still need a recognised wicketkeeper.':p.death<70?'Look for someone who can bowl the closing overs.':'Your squad has the key roles covered. Pick the player who improves your side.';
  return X.squadCoverage(ps,'Your squad · '+ps.length+'/15')+`<p class="g8draftadvice">${esc(note)}</p>`;
 };
 X.seasonProgress=()=>{
  const prior=s.dynasty?.history?.find(h=>h.year===s.year-1),table=s.table[s.userClub?.abbr];
  if(!prior||!table||!Number.isFinite(prior.wins)||!Number.isFinite(table.w))return '';
  const delta=table.w-prior.wins,phrase=delta===0?'Same number of league wins':`${Math.abs(delta)} ${delta>0?'more':'fewer'} league ${Math.abs(delta)===1?'win':'wins'}`;
  return `<p class="g8seasonprogress"><strong>${esc(phrase)} ${delta===0?'as':'than'} ${prior.year}.</strong> ${prior.wins} then · ${table.w} now. League matches only.</p>`;
 };
 X.seasonContributors=()=>{
  const rows=X.clubSeasonRecords(),bat=rows.filter(x=>x.t.runs>0).sort((a,b)=>b.t.runs-a.t.runs).slice(0,3),bowl=rows.filter(x=>x.t.bowlBalls>0).sort((a,b)=>b.t.wickets-a.t.wickets||a.t.runsConceded/a.t.bowlBalls-b.t.runsConceded/b.t.bowlBalls).slice(0,3);
  return `<div class="g8contributors"><section><span class="g8eyebrow">WITH THE BAT</span>${bat.length?bat.map(({p,t})=>stat(p.name,`${t.runs} runs · SR ${(t.runs*100/t.balls).toFixed(1)}`)).join(''):'<p>No batting record yet.</p>'}</section><section><span class="g8eyebrow">WITH THE BALL</span>${bowl.length?bowl.map(({p,t})=>stat(p.name,`${t.wickets} wickets · Econ ${(t.runsConceded*6/t.bowlBalls).toFixed(2)}`)).join(''):'<p>No bowling record yet.</p>'}</section></div>`;
 };
 X.seasonPlan=()=>{
  const totals={pp:[0,0,0,0],mid:[0,0,0,0],death:[0,0,0,0]};
  for(const r of s.results){const mine=r.home.abbr===s.userClub.abbr?r.homeInnings:r.awayInnings,theirs=r.home.abbr===s.userClub.abbr?r.awayInnings:r.homeInnings;for(const k of Object.keys(totals)){const t=totals[k];t[0]+=mine[k];t[1]+=X.phaseBalls(mine,k);t[2]+=theirs[k];t[3]+=X.phaseBalls(theirs,k);}}
  const labels={pp:'field-restriction overs',mid:'middle overs',death:'death overs'},reads=Object.entries(totals).filter(([,t])=>t[1]>=36&&t[3]>=36).map(([k,t])=>({k,for:t[0]*6/t[1],against:t[2]*6/t[3]})).sort((a,b)=>(a.for-a.against)-(b.for-b.against));
  if(!reads.length)return '';
  const w=reads[0],note=w.for<w.against?`Start with the ${labels[w.k]}. This was your largest scoring-rate deficit. Scout the batting and bowling options before making changes.`:`You matched or outscored opponents in every sampled phase. Preserve that balance while planning for departures.`;
  return `<section class="g8seasonplan"><span class="g8eyebrow">BEFORE YOU BUILD AGAIN</span><p>${esc(note)}</p><div class="g8seasoncomparison">${reads.map(v=>X.compareRead(labels[v.k],v.for.toFixed(2),v.against.toFixed(2),'Scored','Conceded',0)).join('')}</div><details class="g8moredata"><summary>How to read these rates</summary><p>Runs per over across your regular-season scorebooks. Different chase lengths and wickets affect these rates; use them as a starting point for scouting.</p></details></section>`;
 };
 X.seasonRead=()=>{
  const a=F.teamAverages(),l=F.leagueAverages();if(!a?.matches)return '<p class="g8fine">The first matches will start to show how this XI plays.</p>';
  const wins=s.table[s.userClub.abbr]?.w||0,losses=s.table[s.userClub.abbr]?.l||0;
  return `<section class="g8sheet g8seasonread"><span class="g8eyebrow">${a.matches} MATCHES · THE SIDE IN PRACTICE</span><div class="g8formstrip" aria-label="Regular-season results">${s.results.map(r=>`<span class="${r.winner.abbr===s.userClub.abbr?'won':'lost'}" title="Round ${r.round}: ${r.winner.abbr===s.userClub.abbr?'won':'lost'}">${r.winner.abbr===s.userClub.abbr?'W':'L'}</span>`).join('')}</div><div class="g8seasoncomparison">${X.compareRead('Runs per innings',a.avgScore.toFixed(1),a.avgConceded.toFixed(1),'Scored','Conceded',0)}${X.compareRead('Runs per over',a.runRate.toFixed(2),a.economy.toFixed(2),'Scored','Conceded',0)}</div><details class="g8moredata"><summary>Wickets and scoring context</summary><p>${a.avgWicketsTaken.toFixed(1)} wickets taken and ${a.avgWicketsLost.toFixed(1)} wickets lost per match.</p>${l?`<p>Across the scorebooks available here: ${l.avgScore.toFixed(1)} runs per innings. These are your match scorebooks, not every match in the league.</p>`:''}</details></section>`;
 };
 X.revealControls=(kind,count,label,action)=>`<div class="g8decisionbar g8revealbar g8drawcontrols"><div><span class="g8eyebrow">${kind==='league'?'THE CLUBS':'THE DRAFT ORDER'}</span><p>${count} of 8 revealed · ${count===8?'Draw complete':uiState()}</p></div><div class="g8actions">${count<8?btn(X.ui.reveal?.running?'Pause reveal':'Resume reveal','revealRun',[],'g8ghost'):''}${count<8?btn(`Speed ${[1,2,4][X.ui.reveal?.speedIndex||0]}×`,'revealSpeed',[],'g8ghost'):''}${count<8?btn('Reveal all','revealAll',[],'g8ghost'):btn(label,action,[],'g8primary')}</div></div>`;
 const uiState=()=>X.ui.reveal?.running?'Drawing next club':'Paused';
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
 X.installDetailedAverages=()=>{const compact=X.averages;X.averages=()=>compact()+`<section class="g8sheet g8seasonread g8tablewrap"><span class="g8eyebrow">THE FULL PLAYER RECORD</span><table class="g8table"><thead><tr><th>Player</th><th>High score</th><th>4s</th><th>6s</th><th>Bowling avg</th><th>Best bowling</th></tr></thead><tbody>${X.clubSeasonRecords().map(({p,t})=>{return `<tr><td>${esc(p.name)}</td><td>${t.bestRuns||0}</td><td>${t.fours||0}</td><td>${t.sixes||0}</td><td>${t.wickets?(t.runsConceded/t.wickets).toFixed(1):'–'}</td><td>${t.bowlBalls?`${t.bestWickets||0}/${t.bestBowlingRuns??'–'}`:'–'}</td></tr>`;}).join('')}</tbody></table></section>`;};
})();
(() => {
 const X=window.GCC8,{G,R,read,esc}=X;
 X.phaseOptions=(key,squad=false)=>{
  const ps=squad?X.roster():G.state.xi.map(G.byId).filter(Boolean),scorers={powerplayBat:p=>R.batPhaseScore(p,'powerplay'),middleBat:p=>R.batPhaseScore(p,'middle'),finishing:p=>R.batPhaseScore(p,'death'),newBall:p=>R.bowlPhaseScore(p,'newBall'),middleBowl:p=>R.bowlPhaseScore(p,'middle'),death:p=>R.bowlPhaseScore(p,'death'),fielding:p=>p.fielding,keeping:p=>p.keeping};
  const fn=scorers[key];if(!fn)return '';
  const bowling=['newBall','middleBowl','death'].includes(key),options=ps.filter(p=>G.state.dynasty?.injuries?.[p.id]?.status!=='OUT'&&(!bowling||R.bowlingWorkload(p)>0&&R.bowlingStyle(p))).map(p=>({p,score:fn(read.fitPlayer(p.id))})).sort((a,b)=>b.score-a.score).slice(0,3);
  return `<div class="g8phaseoptions"><span class="g8eyebrow">LEADING OPTIONS · ${squad?'SQUAD':'XI'}</span>${options.map(({p,score})=>`<div class="g8statrow"><b>${esc(p.name)}</b>${X.abilityRead('Ability',score)}</div>`).join('')}<p class="g8fine">Available options, including managed-fitness effects. Team roles, conditions and workload still affect the match.</p></div>`;
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
  const innings=card.club.abbr===r.home.abbr?r.homeInnings:r.awayInnings,plan=innings.bowlingPlan||[],used=plan.slice(0,innings.deliveries?new Set(innings.deliveries.map(d=>d.over)).size:Math.ceil(card.balls/6));if(!used.length)return '';
  return `<details class="g8moredata"><summary>The bowling changes</summary><p class="g8fine">Bowling spells, over by over. The final over may be incomplete when the innings ends.</p><div class="g8overplan">${used.map((id,i)=>`<div><small>OVER ${i+1} · ${i<4?'POWERPLAY':innings.surge?.startOver&&i+1>=innings.surge.startOver&&i+1<innings.surge.startOver+2?'POWER SURGE':i<15?'MIDDLE':'DEATH'}</small><b>${X.esc(X.G.byId(id)?.name||'Bowler')}</b></div>`).join('')}</div></details>`;
 };
})();

/* Club character belongs to this alternate league; ground reads use the cricket model. */
(() => {
 const X=window.GCC8,{esc,badge}=X,F=window.GCC8_FOUNDATION_READ;
 const stories={
  CSK:['Chennai','A home for patient batting and clever spin. Chennai offers you a chance to control the game through the middle overs.','Look for batters comfortable against spin, reliable slow bowlers and players who turn singles into twos.'],
  MI:['Mumbai','A side for attacking cricket by the sea. Mumbai gives clean hitters room to take charge, while early seam keeps the contest honest.','Pair power at the top with new-ball quality and bowlers who can execute when the boundaries come quickly.'],
  RR:['Jaipur','Jaipur invites you to win through craft. A patient side can squeeze opponents, work the larger pockets and make every scoring opportunity count.','Value control against spin, sharp running and a bowling group that can defend the middle overs.'],
  KKR:['Kolkata','Kolkata offers a meeting of spin and strokeplay. Build a side that can absorb pressure, then change the pace of an innings.','Balance spin options with batters who rotate well and have the range to accelerate once set.'],
  RCB:['Bengaluru','Bengaluru is a home for bold cricket. Short boundaries invite big totals, but every missed length gives the opposition the same opportunity.','Power matters, but protect it with bowling control, variation and dependable options at the death.'],
  DC:['Delhi','Delhi rewards a side that can adapt. A changing surface gives you several ways to compete without handing any one style a permanent advantage.','Keep batting and bowling options across the phases, with variation and flexibility rather than one narrow plan.'],
  SIX:['Sydney','Sydney offers a balanced challenge. The Sixers are a place to build an eleven that can compete in every phase of the match.','Combine reliable top-order batting, varied bowling and good running without leaning entirely on one strength.'],
  THU:['Sydney','The Thunder invite an attacking approach from western Sydney. Square-boundary scoring can make an innings move quickly when batters find their timing.','Look for boundary hitters and bowlers who can deny width and change pace when the hitting starts.'],
  STA:['Melbourne','The Stars give you cricket on a grand scale. Melbourne’s big square boundaries reward a side that covers ground and uses space intelligently.','Running, placement and strong fielding matter here. Build an attack that can make the larger pockets work.'],
  REN:['Melbourne','A different Melbourne challenge: the Renegades offer quick scoring through timing and a fast outfield, with little room for a loose bowling plan.','Choose fluent batters, accurate bowlers and a fielding unit that can prevent easy runs.'],
  SCO:['Perth','Perth offers a fast-bowling challenge. The Scorchers are a home for an assertive attack and batters willing to meet pace with positive footwork.','Invest in new-ball pace and carry, then find batters who handle quick bowling without losing their scoring intent.'],
  STR:['Adelaide','Adelaide offers an even contest. The Strikers give you a true surface where a balanced side must earn its advantage through execution.','Build options across the innings, with batting timing, changes of pace and bowlers able to protect the boundary.'],
  HEA:['Brisbane','Brisbane gives you bounce and opportunity. The Heat invite positive batting, but an attack that uses the extra carry can unsettle opponents early.','Find batters comfortable with bounce and bowlers who can take wickets with the new ball.'],
  HUR:['Hobart','Hobart offers a testing start to an innings. The Hurricanes give disciplined seam bowling and patient top-order batting a useful home.','Value new-ball skill and batters who can survive movement before expanding their range.'],
  SUR:['London','Surrey offers room for fluent batting. At The Oval, your challenge is to match that scoring freedom with an attack that stays in control.','Look for clean striking and bowling variation, with reliable execution when batters are set.'],
  LAN:['Manchester','Lancashire offers several routes into a match. Manchester’s mix of seam and spin lets a flexible bowling group keep asking different questions.','Balance early seam with middle-over spin, and select batters who can adjust as the innings develops.'],
  YOR:['Leeds','Yorkshire offers a demanding new-ball contest. Headingley gives you a chance to build around disciplined pace and a resilient top order.','Prioritise movement and control with the ball, plus batters who can negotiate the opening spell.'],
  NOT:['Nottingham','Nottinghamshire invites you to seize the start. Trent Bridge rewards aggressive powerplay batting and an attack that takes wickets before the innings opens up.','Build a dangerous top order, but give your new-ball and death bowlers the skill to defend short boundaries.'],
  SOM:['Taunton','Somerset offers a small-ground contest with big scoring potential. At Taunton, one strong batting spell can change the match very quickly.','Value hitting range alongside bowling control and clear death-over options. A modest total may be hard to defend.'],
  HAM:['Southampton','Hampshire offers a home for disciplined cricket. Seam assistance and slightly larger pockets let a well-organised side build pressure over several overs.','Look for accurate seamers, adaptable batters and fielders who can turn boundary protection into pressure.']
 };
 X.clubStory=c=>{const p=stories[c.abbr]||window.GCC8_CLUB_EXPANSION?.stories[c.abbr];return {city:p?.[0]||c.region,identity:p?.[1]||'Choose the cricket you want to play, then build a side around this home ground.',selection:p?.[2]||'Balance your strengths across the innings and use the home conditions to guide close selection decisions.'};};
 X.clubPlan=c=>{
  const {pace=0,spin=0,boundary=0}=c.conditions||{},slow=spin>=3&&spin>=pace,quick=pace>=3;
  const bowling=slow?['Middle-overs spin','Use the grip with a specialist spinner and accurate middle-overs bowling.']:quick?['New-ball pace','Make the extra carry count with strong new-ball bowling.']:['A varied attack','Mix pace and spin so you have options when conditions change.'];
  const batting=slow?['Rotate the strike against spin','Look for batters who can rotate the strike and score against spin.']:quick?['A resilient top order','Look for strong powerplay batting to negotiate the opening spell.']:boundary>=2?['Boundary hitters','Look for finishing strength to take advantage of easier boundaries.']:boundary<=-1?['Work the gaps','Value strike rotation and running between wickets when boundaries are harder to clear.']:['Bat through the innings','Cover powerplay, middle and finishing roles rather than one batting strength.'];
  const support=boundary>=2?['Reliable death bowling','Shorter boundaries punish loose closing overs. Check death bowling when scouting.']:boundary<=-1?['Protect the bigger pockets','Strong fielding and running help you make the most of a larger ground.']:['A strong fielding unit','Back your attack with good fielding to limit runs between boundaries.'];
  return {title:slow?'Build a spin attack.':quick?'Use the new ball.':boundary>=2?'Build around boundary hitters.':boundary<=-1?'Rotate the strike.':'Build an adaptable XI.',priorities:[bowling,batting,support]};
 };
 X.clubBrief=c=>{const p=X.clubStory(c),plan=X.clubPlan(c);return `<section class="g8clubidentity g8clubidentitypanel" style="--club-accent:${esc(c.c)}" aria-label="${esc(c.name)} club identity"><div class="g8clubmark">${badge(c)}</div><div class="g8clubmetastrip">${[p.city,c.displayRegion||c.region,c.league].map(text=>`<span>${esc(text)}</span>`).join('')}</div><p class="g8clubidentitytext">${esc(p.identity)}</p></section><div class="g8clubbrief"><section class="g8sheet"><span class="g8eyebrow">HOME GROUND</span><h3>${esc(c.ground)}</h3><span class="g8groundtrait">${esc(c.trait)}</span><p>${esc((window.GCC8_CLUB_EXPANSION?.groundReads[c.abbr]||F.groundStory(c)))}</p><div class="g8groundbands">${[['Pace & carry','pace'],['Spin & grip','spin'],['Boundaries','boundary']].map(([l,k])=>X.conditionRead(l,k,c.conditions[k]||0)).join('')}</div></section><section class="g8sheet g8clubplan"><span class="g8eyebrow">BUILD YOUR SIDE</span><h3>${esc(plan.title)}</h3><ol class="g8clubpriorities">${plan.priorities.map(([title,note],i)=>`<li><span class="g8prioritynumber" aria-hidden="true">${i+1}</span><div><strong>${esc(title)}</strong><p>${esc(note)}</p></div></li>`).join('')}</ol></section></div>`;};
})();

