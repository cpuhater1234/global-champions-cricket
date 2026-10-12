function renderTeam() {
    if (!state.userClub) return;
    const restoreInteraction = preserveTeamInteraction();
    const teamScreen=document.querySelector('#team');
    if(teamScreen) teamScreen.classList.toggle('swap-mode',!!state.pendingSwapIn);
    const roster = state.teams[state.userClub.abbr].map(byId).filter(Boolean).sort((a, b) => b.overall - a.overall);
    const nextFx=nextUserFixture();
    const nextOpp=nextFx?(nextFx.home.abbr===state.userClub.abbr?nextFx.away:nextFx.home):null;
    const nextHome=nextFx?nextFx.home.abbr===state.userClub.abbr:false;
    const nextGround=nextFx?matchGroundForFixture(nextFx):state.userClub;
    const nextRound=nextFx?.round||Math.max(1,(state.round||0)+1);
    const fixtureRead=nextFx&&nextOpp?`${nextHome?'Home':'Away'} · ${nextOpp.name} · ${nextGround.ground} · ${nextGround.trait} · ${nextGround.weather.label}. ${nextGround.weather.read}`:'';
    const selectionKicker=teamScreen?.querySelector('.team-command-bar .kicker');
    if(selectionKicker) selectionKicker.textContent=`ROUND ${nextRound} SELECTION`;
    if(state.fullSchedule?.length){
      const teamHeading=teamScreen?.querySelector('.section-head h2');
      const teamIntro=teamScreen?.querySelector('.section-head p');
      if(teamHeading) teamHeading.textContent=`Set your Round ${nextRound} XI`;
      if(teamIntro) teamIntro.textContent=`Name the eleven for Round ${nextRound}. Weigh form, fitness, opposition and conditions, then return to the Season Hub.`;
    }
    syncBattingOrder();
    if(teamScreen) teamScreen.classList.toggle('team-needs-picks',(state.xi||[]).length<11);
    const selectedIds=new Set(state.xi);
    const benchCount=Math.max(0,roster.length-state.xi.length);
    const layout=teamScreen?.querySelector('.team-layout');
    if(layout) layout.hidden=false;
    teamScreen?.classList.remove('team-choice-only');
    const slotById=new Map(state.battingOrder.map((id,i)=>[id,i+1]));
    $('xiList').innerHTML = roster.map(p => {
      const selected=selectedIds.has(p.id);
      const pending=state.pendingSwapIn===p.id;
      const unavailable=state.dynasty?.injuries?.[p.id]?.status==='OUT';
      let actionFn='toggleXI',actionLabel='PICK',actionClass='';
      if(unavailable){actionLabel='OUT';actionClass='';}
      else if(state.pendingSwapIn&&selected){actionFn='replaceXI';actionLabel='SWAP OUT';actionClass='swap-out';}
      else if(pending){actionFn='cancelSwap';actionLabel='CANCEL';actionClass='selected';}
      else if(selected){actionFn='removeXI';actionLabel='REMOVE';actionClass='selected';}
      else if(state.xi.length>=11){actionFn='beginSwap';actionLabel='SWAP';actionClass='swap';}
      const stateRead=unavailable?'UNAVAILABLE':pending?'SWAP READY':selected?(slotById.has(p.id)?`XI · BAT ${slotById.get(p.id)}`:'IN XI'):(state.xi.length>=11?'BENCH':'AVAILABLE');
      return `<div class="xi-row ${selected?'in':''} ${pending?'swap-pending':''} ${unavailable?'dynasty-injured':''}">
        <div class="xi-row-player"><b>${p.name}</b><span title="${playerNote(p)}">${roleName(p)}${unavailable?' · OUT':''}</span></div>
        <div class="xi-row-side"><strong>${p.overall}</strong><span>${stateRead}</span><button id="xi-action-${p.id}" type="button" class="xi-toggle-btn ${actionClass}" onclick="GCC.${actionFn}(${p.id})" ${unavailable?'disabled':''}>${actionLabel}</button></div>
      </div>`;
    }).join('');
    renderBattingOrderEditor();
    const priorBrief=$('xiSelectionBrief');if(priorBrief)priorBrief.remove();
    const xiNow=(state.xi||[]).map(byId).filter(Boolean),xiOpen=Math.max(0,11-xiNow.length),xiKeeper=xiNow.some(p=>(p.keeping||0)>=65||p.role==='WK-BAT'),xiBowlers=xiNow.filter(p=>(p.bowl||0)>=58||(p.maxOvers||0)>=2||['AR','BOWL'].includes(p.role)).length;
    const xiCol=teamScreen?.querySelector('.team-xi-column');if(xiCol)xiCol.insertAdjacentHTML('beforeend',`<div id="xiSelectionBrief" class="selection-bench-block"><span class="kicker">SELECTION READ</span><div class="selection-brief-grid"><div><span>Open places</span><b>${xiOpen}</b></div><div><span>Keeper</span><b class="${xiKeeper?'':'negative'}">${xiKeeper?'Covered':'Needed'}</b></div><div><span>Bowling options</span><b class="${xiBowlers>=5?'':'warning'}">${xiBowlers}</b></div></div><p>${xiOpen?`There ${xiOpen===1?'is':'are'} ${xiOpen} place${xiOpen===1?'':'s'} still open. Use the full squad on the left and the batting order above to finish the XI.`:'XI complete. Bench changes stay available from the squad list on the left.'}</p></div>`);

    const complete=state.xi.length===11;
    const unavailableSelected=roster.filter(p=>selectedIds.has(p.id)&&state.dynasty?.injuries?.[p.id]?.status==='OUT');
    const selectionBlocked=unavailableSelected.length>0;
    const remaining=11-state.xi.length;
    const columnKicker=$('squadColumnKicker'),columnTitle=$('squadColumnTitle'),columnNote=$('squadColumnNote');
    if(columnKicker) columnKicker.textContent='SQUAD';
    if(columnTitle) columnTitle.textContent=complete?`XI set · ${benchCount} on the bench`:`${state.xi.length}/11 selected`;
    if(columnNote) columnNote.textContent=complete?'All 15 stay visible. Choose SWAP on a bench player for a direct change.':'Selected players stay visible so you can compare the full 15.';

    const lead=$('selectionLead'),copy=$('selectionCopy'),clear=$('clearXIButton'),quickStart=$('quickStartSeasonButton');
    if(lead) lead.textContent=selectionBlocked?(unavailableSelected.length===1?`${unavailableSelected[0].name} is out. Make one change for Round ${nextRound}.`:`${unavailableSelected.length} players are out. Change the XI for Round ${nextRound}.`):complete?`XI set for Round ${nextRound}.`:state.xi.length?`${state.xi.length}/11 selected · ${remaining} to go.`:'0/11 selected.';
    if(copy){
      const actionCopy=selectionBlocked?'Pick a fit replacement from the bench before returning to the Season Hub.':complete?(state.fullSchedule?.length?'Change anything you need, then return to the Season Hub.':'Change anything you need, then start the season.'):state.xi.length?'Keep building the XI. New picks slot into a natural batting order.':'Build a balanced XI. Warnings will flag a missing keeper or insufficient bowling.';
      copy.textContent=fixtureRead?`${fixtureRead} ${actionCopy}`:actionCopy;
    }
    if(clear) clear.hidden=state.xi.length===0;
    if(quickStart){ quickStart.hidden=!complete; quickStart.disabled=!complete||selectionBlocked; quickStart.textContent=selectionBlocked?'CHANGE REQUIRED':state.fullSchedule?.length?'RETURN TO SEASON':'START SEASON'; }

    const swapStatus=$('swapStatus');
    if(swapStatus){
      const incoming=byId(state.pendingSwapIn);
      swapStatus.innerHTML=incoming
        ? `<span><strong>SWAP IN · ${incoming.name}</strong><em>Choose SWAP OUT beside the player leaving the XI.</em></span><button type="button" onclick="GCC.cancelSwap()">CANCEL</button>`
        : `<span>${complete ? 'XI complete. Choose SWAP beside a bench player, then choose who comes out.' : `${remaining} spot${remaining===1?'':'s'} still open.`}</span>`;
      swapStatus.classList.toggle('active',!!incoming);
    }
    $('xiCount').textContent = `${state.xi.length}/11`;
    const startButton = $('startSeasonButton');
    if (startButton) { startButton.disabled = !complete||selectionBlocked; startButton.textContent = selectionBlocked ? 'CHANGE REQUIRED' : complete ? (state.fullSchedule?.length?'RETURN TO SEASON':'START SEASON') : `SELECT ${remaining} MORE`; }

    const selected=userProfileXI();
    const showingSquad = state.xi.length === 0;
    const profileXI = showingSquad ? (roster.length>11?bestXI(roster):roster) : selected;
    const profile = R.profile(profileXI, { matchesTogether: state.teamGames[state.userClub.abbr] || 0 });
    $('profileScope').textContent = showingSquad ? 'NO XI SELECTED' : complete ? 'XI READ' : 'XI TAKING SHAPE';
    renderProfile(profile, showingSquad, profileXI);
    const detail=$('teamDetailRead');
    if(detail){ detail.hidden=!complete; if(!complete) detail.open=false; }
    $('groundCard').innerHTML = complete ? groundReportHtml(nextGround||state.userClub, profile, state.xi.length,{round:nextRound,home:nextHome,opponent:nextOpp,weather:nextGround?.weather||null}) : '';
    restoreInteraction();
  }