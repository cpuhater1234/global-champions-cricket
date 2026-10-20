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
  const partial=fit.length<11,cover=partial?'Still taking shape':profile.oversCapacity>=20&&profile.trustedOversCapacity>=18?'Bowling depth covered':profile.trustedOversCapacity>=16?'A little short on bowling':'Needs another bowling option';
  const note=partial?'Keep building the side around its cricket jobs.':profile.roleFit<84?'Some batting jobs sit outside these players’ usual roles.':!fit.some(R.isKeeper)?'No recognised keeper. Check who can take the gloves.':profile.keeping<65?'A recognised keeper is selected, but current glove work needs attention.':profile.death<70?'Late-over bowling needs attention.':'You have options across the innings. Conditions and execution still matter.';
  const row=(key,label)=>{const value=Math.round(profile[key]||0),band=value>=80?'Strong':value>=65?'Competitive':'Needs work';return `<details class="g8matchuprow" data-matchup="${key}"><summary><span class="g8matchuplabel">${esc(label)}</span><strong>${value}</strong><span class="g8strengthtrack" role="img" aria-label="${esc(label)} ${value} out of 99"><span style="--strength:${Math.max(0,Math.min(100,value*100/99))}%"></span></span><span class="g8strengthword">${band}</span></summary><div class="g8matchupdetail"><p>${esc(key==='bowlingResources'?`Full-innings capacity: ${profile.oversCapacity.toFixed(1)} overs. Usual bowling workloads: ${profile.trustedOversCapacity.toFixed(1)} overs. A full innings is 20 overs; part-time options may be needed.`:R.explanation(key,profile))}</p>${X.phaseOptions(key,squad)}</div></details>`;};
  return `<section class="g8teamread g8roleboard"><div class="g8roleboardhead"><span class="g8eyebrow">${squad?'PROJECTED XI · FROM YOUR SQUAD':'YOUR XI'}</span><div class="g8teamrating"><strong>${fit.length?Math.round(profile.overall):"—"}</strong><span>${squad?"Projected XI":"XI rating"}</span></div><b class="g8coverread">${cover}</b></div><div class="g8matchupboard"><section><h3>Batting</h3>${X.phases.filter(([key])=>['powerplayBat','middleBat','finishing'].includes(key)).map(([k,l])=>row(k,l)).join('')}</section><section><h3>Bowling</h3>${X.phases.filter(([key])=>['newBall','middleBowl','death'].includes(key)).map(([k,l])=>row(k,l)).join('')}</section></div><p>${squad?'Ratings estimate a possible XI; role lists show everyone available. Your manual selection may differ. ':''}${esc(note)} ${partial?'These are early squad estimates.':'Ability ratings describe the side, not a win probability.'}</p><details class="g8moredata"><summary>Keeping, fielding and team balance</summary>${X.phases.filter(([key])=>!['powerplayBat','middleBat','finishing','newBall','middleBowl','death'].includes(key)).map(([k,l])=>row(k,l)).join('')}</details><details class="g8moredata"><summary>Players in each cricket role</summary><div class="g8jobgrid">${groups.map(([label,icon,players])=>`<article class="g8job ${players.length?'g8jobfilled':'g8jobopen'}"><h3>${X.icon(icon)}${label}</h3><div class="g8jobplayers">${players.length?players.map(chip).join(''):'<span class="g8jobempty">No fit option in this group</span>'}</div></article>`).join('')}</div></details></section>`;
 };
 X.squadRoster=()=>{
  const groups=[['WK-BAT','Keepers'],['BAT','Batters'],['AR','All-rounders'],['BOWL','Bowlers']];
  return `<div class="g8dressingroom">${groups.map(([role,label])=>{const players=roster().filter(p=>p.role===role);return players.length?`<section class="g8squadgroup g8role-${role}"><h3>${label}</h3>${players.map(p=>`<div class="g8squadmember"><button type="button" class="g8button g8squadscout" data-action="inspect" data-args="${esc(JSON.stringify([p.id]))}" aria-label="Scout ${esc(p.name)}, current rating ${p.overall}"><span class="g8selectedname">${esc(p.name)}</span><span class="g8selectedmeta"><b class="g8rowrating">${p.overall}</b><span>Scout player →</span></span></button></div>`).join('')}</section>`:'';}).join('')}</div>`;
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
  const ratings=(label,rows)=>`<section class="g8comparemetrics" aria-label="${esc(label)}"><h3>${esc(label)}</h3>${rows.map(([name,a,b])=>`<section class="g8comparemetric"><h4>${esc(name)}</h4>${X.abilityRead(p.name,a)}${X.abilityRead(q.name,b).replace('class="g8abilitybar"','class="g8abilitybar g8comparesecond"')}</section>`).join('')}</section>`;
  return `<div class="g8compareidentities">${[p,q].map((x,i)=>`<section><span class="g8eyebrow">${i?'ALTERNATIVE':'YOU OPENED'}</span><h3>${esc(x.name)}</h3><p>${esc(X.roleLine(x))}</p><span>${x.birthYear?'Age '+(s.year-x.birthYear)+' · ':''}${s.xi.includes(x.id)?'In your XI · ':''}${esc(injury(x)?.status||X.form(x))}</span>${actions[x.id]||''}</section>`).join('')}</div>${p.role!==q.role?'<p class="g8comparecontext">These players have different roles. Compare the job you need to fill.</p>':''}${ratings(different?'Different squad roles':job,different?general.slice(1):focus)}${X.disclosure('All ability ratings',ratings('Current ability · out of 99',general))}${X.disclosure('Innings skills',ratings('Batting and bowling phases',batting.concat(bowling)))}`;
 };
})();
