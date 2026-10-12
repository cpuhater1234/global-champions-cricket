function renderMatchStory(res) {
    const userHome = res.home.abbr === state.userClub.abbr;
    const mine = userHome ? res.homeInnings : res.awayInnings;
    const theirs = userHome ? res.awayInnings : res.homeInnings;
    const mineCard = scorecardInningsFor(res.scorecard, state.userClub);
    const opp = userHome ? res.away : res.home;
    const oppCard = scorecardInningsFor(res.scorecard, opp);
    const won = res.winner.abbr === state.userClub.abbr;
    const swings = [['powerplay', mine.pp - theirs.pp], ['middle overs', mine.mid - theirs.mid], ['death', mine.death - theirs.death]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    let phaseLine;
    if (swings[0][1] > 8) phaseLine = `The match tilted your way in the ${swings[0][0]}, where you were ${swings[0][1]} runs better.`;
    else if (swings[0][1] < -8) phaseLine = `${opp.name} did the damage in the ${swings[0][0]}, winning that passage by ${Math.abs(swings[0][1])} runs.`;
    else phaseLine = 'No phase ran away from either side. The match stayed tight across the innings.';

    const bat = mineCard ? [...mineCard.batting].filter(x=>!x.dnb).sort((a,b)=>b.runs-a.runs || (b.sr||0)-(a.sr||0))[0] : null;
    const bowl = oppCard ? [...oppCard.bowling].sort((a,b)=>b.wickets-a.wickets || a.economy-b.economy)[0] : null;
    const figures=[];
    if (bat) figures.push(`${bat.player.name} ${bat.runs}${bat.dismissal === 'not out' ? '*' : ''} (${bat.balls})`);
    if (bowl && bowl.wickets) figures.push(`${bowl.player.name} ${bowl.wickets}/${bowl.runs}`);

    let ladderLine='';
    if (res.round > 1 && res.ladderAfter) {
      ladderLine = res.ladderBefore !== res.ladderAfter ? ` The result moves you from ${ordinal(res.ladderBefore)} to ${ordinal(res.ladderAfter)}.` : ` You remain ${ordinal(res.ladderAfter)}.`;
    }
    const nextFx=state.schedule.find(f=>f.round===res.round+1);
    const nextOpp=nextFx?(nextFx.home.abbr===state.userClub.abbr?nextFx.away:nextFx.home):null;
    const nextHome=nextFx?nextFx.home.abbr===state.userClub.abbr:false;
    const nextLine=nextFx&&nextOpp?`${nextHome?'Home':'Away'} · ${nextOpp.name} · ${nextFx.home.ground}`:'';
    const margin = res.marginText ? `${won ? 'Won' : 'Lost'} ${res.marginText}` : (won?'Win':'Loss');
    $('matchStory').innerHTML = `<div class="story-card ${won?'match-win':'match-loss'}"><div class="story-main"><span class="kicker">ROUND ${res.round} · ${res.home.ground} · ${(res.weather||matchWeather(res.home,res.round,state.year||2008)).label}</span><h3>${margin}</h3><div class="story-scoreline"><div><span>${state.userClub.name}</span><b>${mine.total}/${mine.wickets}</b></div><span>v</span><div><span>${opp.name}</span><b>${theirs.total}/${theirs.wickets}</b></div></div><p>${phaseLine}${ladderLine}</p></div><div class="story-side">${figures.length?`<div class="story-figures"><span>BEST FOR ${state.userClub.abbr}</span><b>${figures.join(' · ')}</b></div>`:''}${nextLine?`<div class="story-next"><span>NEXT FIXTURE</span><b>${nextLine}</b></div>`:''}<div class="story-actions"><button class="button" onclick="GCC.openScorecard(${res.round})">OPEN SCORECARD</button></div></div></div>`;
  }