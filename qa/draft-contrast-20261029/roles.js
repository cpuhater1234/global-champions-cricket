/* Translate the existing cricket model into jobs, without guessing handedness or a spin subtype. */
(() => {
 const X=window.GCC8,{G,R,esc,btn,roster,injury}=X;
 X.battingJob=p=>({OPEN:'Opener',TOP:'Top order',MIDDLE:'Middle order',LOWER:'Lower order',TAIL:'Tail end'}[R.battingRoleBand(p)]||'Middle order');
 X.bowlingType=p=>({PACE:'Pace bowler',SPIN:'Spin bowler',DUAL:'Pace & spin'}[R.bowlingStyle(p)]||'Batting specialist');
 X.allRounderJobs=p=>X.battingJob(p)+' · '+({PACE:'Pace bowling',SPIN:'Spin bowling',DUAL:'Pace & spin bowling'}[R.bowlingStyle(p)]||'Bowling type unavailable');
 X.isFinisher=p=>p.bat>=50&&p.preferredSlot>=4&&p.finishing>=86&&p.power>=84;
 X.bowlingJob=p=>{
  if(!R.bowlingWorkload(p)||!R.bowlingStyle(p))return '';
  const newBall=R.bowlPhaseScore(p,'newBall'),middle=R.bowlPhaseScore(p,'middle'),death=R.bowlPhaseScore(p,'death');
  if(R.bowlingStyle(p)==='SPIN')return newBall>middle+8?'Powerplay spin option':'Middle-overs spin';
  if(R.bowlingStyle(p)==='DUAL')return 'Middle-overs option';
  if(newBall>=76&&death>=76&&newBall>=middle-4&&death>=middle-4)return 'New ball & death';
  const best=Math.max(newBall,middle,death);return best===newBall?'New-ball option':best===death?'Death-overs option':'Middle-overs option';
 };
 X.roleLine=p=>{
  const bat=X.battingJob(p),type=X.bowlingType(p),job=X.bowlingJob(p);
  if(p.role==='BOWL')return [type,job].filter(Boolean).join(' · ');
  if(p.role==='AR'){const job=p.bat>=p.bowl+15?'Batting all-rounder':p.bowl>=p.bat+15?'Bowling all-rounder':'All-rounder';return [bat,job,type==='Batting specialist'?null:type.replace(' bowler','')+' option',X.isFinisher(p)?'Finishing power':null].filter(Boolean).join(' · ');}
  return [bat,p.role==='WK-BAT'?'Wicketkeeper':null,X.isFinisher(p)?'Finishing power':null].filter(Boolean).join(' · ');
 };
 const chip=p=>btn(p.name,'inspect',[p.id],'g8rolechip'+(injury(p)?.status==='OUT'?' g8unavailable':''));
 X.teamRead=(squad=false)=>{
  const ps=squad?roster():G.state.xi.map(G.byId).filter(Boolean),fit=ps.filter(p=>injury(p)?.status!=='OUT'),profile=squad?X.squadProfile():X.profile();
  const cover=fit.length<11?(squad?'Projection incomplete':'XI incomplete'):(squad?'Projected XI ready':'XI selected');
  const row=(key,label)=>{const value=Math.round(profile[key]||0);return `<div class="g8analysisrow" data-matchup="${key}"><span>${esc(label)}</span><strong style="--rating-color:${X.ratingTone(value)}">${value}</strong></div>`;};
  const section=(label,keys)=>`<section class="g8analysissection"><h3>${X.icon(label==='Batting'?'cricket':label==='Bowling'?'cricket-ball':'stumps')}${label}</h3><div class="g8analysistiles">${X.phases.filter(([key])=>keys.includes(key)).map(([k,l])=>row(k,l)).join('')}</div></section>`;
  return `<section class="g8teamread g8roleboard g8simpleanalysis"><div class="g8roleboardhead"><span class="g8eyebrow">${squad?'PROJECTED XI · FROM YOUR SQUAD':'YOUR XI'}</span><div class="g8teamrating" style="--rating-color:${fit.length?X.ratingTone(profile.overall):'#c4d7e5'}"><strong>${fit.length?Math.round(profile.overall):'—'}</strong><span>Overall</span></div><b class="g8coverread">${cover}</b></div><div class="g8analysisgrid">${section('Batting',['powerplayBat','middleBat','finishing','battingResources'])}${section('Bowling',['newBall','middleBowl','death','bowlingResources'])}${section('Team balance',['keeping','fielding','roleFit','chemistry'])}</div></section>`;
 };
 X.draftRead=()=>{
  const ps=roster(),fit=ps.filter(p=>injury(p)?.status!=='OUT'),n=ps.length,slots=Math.max(0,15-n),profile=X.squadProfile();
  const keepers=fit.filter(R.isKeeper).length,batters=fit.filter(p=>p.bat>=50&&R.battingRoleBand(p)!=='TAIL').length,top=fit.filter(p=>p.bat>=50&&['OPEN','TOP'].includes(R.battingRoleBand(p))).length;
  const legal=profile.oversCapacity||0,trusted=profile.trustedOversCapacity||0,bowling=legal>=20;
  const gaps=!keepers;
  const verdict=!n?'Your squad starts here':n<11?'Building your XI':!keepers?'No recognised keeper':'Review your squad balance';
  return {ps,n,slots,profile,keepers,batters,top,legal,trusted,bowling,options:fit.filter(p=>R.bowlingWorkload(p)>0).length,verdict,gaps};
 };
 X.draftSquadSummary=(d=X.draftRead())=>{
  const available=d.ps.filter(p=>injury(p)?.status!=='OUT').length;
  return `<section class="g8draftsummary g8draftscore" aria-label="Projected XI rating"><div class="g8draftscorevalue" style="--rating-color:${available?X.ratingTone(d.profile.overall):'#c5d9e8'}"><strong>${available?Math.round(d.profile.overall):'—'}</strong></div><div><h3>Projected XI</h3><p>${available<11?`Projection from ${available} player${available===1?'':'s'}`:'Best available XI from your squad'}</p></div></section>`;
 };
 X.draftCompanion=()=>{
  const d=X.draftRead(),role={'BAT':'Batter','BOWL':'Bowler','AR':'All-rounder','WK-BAT':'Keeper'};
  const picked=d.ps,batters=picked.filter(p=>p.role==='BAT'||p.role==='WK-BAT'||p.role==='AR'&&p.bat>=50),regular=picked.filter(p=>R.bowlingWorkload(p)>=4&&R.bowlingUsagePrior(p)>=1.5);
  const coverage=[['Opening batting',batters.filter(p=>R.battingRoleBand(p)==='OPEN'),'opener'],['Top-order batting',batters.filter(p=>R.battingRoleBand(p)==='TOP'),'top'],['Middle-order batting',batters.filter(p=>['MIDDLE','LOWER'].includes(R.battingRoleBand(p))),'middle'],['Finishing',batters.filter(X.isFinisher),'finisher'],['Keeping',picked.filter(R.isKeeper),'keeper'],['All-round play',picked.filter(p=>p.role==='AR'),'allrounder'],['Pace bowling',regular.filter(p=>['PACE','DUAL'].includes(R.bowlingStyle(p))),'pace'],['Spin bowling',regular.filter(p=>['SPIN','DUAL'].includes(R.bowlingStyle(p))),'spin']];
  return `<div class="g8sectionhead"><h2>Your draft</h2><span>${d.n}/15 selected</span></div>${X.draftSquadSummary(d)}${coverage.some(([,ps])=>ps.length)?`<div class="g8pickedroles" aria-label="Squad skill coverage"><p class="g8coveragecaption">Skill coverage · one player can cover several skills.</p>${coverage.filter(([,ps])=>ps.length).map(([label,ps,key])=>`<div class="g8pickedrole g8pickedrole-${key}" data-key="picked-role-${key}"><span class="g8coveragetick" aria-hidden="true">✓</span><span>${esc(label)}</span><strong>${ps.length} ${ps.length===1?'option':'options'}</strong></div>`).join('')}</div>`:''}<section class="g8draftselected" aria-label="Selected players"><div class="g8draftsubhead"><h3>Selected players</h3><span>${d.n}/15</span></div>${d.n?`<div class="g8draftpickedlist">${d.ps.map(p=>`<button type="button" class="g8button g8draftpicked" data-action="inspect" data-args="[${p.id}]" aria-label="Scout selected ${esc(p.name)}, ${esc(role[p.role])}, overall ${p.overall}"><span><b>${esc(p.name)}</b><small class="g8pickedjob">${esc(p.role==='BOWL'?X.bowlingType(p):p.role==='AR'?X.allRounderJobs(p):X.battingJob(p))}</small></span><span class="g8draftpickedmeta"><small>${esc(p.role==='WK-BAT'?'WK':p.role)}</small><strong style="--rating-color:${X.ratingTone(p.overall)}">${p.overall}</strong></span></button>`).join('')}</div>`:'<p class="g8draftempty">Your selections will appear here as you pick.</p>'}</section><div class="g8draftsecondary">${btn('Analysis','draftDetail',['analysis'],'g8ghost g8small')}${btn('League picks','draftDetail',['picks'],'g8ghost g8small')}</div>`;
 };
 X.squadRoster=()=>{
  const groups=[['BAT','Batters'],['BOWL','Bowlers'],['AR','All-rounders'],['WK-BAT','Wicketkeepers']];
  return `<div class="g8dressingroom">${groups.map(([role,label])=>{const players=roster().filter(p=>p.role===role);return players.length?`<section class="g8squadgroup g8role-${role}"><h3><span>${label}</span><span class="g8groupcount">${players.length}</span></h3>${players.map(p=>`<div class="g8squadmember"><button type="button" class="g8button g8squadscout" data-action="inspect" data-args="${esc(JSON.stringify([p.id]))}" aria-label="Scout ${esc(p.name)}, current rating ${p.overall}"><span class="g8selectedidentity"><span class="g8selectedname">${esc(p.name)}</span><span class="g8selectedcontext">${esc(p.country)} · Age ${G.state.year-p.birthYear}</span></span><b class="g8selectedrating" aria-label="Overall ability ${p.overall} out of 99">${p.overall}</b><span class="g8selectedcue">Scout player →</span></button></div>`).join('')}</section>`:'';}).join('')}</div>`;
 };
})();

/* Decision tools use the existing ratings and eligibility rules only. */
(()=>{
 const X=window.GCC8,{G,R,ui,esc,btn,roster,injury}=X,s=G.state;
 X.squadFilters=()=>`<label class="g8squadfilters" for="g8squadrole"><span>Role</span><select id="g8squadrole" data-input="squadFilter">${[['ALL','All roles'],['BAT','Batters'],['WK-BAT','Keepers'],['AR','All-rounders'],['BOWL','Bowlers']].map(([key,label])=>`<option value="${key}" ${(ui.squadFilter||'ALL')===key?'selected':''}>${label}</option>`).join('')}</select></label>`;
 X.filterSquad=ps=>ps.filter(p=>!ui.squadFilter||ui.squadFilter==='ALL'||p.role===ui.squadFilter);
 X.teamCandidates=()=>X.filterSquad(roster().filter(p=>!s.xi.includes(p.id)));
 X.squadCoverage=(ps,label='Available squad')=>{
  const fit=ps.filter(p=>injury(p)?.status!=='OUT'),keepers=fit.filter(R.isKeeper).length,bowlers=fit.filter(p=>R.bowlingWorkload(p)>=4&&R.bowlingUsagePrior(p)>=1.5).length,openers=fit.filter(p=>R.battingRoleBand(p)==='OPEN').length;
  return `<section class="g8squadcoverage" aria-label="${esc(label)} coverage"><span class="g8eyebrow">${esc(label)}</span><div>${[[keepers,'Keeper'+(keepers===1?'':'s')],[bowlers,'Regular bowlers'],[openers,'Opener'+(openers===1?'':'s')]].map(([n,name])=>`<span><strong>${n}</strong>${name}</span>`).join('')}</div></section>`;
 };
 X.comparisonCandidates=id=>{
  const p=G.byId(Number(id));if(!p)return [];
  const ps=ui.view==='team'?roster():ui.view==='draft'?s.pool.filter(q=>q.available===true&&!q.draftedBy&&!q.dynastyRetired):ui.view==='dynasty'&&s.dynasty?.offseason?.phase==='draft'?X.read.freeAgents().map(G.byId):[];
  if(!ps.some(q=>q.id===p.id))return [];
  return ps.filter(q=>q.id!==p.id).sort((a,b)=>Number(b.role===p.role)-Number(a.role===p.role)||Number(s.xi.includes(b.id))-Number(s.xi.includes(a.id))||b.overall-a.overall||a.id-b.id);
 };
 X.playerComparison=(p,q,actions={})=>{
  const general=[['Overall',p.overall,q.overall],['Batting',p.bat,q.bat],['Bowling',p.bowl,q.bowl],['Fielding',p.fielding,q.fielding],['Keeping',R.isKeeper(p)?p.keeping:null,R.isKeeper(q)?q.keeping:null]],batting=['powerplay','middle','death'].map((k,i)=>[['Powerplay batting','Middle batting','Death batting'][i],R.batPhaseScore(p,k),R.batPhaseScore(q,k)]),bowling=['newBall','middle','death'].map((k,i)=>[['New-ball bowling','Middle bowling','Death bowling'][i],R.bowlPhaseScore(p,k),R.bowlPhaseScore(q,k)]);
  const focus=p.role==='BOWL'?bowling.concat([general[3]]):p.role==='WK-BAT'?[general[4],general[1],general[3]]:p.role==='AR'?general.slice(1,4):batting.concat([general[3]]),job=p.role==='BOWL'?'Bowling options':p.role==='WK-BAT'?'Wicketkeeping options':p.role==='AR'?'All-round options':'Batting options';
  const different=p.role!==q.role;
  const ratings=(label,rows)=>`<section class="g8comparemetrics" aria-label="${esc(label)}"><h3>${esc(label)}</h3>${rows.filter(([name])=>name!=='Keeping'||R.isKeeper(p)||R.isKeeper(q)).map(([name,a,b])=>`<section class="g8comparemetric"><h4>${esc(name)}</h4>${a===null?`<p class="g8notkeeper">${esc(p.name)} · Not a wicketkeeper</p>`:X.abilityRead(p.name,a)}${b===null?`<p class="g8notkeeper">${esc(q.name)} · Not a wicketkeeper</p>`:X.abilityRead(q.name,b).replace('class="g8abilitybar g8rated"','class="g8abilitybar g8rated g8comparesecond"')}</section>`).join('')}</section>`;
  return `<div class="g8compareidentities">${[p,q].map((x,i)=>`<section><span class="g8eyebrow">${i?'ALTERNATIVE':'YOU OPENED'}</span><h3>${esc(x.name)}</h3><p>${esc(X.roleLine(x))}</p><span>${x.birthYear?'Age '+(s.year-x.birthYear)+' · ':''}${s.xi.includes(x.id)?'In your XI · ':''}${esc(injury(x)?.status||X.form(x))}</span>${actions[x.id]||''}</section>`).join('')}</div>${p.role!==q.role?'<p class="g8comparecontext">These players have different roles. Compare the job you need to fill.</p>':''}${ratings(different?'Different squad roles':job,different?general.slice(1):focus)}${X.disclosure('All ability ratings',ratings('Current ability · out of 99',general))}${X.disclosure('Innings skills',ratings('Batting and bowling phases',batting.concat(bowling)))}`;
 };
})();
