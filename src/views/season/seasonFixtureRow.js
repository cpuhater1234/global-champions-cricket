function seasonFixtureRow(f, mode = 'full') {
    const res = state.results.find(x => x.round === f.round);
    const opp = f.home.abbr === state.userClub.abbr ? f.away : f.home;
    const home = f.home.abbr === state.userClub.abbr;
    const won = res ? res.winner.abbr === state.userClub.abbr : null;
    const next = !res && f.round === state.round + 1;
    if (mode === 'overview') {
      const status = res ? (won ? 'W' : 'L') : next ? 'NEXT' : 'UPCOMING';
      const score = res ? `${res.homeInnings.total}/${res.homeInnings.wickets}–${res.awayInnings.total}/${res.awayInnings.wickets}` : `${home ? 'Home' : 'Away'} · ${f.home.ground}`;
      return `<div class="season-run-row ${res ? (won ? 'is-win' : 'is-loss') : next ? 'is-next' : ''}"><span class="season-run-round">R${f.round}</span><div class="club-mark" style="--club:${opp.c};--club-accent:${opp.a || 'transparent'};--club-text:${opp.t || '#112018'}">${opp.abbr}</div><div class="season-run-opponent"><b>${home ? 'vs' : '@'} ${opp.name}</b><span>${score}</span></div><strong class="season-run-status">${status}</strong></div>`;
    }
    const weather=res?.weather||(next?matchWeather(f.home,f.round,state.year||2008):null);
    const weatherRead=weather?` · ${weather.label}`:'';
    return `<div class="fixture ${res ? (won ? 'is-win' : 'is-loss') : (next ? 'next-fixture' : '')}"><div class="club-mark" style="--club:${opp.c};--club-accent:${opp.a || 'transparent'};--club-text:${opp.t || '#112018'}">${opp.abbr}</div><div><b>R${f.round} · ${home ? 'vs' : '@'} ${opp.name}</b><small>${f.home.ground} · ${f.home.trait}${weatherRead}</small></div><div class="fixture-result"><div class="result ${res ? (won ? 'win' : 'loss') : ''}">${res ? `${won ? 'W' : 'L'} ${res.homeInnings.total}/${res.homeInnings.wickets}–${res.awayInnings.total}/${res.awayInnings.wickets}` : next ? 'NEXT' : '—'}</div>${res ? `<button class="scorecard-link" onclick="GCC.openScorecard(${f.round})">Scorecard</button>` : ''}</div></div>`;
  }