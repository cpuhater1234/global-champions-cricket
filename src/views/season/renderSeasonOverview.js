function renderSeasonOverview(st = standings(), pos = null) {
    const completed = state.schedule.filter(f => state.results.some(x => x.round === f.round));
    const upcoming = state.schedule.filter(f => f.round > state.round).slice(0, 3);
    const run = [...completed.slice(-2), ...upcoming];
    $('seasonRun').innerHTML = run.length
      ? run.map(f => seasonFixtureRow(f, 'overview')).join('')
      : `<div class="season-overview-empty">Round 1 will start the season.</div>`;

    if (!state.round) {
      $('ladderSnapshot').innerHTML = `<div class="season-overview-empty">No ladder yet. Round 1 starts it.</div>`;
      return;
    }
    const userIndex = st.findIndex(x => x.club.abbr === state.userClub.abbr);
    let indexes = [0,1,2,3,4].filter(i => i < st.length);
    if (userIndex > 4) indexes = [0,1,2,3,userIndex];
    const rows = indexes.map(i => ({ ...st[i], rank:i+1 }));
    $('ladderSnapshot').innerHTML = rows.map((x, rowIndex) => {
      const cut = x.rank === 4;
      return `<div class="ladder-snapshot-row ${x.club.abbr === state.userClub.abbr ? 'is-user' : ''} ${cut ? 'finals-cut' : ''}"><span class="ladder-snapshot-rank">${x.rank}</span><div class="club-mark" style="--club:${x.club.c};--club-accent:${x.club.a || 'transparent'};--club-text:${x.club.t || '#112018'}">${x.club.abbr}</div><b>${x.club.name}</b><span>${x.w}-${x.l}</span><strong>${x.pts} pts</strong></div>`;
    }).join('');
  }