function renderSeason(light = false) {
    const st = standings();
    const me = state.table[state.userClub.abbr];
    const pos = me && state.round ? st.findIndex(x => x.club.abbr === state.userClub.abbr) + 1 : null;
    const seasonHeading=document.querySelector('#season .section-head h2');
    const seasonIntro=document.querySelector('#season .section-head p');
    if(seasonHeading && seasonIntro){
      const y=state.year || 2008;
      if(state.round===0){
        seasonHeading.textContent=y===2008?'The first season begins':`${y} is ready to go`;
        seasonIntro.textContent='Fourteen matches. Seven at home, seven away.';
      } else if(state.round<=4){
        seasonHeading.textContent='Early rounds';
        seasonIntro.textContent=`${state.round} of 14 played. The scorecards matter more than the ladder this early.`;
      } else if(state.round<=9){
        seasonHeading.textContent='The season is taking shape';
        seasonIntro.textContent=`${state.round} of 14 played. Form and the finals line are beginning to matter.`;
      } else if(state.round<14){
        seasonHeading.textContent='The run home';
        seasonIntro.textContent=`${14-state.round} ${14-state.round===1?'match':'matches'} left.`;
      } else {
        seasonHeading.textContent='Regular season complete';
        seasonIntro.textContent='The ladder is locked.';
      }
    }
    $('seasonKpis').innerHTML = statsHtml([
      ['ROUND', `${state.round}/14`],
      ['RECORD', me ? `${me.w}-${me.l}` : '0-0'],
      ['POSITION', state.round ? (pos || '—') : '—'],
      ['NRR', state.round && me ? (me.nrr >= 0 ? '+' : '') + me.nrr.toFixed(2) : '—']
    ]);
    $('seasonPace').textContent = seasonPaceLabels[state.seasonSpeedIndex];
    $('simulateSeason').textContent = state.round >= 14 ? 'SEASON COMPLETE' : state.seasonRunning ? 'PAUSE SEASON' : state.round ? 'RUN REST OF SEASON' : 'RUN SEASON';
    $('playRound').textContent = state.round >= 14 ? 'REGULAR SEASON COMPLETE' : `MATCHDAY · ROUND ${state.round + 1}`;
    $('simulateSeason').disabled = state.round >= 14;
    $('playRound').disabled = state.round >= 14 || state.seasonRunning;
    $('seasonPace').disabled = state.round >= 14;
    $('seasonPace').hidden = !state.seasonRunning || state.round >= 14;
    $('seasonActions').hidden = state.round >= 14;
    $('playRound').classList.toggle('primary', !state.seasonRunning && state.round < 14);
    $('simulateSeason').classList.toggle('primary', state.seasonRunning && state.round < 14);
    if (state.round >= 14) {
      const y=state.year || 2008;
      $('seasonStageTitle').textContent = state.regularSeasonPosition <= 4 ? `Finals secured · ${ordinal(state.regularSeasonPosition)}` : `Season finished · ${ordinal(state.regularSeasonPosition)}`;
      $('seasonStageCopy').textContent = state.regularSeasonPosition <= 4 ? 'The ladder is locked. One loss ends the season from here.' : `Your ${y} season is over.`;
      $('postSeasonCta').innerHTML = `<div class="post-season-card"><div><span class="kicker">REGULAR SEASON COMPLETE</span><h3>${state.regularSeasonPosition <= 4 ? 'Finals cricket is next.' : `That is ${y}.`}</h3><p>${state.regularSeasonPosition <= 4 ? `You finished ${ordinal(state.regularSeasonPosition)} at ${me.w}-${me.l}.` : `You finished ${ordinal(state.regularSeasonPosition)} at ${me.w}-${me.l}. Open the season review when you are ready.`}</p></div><button class="button primary" onclick="GCC.proceedPostSeason()">${state.regularSeasonPosition <= 4 ? 'ENTER FINALS' : 'VIEW SEASON REVIEW'}</button></div>`;
    } else {
      const nextFx = state.schedule.find(f => f.round === state.round + 1);
      const nextOpp = nextFx ? (nextFx.home.abbr === state.userClub.abbr ? nextFx.away : nextFx.home) : null;
      const nextHome = nextFx ? nextFx.home.abbr === state.userClub.abbr : false;
      $('seasonStageTitle').textContent = nextOpp ? `${state.round ? 'Next' : 'Round 1'} · ${nextHome ? 'vs' : '@'} ${nextOpp.name}` : 'Next fixture';
      $('seasonStageCopy').textContent = nextFx && nextOpp
        ? `${nextFx.home.ground} · ${nextFx.home.trait} · ${matchWeather(nextFx.home,nextFx.round,state.year||2008).label}${state.round ? ` · ${ordinal(pos)} on the ladder` : ''}`
        : 'The next fixture will appear here.';
      $('postSeasonCta').innerHTML = '';
    }
    renderSeasonOverview(st, pos);
    if (seasonView !== 'overview') setSeasonView(seasonView);
  }