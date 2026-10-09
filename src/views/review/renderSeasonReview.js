function renderSeasonReview() {
    const me = state.table[state.userClub.abbr];
    const pos = state.regularSeasonPosition || standings().findIndex(x => x.club.abbr === state.userClub.abbr) + 1;
    const champion = state.champion && state.champion.abbr === state.userClub.abbr;
    const reachedFinal = state.finals && state.finals.gf && [state.finals.gf.home.abbr,state.finals.gf.away.abbr].includes(state.userClub.abbr);
    const runnerUp = reachedFinal && !champion;
    const woodenSpoon = pos === 8;
    const outcome = champion ? 'Champions' : runnerUp ? 'Grand Finalist' : pos <= 4 ? 'Semi-finalist' : pos===8 ? 'Wooden Spoon' : 'Missed finals';
    const shell=document.querySelector('.review-shell');
    const mood=champion?'champion':runnerUp?'runner-up':woodenSpoon?'wooden-spoon':pos<=4?'finalist':pos===5?'near-miss':'midtable';
    if(shell) shell.className=`review-shell outcome-${mood}`;
    const moments={
      champion:['CHAMPIONS','The first title is yours.','Draft night to Grand Final, the plan held.'],
      'runner-up':['RUNNERS-UP','One match short.','The season ended in the Grand Final.'],
      'wooden-spoon':['WOODEN SPOON','Eighth.','The rebuild starts with the scorecards.'],
      finalist:['SEMI-FINAL EXIT','The four, then out.','The knockout ended the run.'],
      'near-miss':['FIFTH','One place outside.','Four teams made the finals. You were next.'],
      midtable:['SEASON OVER',`${ordinal(pos)} after 14 rounds.`,'The table is final. The scorecards explain it.']
    };
    const m=moments[mood];
    $('reviewOutcome').innerHTML=`<span>${m[0]}</span><b>${m[1]}</b><small>${m[2]}</small>`;
    $('reviewTitle').textContent = champion ? 'How the title was won.' : runnerUp ? 'Where the Grand Final got away.' : woodenSpoon ? 'Why it finished eighth.' : pos<=4 ? 'Where the semi-final got away.' : pos===5 ? 'Where the top four got away.' : 'What the season exposed.';
    $('reviewIntro').textContent = seasonReviewNarrative(pos, champion, reachedFinal);
    $('reviewKpis').innerHTML = statsHtml([['RECORD',`${me.w}-${me.l}`],['LADDER',ordinal(pos).toUpperCase()],['FINISH',outcome],['NRR',(me.nrr>=0?'+':'')+me.nrr.toFixed(2)]]);
    const allPlayers = userSeasonPlayers().sort((a,b)=>b.st.runs-a.st.runs || b.st.wickets-a.st.wickets || b.p.overall-a.p.overall);
    const players = allPlayers.filter(x=>x.st.matches>0);
    const topBat = [...players].filter(x=>x.st.balls>0).sort((a,b)=>b.st.runs-a.st.runs || (battingAverage(b.st)||0)-(battingAverage(a.st)||0))[0];
    const topBowl = [...players].filter(x=>x.st.bowlBalls>0).sort((a,b)=>b.st.wickets-a.st.wickets || (bowlingAverage(a.st) ?? 999)-(bowlingAverage(b.st) ?? 999))[0];
    const seasonStandout = [...players].sort((a,b)=>reviewSeasonValue(b.st)-reviewSeasonValue(a.st) || b.st.runs-a.st.runs || b.st.wickets-a.st.wickets)[0];
    const reviewCards = [];
    if (seasonStandout) {
      const st=seasonStandout.st;
      const bowlingLed=st.wickets>=12 && st.runs<220;
      const battingLed=st.runs>=250 && st.wickets<8;
      const headline=bowlingLed?`${st.wickets} wickets`:battingLed?`${st.runs} runs`:`${st.runs} runs · ${st.wickets} wickets`;
      const detail=bowlingLed?`Avg ${stat1(bowlingAverage(st))} · Econ ${stat2(economyRate(st))}${st.runs?` · ${st.runs} runs`:''}`:battingLed?`Avg ${stat1(battingAverage(st))} · SR ${stat1(strikeRate(st))}${st.wickets?` · ${st.wickets} wkts`:''}`:`Bat avg ${stat1(battingAverage(st))} · Bowl avg ${stat1(bowlingAverage(st))}`;
      reviewCards.push(`<div class="review-player featured"><span class="place">PLAYER OF THE SEASON</span><h4>${seasonStandout.p.name}</h4><b>${headline}</b><span>${detail}</span></div>`);
    }
    if (topBat && (!seasonStandout || topBat.p.id!==seasonStandout.p.id)) reviewCards.push(`<div class="review-player"><span class="place">BATTING LEADER</span><h4>${topBat.p.name}</h4><b>${topBat.st.runs} runs</b><span>Avg ${stat1(battingAverage(topBat.st))} · SR ${stat1(strikeRate(topBat.st))} · HS ${topBat.st.bestRuns}</span></div>`);
    if (topBowl && (!seasonStandout || topBowl.p.id!==seasonStandout.p.id)) reviewCards.push(`<div class="review-player"><span class="place">BOWLING LEADER</span><h4>${topBowl.p.name}</h4><b>${topBowl.st.wickets} wickets</b><span>Avg ${stat1(bowlingAverage(topBowl.st))} · Econ ${stat2(economyRate(topBowl.st))}${topBowl.st.bestWickets ? ` · BBI ${topBowl.st.bestWickets}/${topBowl.st.bestBowlingRuns}` : ''}</span></div>`);
    $('reviewPlayers').innerHTML = reviewCards.join('');
    $('reviewMoments').innerHTML = seasonReviewMoments();
    const profile = R.profile(userProfileXI(), { matchesTogether: state.teamGames[state.userClub.abbr] || 0 });
    const metrics = [['Powerplay batting','powerplayBat'],['Middle-overs batting','middleBat'],['Finishing','finishing'],['Batting depth','battingResources'],['New ball','newBall'],['Middle-overs bowling','middleBowl'],['Death bowling','death'],['Bowling depth','bowlingResources'],['Fielding','fielding'],['Chemistry','chemistry']];
    const sorted = metrics.map(([label,key])=>({label,key,value:profile[key]})).sort((a,b)=>b.value-a.value);
    $('reviewStrengths').innerHTML = sorted.slice(0,3).map(x=>`<div class="review-item"><b>${x.label} · ${x.value}</b><span>${R.explanation(x.key,profile)}</span></div>`).join('');
    const rankedWeak = [...sorted].reverse();
    const actualWeak = rankedWeak.filter(x=>x.value<80).slice(0,3);
    const weak = actualWeak.length ? actualWeak : rankedWeak.slice(0,2);
    const weakCard=document.querySelector('#review .review-grid .review-card:last-child');
    if(weakCard){
      const weakKick=weakCard.querySelector('.kicker');
      const weakHead=weakCard.querySelector('h3');
      const lowest=rankedWeak[0]?.value ?? 100;
      weakCard.classList.toggle('fine-margins',!actualWeak.length);
      if(!actualWeak.length){
        if(weakKick) weakKick.textContent='FINE MARGINS';
        if(weakHead) weakHead.textContent='Small gains';
      } else if(lowest<70){
        if(weakKick) weakKick.textContent='NEXT SEASON';
        if(weakHead) weakHead.textContent='The first fix';
      } else {
        if(weakKick) weakKick.textContent='NEXT SEASON';
        if(weakHead) weakHead.textContent='Where to improve';
      }
    }
    let weakHtml = weak.map(x=>`<div class="review-item ${actualWeak.length?'needs-work':'fine'}"><b>${x.label} · ${x.value}</b><span>${reviewWeaknessExplanation(x.key,profile,x.value)}</span></div>`).join('');
    if(profile.keeping<65 && weak.length<3){
      weakHtml += `<div class="review-item"><b>Wicketkeeping · Selection</b><span>You went through the season without a recognised keeper. That gave away chances behind the stumps.</span></div>`;
    }
    $('reviewWeaknesses').innerHTML = weakHtml;
    const battingRows = allPlayers.filter(({st})=>st.innings>0).sort((a,b)=>b.st.runs-a.st.runs).map(({p,st})=>`<tr><td><b>${p.name}</b><span style="display:block;color:var(--muted);font-size:10px">${playerArchetype(p)}</span></td><td>${st.innings}</td><td>${Math.max(0,st.innings-st.outs)}</td><td>${st.runs}</td><td>${st.bestRuns}</td><td>${stat1(battingAverage(st))}</td><td>${stat1(strikeRate(st))}</td><td>${st.fours}</td><td>${st.sixes}</td></tr>`).join('');
    const bowlingRows = allPlayers.filter(({st})=>st.bowlBalls>0).sort((a,b)=>b.st.wickets-a.st.wickets || (bowlingAverage(a.st) ?? 999)-(bowlingAverage(b.st) ?? 999)).map(({p,st})=>`<tr><td><b>${p.name}</b><span style="display:block;color:var(--muted);font-size:10px">${playerArchetype(p)}</span></td><td>${ballsToOvers(st.bowlBalls)}</td><td>${st.runsConceded}</td><td>${st.wickets}</td><td>${st.bestWickets ? `${st.bestWickets}/${st.bestBowlingRuns}` : '—'}</td><td>${stat1(bowlingAverage(st))}</td><td>${stat2(economyRate(st))}</td></tr>`).join('');
    $('reviewTable').innerHTML = `<div class="review-table-section"><div class="review-table-title"><b>Batting</b><span>Inns · NO · Runs · HS · Avg · SR</span></div><div class="review-table-wrap"><table><thead><tr><th>Player</th><th>Inns</th><th>NO</th><th>Runs</th><th>HS</th><th>Avg</th><th>SR</th><th>4s</th><th>6s</th></tr></thead><tbody>${battingRows || '<tr><td colspan="9">No batting figures recorded.</td></tr>'}</tbody></table></div></div><div class="review-table-section"><div class="review-table-title"><b>Bowling</b><span>O · Runs · Wkts · BBI · Avg · Econ</span></div><div class="review-table-wrap"><table><thead><tr><th>Player</th><th>O</th><th>Runs</th><th>Wkts</th><th>BBI</th><th>Avg</th><th>Econ</th></tr></thead><tbody>${bowlingRows || '<tr><td colspan="7">No bowling figures recorded.</td></tr>'}</tbody></table></div></div>`;
  }