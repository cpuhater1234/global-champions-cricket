function finalsMatchMarkup(label, home, away, result = null) {
    const userMatch = [home.abbr, away.abbr].includes(state.userClub.abbr);
    const userWon = !!(userMatch && result && result.winner.abbr === state.userClub.abbr);
    const resultClass = userMatch && result ? (userWon ? ' user-win' : ' user-loss') : '';
    const row = (club, inningsData) => `<div class="final-team"><div class="club-mark" style="--club:${club.c};--club-accent:${club.a || 'transparent'};--club-text:${club.t || '#112018'}">${club.abbr}</div><div><b>${club.name}</b><span>${club.ground}</span></div><span class="final-score ${result && result.winner.abbr === club.abbr ? 'final-winner' : ''}">${inningsData ? `${inningsData.total}/${inningsData.wickets}` : '—'}</span></div>`;
    const link = result ? `<button class="scorecard-link final-scorecard-link" onclick="GCC.openFinalsScorecard('${result === state.finals?.gf ? 'gf' : 'semi'}',${result === state.finals?.gf ? 0 : Math.max(0,state.finals?.semis?.indexOf(result) || 0)})">OPEN SCORECARD</button>` : '';
    const resultLine = result ? `<div class="final-result-strip ${userMatch ? (userWon?'win':'loss') : ''}"><span>RESULT</span><b>${result.winner.name} won ${result.marginText || ''}</b></div>` : '';
    return `<div class="final-match ${userMatch ? 'user-match' : ''}${resultClass}"><span class="match-label">${label}</span>${row(home, result && result.homeInnings)}${row(away, result && result.awayInnings)}${resultLine}${link}</div>`;
  }