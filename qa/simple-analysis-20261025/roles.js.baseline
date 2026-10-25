/* Translate the existing cricket model into jobs, without guessing handedness or a spin subtype. */
(() => {
 const X=window.GCC8,{G,R,esc,btn,roster,injury}=X;
 X.battingJob=p=>({OPEN:'Opener',TOP:'Top order',MIDDLE:'Middle order',LOWER:'Lower order',TAIL:'Tail end'}[R.battingRoleBand(p)]||'Middle order');
 X.bowlingType=p=>({PACE:'Pace bowler',SPIN:'Spin bowler',DUAL:'Pace & spin'}[R.bowlingStyle(p)]||'Batting specialist');
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
  const groups=[['Openers','cricket',fit.filter(p=>X.battingJob(p)==='Opener')],['Middle order','shirt-sport',fit.filter(p=>['Top order','Middle order','Lower order'].includes(X.battingJob(p))&&p.bat>=50)],['All-rounders','users-group',fit.filter(p=>p.role==='AR')],['Pace attack','cricket',fit.filter(p=>['PACE','DUAL'].includes(R.bowlingStyle(p))&&R.bowlingWorkload(p)>0)],['Spin options','cricket',fit.filter(p=>['SPIN','DUAL'].includes(R.bowlingStyle(p))&&R.bowlingWorkload(p)>0)],['Behind the stumps','shield-check',fit.filter(R.isKeeper)]];
  const partial=fit.length<11,cover=partial?'XI incomplete':profile.oversCapacity>=20&&profile.trustedOversCapacity>=18?'Bowling depth covered':profile.trustedOversCapacity>=16?'A little short on bowling':'Needs another bowling option';
  const note=partial?'Balance your top order, wicketkeeping and bowling attack.':profile.roleFit<84?'Some batters are outside their usual positions.':!fit.some(R.isKeeper)?'No recognised keeper. Check who can take the gloves.':profile.keeping<65?'A recognised keeper is selected, but current glove work needs attention.':profile.death<70?'Late-over bowling needs attention.':'You have options across the innings. Conditions and execution still matter.';
  const row=(key,label)=>{const value=Math.round(profile[key]||0),band=value>=80?'Strong':value>=65?'Competitive':'Needs work';return `<details class="g8matchuprow" data-matchup="${key}" style="--rating-color:${X.ratingTone(value)}"><summary><span class="g8matchuplabel">${esc(label)}</span><strong>${value}</strong><span class="g8strengthtrack" role="img" aria-label="${esc(label)} ${value} out of 99"><span style="--strength:${Math.max(0,Math.min(100,value*100/99))}%"></span></span><span class="g8strengthword">${band}</span></summary><div class="g8matchupdetail"><p>${esc(key==='bowlingResources'?`Full-innings capacity: ${profile.oversCapacity.toFixed(1)} overs. Usual bowling workloads: ${profile.trustedOversCapacity.toFixed(1)} overs. A full innings is 20 overs; part-time options may be needed.`:R.explanation(key,profile))}</p>${X.phaseOptions(key,squad)}</div></details>`;};
  return `<section class="g8teamread g8roleboard"><div class="g8roleboardhead"><span class="g8eyebrow">${squad?'PROJECTED XI · FROM YOUR SQUAD':'YOUR XI'}</span><div class="g8teamrating" style="--rating-color:${fit.length?X.ratingTone(profile.overall):'#c4d7e5'}"><strong>${fit.length?Math.round(profile.overall):"—"}</strong><span>${squad?"Projected XI":"XI rating"}<small>Overall · out of 99</small></span></div><b class="g8coverread">${cover}</b></div><div class="g8matchupboard"><section><h3>Batting</h3>${X.phases.filter(([key])=>['powerplayBat','middleBat','finishing'].includes(key)).map(([k,l])=>row(k,l)).join('')}</section><section><h3>Bowling</h3>${X.phases.filter(([key])=>['newBall','middleBowl','death'].includes(key)).map(([k,l])=>row(k,l)).join('')}</section></div><p>${squad?'Ratings estimate a possible XI; role lists show everyone available. Your manual selection may differ. ':''}${esc(note)} ${partial?'These are early squad estimates.':'Ability ratings describe the side, not a win probability.'}</p><details class="g8moredata"><summary>Keeping, fielding and team balance</summary>${X.phases.filter(([key])=>!['powerplayBat','middleBat','finishing','newBall','middleBowl','death'].includes(key)).map(([k,l])=>row(k,l)).join('')}</details><details class="g8moredata"><summary>Squad roles</summary><div class="g8jobgrid">${groups.map(([label,icon,players])=>`<article class="g8job ${players.length?'g8jobfilled':'g8jobopen'}"><h3>${X.icon(icon)}${label}</h3><div class="g8jobplayers">${players.length?players.map(chip).join(''):'<span class="g8jobempty">No fit option in this group</span>'}</div></article>`).join('')}</div></details></section>`;
 };
 X.draftRead=()=>{
  const ps=roster(),fit=ps.filter(p=>injury(p)?.status!=='OUT'),n=ps.length,slots=Math.max(0,15-n),profile=X.squadProfile();
  const keepers=fit.filter(R.isKeeper).length,batters=fit.filter(p=>p.bat>=50&&R.battingRoleBand(p)!=='TAIL').length,top=fit.filter(p=>p.bat>=50&&['OPEN','TOP'].includes(R.battingRoleBand(p))).length;
  const legal=profile.oversCapacity||0,trusted=profile.trustedOversCapacity||0,bowling=legal>=20&&trusted>=18;
  const available=(G.state.dynasty?.offseason?.phase==='draft'?X.read.freeAgents().map(G.byId):G.state.pool.filter(p=>p.available===true&&!p.draftedBy&&!p.dynastyRetired)).filter(Boolean);
  const guard=window.GCC8_DRAFT_GUARD,candidates=slots?guard.candidates(ps,available,slots,R):[];
  let target={label:'Build around quality',detail:'Start with a player who can anchor your side.',test:()=>true,score:p=>R.roleFit(p)};
  if(n&&!keepers)target={label:'Keeper-batter',detail:'Add a recognised keeper who also fits your batting order.',test:R.isKeeper,score:p=>p.keeping};
  else if(n&&!bowling)target={label:'Dependable bowler',detail:legal<20?`${Math.min(20,legal).toFixed(0)}/20 overs covered. Add a regular bowling option.`:'Your attack relies on part-timers. Add a regular bowler.',test:p=>R.bowlingWorkload(p)>=4&&R.bowlingUsagePrior(p)>=1.5,score:p=>p.bowl};
  else if(n&&(batters<6||top<2))target={label:top<2?'Top-order batter':'Batting depth',detail:top<2?'Give your innings a reliable start.':'Build at least six credible batting options.',test:p=>p.bat>=50&&(top>=2||['OPEN','TOP'].includes(R.battingRoleBand(p))),score:p=>p.bat};
  else if(n&&profile.death<70)target={label:'Death-over bowler',detail:'Your closing overs are the clearest weakness.',test:p=>R.bowlingWorkload(p)>=3,score:p=>R.bowlPhaseScore(p,'death')};
  else if(n){const bat=profile.battingResources<profile.bowlingResources;target={label:bat?'Batting upgrade':'Bowling upgrade',detail:'Core roles are covered. Improve the weaker side of your XI.',test:p=>bat?p.bat>=50:R.bowlingWorkload(p)>=3,score:p=>bat?p.bat:p.bowl};}
  const suggestions=candidates.filter(target.test).sort((a,b)=>target.score(b)-target.score(a)||b.overall-a.overall||a.id-b.id).slice(0,2);
  const gaps=!keepers||!bowling||batters<6||top<2;
  const verdict=!n?'Your squad starts here':n<11?'Building your XI':gaps?'Balance needs attention':profile.overall>=80?'Strong, balanced XI':profile.overall>=65?'Competitive, balanced XI':'Roles covered · build quality';
  return {ps,n,slots,profile,keepers,batters,top,legal,trusted,bowling,target,suggestions,verdict,gaps};
 };
 X.draftSquadSummary=(d=X.draftRead())=>`<section class="g8draftsummary g8draftscore" aria-label="Projected XI rating"><div class="g8draftscorevalue" style="--rating-color:${d.n?X.ratingTone(d.profile.overall):'#c5d9e8'}"><strong>${d.n?Math.round(d.profile.overall):'—'}</strong><small>/ 99</small></div><div><h3>Projected XI</h3><p>${d.n<11?`Provisional · ${d.n}/11 selected`:'Best available XI from your squad'}</p></div></section>`;
 X.draftCompanion=()=>{
  const d=X.draftRead(),role={'BAT':'Batter','BOWL':'Bowler','AR':'All-rounder','WK-BAT':'Keeper'};
  const coverage=[[d.keepers>0,`${d.keepers} keeper${d.keepers===1?'':'s'}`],[d.batters>=6,`${Math.min(6,d.batters)}/6 batters`],[d.bowling,d.legal>=20&&!d.bowling?'More bowling':`${Math.min(20,d.legal).toFixed(0)}/20 overs`]];
  return `<div class="g8sectionhead"><h2>Your draft</h2><span>${d.n}/15 selected</span></div>${X.draftSquadSummary(d)}<section class="g8draftverdict" aria-label="Squad balance"><h3>${esc(d.verdict)}</h3><div class="g8draftcoverage">${coverage.map(([ok,label])=>`<span class="${ok?'g8covered':'g8gap'}"><b aria-hidden="true">${ok?'✓':'○'}</b>${esc(label)}</span>`).join('')}</div></section><section class="g8draftnext" aria-label="Next pick guidance"><div class="g8draftsubhead"><h3>${d.slots?'Look for next':'Before the season'}</h3><span>${d.slots?d.slots+' spot'+(d.slots===1?'':'s')+' left':'Squad full'}</span></div><strong>${esc(d.slots?d.target.label:d.gaps?'Check your XI balance':'Ready to select your XI')}</strong><p>${esc(d.slots?d.target.detail:d.gaps?'Use the team room to check keeper, batting and bowling coverage.':'Choose your XI and batting order in the team room.')}</p>${d.slots?(d.suggestions.length?`<div class="g8draftsuggestions">${d.suggestions.map(p=>`<button type="button" class="g8button g8draftsuggestion" data-action="inspect" data-args="[${p.id}]" aria-label="Scout suggested ${esc(p.name)}"><span><b>${esc(p.name)}</b><small>${esc(role[p.role])} · Overall ${p.overall}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>`:'<p class="g8fine">No matching specialist is currently available. Compare the remaining options.</p>'):''}</section><section class="g8draftselected" aria-label="Selected players"><div class="g8draftsubhead"><h3>Selected players</h3><span>${d.n}/15</span></div>${d.n?`<div class="g8draftpickedlist">${d.ps.map(p=>`<button type="button" class="g8button g8draftpicked" data-action="inspect" data-args="[${p.id}]" aria-label="Scout selected ${esc(p.name)}, ${esc(role[p.role])}, overall ${p.overall}"><span><b>${esc(p.name)}</b></span><span class="g8draftpickedmeta"><small>${esc(p.role==='WK-BAT'?'WK':p.role)}</small><strong style="--rating-color:${X.ratingTone(p.overall)}">${p.overall}</strong></span></button>`).join('')}</div>`:'<p class="g8draftempty">Your selections will appear here as you pick.</p>'}</section><div class="g8draftsecondary">${btn('Analysis','draftDetail',['analysis'],'g8ghost g8small')}${btn('League picks','draftDetail',['picks'],'g8ghost g8small')}</div>`;
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
  const general=[['Overall',p.overall,q.overall],['Batting',p.bat,q.bat],['Bowling',p.bowl,q.bowl],['Fielding',p.fielding,q.fielding],['Keeping',p.keeping,q.keeping]],batting=['powerplay','middle','death'].map((k,i)=>[['Powerplay batting','Middle batting','Death batting'][i],R.batPhaseScore(p,k),R.batPhaseScore(q,k)]),bowling=['newBall','middle','death'].map((k,i)=>[['New-ball bowling','Middle bowling','Death bowling'][i],R.bowlPhaseScore(p,k),R.bowlPhaseScore(q,k)]);
  const focus=p.role==='BOWL'?bowling.concat([general[3]]):p.role==='WK-BAT'?[general[4],general[1],general[3]]:p.role==='AR'?general.slice(1,4):batting.concat([general[3]]),job=p.role==='BOWL'?'Bowling options':p.role==='WK-BAT'?'Wicketkeeping options':p.role==='AR'?'All-round options':'Batting options';
  const different=p.role!==q.role;
  const ratings=(label,rows)=>`<section class="g8comparemetrics" aria-label="${esc(label)}"><h3>${esc(label)}</h3>${rows.map(([name,a,b])=>`<section class="g8comparemetric"><h4>${esc(name)}</h4>${X.abilityRead(p.name,a)}${X.abilityRead(q.name,b).replace('class="g8abilitybar g8rated"','class="g8abilitybar g8rated g8comparesecond"')}</section>`).join('')}</section>`;
  return `<div class="g8compareidentities">${[p,q].map((x,i)=>`<section><span class="g8eyebrow">${i?'ALTERNATIVE':'YOU OPENED'}</span><h3>${esc(x.name)}</h3><p>${esc(X.roleLine(x))}</p><span>${x.birthYear?'Age '+(s.year-x.birthYear)+' · ':''}${s.xi.includes(x.id)?'In your XI · ':''}${esc(injury(x)?.status||X.form(x))}</span>${actions[x.id]||''}</section>`).join('')}</div>${p.role!==q.role?'<p class="g8comparecontext">These players have different roles. Compare the job you need to fill.</p>':''}${ratings(different?'Different squad roles':job,different?general.slice(1):focus)}${X.disclosure('All ability ratings',ratings('Current ability · out of 99',general))}${X.disclosure('Innings skills',ratings('Batting and bowling phases',batting.concat(bowling)))}`;
 };
})();
