function renderSeasonInsights() {
    if (!state.userClub) return;
    const xi = userProfileXI();
    const profile = R.profile(xi, { matchesTogether: state.teamGames[state.userClub.abbr] || 0 });
    const diffs = { pp:0, mid:0, death:0 };
    state.results.forEach(res => {
      const home = res.home.abbr === state.userClub.abbr;
      const mine = home ? res.homeInnings : res.awayInnings;
      const theirs = home ? res.awayInnings : res.homeInnings;
      diffs.pp += mine.pp - theirs.pp;
      diffs.mid += mine.mid - theirs.mid;
      diffs.death += mine.death - theirs.death;
    });
    const games = Math.max(1, state.results.length);
    const sample = seasonEvidenceStage(state.results.length);
    const phases = [
      ['Powerplay', diffs.pp / games],
      ['Middle overs', diffs.mid / games],
      ['Death overs', diffs.death / games]
    ];
    const biggest = [...phases].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
    let why = 'No scorecards yet. The first few matches will show whether this XI is winning the powerplay, holding the middle and closing innings cleanly.';
    if (state.round) {
      if (sample.key === 'early') {
        if (biggest[1] >= 3) why = `So far, your best passage has been the ${biggest[0].toLowerCase()}: about ${Math.abs(biggest[1]).toFixed(1)} runs better than the opposition per match.`;
        else if (biggest[1] <= -3) why = `The early trouble is in the ${biggest[0].toLowerCase()}: about ${Math.abs(biggest[1]).toFixed(1)} runs down on the opposition per match.`;
        else why = 'Nothing has split the sides clearly by phase yet.';
        why += state.results.length === 1 ? ' One match is a clue, not a trend.' : ' Two matches are still only an early read.';
      } else if (sample.key === 'forming') {
        if (biggest[1] >= 3) why = `The ${biggest[0].toLowerCase()} is becoming your strongest passage, worth about ${Math.abs(biggest[1]).toFixed(1)} runs per match.`;
        else if (biggest[1] <= -3) why = `The ${biggest[0].toLowerCase()} is where sides are getting away from you, by about ${Math.abs(biggest[1]).toFixed(1)} runs per match.`;
        else why = 'The innings are staying fairly even by phase. No one passage is deciding the season yet.';
      } else {
        if (biggest[1] >= 3) why = `Your clearest edge is the ${biggest[0].toLowerCase()}, worth about ${Math.abs(biggest[1]).toFixed(1)} runs per match.`;
        else if (biggest[1] <= -3) why = `The ${biggest[0].toLowerCase()} is where the damage is being done: about ${Math.abs(biggest[1]).toFixed(1)} runs lost per match.`;
        else why = 'There is no runaway phase edge. Your matches are being decided by smaller moments across the full twenty overs.';
      }
      if (sample.key !== 'early') {
        if (profile.roleFit < 84) why += ' A few players are being pushed into jobs that do not suit them.';
        else if (profile.xiShape < 76) why += ' The names are good enough; the batting and bowling jobs are not lining up cleanly.';
        else if (profile.death < 70) why += ' The closing overs still look light.';
        else if (profile.keeping < 65) why += ' There is still no recognised keeper in the XI.';
        else if (profile.bowlingResources < 70) why += ' The attack is having to find too many overs from its weaker options.';
      }
    }
    const phaseRead = val => val >= 3 ? 'Ahead' : val <= -3 ? 'Behind' : 'Level';
    const seasonWhyEl=$('seasonWhy');
    if(seasonWhyEl) seasonWhyEl.dataset.sample=sample.key;
    $('seasonWhy').innerHTML = `<span class="kicker">INNINGS PHASES</span><h3>${sample.title}</h3><p>${why}</p><div class="phase-bars">${phases.map(([label,val]) => { const key = state.round && label === biggest[0] && sample.key !== 'early'; return `<div class="phase-row ${key ? 'is-key' : ''}"><div class="phase-label"><span>${label}</span><small>${state.round ? phaseRead(val) : 'No scorecard yet'}</small></div><div class="phase-track"><div class="phase-fill ${val < 0 ? 'negative' : ''}" style="width:${state.round ? Math.min(100, 24 + Math.abs(val) * 6) : 0}%"></div></div><b>${state.round ? `${val >= 0 ? '+' : ''}${val.toFixed(1)}` : '—'}</b></div>`; }).join('')}</div>`;

    const leaguePlayed = state.league.flatMap(club => (state.teams[club.abbr] || []).map(byId).map(p => ({ p, club, st: state.playerSeasonStats[p.id] || emptyPlayerStat() }))).filter(x => x.st.matches > 0);
    const batting = [...leaguePlayed].filter(x => x.st.balls > 0).sort((a,b)=>b.st.runs-a.st.runs || (battingAverage(b.st)||0)-(battingAverage(a.st)||0)).slice(0,5);
    const bowling = [...leaguePlayed].filter(x => x.st.bowlBalls > 0).sort((a,b)=>b.st.wickets-a.st.wickets || (bowlingAverage(a.st) ?? 999)-(bowlingAverage(b.st) ?? 999)).slice(0,5);
    const battingRows = batting.map(({p,club,st},i) => `<div class="leader-table-row"><span class="leader-rank">${i+1}</span><b class="leader-name">${p.name}</b><span class="leader-club">${club.abbr}</span><strong>${st.runs}</strong><span>${stat1(battingAverage(st))}</span><span>${stat1(strikeRate(st))}</span></div>`).join('');
    const bowlingRows = bowling.map(({p,club,st},i) => `<div class="leader-table-row"><span class="leader-rank">${i+1}</span><b class="leader-name">${p.name}</b><span class="leader-club">${club.abbr}</span><strong>${st.wickets}</strong><span>${stat1(bowlingAverage(st))}</span><span>${stat2(economyRate(st))}</span></div>`).join('');
    $('seasonPlayers').innerHTML = `<span class="kicker">GCC LEADERS</span><h3>${leaguePlayed.length ? 'Run-makers and wicket-takers' : 'Waiting for Round 1'}</h3>${leaguePlayed.length ? `<div class="leaderboards-wide"><div class="leader-table"><div class="leader-table-title">Batting</div><div class="leader-table-head"><span>#</span><span>Player</span><span>Club</span><span>Runs</span><span>Avg</span><span>SR</span></div>${battingRows}</div><div class="leader-table"><div class="leader-table-title">Bowling</div><div class="leader-table-head"><span>#</span><span>Player</span><span>Club</span><span>Wkts</span><span>Avg</span><span>Econ</span></div>${bowlingRows}</div></div>` : '<p class="muted">The batting and bowling tables will fill as Round 1 gets underway.</p>'}`;

    const av = userTeamAverages(false);
    const leagueAv = leagueInningsAverages();
    let scorebookRead = '';
    if (av && leagueAv) {
      const scoreDelta = av.avgScore - leagueAv.avgScore;
      const concedeDelta = av.avgConceded - leagueAv.avgScore;
      const wicketDelta = av.avgWicketsTaken - leagueAv.avgWicketsLost;
      const scoreRead = Math.abs(scoreDelta) < 1 ? 'scoring almost exactly at the GCC average' : `${scoreDelta > 0 ? 'scoring' : 'scoring'} ${Math.abs(scoreDelta).toFixed(1)} ${scoreDelta > 0 ? 'runs above' : 'runs below'} the GCC average`;
      const concedeRead = Math.abs(concedeDelta) < 1 ? 'conceding almost exactly at the GCC average' : `conceding ${Math.abs(concedeDelta).toFixed(1)} ${concedeDelta < 0 ? 'fewer' : 'more'} runs than the GCC average`;
      const wicketRead = Math.abs(wicketDelta) < .15 ? 'taking wickets at roughly the league rate' : `taking ${Math.abs(wicketDelta).toFixed(1)} ${wicketDelta > 0 ? 'more' : 'fewer'} wickets per innings than the league rate`;
      const readLead = sample.key === 'early' ? 'Early days. ' : sample.key === 'forming' ? 'This is starting to hold. ' : '';
      scorebookRead = `<div class="scorebook-read"><span>${sample.label}</span><p>${readLead}You are ${scoreRead}, ${concedeRead}, and ${wicketRead}.</p></div>`;
    }
    $('seasonShape').innerHTML = `<span class="kicker">SEASON SCOREBOOK</span><h3>${av ? 'Your side with bat and ball' : 'Waiting for Round 1'}</h3>${av ? `<div class="team-scorebook"><div class="team-scorebook-side"><span class="team-scorebook-title">With bat</span><div class="team-scorebook-line"><span>Average score</span><b>${av.avgScore.toFixed(1)}</b></div><div class="team-scorebook-line"><span>Run rate</span><b>${av.runRate.toFixed(2)}</b></div><div class="team-scorebook-line"><span>Wickets lost</span><b>${av.avgWicketsLost.toFixed(1)}</b></div></div><div class="team-scorebook-side"><span class="team-scorebook-title">With ball</span><div class="team-scorebook-line"><span>Average conceded</span><b>${av.avgConceded.toFixed(1)}</b></div><div class="team-scorebook-line"><span>Economy rate</span><b>${av.economy.toFixed(2)}</b></div><div class="team-scorebook-line"><span>Wickets taken</span><b>${av.avgWicketsTaken.toFixed(1)}</b></div></div></div>${scorebookRead}` : '<p class="muted">Your batting and bowling numbers will come straight from the scorecards.</p>'}`;
  }