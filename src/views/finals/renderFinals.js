function renderFinals() {
    if (!state.finals) return;
    const f = state.finals;
    const shell=document.querySelector('.finals-shell');
    if(shell) shell.dataset.stage=f.stage;
    const seed = f.top.findIndex(c => c.abbr === state.userClub.abbr) + 1;
    $('finalsSeed').textContent = `YOUR SEED · ${seed}`;
    const pairs = [[f.top[0],f.top[3]],[f.top[1],f.top[2]]];
    $('finalsSemis').innerHTML = pairs.map((pair,i) => finalsMatchMarkup(`SEMI-FINAL ${i+1} · ${i===0?'1 v 4':'2 v 3'}`, pair[0], pair[1], f.semis[i] || null)).join('');
    const semiPreview=f.semis?.length===2?(()=>{const a=f.semis[0].winner,b=f.semis[1].winner;if(!a||!b)return null;const seedOf=c=>f.top.findIndex(x=>x.abbr===c.abbr);return seedOf(a)<=seedOf(b)?{home:a,away:b}:{home:b,away:a}})():null;
    const gfPair=f.gfPair||semiPreview;
    $('finalsGrandFinal').innerHTML = f.gf ? finalsMatchMarkup('GRAND FINAL', f.gf.home, f.gf.away, f.gf)
      : gfPair ? finalsMatchMarkup('GRAND FINAL',gfPair.home,gfPair.away,null)
      : `<div class="final-match final-awaiting"><span class="match-label">GRAND FINAL</span><div class="final-awaiting-copy"><h3>Waiting for the semi-final winners</h3><span>The two winners come here.</span></div></div>`;
    const userSemi = pairs.find(pair => pair.some(c => c.abbr === state.userClub.abbr));
    const userSemiResult=f.semis.find(x=>[x.home.abbr,x.away.abbr].includes(state.userClub.abbr));
    const finalsTone=f.stage==='semis'&&userSemiResult?(userSemiResult.winner.abbr===state.userClub.abbr?'win':'loss'):f.stage==='done'&&f.gf?(f.gf.winner.abbr===state.userClub.abbr?'win':'loss'):'neutral';
    if(shell) shell.dataset.outcome=finalsTone;
    const opp = userSemi.find(c => c.abbr !== state.userClub.abbr);
    const semiHost=userSemi[0];
    const semiWeather=matchWeather(semiHost,15,state.year||2008);
    const semiConditions=`${semiHost.ground} · ${semiWeather.label}`;
    if (f.stage === 'ready') {
      $('finalsTitle').textContent = 'Four clubs remain.';
      $('finalsIntro').textContent = `You finished ${ordinal(seed)}. One loss ends the season. Your semi-final is against ${opp.name}.`;
      $('finalsTension').innerHTML='<span>SEMI-FINAL</span><b>20 overs can end the entire season.</b><small>No ladder. No recovery game. Win and the Grand Final opens.</small>';
      $('finalsStageTitle').textContent = 'The bracket is set.';
      $('finalsStageCopy').textContent = `Your path begins against ${opp.name}. ${semiConditions}. The next click decides whether this season survives.`;
      $('finalsStory').innerHTML = finalsExperienceCard('SEMI-FINAL',userSemi[0],userSemi[1],null,`${finalsSeasonContext(state.userClub,opp)} ${finalsMatchupRead(state.userClub,opp)}`.trim());
      $('finalsControls').innerHTML = `<button class="button primary finals-primary" onclick="GCC.simulateFinals()">PLAY SEMI-FINAL</button>`;
    } else if (f.stage === 'semis') {
      const mine = f.semis.find(x => [x.home.abbr,x.away.abbr].includes(state.userClub.abbr));
      const alive = mine.winner.abbr === state.userClub.abbr;
      $('finalsTitle').textContent = alive ? 'One match from the title.' : 'The run is over.';
      $('finalsIntro').textContent = alive ? 'The semi-final is banked. The other result decides who stands between you and the first GCC title.' : 'The knockout format has done its job. There is no route back into the tournament.';
      $('finalsTension').innerHTML = alive ? '<span>SEMI-FINAL WON</span><b>You are through.</b><small>The Grand Final is now the only match that matters.</small>' : '<span>SEMI-FINAL LOST</span><b>Season over.</b><small>The margin is final. The championship moves on without you.</small>';
      $('finalsStageTitle').textContent = alive ? 'You are into the Grand Final.' : 'Your season ends here.';
      $('finalsStageCopy').textContent = alive ? 'Move into the final, see the opponent, then make the last call of the season.' : 'You can still see who wins the first title before opening your season review.';
      $('finalsStory').innerHTML = finalsExperienceCard('SEMI-FINAL',mine.home,mine.away,mine,finalsResultRead(mine));
      $('finalsControls').innerHTML = `<button class="button primary" onclick="GCC.advanceFinals()">${alive?'GO TO GRAND FINAL':'VIEW GRAND FINAL'}</button>`;
    } else if (f.stage === 'gf-ready') {
      const userIn=[f.gfPair.home.abbr,f.gfPair.away.abbr].includes(state.userClub.abbr);
      const gfOpp=userIn?(f.gfPair.home.abbr===state.userClub.abbr?f.gfPair.away:f.gfPair.home):null;
      const gfWeather=matchWeather(f.gfPair.home,16,state.year||2008);
      const gfConditions=`${f.gfPair.home.ground} · ${gfWeather.label}`;
      $('finalsTitle').textContent = userIn ? 'The Grand Final.' : 'The championship match.';
      $('finalsIntro').textContent = userIn ? `${state.userClub.name} v ${gfOpp.name}. Twenty overs between you and the first GCC title.` : `${f.gfPair.home.name} v ${f.gfPair.away.name}. The first GCC champion is about to be decided.`;
      $('finalsTension').innerHTML = userIn ? '<span>GRAND FINAL</span><b>This is the season.</b><small>Everything before this earned one last match.</small>' : '<span>GRAND FINAL</span><b>One match remains.</b><small>The first champion is about to be crowned.</small>';
      $('finalsStageTitle').textContent = userIn ? 'No second chance.' : 'The title is waiting.';
      $('finalsStageCopy').textContent = userIn ? `The matchup is set against ${gfOpp.name}. ${gfConditions}. There is nothing after this except the season review.` : `${gfConditions}. Decide the championship, then close the season.`;
      $('finalsStory').innerHTML = finalsExperienceCard('GRAND FINAL',f.gfPair.home,f.gfPair.away,null,userIn?`${finalsSeasonContext(state.userClub,gfOpp)} ${finalsMatchupRead(state.userClub,gfOpp)}`.trim():'The two semi-final winners meet for the championship.');
      $('finalsControls').innerHTML = `<button class="button primary finals-primary" onclick="GCC.simulateFinals()">${userIn?'PLAY GRAND FINAL':'DECIDE CHAMPIONSHIP'}</button>`;
    } else if (f.stage === 'done') {
      const champion = f.gf.winner;
      const won = champion.abbr === state.userClub.abbr;
      $('finalsTitle').textContent = won ? 'You are the first Global Champions.' : `${champion.name} are the first Global Champions.`;
      $('finalsIntro').textContent = won ? 'You won the first GCC title.' : `${champion.name} won the first GCC title. Your 2008 season is over.`;
      $('finalsTension').innerHTML = won ? '<span>CHAMPIONS</span><b>The first title is yours.</b><small>Draft night to Grand Final. The season is now part of GCC history.</small>' : '<span>CHAMPIONSHIP DECIDED</span><b>The season has its winner.</b><small>Your review now tells the story of how close you came and what happens next.</small>';
      $('finalsStageTitle').textContent = 'The first GCC season is complete.';
      $('finalsStageCopy').textContent = 'The season review is ready: scorecards, player numbers and what needs fixing.';
      $('finalsStory').innerHTML = finalsExperienceCard('GRAND FINAL',f.gf.home,f.gf.away,f.gf,finalsResultRead(f.gf,true));
      $('finalsControls').innerHTML = `<button class="button primary" onclick="GCC.openSeasonReview()">VIEW SEASON REVIEW</button>`;
    }
  }