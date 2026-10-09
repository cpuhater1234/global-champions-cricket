function openMatchdayPreview(){
    if(state.round>=14)return proceedPostSeason();
    const r=state.round+1,roundFixtures=state.fullSchedule?.[r-1]||[];
    const fx=roundFixtures.find(f=>f.home.abbr===state.userClub.abbr||f.away.abbr===state.userClub.abbr);
    if(!fx)return toast('Round schedule is invalid');
    const userHome=fx.home.abbr===state.userClub.abbr,opp=userHome?fx.away:fx.home;
    const weather=matchWeather(fx.home,r,state.year||2008);
    const myIds=[...(state.xi||[])],oppIds=[...(state.cpuXIs?.[opp.abbr]||clubXI(opp).map(p=>p.id))];
    const mine=matchdayWatchPlayer(myIds),theirs=matchdayWatchPlayer(oppIds);
    const meRow=state.table?.[state.userClub.abbr],oppRow=state.table?.[opp.abbr];
    let stakes='The table starts here. Fourteen matches decide the top four.';
    if(state.round){
      const st=standings(),mePos=st.findIndex(x=>x.club.abbr===state.userClub.abbr)+1,oppPos=st.findIndex(x=>x.club.abbr===opp.abbr)+1;
      if(r<=5)stakes=`You arrive ${ordinal(mePos)} at ${meRow?.w||0}-${meRow?.l||0}. ${opp.name} are ${ordinal(oppPos)} at ${oppRow?.w||0}-${oppRow?.l||0}.`;
      else if(r<=10){const left=14-r;stakes=`The finals line is taking shape: ${ordinal(mePos)} against ${ordinal(oppPos)}, with ${left} ${left===1?'match':'matches'} still to follow after today.`;}
      else if(r<14){const left=14-r;stakes=`The run home: ${ordinal(mePos)} plays ${ordinal(oppPos)} with ${left} ${left===1?'match':'matches'} left after today.`;}
      else stakes=`The regular season closes here: ${ordinal(mePos)} against ${ordinal(oppPos)} with the top four decided after today.`;
    }
    const mark=c=>`<div class="club-mark" style="--club:${c.c};--club-accent:${c.a||'transparent'};--club-text:${c.t||'#112018'}">${c.abbr}</div>`;
    const watch=(p,label)=>p?`<div class="matchday-watch-player"><span>${label}</span><b>${matchdayEsc(p.name)}</b><small>${matchdayEsc(playerNote(p))}${Number(p.form||0)?` · ${matchdayFormWord(p)}`:''}</small></div>`:'';
    openModal(`<div class="matchday-preview"><header class="matchday-preview-head"><span class="kicker">MATCHDAY · ROUND ${r}</span><h2>${matchdayEsc(state.userClub.name)} ${userHome?'v':'at'} ${matchdayEsc(opp.name)}</h2><p>${matchdayEsc(fx.home.ground)} · ${userHome?'Home':'Away'}</p></header><div class="matchday-teams"><div class="matchday-team">${mark(state.userClub)}<div class="matchday-team-copy"><span>Your side</span><b>${matchdayEsc(state.userClub.name)}</b><small>${matchdayTableRead(state.userClub)}</small></div></div><div class="matchday-vs">${userHome?'v':'at'}</div><div class="matchday-team away"><div class="matchday-team-copy"><span>Opposition</span><b>${matchdayEsc(opp.name)}</b><small>${matchdayTableRead(opp)}</small></div>${mark(opp)}</div></div><div class="matchday-ground"><div><span>HOW IT PLAYS</span><b>${matchdayEsc(fx.home.trait)}</b><p>${matchdayEsc(groundStory(fx.home))}</p></div><div><span>CONDITIONS</span><b>${matchdayEsc(weather.label)}</b><p>${matchdayEsc(weather.read)}</p></div></div><div class="matchday-read"><section class="matchday-stakes"><span>THE MATCH</span><h3>${r===1?'A new season starts.':r===14?'The regular season closes.':r>=11?'The run home.':'The table matters now.'}</h3><p>${matchdayEsc(stakes)}</p></section><section class="matchday-watch"><span>PLAYERS TO WATCH</span><h3>Who can shape it.</h3><div class="matchday-watch-grid">${watch(mine,'YOUR XI')}${watch(theirs,opp.abbr)}</div></section></div><div class="matchday-xi-line"><b>XI lodged · ${myIds.length}/11</b><span>${state.battingOrder?.length===11?'Batting order set':'Batting order needs attention'} · ${userHome?'Home':'Away'} at ${matchdayEsc(fx.home.ground)}</span></div><div class="matchday-actions"><button class="button" onclick="GCC.closeModal()">BACK TO SEASON</button><button class="button primary" onclick="GCC.closeModal();GCC.playNextRound()">PLAY MATCH</button></div></div>`);
  }