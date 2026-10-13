(() => {
 const X=window.GCC8,{G,D,R,read,ui,views,esc,btn,badge,roster,playerCard,profile,phases,injury,form}=X,s=G.state,clock=window.GCC8_CLOCK;
 const stage=document.getElementById('g8stage'),hud=document.getElementById('g8hud'),dialog=document.getElementById('g8dialog'),content=document.getElementById('g8dialogContent');
 const commands={},allow={},own=()=>s.userClub?.abbr,annual=()=>ui.view==='dynasty'&&s.dynasty?.offseason?.phase==='draft';
 let busy=false,lastSignature='',archiveReturn='season',dialogOpener=null;
 X.hasSave=()=>!!s.dynasty?.started||!!localStorage.getItem('gcc_dynasty_v8')||!!localStorage.getItem('gcc_dynasty_v7_2');
 const announce=t=>{document.getElementById('g8feedback').textContent=t;};
 const bind=(name,where,fn)=>{commands[name]=fn;allow[name]=where;};
 const assert=(condition,text)=>{if(!condition)throw new Error(text);};
 function closeDialog(){if(dialog.open)dialog.close();ui.modal=null;const opener=dialogOpener;dialogOpener=null;opener?.focus?.({preventScroll:true});if(ui.view!=='home')clock.resume();}
 function modal(title,body,key='info'){
  if(!dialog.open)dialogOpener=document.activeElement;
  clock.pause();ui.modal=key;content.innerHTML=`<span class="g8eyebrow">GLOBAL CHAMPIONS CRICKET</span><h2 id="g8dialogTitle">${esc(title)}</h2>${body}<div class="g8actions">${btn('Close','close')}</div>`;
  if(!dialog.open)dialog.showModal();
 }
 function setView(view){assert(views[view],`Unknown screen: ${view}`);ui.view=view;ui.modal=null;if(dialog.open)dialog.close();if(view==='home'||view==='story')clock.pause();else clock.resume();render(true);}
 function render(changed=false){
  const active=document.activeElement,id=active?.id,within=stage.contains(active),focusAction=active?.dataset?.action,focusArgs=active?.dataset?.args,focusInHud=hud.contains(active),start=active?.selectionStart,end=active?.selectionEnd,x=window.scrollX,y=window.scrollY;
  const wire=document.getElementById('g8wire'),wireScroll=wire?.scrollTop||0;
  const body=views[ui.view]();
  stage.dataset.view=ui.view;
  stage.innerHTML=body;
  hud.innerHTML=`<div class="g8hudclub"><span class="g8brand">GCC</span>${s.userClub?`${badge(s.userClub)}<div><strong>${esc(s.userClub.name)}</strong><small>${s.year} · ${s.dynasty?.offseason?'Offseason':s.fullSchedule.length?'Round '+s.round:'Foundation'}</small></div>`:''}</div><nav aria-label="Game menu">${s.userClub?btn('Club archive','archive',[],'g8ghost g8small',!s.dynasty?.history?.length):''}${s.dynasty?btn('Export save','export',[],'g8ghost g8small'):''}${btn('How to play','how',[],'g8ghost g8small')}${btn('Title screen','home',[],'g8ghost g8small')}</nav>`;
  if(changed){stage.focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});}
  else{
   const next=(id&&document.getElementById(id))||(focusAction?[...(focusInHud?hud:stage).querySelectorAll('button[data-action]')].find(b=>b.dataset.action===focusAction&&b.dataset.args===focusArgs):null);if(next&&!next.disabled){next.focus({preventScroll:true});if(typeof next.setSelectionRange==='function'&&start!==null)try{next.setSelectionRange(start,end);}catch{}}
   window.scrollTo({left:x,top:y,behavior:'instant'});
   const newWire=document.getElementById('g8wire');if(newWire)newWire.scrollTop=wireScroll;
  }
  ui.lastScreen=X.screen();lastSignature=signature();
 }
 function signature(){return JSON.stringify([X.screen(),s.year,s.recruit?.day,s.recruit?.running,s.recruit?.complete,s.recruit?.feedSeq,s.pickIndex,s.dynasty?.offseason?.phase,s.dynasty?.offseason?.pickCursor,s.round,s.finals?.stage,s.dynasty?.transactions?.[0]?.seq]);}
 X.afterTick=()=>{
  if(['home','story','leagueDraw','draftDraw','archive','result'].includes(ui.view)||ui.modal)return;
  const key=signature();if(key===lastSignature)return;
  if(ui.view==='recruit'){
   const el=document.getElementById('g8live'),wire=document.getElementById('g8wire'),scroll=wire?.scrollTop||0,active=document.activeElement;
   const action=active?.dataset?.action;el.innerHTML=X.signingLive();if(scroll&&document.getElementById('g8wire'))document.getElementById('g8wire').scrollTop=scroll;
   if(action)el.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});lastSignature=key;
  }else render(false);
 };
 function save(){if(s.dynasty&&!read.save())announce('This device could not save the dynasty. Export it before closing.');}
 function resetFilters(){ui.search='';ui.filter='ALL';ui.draftShown=24;}
 function draftable(id){return (annual()?read.freeAgents():s.pool.filter(p=>p.available===true&&!p.draftedBy&&!p.dynastyRetired).map(p=>p.id)).includes(Number(id));}
 function inspect(id){
  ui.scoutReturn=ui.modal==='trade'?'trade':null;const p=G.byId(Number(id));assert(p,'That player is no longer available.');ui.selectedPlayer=p.id;
  const batting=[['Powerplay',R.batPhaseScore(p,'powerplay')],['Middle overs',R.batPhaseScore(p,'middle')],['Death',R.batPhaseScore(p,'death')]];
  const bowling=[['New ball',R.bowlPhaseScore(p,'newBall')],['Middle overs',R.bowlPhaseScore(p,'middle')],['Death',R.bowlPhaseScore(p,'death')]];
  const rows=a=>a.map(([l,n])=>`<div class="g8statrow"><span>${esc(l)}</span><b>${Math.round(n)}</b></div>`).join('');
  const current=X.draftCurrent(annual()),canDraft=['draft','dynasty'].includes(ui.view)&&current?.club.abbr===own()&&draftable(p.id);
  modal(p.name,`<p>${esc(p.country)} · ${esc(p.role)} · Age ${s.year-(p.birthYear||s.year-28)} · ${esc(form(p))}</p><div class="g8trade"><section class="g8sheet"><span class="g8eyebrow">BATTING</span>${rows(batting)}</section><section class="g8sheet"><span class="g8eyebrow">BOWLING</span>${rows(bowling)}</section></div><p>Fielding ${p.fielding} · Keeping ${p.keeping} · Preferred batting position ${p.preferredSlot}</p>${injury(p)?`<p>${esc(injury(p).status)} · ${injury(p).roundsLeft} rounds to recover</p>`:''}<p>${p.birthYear?(s.year-p.birthYear<24?'A young player still developing.':s.year-p.birthYear>33?'An experienced player in the later part of his career.':'A player in the main years of his career.'):''}</p><div class="g8actions">${canDraft?btn('Draft '+p.name,'draftPlayer',[p.id],'g8primary'):''}${['team'].includes(ui.view)&&roster().some(x=>x.id===p.id)&&!s.xi.includes(p.id)?btn(s.xi.length===11?'Swap into XI':'Select for XI',s.xi.length===11?'swapIn':'select',[p.id],'g8primary',injury(p)?.status==='OUT'):''}</div>`,'player');
 }
 function scorecard(r){
  assert(r?.scorecard,'This match has no scorebook.');
  const table=(caption,heads,rows)=>`<div class="g8tablewrap"><table class="g8table"><caption>${esc(caption)}</caption><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  modal('The match scorebook',r.scorecard.innings.map(i=>`<section class="g8sheet"><h3>${esc(i.club.name)} · ${i.total}/${i.wickets} (${i.overs} overs)</h3>${table('Batting',['Player','Dismissal','R','B','4','6','SR'],i.batting.map(b=>[b.player.name,b.dismissal,b.runs,b.balls,b.fours,b.sixes,b.sr?.toFixed(1)||'–']))}<p>Extras ${i.extras} · Powerplay ${i.phases.pp} · Middle ${i.phases.mid} · Death ${i.phases.death}</p>${table('Bowling',['Player','O','R','W','Econ'],i.bowling.map(b=>[b.player.name,`${Math.floor(b.balls/6)}.${b.balls%6}`,b.runs,b.wickets,Number(b.economy||0).toFixed(2)]))}</section>`).join(''),'scorecard');
 }
 function trade(mid=false){
  assert(mid?(s.round===7&&!s.dynasty.midseasonDone[s.year]):['market','lottery'].includes(s.dynasty?.offseason?.phase),'The trade window is closed.');
  ui.tradeMid=mid;ui.tradeClub=s.league.find(c=>c.abbr!==own())?.abbr;ui.tradeOffer=roster().find(p=>!p.dynastyReplacement)?.id;
  ui.tradeTarget=s.teams[ui.tradeClub]?.[0];ui.tradePick='';tradeDialog();
 }
 function tradeDialog(){
  const options=(ids,value)=>ids.map(G.byId).filter(p=>p&&!p.dynastyReplacement).map(p=>`<option value="${p.id}" ${value===p.id?'selected':''}>${esc(p.name)} · ${p.role} · ${p.overall}</option>`).join('');
  const p=G.byId(ui.tradeTarget),off=G.byId(ui.tradeOffer);
  modal('Work the phones.',`<p>${ui.tradeMid?'Midseason':'Offseason'} · Compare what each player brings to the new side.</p><div class="g8trade"><section><label>Club<select data-input="tradeClub">${s.league.filter(c=>c.abbr!==own()).map(c=>`<option value="${c.abbr}" ${ui.tradeClub===c.abbr?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Player wanted<select data-input="tradeTarget">${options(s.teams[ui.tradeClub],ui.tradeTarget)}</select></label>${p?playerCard(p):''}</section><section><label>Your offer<select data-input="tradeOffer">${options(s.teams[own()],ui.tradeOffer)}</select></label>${off?playerCard(off):''}${!ui.tradeMid?`<label>Draft pick offered<select data-input="tradePick"><option value="">No pick</option>${['R1','R2'].filter(read.ownsPick).map(k=>`<option ${ui.tradePick===k?'selected':''}>${k}</option>`).join('')}</select></label>`:''}</section></div><p>Wanted: ${p?D.marketBand(D.tradeValue(p,own())):'–'} value to your club. Offered: ${off?D.marketBand(D.tradeValue(off,ui.tradeClub)):'–'} value to theirs.</p><p>Age and form affect the deal. The other club can refuse an offer that weakens its squad.</p><div id="g8tradeReply" class="g8notice" hidden></div><div class="g8actions">${btn('Put the offer to the club','propose',[],'g8primary',!p||!off)}</div>`,'trade');
 }
 bind('home','*',()=>{G.pauseSeason();ui.resumeView=ui.view;save();setView('home');});
 bind('play',['home'],()=>{if(X.hasSave())modal('Start a new dynasty?','<p>Your v8 save will be replaced. Export the current dynasty first if you want to keep it.</p><div class="g8actions">'+btn('Export current save','export')+btn('Start a new dynasty','fresh',[],'g8primary')+'</div>','fresh');else setView('story');});
 bind('fresh',['home'],()=>{assert(ui.modal==='fresh','Open the new dynasty prompt first.');closeDialog();ui.newCareer=true;setView('story');});
 bind('world',['story'],()=>{read.fresh();G.skipLeagueReveal();ui.revealed=0;setView('leagueDraw');save();});
 bind('revealClub',['leagueDraw'],()=>{ui.revealed=Math.min(8,ui.revealed+1);});
 bind('revealAll',['leagueDraw'],()=>{ui.revealed=8;});
 bind('clubs',['leagueDraw'],()=>{assert(ui.revealed===8,'Reveal the clubs first.');G.finishLeagueReveal();setView('clubs');});
 bind('club',['clubs'],i=>{assert(Number.isInteger(i)&&i>=0&&i<s.league.length,'Choose one of the eight clubs.');G.selectClub(i);});
 bind('confirmClub',['clubs'],()=>{assert(!s.userClub,'Your club has already been chosen.');assert(s.selectedClub!==null,'Choose a club.');G.confirmClub();setView('recruit');});
 bind('continue',['home'],()=>{assert(X.hasSave(),'There is no saved dynasty.');clock.resume();D.resumeSave();assert(s.dynasty?.started,'The save could not be restored.');const view=X.screen();setView(view==='world'?'clubs':view);if(view==='archive')archiveReturn=s.dynasty.careerClosed?'legacy':s.dynasty.offseason?'dynasty':s.dynasty.archiveReturnScreen||'season';});
 bind('how','*',()=>modal('How to play','<p>Take over one of eight clubs. The five-day signing window decides which players enter the league. These are not signings for your club.</p><p>Build a fifteen-player squad in a fifteen-round snake draft. Scout names on the board and consider batting, bowling, keeping and your home ground.</p><p>Choose eleven manually. Move their batting order up or down, and swap players when form, injuries or conditions demand it. Ratings describe quality; results show whether your plans work.</p><p>Play fourteen league matches. The top four enter two semi-finals, followed by a Grand Final. Each offseason brings retirements, contract decisions, trades and a new random draft order.</p><p>Autosave keeps the career on this browser. Export a JSON save to keep a separate copy. The career ends after the 2026 season.</p>'));
 bind('close','*',()=>{const back=ui.modal==='player'&&ui.scoutReturn==='trade';closeDialog();if(back)tradeDialog();});
 bind('signingRun',['recruit'],()=>G.runRecruitment());
 bind('signingSpeed',['recruit'],()=>{G.cycleRecruitSpeed();announce(['Signing speed 1×','Signing speed 2×','Signing speed 4×'][s.recruit.speedIndex]);});
 bind('signingSkip',['recruit'],()=>G.skipRecruitment());
 bind('draftDraw',['recruit'],()=>{assert(s.recruit.complete,'Wait for the signing window to close.');G.setupDraft();G.skipDraftReveal();setView('draftDraw');});
 bind('beginDraft',['draftDraw'],()=>{G.beginDraft();resetFilters();setView('draft');});
 bind('skipPick',['draft','dynasty'],()=>{if(annual())D.runCpuDraftUntilUser();else G.skipToMyPick();});
 bind('more',['draft','dynasty'],()=>{ui.draftShown+=24;});
 bind('inspect','*',inspect);
 bind('draftPlayer',['draft','dynasty'],id=>{assert(ui.modal==='player','Scout the player before confirming your pick.');const current=X.draftCurrent(annual());assert(current?.club.abbr===own(),'Another club is on the clock.');assert(draftable(id),'That player is no longer on the board.');closeDialog();if(annual())D.userAnnualDraft(Number(id));else G.userDraft(Number(id));announce(`${G.byId(Number(id)).name} joins your squad.`);});
 bind('team',['draft'],()=>{assert(s.pickIndex>=120&&roster().length===15,'Finish the draft first.');G.enterTeamRoom();ui.teamReturn='season';setView('team');});
 bind('editXI',['season','finals'],from=>{ui.teamReturn=from==='finals'?'finals':'season';G.go('team');setView('team');});
 bind('select',['team'],id=>{assert(roster().some(p=>p.id===Number(id)),'Choose a player from your squad.');assert(s.xi.length<11&&!s.xi.includes(Number(id)),'The XI is already full.');assert(injury(G.byId(Number(id)))?.status!=='OUT','That player is unavailable.');closeDialog();G.toggleXI(Number(id));});
 bind('remove',['team'],id=>{assert(s.xi.includes(Number(id)),'That player is not in the XI.');G.removeXI(Number(id));});
 bind('move',['team'],(id,dir)=>{assert(s.xi.includes(Number(id))&&[-1,1].includes(Number(dir)),'Choose a valid place in the batting order.');G.moveBattingPlayer(Number(id),Number(dir));});
 bind('swapIn',['team'],id=>{assert(roster().some(p=>p.id===Number(id)),'Choose a player from the squad.');closeDialog();G.beginSwap(Number(id));});
 bind('swapOut',['team'],id=>{assert(s.pendingSwapIn&&s.xi.includes(Number(id)),'Choose a player to replace.');G.replaceXI(Number(id));});
 bind('cancelSwap',['team'],()=>G.cancelSwap());
 bind('clearXI',['team'],()=>G.clearXI());
 bind('naturalOrder',['team'],()=>G.autoOrderXI());
 bind('rating',['team','review'],key=>{assert(phases.some(([k])=>k===key),'Choose a cricket rating.');const p=profile();modal(phases.find(([k])=>k===key)[1],`<p>${Math.round(p[key])}/99 · ${esc(R.explanation(key,p))}</p><p>XI ability ${Math.round(p.overall)}/99 · Role fit ${Math.round(p.roleFit)}/99 · Keeping ${Math.round(p.keeping)}/99</p><p>The selected eleven and their batting order determine this read. The scorebooks show what happens in matches.</p>`);});
 bind('lodge',['team'],()=>{assert(!read.xiProblem(),read.xiProblem());if(ui.teamReturn==='finals'&&s.finals){G.go('finals');setView('finals');}else{G.startSeason();assert(s.fullSchedule.length===14,'The fixture could not be created.');setView('season');}});
 bind('seasonTab',['season'],tab=>{assert(['matchday','ladder','fixtures','players'].includes(tab),'Unknown season view.');ui.seasonTab=tab;});
 bind('matchday',['result'],()=>{G.go('season');setView('season');});
 bind('prepare',['season'],()=>{
  const fx=G.nextUserFixture();assert(fx,'The regular season is finished.');const problem=read.xiProblem();assert(!problem,problem);const c=G.matchGroundForFixture(fx),weather=G.matchWeather?.(fx.home,fx.round),op=fx.home.abbr===own()?fx.away:fx.home;
  modal(`Round ${s.round+1} · ${s.userClub.name} v ${op.name}`,`<p>${esc(fx.home.ground)} · ${esc(c?.trait||fx.home.trait)} · ${esc(weather?.label||weather?.name||'')}</p><p>Your XI is lodged. The batting order is the one you set in the team room.</p><ol class="g8roster">${s.battingOrder.map((id,i)=>`<li><b>${i+1}. ${esc(G.byId(id)?.name)}</b><small>${esc(G.byId(id)?.role)}</small></li>`).join('')}</ol><div class="g8actions">${btn('Play the match','playMatch',[s.round+1],'g8primary')}${btn('Change XI','editXI')}</div>`,'prepare');
 });
 bind('playMatch',['season'],round=>{assert(ui.modal==='prepare'&&round===s.round+1,'Prepare the next match first.');assert(!read.xiProblem(),read.xiProblem());closeDialog();G.playNextRound();assert(s.round===round,'The match could not be played.');ui.result=s.results.at(-1);setView('result');});
 bind('result',['season'],round=>{ui.result=s.results.find(r=>r.round===Number(round));assert(ui.result,'That match is not complete.');setView('result');});
 bind('resultScorecard',['result'],()=>scorecard(ui.result));
 bind('scorecard',['season'],round=>scorecard(s.results.find(r=>r.round===Number(round))));
 bind('finalScorecard',['finals'],(type,i)=>scorecard(type==='gf'?s.finals.gf:s.finals.semis[i]));
 bind('postSeason',['season'],()=>{assert(s.round===14,'Finish the regular season first.');if(s.regularSeasonPosition<=4&&read.xiProblem()){ui.teamReturn='season';G.go('team');setView('team');announce('Review availability and name your finals XI.');return;}G.proceedPostSeason();setView(X.screen());if(ui.view==='review')read.archive();});
 bind('simulateFinals',['finals'],()=>{assert(['ready','gf-ready'].includes(s.finals?.stage),'The next finals match is not ready.');const stageBefore=s.finals.stage;G.simulateFinals();assert(s.finals.stage!==stageBefore,'Review your XI before the finals match.');});
 bind('advanceFinals',['finals'],()=>{assert(s.finals?.stage==='semis','Play the semi-finals first.');G.advanceFinals();});
 bind('finalsReturn',['result'],()=>setView('finals'));
 bind('review',['finals'],()=>{assert(s.finals?.stage==='done','Finish the Grand Final first.');G.openSeasonReview();read.archive();setView('review');});
 bind('averages',['review'],()=>modal('Season averages',X.averages()));
 bind('offseason',['review'],()=>{assert(s.round===14&&s.year<2026&&s.champion,'Finish the season first.');D.beginOffseason();resetFilters();setView('dynasty');});
 bind('finishCareer',['review'],()=>{assert(s.year===2026&&s.dynasty.archivedYears[2026],'Close the 2026 season first.');D.finishCareer();setView('legacy');});
 bind('cpuMarket',['dynasty'],()=>{assert(s.dynasty.offseason?.phase==='market','The trade period is closed.');D.runCpuMarket();});
 bind('annualDraw',['dynasty'],()=>{assert(s.dynasty.offseason?.phase==='market','The market is already closed.');D.drawDraftOrder();});
 bind('annualDraft',['dynasty'],()=>{assert(s.dynasty.offseason?.phase==='lottery','Draw the order first.');D.startAnnualDraft();resetFilters();});
 bind('annualList',['dynasty'],()=>{assert(s.dynasty.offseason?.draftComplete,'Finish the annual draft first.');D.renderOffseason();});
 bind('lodgeList',['dynasty'],()=>{assert(s.dynasty.offseason?.phase==='cuts'&&roster().length===15,'Lodge exactly fifteen players.');D.finishOffseason();});
 bind('annualTeam',['dynasty'],()=>{assert(s.dynasty.offseason?.phase==='ready','Lodge the final list first.');D.enterTeamRoom();ui.teamReturn='season';setView('team');});
 bind('release',['dynasty'],id=>{assert(s.dynasty.offseason?.phase==='market'&&read.contractCandidates().includes(Number(id)),'That contract is not due.');modal(`Release ${G.byId(Number(id)).name}?`,`<p>This opens a place in the annual draft. The player returns to the free-agent pool.</p><div class="g8actions">${btn('Confirm release','confirmRelease',[Number(id)],'g8danger')}</div>`,'release');});
 bind('confirmRelease',['dynasty'],id=>{assert(ui.modal==='release'&&read.contractCandidates().includes(Number(id)),'Open the contract decision first.');const budget=read.cutBudget(),o=s.dynasty.offseason;assert(o.voluntaryCuts.length+o.finalCuts.length<budget.limit,'No optional release remains.');D.releaseContractPlayer(Number(id));closeDialog();});
 bind('finalCut',['dynasty'],id=>{assert(s.dynasty.offseason?.phase==='cuts'&&roster().length>15,'Only an overfull list needs a final correction.');D.cutPlayer(Number(id));});
 bind('trade',['dynasty','season'],trade);
 bind('propose',['dynasty','season'],()=>{
  assert(ui.modal==='trade','Open the trade room first.');assert(ui.tradeMid?s.round===7&&!s.dynasty.midseasonDone[s.year]:['market','lottery'].includes(s.dynasty?.offseason?.phase),'The trade window is closed.');
  // The transitional domain command still reads its own hidden form. Visible IDs never collide.
  D.openTradeCentre(ui.tradeMid);document.getElementById('tradeClub').value=ui.tradeClub;D.refreshTradeTarget();document.getElementById('tradeTarget').value=String(ui.tradeTarget);document.getElementById('tradeOffer').value=String(ui.tradeOffer);const pick=document.getElementById('tradePick');if(pick)pick.value=ui.tradePick;
  D.proposeTrade(ui.tradeMid);const reply=document.getElementById('g8tradeReply');reply.hidden=false;reply.textContent=document.getElementById('tradeRead').textContent;G.closeModal();
 });
 bind('cover',['team'],id=>{const p=G.byId(Number(id));assert(p&&injury(p)?.status==='OUT'&&!s.dynasty.replacementFor[p.id],'Choose a player who needs injury cover.');modal(`Cover ${p.name}`,`<p>The replacement stays until ${esc(p.name)} is cleared to play.</p><div class="g8board">${read.replacements(p.id).slice(0,18).map(G.byId).map(p=>playerCard(p,'signCover','Sign as cover')).join('')}</div>`,'cover');ui.coverId=Number(id);});
 bind('signCover',['team'],id=>{assert(ui.modal==='cover'&&read.replacements(ui.coverId).includes(Number(id)),'Choose an eligible replacement.');D.signReplacement(ui.coverId,Number(id));closeDialog();});
 bind('archive','*',()=>{assert(s.dynasty?.history?.length,'The archive opens after your first completed season.');archiveReturn=ui.view==='archive'?archiveReturn:ui.view;D.openArchive();setView('archive');});
 bind('archiveBack',['archive'],()=>{D.backFromArchive();setView(views[archiveReturn]?archiveReturn:X.screen());});
 bind('archiveSeason',['archive'],year=>{const h=s.dynasty.history.find(h=>h.year===Number(year));assert(h,'That season is not in the archive.');const stats=Object.entries(h.userPlayerStats||{}).sort((a,b)=>b[1].runs-a[1].runs);modal(`${year} · The club scorebook`,`<p>${h.wins} wins · ${h.losses} losses · Finished ${h.userPosition}</p><div class="g8tablewrap"><table class="g8table"><thead><tr><th>Player</th><th>Matches</th><th>Runs</th><th>Wickets</th></tr></thead><tbody>${stats.map(([id,t])=>`<tr><td>${esc(G.byId(Number(id))?.name||id)}</td><td>${t.matches||0}</td><td>${t.runs||0}</td><td>${t.wickets||0}</td></tr>`).join('')}</tbody></table></div>`);});
 bind('export','*',()=>{if(s.dynasty?.started)D.exportSave();else{const raw=localStorage.getItem('gcc_dynasty_v8')||localStorage.getItem('gcc_dynasty_v7_2');assert(raw,'There is no dynasty to export.');const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='gcc_dynasty_save.json';a.click();clock.setTimeout(()=>URL.revokeObjectURL(url),500);}announce('Dynasty exported.');});
 bind('import',['home'],()=>{
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.onchange=()=>{const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{
   try{const loaded=JSON.parse(reader.result);assert(loaded?.state&&Number.isInteger(loaded.state.year)&&loaded.state.year>=2008&&loaded.state.year<=2026&&Array.isArray(loaded.state.league)&&loaded.state.league.length===8&&Array.isArray(loaded.state.pool),'That file is not a supported GCC dynasty.');
    localStorage.setItem('gcc_dynasty_v8',JSON.stringify(loaded));clock.resume();D.resumeSave();setView(X.screen());save();
   }catch(e){announce(e.message||'The save could not be imported.');clock.pause();}
  };reader.onerror=()=>announce('The save file could not be read.');reader.readAsText(file);};input.click();
 });
 X.dispatch=(action,args=[])=>{
  if(busy)return false;assert(Array.isArray(args),'Invalid command arguments.');
  const fn=commands[action];if(!fn){announce('That control is unavailable.');return false;}
  const where=allow[action];if(where!=='*'&&!where.includes(ui.view)){announce('That action belongs to a different stage of the career.');return false;}
  busy=true;const view=ui.view,x=window.scrollX,y=window.scrollY;
  try{document.getElementById('g8feedback').textContent='';fn(...args);save();if(ui.view===view&&!ui.modal)render(false);return true;}
  catch(e){announce(e.message||'The action could not be completed.');return false;}
  finally{G.closeModal();busy=false;if(ui.view===view)window.scrollTo({left:x,top:y,behavior:'instant'});}
 };
 document.getElementById('g8app').addEventListener('click',event=>{const b=event.target.closest?.('button[data-action]');if(!b||b.disabled)return;X.dispatch(b.dataset.action,JSON.parse(b.dataset.args||'[]'));});
 document.getElementById('g8app').addEventListener('input',event=>{
  const el=event.target,key=el.dataset?.input;if(!key)return;
  if(key==='search'&&['draft','dynasty'].includes(ui.view)){ui.search=el.value;ui.draftShown=24;const board=document.getElementById('g8pool');board.innerHTML=X.poolBoard(annual());}
 });
 document.getElementById('g8app').addEventListener('change',event=>{
  const el=event.target,key=el.dataset?.input;if(key==='filter'){ui.filter=el.value;ui.draftShown=24;document.getElementById('g8pool').innerHTML=X.poolBoard(annual());}
  if(key?.startsWith('trade')&&ui.modal==='trade'){
   ui[key]=['tradeOffer','tradeTarget'].includes(key)?Number(el.value):el.value;if(key==='tradeClub')ui.tradeTarget=s.teams[ui.tradeClub][0];tradeDialog();content.querySelector(`[data-input="${key}"]`)?.focus({preventScroll:true});
  }
 });
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.pause();save();}else if(!ui.modal&&!['home','story'].includes(ui.view))clock.resume();});
 X.render=render;X.commands=Object.freeze(Object.keys(commands));X.showScorecard=scorecard;
 clock.pause();render(true);
})();
