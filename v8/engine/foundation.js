
window.GCC = (() => {
  const D = window.GCC_DATA;
  const R = window.GCC_RATINGS;
  const AI = window.GCC_AI;
  const screens = ['world', 'clubs', 'recruit', 'draft', 'team', 'season'];
  const allScreens = ['world', 'leagueDraw', 'clubs', 'recruit', 'draftDraw', 'draft', 'team', 'season', 'finals', 'review'];
  const recruitSpeeds = [190, 95, 42];
  const recruitDayPauses = [760, 360, 150];
  const recruitLabels = ['SPEED 1×', 'SPEED 2×', 'SPEED 4×'];
  const revealSpeeds = [900, 500, 250];
  const revealPaceLabels = ['PACE 1×', 'PACE 2×', 'PACE 4×'];
  const draftSpeeds = [520, 260, 130];
  const draftPaceLabels = ['PACE 1×', 'PACE 2×', 'PACE 4×'];
  const seasonSpeeds = [620, 330, 150];
  const seasonPaceLabels = ['PACE 1×', 'PACE 2×', 'PACE 4×'];
  let seasonView = 'overview';
  let revealSpeedIndex = 0;
  let leagueRevealTimer = null;
  let draftRevealTimer = null;
  let draftAutoTimer = null;
  let seasonTimer = null;
  let finalsTimer = null;
  let leagueRevealIndex = 0;
  let draftRevealIndex = 0;
  let draftPoolLimit = 24;
  let draftBoardVisible = false;
  let recruitWireVisible = false;
  const draftPoolStep = 24;

  const state = {
    year: 2008,
    seed: 1,
    weatherSeed: 1,
    league: [],
    selectedClub: null,
    userClub: null,
    pool: [],
    teams: {},
    draftOrder: [],
    picks: [],
    pickIndex: 0,
    filter: 'ALL',
    xi: [],
    battingOrder: [],
    orderTouched: false,
    pendingSwapIn: null,
    battingPins: {},
    cpuXIs: {},
    schedule: [],
    fullSchedule: [],
    round: 0,
    table: {},
    results: [],
    teamGames: {},
    champion: null,
    recruit: null,
    draftSpeedIndex: 0,
    draftFinished: false,
    lastDraftPick: null,
    lastUserDraftRead: null,
    playerSeasonStats: {},
    seasonSpeedIndex: 0,
    seasonRunning: false,
    regularSeasonPosition: null,
    finals: null
  };

  const $ = id => document.getElementById(id);

  function rng() {
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    return state.seed / 4294967296;
  }

  function randint(a, b) {
    return Math.floor(rng() * (b - a + 1)) + a;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function toast(text) {
    const el = $('toast');
    clearTimeout(el._hideTimer);
    el.textContent = text;
    el.classList.add('show');
    el._hideTimer = setTimeout(() => el.classList.remove('show'), 900);
  }

  function go(id) {
    const t = $('toast');
    clearTimeout(t._hideTimer);
    t.classList.remove('show');
    allScreens.forEach(s => $(s).classList.toggle('active', s === id));
    renderNav(id);
    window.GCC8_ENGINE_SCROLL({ top: 0, behavior: 'smooth' });
  }

  function navUnlocked(screen) {
    if (screen === 'world') return true;
    if (screen === 'clubs') return Array.isArray(state.league) && state.league.length === 8;
    if (screen === 'recruit') return !!state.userClub && !!state.recruit;
    if (screen === 'draft') return !!state.userClub && !!state.recruit?.complete && Array.isArray(state.draftOrder) && state.draftOrder.length === 8;
    if (screen === 'team') return !!state.userClub && state.pickIndex >= 120 && (state.teams?.[state.userClub.abbr] || []).length === 15;
    if (screen === 'season') return !!state.userClub && Array.isArray(state.fullSchedule) && state.fullSchedule.length === 14;
    return false;
  }

  function renderNav(active) {
    const labels = { world: 'World', clubs: 'Club', recruit: 'Signing', draft: 'Draft', team: 'XI', season: 'Season' };
    if (active === 'leagueDraw' || active === 'draftDraw') {
      $('nav').innerHTML = '';
      return;
    }
    const navActive = (active === 'finals' || active === 'review') ? 'season' : active;
    $('nav').innerHTML = screens.map(s => { const unlocked = navUnlocked(s) || s === navActive; return `<button class="${s === navActive ? 'active' : ''}" ${unlocked ? '' : 'disabled aria-disabled="true"'} onclick="GCC.go('${s}')">${labels[s]}</button>`; }).join('');
  }

  function resetState() {
    clearTimeout(leagueRevealTimer);
    clearTimeout(draftRevealTimer);
    clearTimeout(draftAutoTimer);
    clearTimeout(seasonTimer);
    clearTimeout(finalsTimer);
    leagueRevealTimer = null;
    draftRevealTimer = null;
    draftAutoTimer = null;
    seasonTimer = null;
    finalsTimer = null;
    leagueRevealIndex = 0;
    draftRevealIndex = 0;
    revealSpeedIndex = 0;
    state.year = 2008;
    state.seed = (Date.now() >>> 0);
    state.weatherSeed = state.seed;
    state.league = [];
    state.selectedClub = null;
    state.userClub = null;
    state.pool = [];
    state.teams = {};
    state.draftOrder = [];
    state.picks = [];
    state.pickIndex = 0;
    state.filter = 'ALL';
    state.xi = [];
    state.battingOrder = [];
    state.orderTouched = false;
    state.pendingSwapIn = null;
    state.battingPins = {};
    state.cpuXIs = {};
    state.schedule = [];
    state.fullSchedule = [];
    state.round = 0;
    state.table = {};
    state.results = [];
    state.teamGames = {};
    state.champion = null;
    state.recruit = createRecruitState();
    state.draftSpeedIndex = 0;
    state.draftFinished = false;
    state.lastDraftPick = null;
    state.lastUserDraftRead = null;
    draftPoolLimit = 24;
    draftBoardVisible = false;
    state.playerSeasonStats = {};
    state.seasonSpeedIndex = 0;
    state.seasonRunning = false;
    state.regularSeasonPosition = null;
    state.finals = null;
  }

  function createRecruitState() {
    return {
      started: false,
      running: false,
      complete: false,
      day: 0,
      speedIndex: 0,
      timer: null,
      feed: [],
      feedSeq: 0,
      queue: [],
      dayTotal: 0,
      dayResolved: 0,
      daySigned: 0,
      dayDeclined: 0,
      betweenDays: false,
      currentDecision: null,
      targetSigned: 0,
      plan: null,
      universeSize: 0
    };
  }

  function newWorld() {
    resetState();
    drawClubs();
    prepareLeagueReveal();
    go('leagueDraw');
    leagueRevealTimer = setTimeout(() => runLeagueReveal(0), 560);
  }

  function prepareLeagueReveal() {
    leagueRevealIndex = 0;
    $('leagueRevealGrid').innerHTML = Array.from({length:8}, (_,i) => `<article class="club-card reveal-entry placeholder" id="leagueSlot${i}">Club ${i + 1}<br>waiting</article>`).join('');
    $('leagueRevealCount').textContent = '0 of 8 revealed';
    $('leagueRevealStatus').textContent = 'The draw is about to begin';
    $('leagueRevealPrompt').innerHTML = 'Who takes the deal?<small>Eight clubs are about to leave the old order behind. When the last name lands, one of them becomes yours.</small>';
    $('leagueRevealContinue').disabled = true;
    $('leagueRevealSkip').disabled = false;
    $('leagueRevealPace').disabled = false;
    $('leagueRevealPace').textContent = revealPaceLabels[revealSpeedIndex];
  }

  function revealLeagueSlot(i) {
    const c = state.league[i];
    const slot = $(`leagueSlot${i}`);
    slot.className = 'club-card reveal-entry live';
    slot.style.setProperty('--club', c.c);
    slot.style.setProperty('--club-accent', c.a || 'transparent');
    slot.style.setProperty('--club-text', c.t || '#112018');
    slot.innerHTML = `<div class="club-card-head"><div class="club-mark">${c.abbr}</div><div class="club-topline league-tag league-country-${c.region.toLowerCase()}">${c.league}</div></div><h3>${c.name}</h3>${compactGroundReportHtml(c, 'club')}`;
    $('leagueRevealCount').textContent = `${i + 1} of 8 revealed`;
    $('leagueRevealStatus').textContent = `${c.name} are in`;
    const prompts = ['The first name is out.', 'Two clubs have taken the deal.', 'Another heavyweight is in.', 'Half the league is set.', 'Would you take this one?', 'Two places remain after this.', 'One seat left.', 'Eight clubs. Now choose yours.'];
    $('leagueRevealPrompt').innerHTML = `${prompts[i]}<small>${c.name} has taken the deal. The home ground comes with it. The squad does not.</small>`;
    leagueRevealIndex = i + 1;
  }

  function completeLeagueReveal() {
    $('leagueRevealCount').textContent = '8 of 8 revealed';
    $('leagueRevealStatus').textContent = 'All eight clubs are in';
    $('leagueRevealPrompt').innerHTML = 'The league is set. Which club is yours?<small>You take the club, its home ground and an empty dressing room.</small>';
    $('leagueRevealContinue').disabled = false;
    $('leagueRevealSkip').disabled = true;
    $('leagueRevealPace').disabled = true;
  }

  function runLeagueReveal(i) {
    if (i >= state.league.length) return completeLeagueReveal();
    revealLeagueSlot(i);
    leagueRevealTimer = setTimeout(() => runLeagueReveal(i + 1), revealSpeeds[revealSpeedIndex]);
  }

  function skipLeagueReveal() {
    clearTimeout(leagueRevealTimer);
    for (let i = leagueRevealIndex; i < state.league.length; i++) revealLeagueSlot(i);
    completeLeagueReveal();
  }

  function finishLeagueReveal() {
    renderClubs();
    go('clubs');
  }

  function drawClubs() {
    const byRegion = {
      India: D.clubs.filter(c => c.region === 'India'),
      Australia: D.clubs.filter(c => c.region === 'Australia'),
      England: D.clubs.filter(c => c.region === 'England')
    };
    state.league = [
      ...shuffle(byRegion.India).slice(0, 3),
      ...shuffle(byRegion.Australia).slice(0, 3),
      ...shuffle(byRegion.England).slice(0, 2)
    ];
    state.league = shuffle(state.league);
    renderClubs();
  }

  function renderClubs() {
    $('clubGrid').innerHTML = state.league.map((c, i) => `
      <article class="club-card ${state.selectedClub === i ? 'selected' : ''}" style="--club:${c.c};--club-accent:${c.a || 'transparent'};--club-text:${c.t || '#112018'}" role="button" tabindex="0" onclick="GCC.selectClub(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();GCC.selectClub(${i})}">
        <div class="club-card-head"><div class="club-mark">${c.abbr}</div><div class="club-topline league-tag league-country-${c.region.toLowerCase()}">${c.league}</div></div>
        <h3>${c.name}</h3>
        ${compactGroundReportHtml(c, 'club')}
      </article>
    `).join('');
    $('chooseClub').disabled = state.selectedClub === null;
  }

  function selectClub(i) {
    state.selectedClub = i;
    renderClubs();
  }

  function confirmClub() {
    if (state.selectedClub === null) return;
    state.userClub = state.league[state.selectedClub];
    $('draftTeamName').textContent = state.userClub.name;
    $('profileTeamName').textContent = state.userClub.name;
    prepareRecruitment();
    go('recruit');
  }

  function recruitmentProfile(player){
    return (window.GCC_RECRUITMENT_2008||{})[player.name] || {recruitClass:'opportunity',willingness:.78,evidenceClass:'UNKNOWN'};
  }
  function gumbelNoise(){ const u=Math.max(1e-9,Math.min(1-1e-9,rng())); return -Math.log(-Math.log(u)); }
  function buildRecruitmentPlan(pool){
    const target=randint(158,174);
    const ranked=pool.map(player=>{
      const meta=recruitmentProfile(player);
      const w=Math.max(.08,Math.min(.98,Number(meta.willingness||.70)));
      const logit=Math.log(w/(1-w));
      // Scarce-role market pressure: eight clubs all need a keeper. This changes recruitment effort,
      // not the player's cricket ability and not the identity of who must sign.
      const roleBoost=player.role==='WK-BAT'?.50:0;
      return {player,score:logit+roleBoost+gumbelNoise()};
    }).sort((a,b)=>b.score-a.score);
    const signedIds=new Set(ranked.slice(0,target).map(x=>x.player.id));
    return {target,decisions:Object.fromEntries(pool.map(p=>[p.id,signedIds.has(p.id)]))};
  }

  function prepareRecruitment() {
    clearRecruitTimer();
    recruitWireVisible = false;
    state.recruit = createRecruitState();
    state.pool = (window.GCC_MASTER_PLAYERS_2008||window.GCC_PLAYERS_2008).map(p => ({ ...p, available: null, draftedBy: null, form: 0 }));
    window.GCC8_SEED_FOUNDATION();
    state.recruit.universeSize=state.pool.length;
    state.recruit.plan=buildRecruitmentPlan(state.pool);
    state.recruit.targetSigned=state.recruit.plan.target;
    renderRecruitment();
  }

  function openWorldDossier(tab='story') {
    const storyActive = tab !== 'how';
    openModal(`
      <div class="dossier-shell dossier-v670">
        <div class="dossier-tabs" role="tablist" aria-label="2008 GCC dossier">
          <button type="button" class="dossier-tab ${storyActive?'active':''}" onclick="GCC.openWorldDossier('story')">THE STORY</button>
          <button type="button" class="dossier-tab ${storyActive?'':'active'}" onclick="GCC.openWorldDossier('how')">HOW TO PLAY</button>
        </div>
        ${storyActive ? `
          <span class="kicker">THE 2008 GCC DOSSIER</span>
          <h2>Cricket has a new problem.</h2>
          <div class="dossier-story-intro"><span>2008</span><p>Twenty20 is moving fast. Broadcasters want more of it, players can see where the money is going, and a Saudi-backed group thinks the sport is ready for a breakaway league.</p></div>
          <div class="dossier-story-list">
            <article class="dossier-story-block"><span>01</span><div><h3>Saudi money lands in cricket</h3><p>Global Champions Cricket is announced as a short, high-value T20 competition outside the old structure. The pitch is simple: take established clubs from India, Australia and England and put them into one global championship.</p></div></article>
            <article class="dossier-story-block"><span>02</span><div><h3>Eight clubs take the deal</h3><p>Three Indian clubs, three Australian clubs and two English clubs make the foundation season. Their names, colours and home grounds stay. Their squads do not. Every GCC dressing room starts empty.</p></div></article>
            <article class="dossier-story-block"><span>03</span><div><h3>The money is real. The league is unproven.</h3><p>Players are free to say yes or no. International cricket, board pressure, existing contracts and plain distrust all matter. Some of the biggest names will sign. Some will stay away.</p></div></article>
            <article class="dossier-story-block"><span>04</span><div><h3>Five days decide the draft</h3><p>The signing window runs before any squad exists. Every yes puts another name on the board. Every no takes one off it. You do not know the final pool until the window shuts.</p></div></article>
            <article class="dossier-story-block"><span>05</span><div><h3>Then every side is built from scratch</h3><p>The draft order is drawn and 15 rounds snake through all eight clubs. There are no protected lists. If another club takes your player, he is gone. Reputation matters, but so do roles, overs, batting positions and the ground you call home.</p></div></article>
            <article class="dossier-story-block"><span>06</span><div><h3>Fourteen games decide whether any of it worked</h3><p>Everyone plays everyone twice. The top four make the finals. By then the theory is over: the scorecards tell you which squads actually work and the first GCC champion is decided on the field.</p></div></article>
          </div>
          <blockquote class="dossier-quote">The money gets them in the room. The draft builds the sides. Then cricket takes over.</blockquote>
        ` : `
          <span class="kicker">HOW TO PLAY</span>
          <h2>Build a side that makes cricket sense.</h2>
          <p class="dossier-intro">The loop is simple: signing window, draft, XI, season. Getting the cricket right is not.</p>
          <div class="dossier-how-grid">
            <article><span>1</span><div><h3>Watch the signing window</h3><p>Only players who accept GCC enter the draft. A big name saying no can change the whole board.</p></div></article>
            <article><span>2</span><div><h3>Read your ground</h3><p>Your club keeps its home conditions. Pace, spin and boundary size should influence the squad you build.</p></div></article>
            <article><span>3</span><div><h3>Draft fifteen</h3><p>The order snakes for 15 rounds. Once a player is picked, he is gone. You need a squad, not a list of famous names.</p></div></article>
            <article><span>4</span><div><h3>Cover the whole innings</h3><p>Powerplay runs, middle-overs batting, finishing, new-ball wickets, middle-overs control and death bowling all matter.</p></div></article>
            <article><span>5</span><div><h3>Name the XI yourself</h3><p>There are no hard role locks. Pick the eleven you want, set the batting order and make sure you have enough trustworthy overs.</p></div></article>
            <article><span>6</span><div><h3>Keep someone behind the stumps</h3><p>You can gamble without a recognised keeper, but missed chances and untidy work behind the stumps will follow. That choice belongs in your XI.</p></div></article>
            <article><span>7</span><div><h3>Let the season prove it</h3><p>Fourteen matches and the finals turn theory into scorecards. Form, conditions, matchups and the balance of the XI decide whether the plan holds up.</p></div></article>
          </div>
          <div class="dossier-rule"><b>SCOUTING IN 2008</b>You are judging the player in front of you, with the evidence available at the time. The game does not hand you his future career.</div>
        `}
        <div class="close-row"><button class="button primary" onclick="GCC.closeModal()">BACK TO 2008</button></div>
      </div>
    `);
  }

  function openHow() {
    openWorldDossier('how');
  }

  // One modal surface, including direct opens from the dynasty layer.
function installModalInteraction() {
  const modal=document.getElementById('modal');
  if(!modal) return;
  let opened=false,returnTo=null,oldOverflow='',blocked=[];
  const available=()=>[...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]')]
    .filter(el=>!el.disabled && el.tabIndex>=0 && el.getClientRects().length);
  const sync=()=>{
    const now=modal.classList.contains('open');
    if(now===opened)return;
    opened=now;
    if(now){
      globalThis.GCC?.pauseSeason?.();
      returnTo=document.activeElement;
      oldOverflow=document.body.style.overflow;
      document.body.style.overflow='hidden';
      blocked=[...document.body.children].filter(el=>el!==modal && !el.contains(modal) && !['SCRIPT','STYLE','SVG'].includes(el.tagName)).map(el=>({el,inert:el.inert}));
      blocked.forEach(({el})=>el.inert=true);
      document.getElementById('modalBody').scrollTop=0;
      document.getElementById('modalClose')?.focus({preventScroll:true});
    }else{
      document.body.style.overflow=oldOverflow;
      blocked.forEach(({el,inert})=>el.inert=inert);
      blocked=[];
      if(returnTo?.isConnected && !returnTo.disabled && (!returnTo.getClientRects || returnTo.getClientRects().length)) returnTo.focus({preventScroll:true});
      else document.querySelector?.('.screen.active button:not([disabled]),#nav button:not([disabled])')?.focus({preventScroll:true});
      returnTo=null;
    }
  };
  new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(!modal.classList.contains('open'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeModal();return;}
    if(event.key!=='Tab')return;
    const controls=available(),first=controls[0],last=controls[controls.length-1];
    if(!first){event.preventDefault();document.getElementById('modalBody').focus();return;}
    if(event.shiftKey && (document.activeElement===first || !modal.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey && (document.activeElement===last || !modal.contains(document.activeElement))){event.preventDefault();first.focus();}
  },true);
  sync();
}

  installModalInteraction();

  function openModal(html) {
    window.GCC?.pauseSeason?.();
    $('modalBody').innerHTML = html;
    $('modal').classList.add('open');
  }

  function closeModal() {
    $('modal').classList.remove('open');
  }

  function backdropClose(e) {
    if (e.target === $('modal')) closeModal();
  }

  function clearRecruitTimer() {
    if (state.recruit && state.recruit.timer) {
      clearTimeout(state.recruit.timer);
      state.recruit.timer = null;
    }
  }

  function cycleRecruitSpeed() {
    if (state.recruit.complete) return;
    state.recruit.speedIndex = (state.recruit.speedIndex + 1) % recruitLabels.length;
    renderRecruitment();
    if (!state.recruit.running) return;
    clearRecruitTimer();
    if (state.recruit.betweenDays) {
      state.recruit.timer = setTimeout(() => startRecruitDay(state.recruit.day + 1), recruitDayPauses[state.recruit.speedIndex]);
    } else {
      scheduleRecruitEvent(80);
    }
  }

  function runRecruitment() {
    if (!state.userClub || !state.recruit) return toast('Choose your club first');
    if (state.recruit.complete) return;
    if(state.recruit.running){clearRecruitTimer();state.recruit.running=false;renderRecruitment();return;}
    if (!state.recruit.started) {
      state.recruit.started = true;
      state.recruit.running = true;
      pushRecruitFeed('League window opens', `GCC begins contacting ${state.pool.length} eligible players across the 2008 cricket world. Five days from now, only the players who commit will be on the foundation draft board.`, 'day');
      startRecruitDay(1, 180);
      return;
    }
    state.recruit.running = true;
    if(state.recruit.betweenDays){startRecruitDay(state.recruit.day+1,100);return;}
    state.recruit.betweenDays = false;
    if (!state.recruit.queue.length) prepareRecruitmentDay(state.recruit.day || 1);
    renderRecruitment();
    scheduleRecruitEvent(100);
  }

  function skipRecruitment() {
    if (state.recruit.complete) return;
    if (!state.recruit.started) {
      state.recruit.started = true;
      state.recruit.day = 1;
      pushRecruitFeed('League window opens', `GCC begins contacting ${state.pool.length} eligible players across the 2008 cricket world. You jump ahead to the close of the five-day window.`, 'day');
      prepareRecruitmentDay(1);
    }

    clearRecruitTimer();
    state.recruit.running = false;

    if (state.recruit.queue.length || !state.recruit.betweenDays) {
      while (state.recruit.queue.length) resolveRecruitEvent(state.recruit.queue.shift(), true);
      closeRecruitDay(false);
    }

    while (state.recruit.day < 5) {
      state.recruit.day += 1;
      prepareRecruitmentDay(state.recruit.day);
      while (state.recruit.queue.length) resolveRecruitEvent(state.recruit.queue.shift(), true);
      closeRecruitDay(false);
    }

    state.recruit.betweenDays = false;
    finaliseRecruitment();
  }

  function startRecruitDay(day, firstDelay = null) {
    if (!state.recruit.running || state.recruit.complete || day > 5) return;
    state.recruit.day = day;
    state.recruit.betweenDays = false;
    prepareRecruitmentDay(day);
    renderRecruitment();
    scheduleRecruitEvent(firstDelay ?? recruitSpeeds[state.recruit.speedIndex]);
  }

  function prepareRecruitmentDay(day) {
    state.recruit.betweenDays = false;
    const pending = state.pool.filter(p => p.available === null);
    state.recruit.dayResolved = 0;
    state.recruit.daySigned = 0;
    state.recruit.dayDeclined = 0;

    if (!pending.length) {
      state.recruit.queue = [];
      state.recruit.dayTotal = 0;
      return;
    }

    const daysLeft = 6 - day;
    const count = day === 5
      ? pending.length
      : Math.max(18, Math.min(pending.length - Math.max(0, (daysLeft - 1) * 18), Math.ceil(pending.length / daysLeft) + randint(-3, 4)));

    const batch = shuffle(pending).slice(0, count);
    state.recruit.queue = batch.map(player => {
      const joins=Boolean(state.recruit.plan?.decisions?.[player.id]);
      const notable = player.overall >= 84 || AI.projectedValue(player,state.year)>=92 || rng() < 0.10;
      return { player, joins, notable };
    });
    state.recruit.dayTotal = state.recruit.queue.length;
  }

  function scheduleRecruitEvent(delay = recruitSpeeds[state.recruit.speedIndex]) {
    clearRecruitTimer();
    state.recruit.timer = setTimeout(processRecruitEvent, delay);
  }

  function processRecruitEvent() {
    if (!state.recruit.running || state.recruit.complete) return;
    if (!state.recruit.queue.length) {
      closeRecruitDay(true);
      return;
    }

    const event = state.recruit.queue.shift();
    resolveRecruitEvent(event, true);
    renderRecruitment();

    if (state.recruit.queue.length) {
      scheduleRecruitEvent();
    } else {
      closeRecruitDay(true);
    }
  }

  function resolveRecruitEvent(event, emitFeed) {
    const player = byId(event.player.id), joins = event.joins;
    if (!player) throw new Error('Signing decision refers to an unavailable player.');
    player.available = joins;
    state.recruit.dayResolved += 1;
    if (joins) state.recruit.daySigned += 1;
    else state.recruit.dayDeclined += 1;

    state.recruit.currentDecision = {
      name: player.name,
      joins,
      country: player.country,
      role: playerArchetype(player)
    };

    if (emitFeed) {
      pushRecruitFeed(
        player.name,
        `${joins ? 'SIGNED WITH GCC' : 'DECLINED GCC'} · ${player.country} · ${playerArchetype(player)}`,
        joins ? 'signed' : 'declined'
      );
    }
  }

  function closeRecruitDay(scheduleNext) {
    if (state.recruit.betweenDays || state.recruit.complete) return;
    pushRecruitFeed(
      `Day ${state.recruit.day} complete`,
      recruitmentDayLine(state.recruit.day, state.recruit.daySigned, state.recruit.dayDeclined),
      'day'
    );
    state.recruit.betweenDays = state.recruit.day < 5;
    renderRecruitment();

    if (state.recruit.day >= 5) {
      finaliseRecruitment();
      return;
    }

    if (scheduleNext && state.recruit.running) {
      clearRecruitTimer();
      state.recruit.timer = setTimeout(() => startRecruitDay(state.recruit.day + 1), recruitDayPauses[state.recruit.speedIndex]);
    }
  }

  function finaliseRecruitment() {
    if (state.recruit.complete) return;
    clearRecruitTimer();
    state.recruit.running = false;
    state.recruit.betweenDays = false;

    const signed = state.pool.filter(p => p.available === true);
    const declined = state.pool.filter(p => p.available === false);
    if (signed.length < 120) throw new Error(`Recruitment plan produced only ${signed.length} signed players`);
    if (state.recruit.targetSigned && signed.length !== state.recruit.targetSigned) throw new Error(`Recruitment plan mismatch: expected ${state.recruit.targetSigned}, got ${signed.length}`);

    state.recruit.complete = true;
    pushRecruitFeed('Signing window closed', `${signed.length} players entered the GCC draft pool. ${state.pool.length - signed.length} declined.`, 'day');
    renderRecruitment();
    $('draftSetup').disabled = false;
    toast('Signing window closed');
  }

  function recruitmentDayLine(day, signed, declined) {
    const lines = {
      1: `Opening day is done. ${signed} players enter the GCC draft pool and ${declined} decline.`,
      2: `${signed} more players enter the pool. ${declined} decline GCC.`,
      3: `Halfway through. ${signed} players enter today and ${declined} decline.`,
      4: `One day left. ${signed} players enter today and ${declined} decline.`,
      5: `Last calls. ${signed} players enter before the deadline and ${declined} stay outside GCC.`
    };
    return lines[day] || `${signed} signed, ${declined} declined.`;
  }

  function recruitJoinHeadline(player) {
    const names = [
      `${player.name} signs`,
      `${player.name} is in`,
      `${player.name} joins the league`,
      `${player.name} commits to the breakaway`
    ];
    return names[randint(0, names.length - 1)];
  }

  function recruitDeclineHeadline(player) {
    const names = [
      `${player.name} stays away`,
      `${player.name} turns it down`,
      `${player.name} remains out`,
      `${player.name} will not join`
    ];
    return names[randint(0, names.length - 1)];
  }

  function recruitDetail(player, joins) {
    const cricketNote = playerNote(player).toLowerCase();
    if (joins) {
      const options = [
        `${player.country} ${roleName(player).toLowerCase()}. ${sentenceCase(cricketNote)}. He will be on your board when the draft opens.`,
        `${player.country} ${roleName(player).toLowerCase()}. He brings ${cricketNote}. Another name to weigh up on draft night.`,
        `${player.country} ${roleName(player).toLowerCase()}. Deal done. If you want him, he will be there when the room opens.`
      ];
      return options[randint(0, options.length - 1)];
    }
    const options = [
      `${player.country} ${roleName(player).toLowerCase()}. ${sentenceCase(cricketNote)}. Cross him off the board.`,
      `${player.country} ${roleName(player).toLowerCase()}. He says no. One less name to consider on draft night.`,
      `${player.country} ${roleName(player).toLowerCase()}. GCC misses out. ${sentenceCase(cricketNote)} stays outside the league.`
    ];
    return options[randint(0, options.length - 1)];
  }

  function pushRecruitFeed(title, text, tone = '') {
    state.recruit.feedSeq = (state.recruit.feedSeq || 0) + 1;
    state.recruit.feed.unshift({ id: state.recruit.feedSeq, title, text, tone });
    const keep = Math.max(80, (state.recruit.universeSize || state.pool.length || 0) + 16);
    state.recruit.feed = state.recruit.feed.slice(0, keep);
  }

  function toggleRecruitWire() {
    recruitWireVisible = !recruitWireVisible;
    renderRecruitment();
  }

  function renderRecruitment() {
    let signedCount = 0, declinedCount = 0, pendingCount = 0;
    for (const p of state.pool) { if (p.available === true) signedCount++; else if (p.available === false) declinedCount++; else pendingCount++; }
    const dayValue = state.recruit.complete ? '5/5' : state.recruit.day ? `${state.recruit.day}/5` : '0/5';

    const summary = $('recruitSummary');
    if (summary) summary.textContent = `DAY ${dayValue} · ${signedCount} IN · ${declinedCount} OUT · ${pendingCount} WAITING`;

    $('recruitProgress').innerHTML = Array.from({ length: 5 }, (_, i) => {
      const day = i + 1;
      const done = state.recruit.complete || state.recruit.day > day || (state.recruit.betweenDays && state.recruit.day === day);
      const cls = done ? 'done' : state.recruit.day === day && state.recruit.started && !state.recruit.complete ? 'live' : '';
      const label = done ? 'Done' : state.recruit.day === day && state.recruit.running ? 'Live' : state.recruit.day === day ? 'Paused' : 'Next';
      return `<div class="day-pill ${cls}"><b>Day ${day}</b>${label}</div>`;
    }).join('');

    const feedMarkup = item => `<div class="feed-item ${item.tone || ''}" data-feed-id="${item.id}"><b>${item.title}</b><span>${item.text}</span></div>`;
    const visibleRecruitFeed = state.recruit.feed;
    const feedEl = $('recruitFeed');
    if (feedEl) feedEl.innerHTML = visibleRecruitFeed.length ? visibleRecruitFeed.map(feedMarkup).join('') : '<div class="empty">No calls yet.</div>';

    const recentEl = $('recruitRecent');
    const recent = state.recruit.feed.filter(item => item.tone !== 'day').slice(0, 4);
    if (recentEl) recentEl.innerHTML = recent.length ? recent.map(feedMarkup).join('') : '<div class="empty">No decisions yet.</div>';

    const liveView = $('recruitLiveView');
    const wirePanel = $('recruitWirePanel');
    if (liveView) liveView.hidden = recruitWireVisible;
    if (wirePanel) wirePanel.hidden = !recruitWireVisible;
    const wireToggle = $('recruitWireToggle');
    if (wireToggle) wireToggle.textContent = recruitWireVisible ? 'BACK TO LIVE WINDOW' : 'VIEW FULL SIGNING WIRE';

    const roll = $('recruitRoll');
    if (roll) {
      const d = state.recruit.currentDecision;
      roll.className = `recruit-roll${state.recruit.complete ? ' complete' : d ? (d.joins ? ' signed' : ' declined') : ''}`;
      roll.innerHTML = state.recruit.complete
        ? `<span class="roll-label">POOL LOCKED</span><h3>${signedCount} players are in</h3><p>${declinedCount} stay outside GCC · The draft order is next</p>`
        : d
          ? `<span class="roll-label">LATEST CALL</span><h3>${d.name}</h3><p>${d.joins ? 'JOINS GCC' : 'DECLINES GCC'} · ${d.country} · ${d.role}</p>`
          : '<span class="roll-label">NEXT CALL</span><h3>The first name is waiting</h3><p>Open the window to see who enters the foundation Draft.</p>';
    }

    const ticker = $('recruitTicker');
    if (ticker) {
      const resolved = state.recruit.dayResolved || 0;
      const total = state.recruit.dayTotal || 0;
      ticker.classList.toggle('live', state.recruit.running && !state.recruit.betweenDays);
      ticker.innerHTML = state.recruit.complete
        ? '<span class="live-dot"></span><b>Signing week complete</b><span>The foundation draft pool is locked.</span>'
        : !state.recruit.started
          ? '<span class="live-dot"></span><b>Day 1 ready</b><span>No player has committed yet.</span>'
          : state.recruit.betweenDays
            ? `<span class="live-dot"></span><b>Day ${state.recruit.day} complete</b><span>Day ${state.recruit.day + 1} begins shortly.</span>`
            : `<span class="live-dot"></span><b>Day ${state.recruit.day} live</b><span>${resolved} of ${total} calls resolved.</span>`;
    }

    const contextLead = $('recruitContextLead');
    const context = $('recruitContext');
    if (contextLead && context) {
      if (state.recruit.complete) {
        contextLead.textContent = 'The Draft pool is locked.';
        context.textContent = `${signedCount} players are in the Draft. ${declinedCount} are out. Draw the order to learn your first pick.`;
      } else if (state.recruit.started) {
        contextLead.textContent = `${signedCount} players are in the Draft pool.`;
        context.textContent = pendingCount ? `${pendingCount} calls remain. The pool can still change before Day 5 closes.` : 'Every call is resolved. The league is closing the window.';
      } else {
        contextLead.textContent = 'The Draft pool is still open.';
        context.textContent = `All ${pendingCount} eligible players are undecided. Every yes puts a player into the Draft; every no takes that player out before the order is drawn.`;
      }
    }

    $('runRecruit').textContent = state.recruit.complete
      ? 'WINDOW CLOSED'
      : state.recruit.running
        ? 'PAUSE SIGNING WINDOW'
        : state.recruit.started
          ? 'RESUME SIGNING WINDOW'
          : 'OPEN SIGNING WINDOW';

    $('runRecruit').disabled = state.recruit.complete;
    $('speedRecruit').textContent = recruitLabels[state.recruit.speedIndex];
    $('speedRecruit').disabled = state.recruit.complete;
    $('skipRecruit').disabled = state.recruit.complete;
    $('draftSetup').disabled = !state.recruit.complete;
  }

  function setupDraft() {
    state.draftOrder = shuffle(state.league);
    state.teams = {};
    state.picks = [];
    state.pickIndex = 0;
    state.xi = [];
    state.draftSpeedIndex = 0;
    state.draftFinished = false;
    state.lastDraftPick = null;
    state.lastUserDraftRead = null;
    draftPoolLimit = 24;
    draftBoardVisible = false;
    state.draftOrder.forEach(c => state.teams[c.abbr] = []);
    prepareDraftReveal();
    go('draftDraw');
    draftRevealTimer = setTimeout(() => runDraftReveal(0), 600);
  }

  function prepareDraftReveal() {
    revealSpeedIndex = 0;
    draftRevealIndex = 0;
    $('draftRevealGrid').innerHTML = Array.from({length:8}, (_,i) => `<div class="reveal-card placeholder draft-order-card" id="draftSlot${i}"><span class="reveal-no">${i + 1}</span><br>waiting</div>`).join('');
    $('draftRevealCount').textContent = '0 of 8 positions drawn';
    $('draftRevealStatus').textContent = 'The first envelope is ready';
    $('draftRevealPrompt').innerHTML = 'Where do you land?<small>Round 1 runs from 1 to 8. Round 2 comes straight back.</small>';
    $('draftRevealContinue').disabled = true;
    $('draftRevealSkip').disabled = false;
    $('draftRevealPace').disabled = false;
    $('draftRevealPace').textContent = revealPaceLabels[revealSpeedIndex];
  }

  function revealDraftSlot(i) {
    const c = state.draftOrder[i];
    const slot = $(`draftSlot${i}`);
    const mine = c.abbr === state.userClub.abbr;
    slot.className = `reveal-card live draft-order-card${mine ? ' user' : ''}`;
    slot.innerHTML = `<span class="reveal-no">${i + 1}</span><div class="club-mark" style="--club:${c.c};--club-accent:${c.a || 'transparent'};--club-text:${c.t || '#112018'};margin-top:10px">${c.abbr}</div><h3>${c.name}${mine ? ' · YOU' : ''}</h3><p>${i === 0 ? 'First pick in Round 1' : `Pick ${i + 1} in Round 1`}<br>Round 2: Pick ${16 - i}</p>`;
    $('draftRevealCount').textContent = `${i + 1} of 8 positions drawn`;
    $('draftRevealStatus').textContent = mine ? `${state.userClub.name}: Pick ${i + 1}` : `${c.name}: Pick ${i + 1}`;
    const userIndex = state.draftOrder.findIndex(x => x.abbr === state.userClub.abbr);
    $('draftRevealPrompt').innerHTML = mine
      ? `Your club has Pick ${i + 1}.<small>Now watch where the rest of the order falls around you.</small>`
      : `${c.name}: Pick ${i + 1}.<small>${i < userIndex ? 'Your position is still waiting.' : 'Your place is set. The rest of the order is filling in.'}</small>`;
    draftRevealIndex = i + 1;
  }

  function completeDraftReveal() {
    const userPick = state.draftOrder.findIndex(c => c.abbr === state.userClub.abbr) + 1;
    $('draftRevealCount').textContent = '8 of 8 positions drawn';
    $('draftRevealStatus').textContent = 'The snake order is locked';
    $('draftRevealPrompt').innerHTML = `Pick ${userPick} is yours. Who do you want?<small>You come back at pick ${17 - userPick} overall.</small>`;
    $('draftRevealContinue').disabled = false;
    $('draftRevealSkip').disabled = true;
    $('draftRevealPace').disabled = true;
  }

  function runDraftReveal(i) {
    if (i >= state.draftOrder.length) return completeDraftReveal();
    revealDraftSlot(i);
    const mine = state.draftOrder[i].abbr === state.userClub.abbr;
    draftRevealTimer = setTimeout(() => runDraftReveal(i + 1), revealSpeeds[revealSpeedIndex] + (mine ? 220 : 0));
  }

  function skipDraftReveal() {
    clearTimeout(draftRevealTimer);
    for (let i = draftRevealIndex; i < state.draftOrder.length; i++) revealDraftSlot(i);
    completeDraftReveal();
  }

  function cycleRevealPace(kind) {
    revealSpeedIndex = (revealSpeedIndex + 1) % revealPaceLabels.length;
    const leagueButton = $('leagueRevealPace');
    const draftButton = $('draftRevealPace');
    if (leagueButton) leagueButton.textContent = revealPaceLabels[revealSpeedIndex];
    if (draftButton) draftButton.textContent = revealPaceLabels[revealSpeedIndex];
    if (kind === 'league' && leagueRevealIndex < state.league.length) {
      clearTimeout(leagueRevealTimer);
      leagueRevealTimer = setTimeout(() => runLeagueReveal(leagueRevealIndex), 90);
    }
    if (kind === 'draft' && draftRevealIndex < state.draftOrder.length) {
      clearTimeout(draftRevealTimer);
      draftRevealTimer = setTimeout(() => runDraftReveal(draftRevealIndex), 90);
    }
  }

  function beginDraft() {
    closeModal();
    clearTimeout(draftAutoTimer);
    draftPoolLimit = 24;
    draftBoardVisible = false;
    go('draft');
    renderFilters();
    renderDraft();
    advanceAI();
  }

  function currentTeam() {
    if (state.pickIndex >= 120 || !state.draftOrder.length) return null;
    return orderForPick(state.pickIndex);
  }

  function orderForPick(idx) {
    const round = Math.floor(idx / 8);
    const pos = idx % 8;
    return state.draftOrder[round % 2 === 0 ? pos : 7 - pos];
  }

  function renderFilters() {
    $('filters').innerHTML = ['ALL', 'BAT', 'WK-BAT', 'AR', 'BOWL'].map(f => `<button class="button ${state.filter === f ? 'primary' : ''}" onclick="GCC.setFilter('${f}')">${f}</button>`).join('');
  }

  function setFilter(f) {
    state.filter = f;
    draftPoolLimit = 24;
    renderFilters();
    renderPlayers();
  }

  function showMoreDraftPlayers() {
    draftPoolLimit += draftPoolStep;
    renderPlayers();
  }

  function toggleDraftBoard() {
    draftBoardVisible = !draftBoardVisible;
    renderDraftWorkspace();
    if (draftBoardVisible) renderDraftBoard();
  }

  function renderDraftWorkspace() {
    const workspace = $('draftWorkspace');
    const board = $('draftBoardPanel');
    const toggle = $('draftBoardToggle');
    if (workspace) workspace.hidden = draftBoardVisible;
    if (board) board.hidden = !draftBoardVisible;
    if (toggle) toggle.textContent = draftBoardVisible ? 'BACK TO PLAYER POOL' : 'VIEW DRAFT BOARD';
  }

  function renderDraftStatus(t) {
    if (!t) {
      $('onClock').textContent = 'Foundation draft complete';
      $('draftHint').textContent = 'Your 15 are set.';
      $('pickNo').textContent = '120 / 120';
      return;
    }
    $('onClock').textContent = t.abbr === state.userClub.abbr ? `${state.userClub.name} on the clock` : `${t.name} on the clock`;
    $('draftHint').textContent = `Round ${Math.floor(state.pickIndex / 8) + 1} · board runs ${Math.floor(state.pickIndex / 8) % 2 === 0 ? '1 → 8' : '8 → 1'}`;
    $('pickNo').textContent = `${state.pickIndex + 1} / 120`;
  }

  function renderDraftTransit() {
    const t = currentTeam();
    renderDraftWorkspace();
    if (draftBoardVisible) renderDraftBoard();
    renderDraftFlow(t);
    renderDraftStatus(t);
  }

  function renderDraft() {
    renderDraftWorkspace();
    renderPlayers();
    renderSquadMini();
    if (draftBoardVisible) renderDraftBoard();
    const t = currentTeam();
    renderDraftFlow(t);
    renderDraftStatus(t);
  }

  function renderDraftFlow(t) {
    const flow = $('draftFlow');
    if (!flow) return;
    flow.classList.toggle('user-turn', !!t && t.abbr === state.userClub.abbr);
    $('draftPace').textContent = draftPaceLabels[state.draftSpeedIndex];
    const skip = $('skipToPick');
    if (!t) {
      $('draftFlowLead').textContent = 'The board is full.';
      $('draftFlowDetail').textContent = 'All 120 names are off the board.';
      skip.textContent = 'DRAFT COMPLETE';
      skip.disabled = true;
      $('draftPace').disabled = true;
      return;
    }
    $('draftPace').disabled = false;
    if (t.abbr === state.userClub.abbr) {
      $('draftFlowLead').textContent = "You're on the clock.";
      $('draftFlowDetail').textContent = `Pick ${state.pickIndex + 1}. Name the player.`;
      skip.textContent = 'YOUR PICK';
      skip.disabled = true;
      return;
    }
    if (state.lastDraftPick) {
      const lp = state.lastDraftPick;
      $('draftFlowLead').textContent = `${lp.team.name} take ${lp.player.name}.`;
      $('draftFlowDetail').textContent = `Pick ${lp.overall}. ${t.name} are next.`;
    } else {
      $('draftFlowLead').textContent = `${t.name} are on the clock at Pick 1.`;
      $('draftFlowDetail').textContent = 'The board is moving.';
    }
    skip.textContent = 'SKIP TO MY PICK';
    skip.disabled = false;
  }

  function renderPlayers() {
    if (!state.pool.length) return;
    const q = ($('playerSearch')?.value || '').trim().toLowerCase();
    const list = state.pool
      .filter(p => p.available && !p.draftedBy && (state.filter === 'ALL' || p.role === state.filter) && p.name.toLowerCase().includes(q))
      .sort((a, b) => b.overall - a.overall);
    const shown = list.slice(0, draftPoolLimit);
    const userOnClock = currentTeam()?.abbr === state.userClub?.abbr;
    $('players').innerHTML = shown.map(p => {
      return `
      <article class="player-card score-${R.grade(p.overall)}${userOnClock ? '' : ' waiting'}" role="button" tabindex="${userOnClock ? '0' : '-1'}" onclick="GCC.userDraft(${p.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();GCC.userDraft(${p.id})}">
        <div class="player-top">
          <div>
            <h4>${p.name}</h4>
            <div class="player-meta">${p.country} · ${2008 - p.birthYear} · ${roleName(p)}</div>
          </div>
          <div class="ovr">${p.overall}</div>
        </div>
        <div class="player-role">${playerNote(p)}</div>
        <div class="player-tags">${playerTagsHtml(p)}</div>
        <div class="player-stats"><span>BAT ${p.bat}</span><span>BOWL ${p.bowl}</span><span>FIELD ${p.fielding}</span>${p.keeping > 60 ? `<span>KEEP ${p.keeping}</span>` : ''}</div>
      </article>`;
    }).join('') || '<div class="empty">No players found.</div>';

    const controls = $('draftPoolControls');
    if (controls) {
      if (!list.length) controls.innerHTML = '<span>0 players match this search.</span>';
      else {
        const count = Math.min(shown.length, list.length);
        const context = q || state.filter !== 'ALL' ? `${count} of ${list.length} matching players` : `${count} of ${list.length} available players`;
        controls.innerHTML = `<span>${context}</span>${count < list.length ? '<button class="button" onclick="GCC.showMoreDraftPlayers()">SHOW MORE</button>' : ''}`;
      }
    }
  }

  function roleName(p) {
    return ({ BAT: 'Batter', 'WK-BAT': 'Wicketkeeper-batter', AR: 'All-rounder', BOWL: 'Bowler' })[p.role] || p.role;
  }

  function credibleBowler(p) { return R.bowlingWorkload(p) > 0 && p.bowl >= 45; }
  function bowlingType(p) {
    if (!credibleBowler(p)) return null;
    const type=R.bowlingStyle ? R.bowlingStyle(p) : null;
    return type==='DUAL' ? (p.spin>=p.pace?'SPIN':'PACE') : type;
  }
  function bowlingPhaseTags(p, type) {
    if (!type) return [];
    const tags=[];
    if (type === 'SPIN') {
      if (p.spin >= 78 && p.bowlControl >= 68) tags.push(['MIDDLE OVERS',p.spin]);
      if (p.death >= 84) tags.push(['DEATH',p.death]);
      if (p.newBall >= 84) tags.push(['NEW BALL',p.newBall]);
    } else {
      if (p.newBall >= 82) tags.push(['NEW BALL',p.newBall]);
      if (p.death >= 82) tags.push(['DEATH',p.death]);
      const middlePace=p.bowlControl*.45+p.variation*.35+p.bowl*.20;
      if (tags.length < 2 && middlePace >= 82) tags.push(['MIDDLE OVERS',middlePace]);
    }
    return tags.sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  }
  function playerRoleTags(p) {
    const tags=[];
    const canBat=p.bat>=50;
    const type=bowlingType(p);
    const phases=bowlingPhaseTags(p,type);
    const battingTag=!canBat?null:p.preferredSlot<=2?'OPENER':p.preferredSlot<=4?'TOP ORDER':p.preferredSlot<=6?'MIDDLE ORDER':'LOWER MIDDLE';
    const genuineFinisher=canBat && p.preferredSlot>=4 && p.finishing>=86 && p.power>=84;

    if (p.role === 'BOWL') {
      if (type) tags.push(type);
      tags.push(...phases.slice(0,2));
    } else if (p.role === 'AR') {
      if (genuineFinisher) tags.push('FINISHER');
      else if (p.preferredSlot<=4 && p.bat>=70 && battingTag) tags.push(battingTag);
      if (type) tags.push(type);
      tags.push(...phases.slice(0,Math.max(0,3-tags.length)));
    } else {
      if (battingTag) tags.push(battingTag);
      if (genuineFinisher) tags.push('FINISHER');
      if (type && tags.length<3) tags.push(type);
      tags.push(...phases.slice(0,Math.max(0,3-tags.length)));
    }
    // Primary BAT / WK-BAT / AR / BOWL identity is already shown separately.
    return [...new Set(tags)].slice(0,3);
  }

  function playerNote(p) {
    const tags=playerRoleTags(p);
    if (p.role === 'WK-BAT') return p.preferredSlot <= 2 ? 'Wicketkeeper-batter who can open' : p.finishing >= 84 ? 'Wicketkeeper-batter with a finishing role' : 'Wicketkeeper-batter';
    if (p.role === 'AR') {
      const type=bowlingType(p);
      if (type === 'SPIN') return (p.finishing >= 86 && p.power >= 84) ? 'Spin-bowling all-rounder with finishing power' : 'Spin-bowling all-rounder';
      if (type === 'PACE') return p.death >= 82 ? 'Pace-bowling all-rounder with death-overs value' : 'Pace-bowling all-rounder';
      return 'Two-discipline all-rounder';
    }
    if (p.role === 'BAT') return tags.includes('OPENER') ? (p.power >= 88 ? 'Aggressive opening batter' : 'Opening batter') : tags.includes('FINISHER') ? 'Middle-order finisher' : p.preferredSlot <= 4 ? 'Top-order batter' : 'Middle-order batter';
    if (tags.includes('SPIN')) return tags.includes('MIDDLE OVERS') ? 'Frontline spin bowler through the middle overs' : 'Frontline spin bowler';
    if (tags.includes('NEW BALL') && tags.includes('DEATH')) return 'Pace bowler trusted at both ends of the innings';
    if (tags.includes('DEATH')) return 'Death-overs pace bowler';
    if (tags.includes('NEW BALL')) return 'New-ball pace bowler';
    return 'Frontline bowler';
  }

  function playerArchetype(p) {
    const tags=playerRoleTags(p);
    if (!tags.length) return roleName(p).toUpperCase();
    return tags.join(' · ');
  }

  function playerTagsHtml(p) {
    const tags=playerRoleTags(p);
    return tags.map(tag=>`<span class="player-chip">${tag}</span>`).join('');
  }

  function draftSnapshot(ps) {
    const counts = { BAT: 0, 'WK-BAT': 0, AR: 0, BOWL: 0 };
    ps.forEach(p => counts[p.role] = (counts[p.role] || 0) + 1);
    return {
      counts,
      keeper: Math.max(0, ...ps.map(p => p.keeping || 0)),
      openers: ps.filter(p => p.bat >= 55 && p.preferredSlot <= 2).length,
      middle: ps.filter(p => p.bat >= 50 && p.preferredSlot >= 3 && p.preferredSlot <= 6).length,
      death: ps.filter(p => credibleBowler(p) && p.death >= 80).length,
      spin: ps.filter(p => credibleBowler(p) && bowlingType(p) === 'SPIN').length,
      pace: ps.filter(p => credibleBowler(p) && bowlingType(p) === 'PACE').length
    };
  }


  function projectedDraftProfile(ps) {
    if (!ps.length) return R.profile([], { matchesTogether: 0 });
    return R.profile(ps.length > 11 ? bestXI(ps) : ps, { matchesTogether: 0 });
  }

  function draftPickRead(beforePs, afterPs, p, pickNo) {
    const before = beforePs.length ? projectedDraftProfile(beforePs) : null;
    const after = projectedDraftProfile(afterPs);
    const b = draftSnapshot(beforePs), a = draftSnapshot(afterPs);
    let line = '';

    if (b.keeper < 65 && a.keeper >= 65) line = 'Settles the wicketkeeping question and gives the batting order another genuine option.';
    else if (afterPs.length >= 4 && b.openers === 0 && a.openers > 0) line = 'Gives the batting order a natural option at the top without locking you into a particular opening pair.';
    else if (afterPs.length >= 5 && b.death === 0 && a.death > 0) line = 'Adds a bowler you can credibly hold back for the last five overs.';
    else if (afterPs.length >= 5 && b.spin === 0 && a.spin > 0) line = 'Adds a genuine spin option and changes how the attack can handle the middle overs.';
    else if (before && afterPs.length >= 9 && Number.isFinite(after.xiShape) && Number.isFinite(before.xiShape) && after.xiShape < before.xiShape - 2) line = 'Adds quality, but the likely XI is becoming more crowded around similar batting or bowling jobs.';
    else if (before) {
      const changes = [
        ['powerplayBat','Strengthens the top of the order.'],
        ['middleBat','Adds more control through the middle overs.'],
        ['finishing','Adds another way to close an innings.'],
        ['newBall','Strengthens the new-ball attack.'],
        ['middleBowl','Adds another useful option through the middle overs with the ball.'],
        ['death','Improves the attack at the death.'],
        ['bowlingResources','Adds more credible bowling cover across twenty overs.']
      ].map(([key,text]) => ({ key, text, delta:(after[key]||0)-(before[key]||0) })).sort((x,y)=>y.delta-x.delta);
      if (changes[0].delta >= 2) line = changes[0].text;
    }

    if (!line) {
      const note = playerNote(p).replace(/^./, c => c.toLowerCase());
      line = afterPs.length <= 4 ? `Adds a ${note}. It is still too early for one pick to define the shape of the side.` : `Adds a ${note} without materially forcing the rest of the squad in one direction.`;
    }
    return { playerId:p.id, pickNo, line };
  }

  function userDraft(id) {
    if (state.pickIndex >= 120) return;
    const t = currentTeam();
    if (!t || t.abbr !== state.userClub.abbr) return toast('Another club is on the clock');
    const p = state.pool.find(x => x.id === id);
    if (!p || !p.available || p.draftedBy || p.dynastyRetired) return;
    const beforePs = (state.teams[state.userClub.abbr] || []).map(byId);
    const pickNo = state.pickIndex + 1;
    makePick(t, p, false);
    const afterPs = (state.teams[state.userClub.abbr] || []).map(byId);
    state.lastUserDraftRead = draftPickRead(beforePs, afterPs, p, pickNo);
    renderDraft();
    advanceAI();
  }

  function makePick(team, p, renderNow = true) {
    const overall = state.pickIndex + 1;
    p.draftedBy = team.abbr;
    state.teams[team.abbr].push(p.id);
    state.picks.push({ team: team.abbr, player: p.id, overall });
    state.lastDraftPick = { team, player: p, overall };
    state.pickIndex += 1;
    if (renderNow) renderDraft();
  }

  function draftNeed(team, p) {
    const roster = (state.teams[team.abbr] || []).map(id => byId(id));
    const available = state.pool.filter(x => x.available && !x.draftedBy);
    if (!AI) return R.playerDraftValue(p);
    return AI.evaluateDraft(team, p, {
      roster,
      available,
      pickIndex: state.pickIndex,
      year: state.year,
      currentValue: R.playerDraftValue(p)
    }).score;
  }

  function chooseAIPick(t) {
    const roster = (state.teams[t.abbr] || []).map(id => byId(id));
    const available = window.GCC8_DRAFT_GUARD.candidates(roster,state.pool.filter(p => p.available && !p.draftedBy),15-roster.length,R);
    return AI
      ? AI.choosePlayer(t, available, { roster, pickIndex: state.pickIndex, year: state.year })
      : { player: available.sort((a, b) => draftNeed(t, b) - draftNeed(t, a))[0] };
  }

  function advanceAI() {
    clearTimeout(draftAutoTimer);
    if (state.pickIndex >= 120) return finishDraft();
    const t = currentTeam();
    if (!t || t.abbr === state.userClub.abbr) {
      renderDraft();
      return;
    }
    draftAutoTimer = setTimeout(runAIPick, draftSpeeds[state.draftSpeedIndex]);
  }

  function runAIPick() {
    if (state.pickIndex >= 120) return finishDraft();
    const t = currentTeam();
    if (!t || t.abbr === state.userClub.abbr) return renderDraft();
    const choice = chooseAIPick(t);
    if (!choice || !choice.player) return;
    makePick(t, choice.player, false);
    renderDraftTransit();
    advanceAI();
  }

  function cycleDraftPace() {
    state.draftSpeedIndex = (state.draftSpeedIndex + 1) % draftPaceLabels.length;
    renderDraft();
    const t = currentTeam();
    if (t && t.abbr !== state.userClub.abbr) advanceAI();
  }

  function skipToMyPick() {
    clearTimeout(draftAutoTimer);
    if (state.pickIndex >= 120) return finishDraft();
    let t = currentTeam();
    if (!t || t.abbr === state.userClub.abbr) return;
    while (state.pickIndex < 120 && t && t.abbr !== state.userClub.abbr) {
      const choice = chooseAIPick(t);
      if (!choice || !choice.player) break;
      makePick(t, choice.player, false);
      t = currentTeam();
    }
    renderDraft();
    if (state.pickIndex >= 120) finishDraft();
    else toast('Your pick is on the clock');
  }

  function renderSquadMini() {
    if (!state.userClub) return;
    const ps = (state.teams[state.userClub.abbr] || []).map(byId);
    const preview = ps.length ? projectedDraftProfile(ps) : null;
    const d = draftSnapshot(ps);
    const rail = document.querySelector('#draft .side-panel');
    if (rail) rail.dataset.squadStage = !ps.length ? 'empty' : ps.length < 4 ? 'early' : 'formed';
    $('draftSquadCount').textContent = `${ps.length} / 15`;

    if (!ps.length) {
      const firstRead = draftPriorityRead(ps, d, preview);
      $('draftProfile').innerHTML = '';
      $('draftNeeds').innerHTML = firstRead ? `<div class="draft-priority ${firstRead.tone || ''}"><span>${firstRead.label}</span><b>${firstRead.title}</b><small>${firstRead.detail}</small></div>` : '';
      $('draftSquadRead').innerHTML = `<div class="draft-empty-state"><b>The side starts here.</b><p>Your first selection should open possibilities, not solve fifteen picks at once.</p></div>`;
      $('squadMini').innerHTML = '';
      return;
    }

    $('draftProfile').innerHTML = ps.length >= 11 ? miniProfile(preview) : '';
    $('draftSquadRead').innerHTML = ps.length < 4 ? `
      <div class="draft-read-head"><b>EARLY SHAPE</b><span>${15 - ps.length} pick${15 - ps.length===1?'':'s'} left</span></div>
      <div class="draft-read-line">${draftShapeLine(ps, d, preview)}</div>` : `
      <div class="draft-read-head"><b>SQUAD SHAPE</b><span>${ps.length < 15 ? `${15 - ps.length} pick${15 - ps.length===1?'':'s'} left` : 'Squad complete'}</span></div>
      <div class="role-meter-grid">
        <div class="role-meter"><b>${d.counts.BAT || 0}</b><span>BAT</span></div>
        <div class="role-meter"><b>${d.counts['WK-BAT'] || 0}</b><span>WK</span></div>
        <div class="role-meter"><b>${d.counts.AR || 0}</b><span>AR</span></div>
        <div class="role-meter"><b>${d.counts.BOWL || 0}</b><span>BOWL</span></div>
      </div>
      <div class="draft-read-line">${draftShapeLine(ps, d, preview)}</div>`;

    const balanceTags = [
      `${d.openers} opener${d.openers === 1 ? '' : 's'}`,
      d.keeper >= 65 ? 'keeper option' : 'no keeper yet',
      `${d.pace} pace option${d.pace === 1 ? '' : 's'}`,
      `${d.spin} spin option${d.spin === 1 ? '' : 's'}`,
      `${d.death} death option${d.death === 1 ? '' : 's'}`
    ];
    const lastRead = state.lastUserDraftRead;
    const lastPlayer = lastRead ? byId(lastRead.playerId) : null;
    const pickRead = lastRead && lastPlayer ? `<div class="draft-pick-read"><span>YOUR LAST PICK · ${lastRead.pickNo}</span><div><b>${lastPlayer.name}</b><small>${playerArchetype(lastPlayer)}</small></div><p>${lastRead.line}</p></div>` : '';
    const priority = draftPriorityRead(ps, d, preview);
    const priorityRead = priority ? `<div class="draft-priority ${priority.tone || ''}"><span>${priority.label}</span><b>${priority.title}</b><small>${priority.detail}</small></div>` : '';
    $('draftNeeds').innerHTML = `${priorityRead}${pickRead}${ps.length >= 4 ? `<div class="squad-balance-panel"><div class="balance-tags">${balanceTags.map(x => `<span class="balance-tag">${x}</span>`).join('')}</div></div>` : ''}`;

    const userPicks = state.picks.filter(x => x.team === state.userClub.abbr);
    $('squadMini').innerHTML = userPicks.map((pick, i) => {
      const p = byId(pick.player);
      return p ? `<div class="squad-row compact"><div><b>${p.name}</b><span>Pick ${pick.overall} · ${playerArchetype(p)}</span></div><strong>${p.overall}</strong></div>` : '';
    }).join('');
  }

  function draftShapeLine(ps, d, profile) {
    if (!ps.length) return 'The side starts with your first selection.';
    if (ps.length <= 3) return 'The squad is only just taking shape. There is not enough here yet to judge the balance.';
    if (ps.length <= 6) {
      const batting = (d.counts.BAT || 0) + (d.counts['WK-BAT'] || 0);
      const bowling = (d.counts.BOWL || 0) + (d.counts.AR || 0);
      if (batting >= 3 && bowling <= 1) return 'You have started with the batting. Most of the attack is still to come.';
      if (bowling >= 3 && batting <= 1) return 'You have started with the attack. Most of the batting order is still to come.';
      return 'The core is forming, but there is still too much of the side left to draft to call the balance.';
    }
    if (ps.length <= 9) {
      if (d.keeper < 65) return 'The side is beginning to take shape, but you still do not have a clear keeper.';
      if (d.openers === 0) return 'The side is beginning to take shape, but you still need an opener.';
      if ((d.pace + d.spin) < 3) return 'The side is beginning to take shape. Most of the bowling still needs to be built.';
      return 'The side is beginning to take shape, with enough picks left for the balance to change.';
    }
    if (d.openers > 3 && d.middle < 3) return 'There are plenty of opening options, but the batting order is becoming top-heavy.';
    if (profile.xiShape && profile.xiShape < 76) return 'There is talent in the likely XI, but several of the same jobs are being crowded together.';
    if (profile.bowlingResources < 72) return 'There is quality in the attack, but not much cover behind it yet.';
    const rows = [
      ['powerplay batting', profile.powerplayBat], ['middle-overs batting', profile.middleBat], ['finishing', profile.finishing],
      ['new-ball bowling', profile.newBall], ['middle-overs bowling', profile.middleBowl], ['death bowling', profile.death]
    ].sort((a,b)=>a[1]-b[1]);
    const weak = rows[0][0];
    const reads = {
      'powerplay batting':'The top order is the least settled part of the batting at the moment.',
      'middle-overs batting':'The middle of the innings still looks like the hardest part of the batting order to solve.',
      'finishing':'The batting still needs a clearer way to close an innings.',
      'new-ball bowling':'The new-ball attack is the least settled part of the squad.',
      'middle-overs bowling':'The attack still needs more control through the middle overs.',
      'death bowling':'The death overs are the least settled part of the attack.'
    };
    if (rows[0][1] < 68) return reads[weak];
    return 'The squad has a good spread so far. The final picks can still change how the side fits together.';
  }

  function draftPriorityRead(ps, d, profile) {
    const left = Math.max(0, 15 - ps.length);
    const finish = (title, detail, tone='', label=left ? 'NEXT READ' : 'FINAL READ') => ({ title, detail, tone, label });
    if (!ps.length) return finish('Start with top-end quality', 'Pick one should give you options. Do not force a role before the squad has any shape.', '', 'FIRST READ');
    if (ps.length <= 3) return finish('Keep the board open', 'The squad is too young to chase a checklist. Add quality that can still fit several different XIs.');
    if (ps.length <= 6) {
      const batting = (d.counts.BAT || 0) + (d.counts['WK-BAT'] || 0);
      const bowling = (d.counts.BOWL || 0) + (d.counts.AR || 0);
      if (batting >= 3 && bowling <= 1) return finish('The attack can come into view now', 'You have started with the batting. A credible bowler or bowling all-rounder would widen the ways this side can take shape.');
      if (bowling >= 3 && batting <= 1) return finish('The batting can come into view now', 'You have started with the attack. Add a batter who can own a real place in the top six.');
      return finish('Add a different job, not another version of the same one', 'The core is forming. Look for a player who expands the innings rather than crowding a role you already have.');
    }
    if (ps.length <= 9) {
      if (d.keeper < 65) return finish('Keep the wicketkeeper market in sight', 'There is no recognised keeper in the squad yet. You still have time, but the position is now part of the board read.');
      if (d.openers === 0) return finish('A natural opener is becoming a real need', 'The squad still has nobody who naturally owns the first two batting spots.');
      if ((d.pace + d.spin) < 3) return finish('The attack still needs more credible overs', 'The squad does not yet have enough bowling options to build a flexible five-man attack.');
      return finish('Protect the balance you have built', 'There is no urgent hole yet. Let quality and complementary roles drive the next pick.', 'good');
    }
    if (d.keeper < 65) return finish('You still need a keeper', 'There is no recognised keeper in the squad yet.', 'warn');
    if (d.openers === 0) return finish('The top of the order still needs an opener', 'The likely XI has no natural option for the first two batting spots.', 'warn');
    if (d.openers > 3 && d.middle < 3) return finish('The batting is becoming top-heavy', 'Another top-order player would crowd jobs you already have. Middle-order shape matters more now.', 'warn');
    if ((profile?.bowlingResources || 0) < 72) return finish('Bowling cover is the priority', 'The likely XI can get through twenty overs, but there is very little behind the main attack.', 'warn');
    if (d.death === 0 || (profile?.death || 0) < 70) return finish('The death overs still need a trusted option', 'You do not yet have enough control or variation for the last five overs.', 'warn');
    if ((profile?.newBall || 0) < 70) return finish('The new-ball pair still needs another option', 'Another credible option up front would give the XI a cleaner opening six overs.', 'warn');
    if ((profile?.finishing || 0) < 70) return finish('Finishing is the weakest batting phase', 'The final picks can still add a batter who is comfortable closing an innings.', 'warn');
    if ((profile?.middleBowl || 0) < 70) return finish('The middle overs still need another bowler', 'The attack could use another option who can hold or take wickets through overs 7–15.', 'warn');
    if (left) return finish('No obvious hole', 'Use the remaining picks on quality, ground fit or depth. You do not need to force another role.', 'good');
    return finish('The squad has the main jobs covered', 'The main batting, bowling and keeping jobs are covered. The XI will decide whether it actually works.', 'good');
  }

  function miniProfile(p) {
    const row = (label, value) => `<div class="draft-profile-row"><span>${label}</span><b>${value || '—'}</b></div>`;
    return `<div class="draft-team-rating grade-${R.grade(p.overall)}"><div><span>PROJECTED XI</span><small>Strongest XI from squad</small></div><b>${p.overall || '—'}</b></div>
      <div class="draft-profile-columns">
        <div class="draft-profile-group"><span class="draft-profile-group-title">Batting</span>${row('Powerplay', p.powerplayBat)}${row('Middle overs', p.middleBat)}${row('Finishing', p.finishing)}</div>
        <div class="draft-profile-group"><span class="draft-profile-group-title">Bowling</span>${row('New ball', p.newBall)}${row('Middle overs', p.middleBowl)}${row('Death', p.death)}</div>
      </div>`;
  }

  function renderDraftBoard() {
    if (!state.draftOrder.length || !draftBoardVisible) return;
    $('draftBoard').innerHTML = state.draftOrder.map(c => {
      const picks = state.picks.filter(p => p.team === c.abbr);
      const cur = currentTeam()?.abbr === c.abbr;
      return `<div class="draft-col ${c.abbr === state.userClub.abbr ? 'user' : ''}"><div class="draft-col-head">${c.abbr}${c.abbr === state.userClub.abbr ? ' · YOU' : ''}</div>${Array.from({ length: 15 }, (_, i) => {
        const pick = picks[i];
        const p = pick ? byId(pick.player) : null;
        const landed = pick && pick.overall === state.pickIndex ? ' just-picked' : '';
        return `<div class="draft-pick ${cur && i === picks.length ? 'current' : ''}${landed}">${p ? p.name : '—'}</div>`;
      }).join('')}</div>`;
    }).join('');
  }

  function finishDraft() {
    clearTimeout(draftAutoTimer);
    if (state.draftFinished) return;
    state.draftFinished = true;
    renderDraft();
    setTimeout(() => {
      if (!document.querySelector('#draft.screen.active')) return;
      openModal(`
        <span class="kicker"><svg class="kicker-icon" viewBox="0 0 32 32" aria-hidden="true"><use href="#icon-stumps"></use></svg>DRAFT COMPLETE</span>
        <h2>Fifteen players are yours.</h2>
        <p>Now choose who walks out in Round 1. Set the batting order, choose your bowling attack, put someone behind the stumps and decide who you trust with the new ball and at the death.</p>
        <div class="close-row"><button class="button primary" onclick="GCC.enterTeamRoom()">ENTER TEAM ROOM</button></div>
      `);
    }, 360);
  }

  function enterTeamRoom() {
    closeModal();
    state.xi = [];
    state.battingOrder = [];
    state.orderTouched = false;
    state.pendingSwapIn = null;
    state.battingPins = {};
    go('team');
    renderTeam();
  }

  function combinations(arr, k) {
    const out = [];
    const pick = [];
    function rec(start) {
      if (pick.length === k) { out.push([...pick]); return; }
      for (let i = start; i <= arr.length - (k - pick.length); i++) {
        pick.push(arr[i]); rec(i + 1); pick.pop();
      }
    }
    rec(0);
    return out;
  }

  function bestXI(roster) {
    if (roster.length <= 11) return [...roster];
    let best = null, bestScore = -Infinity;
    let bestKeeperXI = null, bestKeeperScore = -Infinity;
    let bestCricketXI = null, bestCricketScore = -Infinity;
    combinations(roster, 11).forEach(xi => {
      const p = R.profile(xi, { matchesTogether: 0 });
      const score = p.overall;
      if (score > bestScore) { bestScore = score; best = xi; }
      if (xi.some(R.isKeeper) && score > bestKeeperScore) {
        bestKeeperScore = score; bestKeeperXI = xi;
      }
      if (xi.some(R.isKeeper) && p.oversCapacity >= 20 && score > bestCricketScore) {
        bestCricketScore = score; bestCricketXI = xi;
      }
    });
    // A recommended XI should never voluntarily omit an available recognised keeper.
    // Prefer the fully balanced side; if 20 overs cannot be covered, keep the gloves covered
    // and expose the bowling shortage to the player rather than recommending an invalid XI.
    return bestCricketXI || bestKeeperXI || best || roster.slice(0, 11);
  }

  function battingPositionLabel(slot) {
    if (slot <= 2) return 'OPEN';
    if (slot <= 4) return 'TOP ORDER';
    if (slot <= 6) return 'MIDDLE ORDER';
    if (slot <= 8) return 'LOWER MIDDLE';
    return 'LOWER ORDER';
  }

  function battingUseRead(p, slot) {
    const fit=R.battingPositionFit(p,slot);
    if(fit>=95) return 'Natural';
    if(fit>=88) return 'Comfortable';
    if(fit>=80) return 'Stretched';
    return 'Out of role';
  }

  function allowedBattingSlots(p) {
    return Array.from({length:11},(_,i)=>i+1);
  }

  function assignBattingSlots(players, pins={}) {
    if (!players.length) return new Map();
    const rows=[...players].sort((a,b)=>{
      const bandRank={OPEN:0,TOP:1,MIDDLE:2,LOWER:3,TAIL:4};
      const br=(bandRank[R.battingRoleBand(a)]??2)-(bandRank[R.battingRoleBand(b)]??2);
      return br || (a.preferredSlot-b.preferredSlot) || (b.bat-a.bat) || (b.control-a.control);
    });
    const memo=new Map();
    function solve(i,mask){
      if(i===rows.length) return {cost:0,slots:[]};
      const key=`${i}:${mask}`; if(memo.has(key)) return memo.get(key);
      const p=rows[i], fixed=Number(pins?.[p.id]||0);
      const choices=fixed?[fixed]:allowedBattingSlots(p);
      let best=null;
      for(const slot of choices){
        const bit=1<<(slot-1); if(mask&bit) continue;
        const next=solve(i+1,mask|bit); if(!next) continue;
        const fit=R.battingPositionFit(p,slot);
        let cost=Math.max(0,100-fit)*1.05;
        // Broad cricket-shape penalties only. No distinction between opener 1 and opener 2.
        if(slot<=2 && p.preferredSlot>4) cost+=7;
        if(slot<=4 && p.role==='BOWL' && p.bat<65) cost+=13;
        if(slot<=6 && p.role==='BOWL' && p.bat<55) cost+=10;
        if(slot>=9 && p.bat>=80) cost+=8;
        if(slot>=8 && p.preferredSlot<=3 && p.bat>=72) cost+=5;
        if(slot<=3 && p.preferredSlot>=7 && p.bat<72) cost+=6;
        const candidate={cost:cost+next.cost,slots:[[p.id,slot],...next.slots]};
        if(!best||candidate.cost<best.cost) best=candidate;
      }
      memo.set(key,best); return best;
    }
    const result=solve(0,0); return result?new Map(result.slots):null;
  }

  function autoOrderIds(players) {
    const assigned=assignBattingSlots(players,{});
    if(!assigned) return [...players].sort((a,b)=>(a.preferredSlot-b.preferredSlot)||(b.bat-a.bat)).map(p=>p.id);
    return [...players].sort((a,b)=>(assigned.get(a.id)||99)-(assigned.get(b.id)||99)||(b.bat-a.bat)).map(p=>p.id);
  }

  function syncBattingOrder() {
    const selected=new Set(state.xi);
    let order=(state.battingOrder||[]).filter(id=>selected.has(id));
    const missing=state.xi.filter(id=>!order.includes(id));
    if(!state.orderTouched){
      order=autoOrderIds(state.xi.map(byId).filter(Boolean));
    } else {
      for(const id of missing){
        const p=byId(id); if(!p) continue;
        let bestIndex=order.length, bestCost=Infinity;
        for(let idx=0; idx<=order.length; idx++){
          const candidate=[...order.slice(0,idx),id,...order.slice(idx)];
          const cost=candidate.reduce((sum,pid,i)=>{
            const q=byId(pid); return sum + (q ? Math.max(0,100-R.battingPositionFit(q,i+1)) : 0);
          },0);
          if(cost<bestCost){bestCost=cost;bestIndex=idx;}
        }
        order.splice(bestIndex,0,id);
      }
    }
    state.battingOrder=order;
  }

  function selectedBattingOrder() {
    syncBattingOrder();
    return state.battingOrder.map(byId).filter(Boolean);
  }

  let manualXIVisible=false;

  function showManualXI() {
    manualXIVisible=true;
    renderTeam();
  }

  function selectRecommendedXI() {
    if(!state.userClub) return;
    const roster=(state.teams[state.userClub.abbr]||[]).map(byId).filter(Boolean);
    const selectable=roster.filter(p=>state.dynasty?.injuries?.[p.id]?.status!=='OUT');
    if(selectable.length<11) return toast('The squad does not have eleven available players');
    const recommended=bestXI(selectable);
    state.xi=recommended.map(p=>p.id);
    state.battingOrder=autoOrderIds(recommended);
    state.battingPins={};
    state.pendingSwapIn=null;
    state.orderTouched=false;
    manualXIVisible=false;
    renderTeam();
    toast('Recommended XI selected');
  }

  function clearXI() {
    state.xi=[];
    state.battingOrder=[];
    state.battingPins={};
    state.pendingSwapIn=null;
    state.orderTouched=false;
    manualXIVisible=false;
    renderTeam();
  }

  function autoOrderXI() {
    if(!state.xi.length) return toast('Choose players before setting the batting order');
    state.battingOrder=autoOrderIds(state.xi.map(byId).filter(Boolean));
    state.orderTouched=false;
    renderTeam();
    toast('Batting order reset to the best natural fit');
  }

  function moveBattingPlayer(id, direction) {
    if(![-1,1].includes(Number(direction)))return;
    syncBattingOrder();
    const i=state.battingOrder.indexOf(id);
    if(i<0) return;
    const j=i+Number(direction);
    if(j<0||j>=state.battingOrder.length) return;
    [state.battingOrder[i],state.battingOrder[j]]=[state.battingOrder[j],state.battingOrder[i]];
    state.orderTouched=true;
    renderTeam();
  }

  function removeXI(id) {
    if(!state.xi.includes(id)) return;
    state.xi=state.xi.filter(x=>x!==id);
    state.battingOrder=(state.battingOrder||[]).filter(x=>x!==id);
    delete state.battingPins[id];
    renderTeam();
  }

  function canSelectPlayer(id) {
    const p=byId(Number(id));
    return !!(p && state.userClub && (state.teams[state.userClub.abbr]||[]).includes(p.id) && !p.dynastyRetired && state.dynasty?.injuries?.[p.id]?.status!=='OUT');
  }

  function beginSwap(id) {
    id=Number(id);
    if(!canSelectPlayer(id)) return toast('Choose an available player from your own squad');
    if(state.xi.includes(id)) return;
    if(state.xi.length<11) return toggleXI(id);
    state.pendingSwapIn=id;
    renderTeam();
  }

  function cancelSwap() {
    state.pendingSwapIn=null;
    renderTeam();
  }

  function replaceXI(outId) {
    const inId=Number(state.pendingSwapIn||0);
    if(!inId||!state.xi.includes(outId)||state.xi.includes(inId)) return;
    if(!canSelectPlayer(inId)){state.pendingSwapIn=null;renderTeam();return toast('That replacement is no longer available. Choose again.');}
    const xiIndex=state.xi.indexOf(outId);
    if(xiIndex<0) return;
    state.xi[xiIndex]=inId;
    const orderIndex=(state.battingOrder||[]).indexOf(outId);
    if(orderIndex>=0) state.battingOrder[orderIndex]=inId;
    else syncBattingOrder();
    state.orderTouched=true;
    state.pendingSwapIn=null;
    delete state.battingPins[outId];
    renderTeam();
    toast(`${byId(inId)?.name||'Replacement'} is in the XI`);
  }

  function toggleXI(id) {
    id=Number(id);
    if (state.xi.includes(id)) return removeXI(id);
    if (state.xi.length >= 11) return toast('Remove a player from the XI before bringing another in');
    if(!canSelectPlayer(id)) return toast('Choose an available player from your own squad');
    state.xi.push(id);
    syncBattingOrder();
    renderTeam();
  }

  function preserveTeamInteraction() {
    const active=document.activeElement;
    const id=active && active.id;
    const relevant=active && $('team').contains(active);
    const slot=active?.closest?.('[data-batting-slot]')?.dataset.battingSlot;
    const x=window.scrollX||0,y=window.scrollY||0;
    return () => {
      if(!relevant || !id) return;
      let next=document.getElementById(id);
      if(!next && id.startsWith('order-swap-') && slot) next=$('xiBattingOrder').querySelector(`[data-batting-slot="${slot}"] .remove-xi-btn`);
      if(!next && id.startsWith('order-')) next=document.getElementById(id.replace(/^order-(?:remove|swap)-/,'xi-action-'));
      if(next?.disabled && id.startsWith('order-')) next=document.getElementById(id.replace('order-up-','order-down-')===id?id.replace('order-down-','order-up-'):id.replace('order-up-','order-down-'));
      if(next && !next.disabled && typeof next.focus==='function') next.focus({preventScroll:true});
      window.GCC8_ENGINE_SCROLL({left:x,top:y,behavior:'instant'});
    };
  }

  function renderBattingOrderEditor() {
    syncBattingOrder();
    const bySlot=new Map(state.battingOrder.map((id,i)=>[i+1,byId(id)]));
    $('xiBattingOrder').innerHTML=Array.from({length:11},(_,i)=>{
      const slot=i+1,p=bySlot.get(slot);
      if(!p) return `<div class="batting-slot empty-slot" data-batting-slot="${slot}"><span class="batting-no">${slot}</span><div class="batting-player"><b>Open slot</b><span>Select a player from the squad</span></div></div>`;
      const fitRead=battingUseRead(p,slot);
      const fitClass=fitRead==='Natural'||fitRead==='Comfortable'?'good':fitRead==='Stretched'?'warn':'bad';
      return `<div class="batting-slot ${state.pendingSwapIn ? 'swap-target' : ''}" data-batting-slot="${slot}"><span class="batting-no">${slot}</span><div class="batting-player"><b>${p.name}</b><span>${roleName(p)} · <em class="batting-fit ${fitClass}">${fitRead}</em></span></div><div class="batting-actions"><button type="button" id="order-up-${p.id}" class="order-btn" aria-label="Move ${p.name} up" onclick="GCC.moveBattingPlayer(${p.id},-1)" ${slot===1?'disabled':''}>↑</button><button type="button" id="order-down-${p.id}" class="order-btn" aria-label="Move ${p.name} down" onclick="GCC.moveBattingPlayer(${p.id},1)" ${slot===state.battingOrder.length?'disabled':''}>↓</button>${state.pendingSwapIn ? `<button type="button" id="order-swap-${p.id}" class="replace-xi-btn" onclick="GCC.replaceXI(${p.id})">SWAP OUT</button>` : `<button type="button" id="order-remove-${p.id}" class="remove-xi-btn" onclick="GCC.removeXI(${p.id})">REMOVE</button>`}</div></div>`;
    }).join('');
  }

  function userProfileXI() {
    return selectedBattingOrder().map((p,i)=>({...p,battingSlot:i+1}));
  }

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
  function renderProfile(p, showingSquad = false, profileXI = []) {
    const completeXI = state.xi.length === 11;
    const partialXI = !showingSquad && !completeXI;
    const battingScore = Math.round((p.powerplayBat + p.middleBat + p.finishing + p.battingResources) / 4);
    const bowlingScore = Math.round((p.newBall + p.middleBowl + p.death + p.bowlingResources) / 4);
    const keeper = [...profileXI].sort((a,b)=>(b.keeping||0)-(a.keeping||0))[0] || null;
    const keeperValid = !!(keeper && (keeper.keeping||0) >= 65);
    const capacity = Number.isFinite(p.oversCapacity) ? p.oversCapacity.toFixed(1) : '—';
    const bowlingCover = capacity;

    if(showingSquad){
      $('teamOverall').innerHTML='';
      $('xiEssentials').innerHTML=`<div><span>Players</span><b>0 / 11</b></div><div><span>Keeper</span><b>—</b></div><div><span>Bowling cover</span><b>—</b></div>`;
      $('teamProfile').innerHTML='';
      $('profileNote').textContent='Pick all eleven before judging the side as a whole.';
      return;
    }

    const keeperRead=keeperValid?keeper.name:'Needed';
    const shapeRead=partialXI?'Still forming':p.battingResources<65?'Batting depth thin':p.bowlingResources<65?'Bowling depth thin':ratingWord(p.xiShape);
    $('xiEssentials').innerHTML=`<div><span>Players</span><b>${state.xi.length} / 11</b></div><div><span>Keeper</span><b class="${keeperValid?'':'is-missing'}">${keeperRead}</b></div><div><span>Bowling cover</span><b>${bowlingCover==='—'?'—':`${bowlingCover} ov`}</b></div><div><span>XI shape</span><b>${shapeRead}</b></div>`;

    if(partialXI){
      $('teamOverall').innerHTML='';
      $('teamProfile').innerHTML='';
      $('profileNote').textContent='Finish the eleven before judging the batting and bowling strength of the side.';
      return;
    }

    const major = (label, score) => `<div class="team-rating-major grade-${R.grade(score)}"><span>${label}</span><b>${score}</b><small>${ratingWord(score)}</small></div>`;
    $('teamOverall').innerHTML = `<div class="team-rating-pair">${major('Batting',battingScore)}${major('Bowling',bowlingScore)}</div>`;
    const metric = ([k, label]) => `<button type="button" class="profile-metric grade-${R.grade(p[k])}" onclick="GCC.openRating('${k}')"><span>${label}</span><span class="profile-metric-read"><b>${p[k] || '—'}</b><small>${ratingWord(p[k], k)}</small></span></button>`;
    const group = (title, cls, rows) => `<section class="profile-group ${cls}"><div class="profile-group-head"><span>${title}</span></div><div class="profile-group-rows">${rows.map(metric).join('')}</div></section>`;
    const batting = [['powerplayBat', 'Powerplay'], ['middleBat', 'Middle overs'], ['finishing', 'Finishing'], ['battingResources', 'Depth']];
    const bowling = [['newBall', 'New ball'], ['middleBowl', 'Middle overs'], ['death', 'Death'], ['bowlingResources', 'Depth']];
    const fieldRead = ratingWord(p.fielding);
    const chemistryRead = ratingWord(p.chemistry,'chemistry');
    const sideRead = `<div class="profile-side-read"><span><b>In the field</b>${fieldRead} · <em class="${keeperValid?'':'bad'}">${keeperValid?keeper.name:'No recognised keeper'}${keeperValid?' keeping':''}</em></span><span><b>Cohesion</b>${chemistryRead}</span></div>`;
    $('teamProfile').innerHTML = `${group('Batting phases', 'profile-group-batting', batting)}${group('Bowling phases', 'profile-group-bowling', bowling)}${sideRead}`;

    let note;
    if (p.roleFit < 84) note = 'Good players, awkward jobs. Too many of the XI are being used outside their natural roles.';
    else if (p.roleFit < 95) note = 'The XI works, but a couple of batting jobs are not quite natural.';
    else if (p.battingResources < 65) note = 'Batting depth is thin. The attack is strong, but the lower order may struggle if early wickets fall.';
    else if (p.battingShape < 78) note = 'There is batting quality here, but the order is not balanced through all three phases.';
    else if (p.attackShape < 76) note = 'You can bowl twenty overs, but the new ball, middle and death jobs are not shared well.';
    else if (p.bowlingResources < 65) note = 'Bowling depth is thin. The fifth option is likely to be used outside his best phase.';
    else if (p.keeping < 65) note = 'There is no recognised keeper in the XI. Expect it to cost runs behind the stumps.';
    else if (p.death < 70) note = 'The death overs are the weak point. You need another bowler you can trust late.';
    else if (p.powerplayBat >= 88 && p.newBall >= 88) note = 'The first six overs suit this XI with both bat and ball.';
    else note = 'Balanced XI. After this, it comes down to the ground, the matchup and form.';
    $('profileNote').textContent = note;
  }
  function ratingWord(n, key = '') {
    if (!n) return 'Not set';
    if (key === 'chemistry') {
      if (n >= 88) return 'Settled';
      if (n >= 78) return 'Building';
      if (n >= 68) return 'New side';
      return 'Unsettled';
    }
    if (n >= 90) return 'Elite';
    if (n >= 82) return 'Strong';
    if (n >= 73) return 'Sound';
    if (n >= 64) return 'Thin';
    return 'Weak';
  }

  function openRating(key) {
    const xi = userProfileXI();
    const p = R.profile(xi, { matchesTogether: state.teamGames[state.userClub.abbr] || 0 });
    const labels = { powerplayBat: 'Powerplay batting', middleBat: 'Middle-overs batting', finishing: 'Finishing', battingResources: 'Batting depth', newBall: 'New ball', middleBowl: 'Middle-overs bowling', death: 'Death bowling', bowlingResources: 'Bowling depth', fielding: 'Fielding', keeping: 'Keeping', chemistry: 'Chemistry' };
    const scorer = metricScorer(key);
    const contributors = [...xi].sort((a, b) => scorer(b) - scorer(a)).slice(0, 3);
    const detail = key === 'chemistry'
      ? `<div class="feed"><div class="feed-item"><b>Role fit · ${p.roleFit}</b><span>Most players are being used in parts of the innings that suit them.</span></div><div class="feed-item"><b>Shape of the XI · ${p.xiShape}</b><span>The batting order and attack cover the innings without crowding too many players into the same job.</span></div><div class="feed-item"><b>Continuity · ${p.continuity}</b><span>The more this group plays together, the more settled it becomes.</span></div><div class="feed-item"><b>Leadership · ${p.leadership}</b><span>Senior heads help a new or reshaped XI settle.</span></div></div>`
      : `<div class="feed">${contributors.map((x, i) => `<div class="feed-item"><b>${i + 1}. ${x.name}</b><span>${contributionLine(key, x)}</span></div>`).join('')}</div>`;
    openModal(`
      <span class="kicker">${labels[key].toUpperCase()}</span>
      <h2>${p[key]}</h2>
      <p>${R.explanation(key, p)}</p>
      ${detail}
      <div class="close-row"><button class="button primary" onclick="GCC.closeModal()">BACK TO XI</button></div>
    `);
  }

  function metricScorer(k) {
    const f = {
      powerplayBat: p => p.power * 0.4 + p.pacePlay * 0.3 + p.control * 0.3,
      middleBat: p => p.spinPlay * 0.38 + p.control * 0.35 + p.running * 0.15 + p.temperament * 0.12,
      finishing: p => p.finishing * 0.45 + p.power * 0.35 + p.temperament * 0.2,
      battingResources: p => p.bat * 0.56 + p.control * 0.15 + p.temperament * 0.12 + p.finishing * 0.10 + p.power * 0.07,
      newBall: p => p.newBall * 0.48 + p.bowlControl * 0.3 + p.pace * 0.12 + p.temperament * 0.1,
      middleBowl: p => Math.max(p.spin * 0.5 + p.bowlControl * 0.3 + p.variation * 0.2, p.bowlControl * 0.45 + p.variation * 0.35 + p.bowl * 0.2),
      death: p => p.death * 0.4 + p.bowlControl * 0.25 + p.variation * 0.22 + p.temperament * 0.13,
      bowlingResources: p => R.bowlingWorkload(p) > 0 ? p.bowl * .42 + p.bowlControl * .30 + Math.max(p.newBall,p.death,p.spin) * .18 + p.temperament * .10 : p.bowl * .35,
      fielding: p => p.fielding,
      keeping: p => p.keeping,
      chemistry: p => p.leadership * 0.6 + p.temperament * 0.4
    };
    return f[k] || (() => 0);
  }

  function contributionLine(k, p) {
    if (k === 'death') return `Death ${p.death} · control ${p.bowlControl} · variation ${p.variation}`;
    if (k === 'newBall') return `New ball ${p.newBall} · control ${p.bowlControl} · pace ${p.pace}`;
    if (k === 'middleBowl') return `Spin ${p.spin} · control ${p.bowlControl} · variation ${p.variation}`;
    if (k === 'bowlingResources') return `${playerArchetype(p)} · bowling ${p.bowl} · control ${p.bowlControl}`;
    if (k === 'keeping') return `Keeping ${p.keeping}`;
    if (k === 'fielding') return `Fielding ${p.fielding}`;
    if (k === 'finishing') return `Finishing ${p.finishing} · power ${p.power} · nerve ${p.temperament}`;
    if (k === 'battingResources') return `Batting ${p.bat} · control ${p.control} · finishing ${p.finishing}`;
    if (k === 'powerplayBat') return `Power ${p.power} · pace ${p.pacePlay} · control ${p.control}`;
    if (k === 'middleBat') return `Spin ${p.spinPlay} · control ${p.control} · running ${p.running}`;
    return `Leadership ${p.leadership} · temperament ${p.temperament}`;
  }

  function buildDoubleRoundRobin(clubs) {
    if (!Array.isArray(clubs) || clubs.length < 2 || clubs.length % 2 !== 0) return [];
    const rotation = [...clubs];
    const firstLeg = [];
    const rounds = clubs.length - 1;
    for (let r = 0; r < rounds; r++) {
      const fixtures = [];
      for (let i = 0; i < clubs.length / 2; i++) {
        const a = rotation[i], b = rotation[clubs.length - 1 - i];
        const flip = (r + i) % 2 === 1;
        fixtures.push({ round:r + 1, home:flip ? b : a, away:flip ? a : b });
      }
      firstLeg.push(fixtures);
      rotation.splice(1, 0, rotation.pop());
    }
    const secondLeg = firstLeg.map((fixtures, r) => fixtures.map(f => ({ round:r + rounds + 1, home:f.away, away:f.home })));
    return [...firstLeg, ...secondLeg];
  }

  const WEATHER_TYPES = Object.freeze({
    SETTLED:Object.freeze({code:'SETTLED',label:'Settled',newBallPace:0,middleSpin:0,boundary:0,read:'Ground should play close to its usual character.'}),
    OVERCAST:Object.freeze({code:'OVERCAST',label:'Overcast',newBallPace:1.10,middleSpin:0,boundary:0,read:'The new ball may do a little more early.'}),
    COOL_DAMP:Object.freeze({code:'COOL_DAMP',label:'Cool & damp',newBallPace:.85,middleSpin:0,boundary:-.55,read:'A little more new-ball help, with a slightly slower outfield.'}),
    HOT_DRY:Object.freeze({code:'HOT_DRY',label:'Hot & dry',newBallPace:0,middleSpin:.80,boundary:.35,read:'A little more grip through the middle, with a quicker outfield.'})
  });

  function weatherWeights(home){
    if(!home) return [['SETTLED',1]];
    // Docklands has a retractable roof, so weather should not overwhelm the venue itself.
    if(home.ground==='Docklands Stadium') return [['SETTLED',1]];
    if(home.region==='England') return [['SETTLED',.40],['OVERCAST',.32],['COOL_DAMP',.20],['HOT_DRY',.08]];
    if(home.region==='Australia') {
      if(home.abbr==='HUR') return [['SETTLED',.38],['OVERCAST',.25],['COOL_DAMP',.25],['HOT_DRY',.12]];
      if(['SCO','STR','HEA'].includes(home.abbr)) return [['SETTLED',.48],['OVERCAST',.11],['COOL_DAMP',.07],['HOT_DRY',.34]];
      return [['SETTLED',.52],['OVERCAST',.16],['COOL_DAMP',.10],['HOT_DRY',.22]];
    }
    if(home.region==='India') return [['SETTLED',.50],['OVERCAST',.14],['COOL_DAMP',.08],['HOT_DRY',.28]];
    return [['SETTLED',.55],['OVERCAST',.20],['COOL_DAMP',.10],['HOT_DRY',.15]];
  }

  function matchWeather(home, round=1, year=state.year||2008){
    if(!home) return {...WEATHER_TYPES.SETTLED};
    const stableSeed=Number.isFinite(state.weatherSeed)?state.weatherSeed:((Number(state.seed)>>>0)||1);
    const roll=detailRng(`${stableSeed}|weather|${year}|${round}|${home.abbr}`)();
    let cursor=0, code='SETTLED';
    for(const [key,weight] of weatherWeights(home)){ cursor+=weight; if(roll<=cursor){ code=key; break; } }
    return {...WEATHER_TYPES[code]};
  }

  function effectiveMatchGround(home, round=1, year=state.year||2008){
    if(!home) return null;
    const weather=matchWeather(home,round,year);
    const base={...(home.conditions||{})};
    return {
      ...home,
      baseConditions:base,
      weather,
      conditions:{
        ...base,
        pace:(base.pace||0)+weather.newBallPace,
        spin:(base.spin||0)+weather.middleSpin,
        boundary:(base.boundary||0)+weather.boundary
      }
    };
  }

  function nextUserFixture(round=Math.max(1,(state.round||0)+1)){
    if(!state.userClub||!state.league?.length||round>14) return null;
    const rounds=state.fullSchedule?.length ? state.fullSchedule : buildDoubleRoundRobin(state.league);
    return (rounds[round-1]||[]).find(f=>f.home.abbr===state.userClub.abbr||f.away.abbr===state.userClub.abbr)||null;
  }

  function matchGroundForFixture(fx){
    return fx ? effectiveMatchGround(fx.home,fx.round,state.year||2008) : null;
  }

  function startSeason() {
    if (state.xi.length !== 11) return toast('Pick exactly eleven');
    // Once a season exists, Team Room is a selection workspace for the next match.
    // Never let its season button erase an active campaign.
    if (state.fullSchedule?.length) { renderSeason(); go('season'); return; }
    clearTimeout(seasonTimer);
    clearTimeout(finalsTimer);
    state.schedule = [];
    state.fullSchedule = [];
    state.results = [];
    state.round = 0;
    state.table = {};
    state.teamGames = {};
    state.champion = null;
    state.playerSeasonStats = {};
    state.seasonSpeedIndex = 0;
    state.seasonRunning = false;
    state.regularSeasonPosition = null;
    state.finals = null;
    state.cpuXIs = {};
    state.league.forEach(c => {
      state.table[c.abbr] = { club: c, p: 0, w: 0, l: 0, pts: 0, nrr: 0, runsFor:0, runsAgainst:0, ballsFor:0, ballsAgainst:0 };
      state.teamGames[c.abbr] = 0;
      if (c.abbr !== state.userClub.abbr) state.cpuXIs[c.abbr] = bestXI(state.teams[c.abbr].map(byId)).map(p=>p.id);
    });
    state.fullSchedule = buildDoubleRoundRobin(state.league);
    state.schedule = state.fullSchedule
      .flat()
      .filter(f => f.home.abbr === state.userClub.abbr || f.away.abbr === state.userClub.abbr)
      .sort((a, b) => a.round - b.round);
    $('playRound').disabled = false;
    $('simulateSeason').disabled = false;
    $('seasonPace').disabled = false;
    $('matchStory').innerHTML = '';
    $('postSeasonCta').innerHTML = '';
    renderSeason();
    go('season');
  }

  function clubXI(c) {
    if (c.abbr === state.userClub.abbr) return state.xi.map(byId);
    const cached=(state.cpuXIs?.[c.abbr]||[]).map(byId).filter(Boolean);
    if(cached.length===11) return cached;
    const roster = state.teams[c.abbr].map(byId);
    return bestXI(roster);
  }

  function effectiveProfile(c) {
    let xi=clubXI(c);
    if(c.abbr===state.userClub.abbr && xi.length){
      xi=userProfileXI();
    }
    return R.profile(xi, { matchesTogether: state.teamGames[c.abbr] || 0 });
  }

  function phaseScore(bat, bowl, overs, base, boundaryEffect, conditionMatchup = 0, inningsSwing = 0, chemistryEdge = 0) {
    const rr = Math.max(3.0, base + (bat - bowl) * 0.052 + boundaryEffect * 0.055 + conditionMatchup + chemistryEdge + (rng() - 0.5) * 3.2 + inningsSwing);
    return Math.max(8, Math.round(rr * overs));
  }

  function bowlingPlanPhase(overIndex) {
    return overIndex < 6 ? 'newBall' : overIndex < 15 ? 'middle' : 'death';
  }

  function bowlingPlan(bowlClub, batClub, ground, context = {}) {
    const xi = typeof clubXI === 'function' ? clubXI(bowlClub) : [];
    if (!xi.length || !R?.bowlingWorkload) return null;
    const bat = effectiveProfile(batClub);
    const conditions = ground?.conditions || {};
    const baseConditions = ground?.baseConditions || conditions;
    const weather = ground?.weather || context.weather || WEATHER_TYPES.SETTLED;
    const assigned = new Map(xi.map(p => [p.id,0]));
    const recent = new Map(xi.map(p => [p.id,[]]));
    const overs = [];
    let lastBowlerId = null;

    const styleAttack = (p,style) => style === 'SPIN'
      ? p.spin*.55+p.bowl*.30+p.bowlControl*.15
      : p.pace*.55+p.bowl*.30+p.bowlControl*.15;
    const phaseBat = phase => phase === 'newBall' ? bat.powerplayBat : phase === 'middle' ? bat.middleBat : bat.finishing;
    const baseRuns = phase => phase === 'newBall' ? 7.60 : phase === 'middle' ? 7.50 : 9.96;

    for (let over=0; over<20; over++) {
      const phase=bowlingPlanPhase(over);
      let candidates=xi.filter(p => p.id!==lastBowlerId && R.bowlingWorkload(p)>assigned.get(p.id) && R.bowlingStyle(p));
      if(!candidates.length) candidates=xi.filter(p => p.id!==lastBowlerId && p.keeping<70 && assigned.get(p.id)<4);
      if(!candidates.length) candidates=xi.filter(p => p.id!==lastBowlerId && assigned.get(p.id)<4);
      if(!candidates.length) candidates=xi.filter(p => assigned.get(p.id)<4);
      if(!candidates.length) break;

      const lastTwo=overs.slice(-2);
      const lastFour=overs.slice(-4);
      const recentTeamRuns=lastTwo.reduce((sum,x)=>sum+x.proxyRuns,0);
      const recentStyles=lastTwo.map(x=>x.style);
      const paceCrisis=lastTwo.length===2 && recentTeamRuns>=22 && recentStyles.every(x=>x==='PACE');
      const spinCrisis=lastTwo.length===2 && recentTeamRuns>=22 && recentStyles.every(x=>x==='SPIN');
      const fourRuns=lastFour.reduce((sum,x)=>sum+x.proxyRuns,0);
      const fourPace=lastFour.filter(x=>x.style==='PACE').length;
      const fourSpin=lastFour.filter(x=>x.style==='SPIN').length;
      const severePaceCrisis=lastFour.length===4 && fourPace>=3 && fourRuns>=42;
      const severeSpinCrisis=lastFour.length===4 && fourSpin>=3 && fourRuns>=42;

      const isFrontline = p => p.role==='BOWL' || p.role==='AR';
      // Captains manage the remaining spell map, not just the next over. Test whether
      // the specialist/all-rounder pool can still cover the rest of the innings after
      // a proposed pick without asking the same bowler to bowl consecutive overs.
      const frontlineCanCoverAfter = p => {
        const remainingOvers=19-over;
        if(remainingOvers<=0) return true;
        const caps=xi.filter(isFrontline).map(x=>({
          id:x.id,
          left:Math.max(0,R.bowlingWorkload(x)-(assigned.get(x.id)||0)-(x.id===p.id?1:0))
        }));
        let last=p.id;
        for(let slot=0;slot<remainingOvers;slot++){
          const options=caps.filter(x=>x.left>0 && x.id!==last).sort((a,b)=>b.left-a.left);
          if(!options.length) return false;
          const choice=options[0];
          choice.left-=1;
          last=choice.id;
        }
        return true;
      };

      const ranked=candidates.map(p=>{
        const phaseScoreKey=phase==='newBall'?'newBall':phase;
        const base=R.bowlPhaseScore(p,phaseScoreKey);
        const style=R.bowlingStyle(p) || (p.spin>=p.pace?'SPIN':'PACE');
        const attack=styleAttack(p,style);
        const resistance=style==='SPIN'?bat.spinPlay:bat.pacePlay;
        const baseCondition=style==='SPIN'?(baseConditions.spin||0):(baseConditions.pace||0);
        const weatherCondition=style==='SPIN'?(phase==='middle'?(weather.middleSpin||0):0):(phase==='newBall'?(weather.newBallPace||0):0);
        const condition=baseCondition+weatherCondition;
        // Translate the existing run-rate matchup effect into rating points so the
        // captain compares bowlers in the same units as phase bowling quality.
        const matchupPoints=-(R.conditionMatchup(resistance,attack,condition)||0)/.052;
        const effective=Math.max(1,Math.min(99,base+matchupPoints));
        const usage=R.bowlingUsagePrior?R.bowlingUsagePrior(p):Math.min(R.bowlingWorkload(p),p.role==='BOWL'?3.6:p.role==='AR'?2.3:.8);
        const used=assigned.get(p.id)||0;
        const trustBonus=used < Math.floor(usage+.15) ? 1.8 : 0;
        const own=recent.get(p.id)||[];
        const ownLast=own.slice(-2);
        const ownAvg=ownLast.length?ownLast.reduce((sum,x)=>sum+x.runs,0)/ownLast.length:8;
        const ownWickets=ownLast.reduce((sum,x)=>sum+x.wickets,0);
        const hotSpell=ownLast.length>0 && (ownAvg<=6.5 || ownWickets>=1);
        const baseOverusePenalty=Math.max(0,(used+1)-Math.max(.35,usage))*4.5;
        const overusePenalty=baseOverusePenalty*(hotSpell?.35:1);
        const baseRoleTrustPenalty=(p.role==='BAT'||p.role==='WK-BAT') ? 4+Math.max(0,1.75-usage)*5 : p.role==='AR' ? Math.max(0,1.5-usage)*1.5 : 0;
        const roleTrustPenalty=baseRoleTrustPenalty*(hotSpell?.30:1);
        const recentAdjustment=ownLast.length ? Math.max(-12,Math.min(8,(8.2-ownAvg)*1.45+ownWickets*2.6)) : 0;
        let tactical=0;
        if(phase==='middle' && style==='SPIN') tactical+=2.2;
        if(phase==='newBall' && style==='PACE') tactical+=1.8;
        // A change of bowling is a real cricket response. If two pace overs have just
        // disappeared, a credible spinner gets a material opportunity boost; vice versa.
        const alternateOpportunity=Math.max(0,matchupPoints)+Math.max(0,condition)*1.2;
        if(paceCrisis && style==='SPIN' && alternateOpportunity>=2) tactical+=6+Math.min(10,alternateOpportunity);
        if(spinCrisis && style==='PACE' && alternateOpportunity>=2) tactical+=5+Math.min(8,alternateOpportunity);
        if(recentTeamRuns>=25 && recentStyles.length && !recentStyles.includes(style) && alternateOpportunity>=3) tactical+=3;
        if((p.role==='BAT'||p.role==='WK-BAT') && (paceCrisis||spinCrisis) && alternateOpportunity>=5) tactical+=2;
        // A genuine part-timer can become the tactical answer when the frontline
        // style has failed for several overs. This buys him an experimental over;
        // it does not make him a default bowler on a normal surface.
        const severeStyleCrisis=(style==='SPIN'&&severePaceCrisis)||(style==='PACE'&&severeSpinCrisis);
        if((p.role==='BAT'||p.role==='WK-BAT') && severeStyleCrisis && alternateOpportunity>=4){
          tactical+=16+Math.min(10,alternateOpportunity*1.2)+Math.min(4,usage*2);
        }
        // If the tactical change actually works, captains persist with it. This is
        // how a part-time option can earn a complete four-over spell in context.
        if((p.role==='BAT'||p.role==='WK-BAT') && ownLast.length && ownAvg<=7.5 && alternateOpportunity>=4) tactical+=11+Math.min(6,ownWickets*2.5);
        const score=effective+trustBonus+recentAdjustment+tactical-overusePenalty-roleTrustPenalty+(rng()-.5)*5.0;
        return {p,score,effective,style,usage,tactical,overusePenalty,futureFrontlineFeasible:frontlineCanCoverAfter(p)};
      });
      const hasFeasibleFrontline=ranked.some(x=>isFrontline(x.p)&&x.futureFrontlineFeasible);
      if(hasFeasibleFrontline){
        for(const row of ranked){
          if(isFrontline(row.p) && !row.futureFrontlineFeasible) row.score-=24;
        }
      }
      ranked.sort((a,b)=>b.score-a.score);

      const pick=ranked[0];
      if(!pick) break;
      assigned.set(pick.p.id,(assigned.get(pick.p.id)||0)+1);
      const expected=baseRuns(phase)+(phaseBat(phase)-pick.effective)*.052+(conditions.boundary||0)*.055;
      const proxyRuns=Math.max(0,Math.min(26,Math.round(expected+(rng()-.5)*7+(rng()-.5)*5)));
      const wicketChance=Math.max(.025,Math.min(.28,.105+(pick.effective-phaseBat(phase))*.0036));
      const proxyWickets=(rng()<wicketChance?1:0)+(rng()<wicketChance*.15?1:0);
      recent.get(pick.p.id).push({runs:proxyRuns,wickets:proxyWickets});
      overs.push({over,phase,bowlerId:pick.p.id,style:pick.style,effective:pick.effective,selectionScore:pick.score,proxyRuns,proxyWickets,usagePrior:pick.usage,tactical:pick.tactical});
      lastBowlerId=pick.p.id;
    }
    return {sequence:overs.map(x=>x.bowlerId),overs};
  }

  function bowlingPlanProfile(plan, fallback) {
    if(!plan?.overs?.length) return {newBall:fallback.newBall,middleBowl:fallback.middleBowl,death:fallback.death};
    const avgPhase=phase=>{
      const rows=plan.overs.filter(x=>x.phase===phase);
      return rows.length?rows.reduce((sum,x)=>sum+x.effective,0)/rows.length:null;
    };
    return {
      newBall:avgPhase('newBall') ?? fallback.newBall,
      middleBowl:avgPhase('middle') ?? fallback.middleBowl,
      death:avgPhase('death') ?? fallback.death
    };
  }

  function allOutBalls(total) {
    // Scorecards should not pretend every all-out innings lasted exactly 20 overs.
    return Math.max(72, Math.min(120, Math.round(82 + total*.19 + rng()*8)));
  }

  function innings(batClub,bowlClub,ground,context={}){
    const estimate=estimateInnings(batClub,bowlClub,ground,context);
    // Dynasty already applies fitness around the complete simulation. Snapshot it once.
    const fit=p=>({...p});
    return window.GCC8_DELIVERY.play({batClub,bowlClub,ground,context,estimate,order:matchBattingOrder(batClub).map(fit),bowlers:clubXI(bowlClub).map(fit),batProfile:effectiveProfile(batClub),bowlProfile:effectiveProfile(bowlClub),random:rng,R});
  }
  function estimateInnings(batClub, bowlClub, ground, context = {}) {
    const bat = effectiveProfile(batClub);
    const bowl = effectiveProfile(bowlClub);
    const boundary = ground.conditions.boundary || 0;

    // Captaincy is now causal. Pick the actual over-by-over attack first; the quality
    // of the bowlers the captain chooses then feeds the innings model and the same
    // sequence is reused by the scorecard.
    const plan = bowlingPlan(bowlClub, batClub, ground, context);
    const planned = bowlingPlanProfile(plan, bowl);
    const baseConditions=ground.baseConditions||ground.conditions||{};
    const weather=ground.weather||context.weather||WEATHER_TYPES.SETTLED;
    const fallbackPaceMatchup = plan ? 0 : R.conditionMatchup(bat.pacePlay, bowl.paceAttack, (baseConditions.pace || 0)+(weather.newBallPace||0));
    const fallbackSpinMatchup = plan ? 0 : R.conditionMatchup(bat.spinPlay, bowl.spinAttack, (baseConditions.spin || 0)+(weather.middleSpin||0));

    const inningsSwing = (rng() - 0.5) * 5.2;
    const chemistryEdge = (bat.chemistry - bowl.chemistry) * 0.006;

    const target=context.chasing ? Math.max(1,Number(context.target||0)) : 0;
    const requiredRate=target ? target/20 : 0;
    // Chasing is not a blanket bonus. Low targets permit restraint; high targets force aggression and wicket risk.
    const chasePressure=target ? Math.max(-.55,Math.min(1.20,(requiredRate-7.65)*.34)) : 0;
    const chasePp=context.chasing ? chasePressure*.38 : 0;
    const chaseMid=context.chasing ? chasePressure*.68 : 0;
    const chaseDeath=context.chasing ? chasePressure*1.00 : 0;

    // Ground/style matchup has already influenced who the captain selected and each
    // selected bowler effective phase quality, so it is not applied a second time here.
    let pp = phaseScore(bat.powerplayBat, planned.newBall, 6, 7.60 + chasePp, boundary, fallbackPaceMatchup, inningsSwing, chemistryEdge);
    let mid = phaseScore(bat.middleBat, planned.middleBowl, 9, 7.50 + chaseMid, boundary * 0.7, fallbackSpinMatchup, inningsSwing, chemistryEdge);
    let death = phaseScore(bat.finishing, planned.death, 5, 9.96 + chaseDeath, boundary, 0, inningsSwing, chemistryEdge);
    // Fielding/keeping changes actual runs, so keep that effect inside the phase ledger rather than
    // adding invisible runs after the phases have been calculated.
    const defenceRuns = (82 - bowl.fielding) * .08 + (84 - bowl.keeping) * .035;
    const defenceAdjustment = Math.round(Math.max(-3, Math.min(3, defenceRuns)));
    const ppDefence = Math.round(defenceAdjustment * .30);
    const midDefence = Math.round(defenceAdjustment * .45);
    const deathDefence = defenceAdjustment - ppDefence - midDefence;
    pp = Math.max(8, pp + ppDefence);
    mid = Math.max(8, mid + midDefence);
    death = Math.max(8, death + deathDefence);
    const total = Math.max(40, pp + mid + death);

    const battingPhases = (bat.powerplayBat + bat.middleBat + bat.finishing + bat.battingResources*.35) / 3.35;
    const bowlingPhases = (planned.newBall + planned.middleBowl + planned.death) / 3;
    let expectedWickets = 6.35
      + (bowlingPhases - battingPhases) * 0.035
      + (bowl.bowlingResources - 80) * 0.015
      + (bowl.chemistry - bat.chemistry) * 0.009
      + (bowl.fielding - 82) * 0.006
      + (bowl.keeping - 84) * 0.004
      - inningsSwing * 0.55;
    if(!plan) {
      expectedWickets += Math.max(0, (baseConditions.pace || 0)+(weather.newBallPace||0)) * Math.max(0, bowl.paceAttack - 76) * 0.0020;
      expectedWickets += Math.max(0, (baseConditions.spin || 0)+(weather.middleSpin||0)) * Math.max(0, bowl.spinAttack - 76) * 0.0020;
    }
    if(context.chasing) expectedWickets += Math.max(-.20,Math.min(.55,chasePressure*.42));

    const wicketProbability = Math.max(0.04, Math.min(0.96, expectedWickets / 10 + (rng() - 0.5) * 0.90));
    let wickets = 0;
    for (let i = 0; i < 10; i++) if (rng() < wicketProbability) wickets += 1;
    const balls = wickets === 10 ? allOutBalls(total) : 120;

    return { total, wickets, pp, mid, death, balls, requiredRate, chasePressure,
      bowlingPlan:plan?.sequence||[], bowlingPlanOvers:plan?.overs||[], bowlingPlanQuality:planned };
  }

  // A successful chase can clear the target with a boundary. This aggregate model
  // samples a legal excess, not a fabricated final delivery or a batter identity.
  function winningChaseTotal(target,potential,seed){
    const extras=[0,0,0,0,0,0,1,2,3,3,4,5],r=detailRng(`${seed}:winning-hit`);
    return target+Math.min(Math.max(0,potential-target),extras[Math.floor(r()*extras.length)]);
  }
  function reconcileChasePhases(phases,balls,total,target){
    const counts={pp:Math.min(36,balls),mid:Math.max(0,Math.min(54,balls-36)),death:Math.max(0,balls-90)},keys=['pp','mid','death'],active=keys.filter(k=>counts[k]>0),last=active[active.length-1],caps=Object.fromEntries(keys.map(k=>[k,counts[k]*6]));
    if(!last||total>balls*6||total<target)throw new Error('Impossible chase phase budget');
    const weights=Object.fromEntries(keys.map(k=>[k,counts[k]?Math.max(0,phases[k]||0):0])),sum=keys.reduce((n,k)=>n+weights[k],0)||balls;
    const weighted=keys.some(k=>weights[k]>0);
    const out=Object.fromEntries(keys.map(k=>[k,Math.min(caps[k],Math.floor(total*(weighted?weights[k]:counts[k])/sum))]));
    // Before the final phase the target must remain unreached, including any excess
    // from the winning boundary. No earlier phase can silently finish the chase.
    const minimum=Math.max(1,total-target+1);out[last]=Math.max(out[last],minimum);
    let diff=total-keys.reduce((n,k)=>n+out[k],0);
    for(const k of active.slice().reverse()){
      if(diff>0){const n=Math.min(diff,caps[k]-out[k]);out[k]+=n;diff-=n;}
      else if(diff<0){const n=Math.min(-diff,out[k]-(k===last?minimum:0));out[k]-=n;diff+=n;}
    }
    if(diff||out[last]>caps[last])throw new Error('Chase phase totals could not reconcile');
    return out;
  }

  function resolveChase(firstInnings, chasePotential) {
    if(chasePotential.deliveryVersion===1)return chasePotential;
    const target = firstInnings.total + 1;
    if (chasePotential.total < target) return chasePotential;
    const ratio = Math.max(.18, Math.min(.995, target / Math.max(target,chasePotential.total)));
    const balls = Math.max(30, Math.min(120, Math.ceil(120 * ratio + (rng() - .5) * 5)));
    let pp = balls >= 36 ? chasePotential.pp : Math.round(chasePotential.pp * balls / 36);
    const midBalls = Math.max(0, Math.min(54, balls - 36));
    let mid = balls <= 36 ? 0 : balls >= 90 ? chasePotential.mid : Math.round(chasePotential.mid * midBalls / 54);
    const deathBalls = Math.max(0, balls - 90);
    let death = balls <= 90 ? 0 : Math.round(chasePotential.death * deathBalls / 30);
    // The target is the scorecard truth. Reconcile the active phase ledger to it exactly so
    // narrative phase totals can never disagree with the final chase total.
    const finalScore=winningChaseTotal(target,chasePotential.total,state.seed);
    const phaseRuns=reconcileChasePhases({pp,mid,death},balls,finalScore,target);
    pp=phaseRuns.pp; mid=phaseRuns.mid; death=phaseRuns.death;
    const scaledWickets = Math.max(0, Math.min(9, Math.round(chasePotential.wickets * balls / 120 + (rng() - .5) * 1.2)));
    return { ...chasePotential, total:finalScore, wickets:scaledWickets, balls, pp, mid, death, chased:true };
  }

  // GCC's simplified tie-break: six legal deliveries, two wickets, repeated if tied.
  // Separate from regulation totals, NRR, player statistics and form updates.
  // The model selects three hitters and one bowler from each actual match XI.
  function simulateSuperOver(firstClub, secondClub, ground, random=rng) {
    const rounds=[];
    function miniInnings(batClub,bowlClub,target=Infinity){
      const hitters=clubXI(batClub).filter(Boolean).slice().sort((a,b)=>R.batPhaseScore(b,'death')-R.batPhaseScore(a,'death')||a.id-b.id).slice(0,3);
      const options=clubXI(bowlClub).filter(Boolean),credible=options.filter(p=>R.bowlingWorkload(p)>0);
      const bowler=(credible.length?credible:options).slice().sort((a,b)=>R.bowlPhaseScore(b,'death')-R.bowlPhaseScore(a,'death')||a.id-b.id)[0];
      if(hitters.length<3||!bowler)throw new Error('A Super Over requires complete match XIs.');
      let total=0,wickets=0,striker=0,nonStriker=1;
      const deliveries=[],batters=hitters.map(p=>({id:p.id,name:p.name,runs:0,balls:0,out:false}));
      for(let ball=1;ball<=6&&wickets<2&&total<target;ball++){
        const p=hitters[striker],edge=R.batPhaseScore(p,'death')-R.bowlPhaseScore(bowler,'death');
        const wicketChance=Math.max(.06,Math.min(.24,.14-edge*.001));
        const batter=batters[striker];batter.balls++;
        let runs=0,out=random()<wicketChance;
        if(out){wickets++;batter.out=true;}
        else{
          const roll=random()+Math.max(-.08,Math.min(.08,edge*.002))+(ground.conditions?.boundary||0)*.003;
          runs=roll<.20?0:roll<.48?1:roll<.65?2:roll<.68?3:roll<.87?4:6;
          total+=runs;batter.runs+=runs;
        }
        deliveries.push({ball,batterId:p.id,runs,wicket:out});
        if(out&&wickets===1)striker=2;
        else if(!out&&runs%2)[striker,nonStriker]=[nonStriker,striker];
      }
      return {club:batClub,total,wickets,balls:deliveries.length,bowler:{id:bowler.id,name:bowler.name},batters,deliveries};
    }
    let first=firstClub,second=secondClub;
    for(;;){
      const a=miniInnings(first,second),b=miniInnings(second,first,a.total+1);
      rounds.push({innings:[a,b]});
      if(a.total!==b.total)return {rounds,winner:a.total>b.total?first:second};
      [first,second]=[second,first];
    }
  }

  function simulateInningsPair(home, away, round=Math.max(1,(state.round||0)+1)) {
    // Home/away is a venue concept, not a batting-order rule. Randomising who bats
    // first gives the season a real chase/defence split without inventing a toss UI.
    const matchGround=effectiveMatchGround(home,round,state.year||2008);
    const awayFirst = rng() < .5;
    const firstClub = awayFirst ? away : home;
    const secondClub = awayFirst ? home : away;
    const firstInnings = innings(firstClub, secondClub, matchGround,{weather:matchGround.weather});
    const rawSecond = innings(secondClub, firstClub, matchGround, { chasing:true, target:firstInnings.total + 1, weather:matchGround.weather });
    const secondInnings = resolveChase(firstInnings, rawSecond);
    let winner;
    let tieBreak = false, superOver = null;
    if (secondInnings.total > firstInnings.total) winner = secondClub;
    else if (firstInnings.total > secondInnings.total) winner = firstClub;
    else { tieBreak = true; superOver = simulateSuperOver(secondClub, firstClub, matchGround); winner = superOver.winner; }
    const hi = firstClub.abbr === home.abbr ? firstInnings : secondInnings;
    const ai = firstClub.abbr === away.abbr ? firstInnings : secondInnings;
    return { hi, ai, winner, tieBreak, superOver, firstClub, secondClub, firstInnings, secondInnings, weather:matchGround.weather, matchGround };
  }

  function emptyPlayerStat() {
    return { matches:0, innings:0, runs:0, balls:0, outs:0, fours:0, sixes:0, wickets:0, bowlBalls:0, runsConceded:0, bestRuns:0, bestWickets:0, bestBowlingRuns:null };
  }

  function ensurePlayerStat(p) {
    if (!state.playerSeasonStats[p.id]) state.playerSeasonStats[p.id] = emptyPlayerStat();
    return state.playerSeasonStats[p.id];
  }

  function matchBattingOrder(club) {
    if(state.userClub && club.abbr===state.userClub.abbr && state.xi.length) return selectedBattingOrder();
    return [...clubXI(club)].sort((a,b) => (a.preferredSlot-b.preferredSlot) || (b.bat-a.bat));
  }

  function allocateRuns(club, total, wicketsLost = 10, seed = '') {
    const order = matchBattingOrder(club);
    const usedCount = Math.min(11, Math.max(2, wicketsLost + 2));
    const active = order.slice(0, usedCount);
    const r = detailRng(seed + ':runs');
    const exposure = [2.00,1.75,1.35,1.05,.78,.55,.37,.25,.16,.10,.06];
    const entries = active.map((p,i) => {
      let phaseSkill;
      if (i <= 1) phaseSkill = p.power*.28 + p.pacePlay*.30 + p.control*.24 + p.temperament*.18;
      else if (i <= 4) phaseSkill = p.spinPlay*.27 + p.control*.27 + p.power*.18 + p.temperament*.18 + p.running*.10;
      else phaseSkill = p.finishing*.34 + p.power*.27 + p.control*.16 + p.temperament*.16 + p.running*.07;
      const skill = Math.max(8, p.bat*.54 + phaseSkill*.46);
      const form = 1 + (p.form || 0) * .018;
      // A T20 scorecard is not proportional allocation. One batter can own an innings.
      // A skewed performance draw allows a batter to own an innings without making 100s routine.
      const performance = Math.min(2.75,.22 + Math.pow(r(),1.75)*2.30);
      return { p, value: skill * (exposure[i] || .18) * form * performance };
    });
    const sum = entries.reduce((a,x)=>a+x.value,0) || 1;
    const out = {};
    order.forEach(p => out[p.id] = 0);
    let used = 0;
    entries.forEach((x, i) => {
      const runs = i === entries.length - 1 ? Math.max(0, total - used) : Math.max(0, Math.floor(total * x.value / sum));
      out[x.p.id] = runs;
      used += runs;
    });
    let diff = total - Object.values(out).reduce((a,b)=>a+b,0);
    const ordered = [...entries].sort((a,b)=>b.value-a.value);
    let i = 0;
    while (diff > 0 && ordered.length) { out[ordered[i % ordered.length].p.id] += 1; diff--; i++; }
    // Even a freak T20 innings still needs a partner. This prevents impossible
    // 2008 scorecards where one batter owns virtually the entire team total.
    const shareCap=Math.max(40,Math.floor(total*.76));
    let excess=0;
    ordered.forEach(x=>{ if(out[x.p.id]>shareCap){excess+=out[x.p.id]-shareCap;out[x.p.id]=shareCap;} });
    let guard=0;
    while(excess>0 && ordered.length && guard++<total*3){
      const x=ordered[guard%ordered.length];
      if(out[x.p.id]<shareCap){out[x.p.id]+=1;excess--;}
    }
    return out;
  }

  function allocateWicketsFromBowling(club, allocation, wicketsLostByOpponent, seed) {
    const r = detailRng(seed + ':wkts');
    const out = {};
    clubXI(club).forEach(p => out[p.id] = 0);
    if (!allocation.length || wicketsLostByOpponent <= 0) return out;
    const runOuts = wicketsLostByOpponent >= 4 && r() < .22 ? 1 : 0;
    const bowlerWickets = Math.max(0, wicketsLostByOpponent - runOuts);
    for (let w = 0; w < bowlerWickets; w++) {
      const weighted = allocation.map(x => {
        const pb=x.phaseBalls||{new:x.balls,middle:0,death:0};
        const newQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'newBall') : x.p.newBall;
        const midQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'middle') : x.p.bowlControl;
        const deathQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'death') : x.p.death;
        // Wicket credit follows where the bowler was actually used, not his best unrelated trait.
        const phaseThreat=(pb.new/6)*1.05*newQ + (pb.middle/6)*.90*midQ + (pb.death/6)*1.15*deathQ;
        return { p:x.p, weight:Math.max(2,phaseThreat*(.82+r()*.36)) };
      });
      const total = weighted.reduce((a,x)=>a+x.weight,0) || 1;
      let pick = r()*total, chosen=weighted[weighted.length-1].p;
      for (const x of weighted) { pick-=x.weight; if (pick<=0) { chosen=x.p; break; } }
      out[chosen.id]=(out[chosen.id]||0)+1;
    }
    return out;
  }

  function detailRng(seedText) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedText.length; i++) { h ^= seedText.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function apportioned(total, entries) {
    if (!entries.length) return [];
    const weights = entries.map(x => Math.max(.01, x.weight));
    const sum = weights.reduce((a,b)=>a+b,0) || 1;
    const raw = weights.map(w => total * w / sum);
    const out = raw.map(Math.floor);
    let left = total - out.reduce((a,b)=>a+b,0);
    const order = raw.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]);
    let k = 0;
    while (left-- > 0) { out[order[k % order.length][1]] += 1; k++; }
    return out;
  }

  function scorecardExtras(total, seed) {
    const r = detailRng(seed);
    const value = 4 + Math.floor(r() * 12);
    return Math.max(0, Math.min(value, Math.max(0,total-8)));
  }

  function scorecardExtrasBreakdown(total, seed) {
    const value = scorecardExtras(total, seed);
    const r = detailRng(seed + ':breakdown');
    let wides = Math.min(value, Math.round(value * (.52 + r() * .16)));
    let noBalls = Math.min(value - wides, Math.round(value * (.10 + r() * .10)));
    const uncharged = Math.max(0, value - wides - noBalls);
    const byes = Math.min(uncharged, Math.floor(uncharged * (.30 + r() * .35)));
    const legByes = Math.max(0, uncharged - byes);
    return { total:value, wides, noBalls, byes, legByes, bowlerCharged:wides + noBalls };
  }

  function eraSixRate(year = state.year) {
    const progress = Math.max(0, Math.min(1, (year - 2008) / 17));
    return 0.034 + progress * 0.013;
  }

  function allocateScorecardSixes(active, runs, inningsTotal, r) {
    const runTotal = active.reduce((sum,p)=>sum+(runs[p.id]||0),0) || 1;
    const weightedPower = active.reduce((sum,p)=>sum+(runs[p.id]||0)*(p.power||70),0) / runTotal;
    const powerAdjustment = Math.max(-0.004, Math.min(0.005, (weightedPower - 82) * 0.00035));
    const expected = inningsTotal * Math.max(0.024, eraSixRate() + powerAdjustment) * (.88 + r()*.24);
    const target = Math.max(0, Math.round(expected));
    const out = Object.fromEntries(active.map(p=>[p.id,0]));
    for (let n=0; n<target; n++) {
      const candidates = active.filter(p => (runs[p.id]||0) >= (out[p.id]+1)*6);
      if (!candidates.length) break;
      const weighted = candidates.map(p => ({
        p,
        weight: Math.max(1,(runs[p.id]||0) * Math.pow(Math.max(55,p.power)/82,2) * (.82 + (p.finishing||70)/260))
      }));
      const totalWeight = weighted.reduce((sum,x)=>sum+x.weight,0);
      let pick = r()*totalWeight;
      let chosen = weighted[weighted.length-1].p;
      for (const x of weighted) { pick -= x.weight; if (pick <= 0) { chosen = x.p; break; } }
      out[chosen.id] += 1;
    }
    return out;
  }

  function eraFourRate(year = state.year) {
    // IPL 2008 produced roughly one four per 10.5 runs. Keep 2008 grounded here;
    // later-era boundary evolution can be calibrated season-by-season with evidence.
    return 0.1005;
  }

  function allocateScorecardFours(active, runs, sixesById, r) {
    const runTotal = active.reduce((sum,p)=>sum+(runs[p.id]||0),0) || 1;
    const weightedCraft = active.reduce((sum,p)=>sum+(runs[p.id]||0)*((p.pacePlay||70)*.46+(p.control||70)*.34+(p.power||70)*.20),0) / runTotal;
    const craftAdjustment = Math.max(-.008, Math.min(.008,(weightedCraft-82)*.00045));
    const target = Math.max(0,Math.round(runTotal * Math.max(.075,eraFourRate()+craftAdjustment) * (.88+r()*.24)));
    const out = Object.fromEntries(active.map(p=>[p.id,0]));
    for (let n=0;n<target;n++) {
      const candidates=active.filter(p=>(runs[p.id]||0) >= (sixesById[p.id]||0)*6 + (out[p.id]+1)*4);
      if(!candidates.length) break;
      const weighted=candidates.map(p=>({
        p,
        weight:Math.max(1,(runs[p.id]||0) * Math.pow(Math.max(55,(p.pacePlay*.48+p.control*.34+p.power*.18))/82,1.55))
      }));
      const totalWeight=weighted.reduce((sum,x)=>sum+x.weight,0)||1;
      let pick=r()*totalWeight, chosen=weighted[weighted.length-1].p;
      for(const x of weighted){pick-=x.weight;if(pick<=0){chosen=x.p;break;}}
      out[chosen.id]+=1;
    }
    return out;
  }

  function buildBattingCard(club, inningsData, runs, bowlingWickets, fieldingClub, seed) {
    const r = detailRng(seed + ':bat');
    const order = matchBattingOrder(club);
    const usedCount = Math.min(11, Math.max(2, inningsData.wickets + 2));
    const active = order.slice(0, usedCount);
    const ballEntries = active.map(p => {
      const run = runs[p.id] || 0;
      const expectedSR = Math.max(82, Math.min(190, 92 + p.power*.38 + p.control*.23 + p.temperament*.13 + (r()-.5)*18));
      return { p, weight: Math.max(1, run * 100 / expectedSR + 1.8) };
    });
    const inningsBalls = Math.max(active.length, inningsData.balls || 120);
    const minimum = active.length;
    const extraBalls = apportioned(Math.max(0,inningsBalls-minimum), ballEntries);
    const balls = {};
    active.forEach((p,i) => balls[p.id] = 1 + extraBalls[i]);
    const sixesById = allocateScorecardSixes(active, runs, inningsData.total, r);
    const foursById = allocateScorecardFours(active, runs, sixesById, r);

    // Not-outs are outcomes, not simply "everyone after wicket N". Exposure and
    // control influence who was dismissed while the exact wicket count is preserved.
    const dismissPool = active.map(p=>({p,weight:Math.max(1,(balls[p.id]||1)*(1.35-(p.control||70)/180)*(1.18-(p.temperament||70)/260))}));
    const dismissedIds=new Set();
    for(let n=0;n<Math.min(inningsData.wickets,active.length);n++){
      const candidates=dismissPool.filter(x=>!dismissedIds.has(x.p.id));
      const total=candidates.reduce((a,x)=>a+x.weight,0)||1;
      let pick=r()*total, chosen=candidates[candidates.length-1]?.p;
      for(const x of candidates){ pick-=x.weight; if(pick<=0){ chosen=x.p; break; } }
      if(chosen) dismissedIds.add(chosen.id);
    }
    const wicketTakers = [];
    Object.entries(bowlingWickets).forEach(([id,w]) => {
      const bowler = byId(Number(id));
      for (let i=0;i<w;i++) if (bowler) wicketTakers.push(bowler);
    });
    for(let i=wicketTakers.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [wicketTakers[i],wicketTakers[j]]=[wicketTakers[j],wicketTakers[i]]; }
    const fielders=fieldingClub ? clubXI(fieldingClub) : wicketTakers;
    const keeper=fielders.length ? [...fielders].sort((a,b)=>(b.keeping||0)-(a.keeping||0))[0] : null;
    const chooseFielder=()=>{
      if(!fielders.length) return null;
      const weighted=fielders.map(f=>({f,w:Math.max(8,(f.fielding||60) + (f.id===keeper?.id?(f.keeping||0)*.18:0))}));
      let pick=r()*weighted.reduce((a,x)=>a+x.w,0), chosen=weighted[weighted.length-1].f;
      for(const x of weighted){pick-=x.w;if(pick<=0){chosen=x.f;break;}}
      return chosen;
    };
    const creditedDismissal=(bowler)=>{
      const spin=(bowler.spin||0)>=76 && (bowler.spin||0)>=(bowler.pace||0);
      const x=r();
      if(spin){
        if(x<.50){const f=chooseFielder();return f?`c ${f.name} b ${bowler.name}`:`b ${bowler.name}`;}
        if(x<.68)return `b ${bowler.name}`;
        if(x<.81)return `lbw b ${bowler.name}`;
        if(x<.93 && keeper)return `st ${keeper.name} b ${bowler.name}`;
        return `c & b ${bowler.name}`;
      }
      if(x<.58){const f=chooseFielder();return f?`c ${f.name} b ${bowler.name}`:`b ${bowler.name}`;}
      if(x<.80)return `b ${bowler.name}`;
      if(x<.94)return `lbw b ${bowler.name}`;
      return `c & b ${bowler.name}`;
    };
    let credited = 0;
    return order.map((p,i) => {
      const run = runs[p.id] || 0;
      if (i >= usedCount) return { player:p, dismissal:'did not bat', runs:0, balls:0, fours:0, sixes:0, sr:null, dnb:true };
      const dismissed = dismissedIds.has(p.id);
      let dismissal = 'not out';
      if (dismissed) {
        if (credited < wicketTakers.length) dismissal=creditedDismissal(wicketTakers[credited++]);
        else { const f=chooseFielder(); dismissal=f?`run out (${f.name})`:'run out'; }
      }
      const sixes = sixesById[p.id] || 0;
      const fours = foursById[p.id] || 0;
      const b = balls[p.id] || 1;
      return { player:p, dismissal, runs:run, balls:b, fours, sixes, sr:run*100/b, dnb:false };
    });
  }

  function bowlingBallAllocation(club, inningsData, seed, includeSequence = false) {
    const r = detailRng(seed + ':overs');
    const xi = clubXI(club);
    const totalBalls = Math.max(1, Math.min(120, inningsData.balls || 120));
    const assigned = new Map(xi.map(p => [p.id,0]));
    const phaseAssigned = new Map(xi.map(p => [p.id,{new:0,middle:0,death:0}]));
    const sequence = [];

    // If the innings engine already made a causal captaincy plan, the scorecard must
    // honour it exactly rather than inventing a second, post-hoc bowling allocation.
    if (Array.isArray(inningsData.bowlingPlan) && inningsData.bowlingPlan.length) {
      let bowled=0;
      for (const id of inningsData.bowlingPlan) {
        if (bowled>=totalBalls) break;
        const p=xi.find(x=>x.id===id);
        if(!p) continue;
        const block=Math.min(6,totalBalls-bowled);
        const phase=bowled<36?'new':bowled<90?'middle':'death';
        assigned.set(p.id,(assigned.get(p.id)||0)+block);
        phaseAssigned.get(p.id)[phase]+=block;
        sequence.push(p.id);
        bowled+=block;
      }
      if (bowled>=totalBalls) {
        const allocation=xi.map(p=>({p,balls:assigned.get(p.id)||0,phaseBalls:{...phaseAssigned.get(p.id)}})).filter(x=>x.balls>0);
        return includeSequence?{allocation,sequence}:allocation;
      }
    }

    // Fallback for legacy/synthetic innings that do not carry a causal plan.
    const primaryCap = new Map(xi.map(p => [p.id, R.bowlingWorkload(p) * 6]));
    let bowled = [...assigned.values()].reduce((a,b)=>a+b,0), lastBowlerId = sequence.length ? sequence[sequence.length-1] : null;
    while (bowled < totalBalls) {
      const block = Math.min(6,totalBalls-bowled);
      const phase = bowled < 36 ? 'new' : bowled < 90 ? 'middle' : 'death';
      let candidates = xi.filter(p => p.id !== lastBowlerId && assigned.get(p.id) + block <= primaryCap.get(p.id) && primaryCap.get(p.id) > 0);
      if (!candidates.length) candidates = xi.filter(p => p.id !== lastBowlerId && p.keeping < 70 && assigned.get(p.id) + block <= 24);
      if (!candidates.length) candidates = xi.filter(p => p.id !== lastBowlerId && assigned.get(p.id) + block <= 24);
      if (!candidates.length) candidates = xi.filter(p => assigned.get(p.id) + block <= 24);
      const ranked = candidates.map(p => {
        let q;
        if (phase === 'new') q=p.newBall*.42+p.bowlControl*.25+p.pace*.15+p.bowl*.12+p.temperament*.06;
        else if (phase === 'death') q=p.death*.38+p.bowlControl*.25+p.variation*.22+p.bowl*.09+p.temperament*.06;
        else q=Math.max(p.spin*.46+p.bowlControl*.28+p.variation*.16+p.bowl*.10,p.bowlControl*.40+p.variation*.28+p.bowl*.22+p.temperament*.10);
        const usage=R.bowlingUsagePrior?R.bowlingUsagePrior(p):R.bowlingWorkload(p);
        const used=(assigned.get(p.id)||0)/6;
        q-=Math.max(0,(used+1)-Math.max(.35,usage))*4.5;
        return {p,q:q+r()*7};
      }).sort((a,b)=>b.q-a.q);
      const pick=ranked[0]?.p;
      if(!pick) break;
      assigned.set(pick.id,assigned.get(pick.id)+block);
      phaseAssigned.get(pick.id)[phase] += block;
      sequence.push(pick.id);
      lastBowlerId=pick.id;
      bowled+=block;
    }
    const allocation = xi.map(p=>({p,balls:assigned.get(p.id)||0,phaseBalls:{...phaseAssigned.get(p.id)}})).filter(x=>x.balls>0);
    return includeSequence ? { allocation, sequence } : allocation;
  }

  function buildBowlingCard(club, inningsData, totalConceded, wicketsMap, allocation, seed) {
    const r = detailRng(seed + ':bowl');
    const entries = allocation.map(x => {
      const pb=x.phaseBalls||{new:x.balls,middle:0,death:0};
      const newQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'newBall') : x.p.newBall;
      const midQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'middle') : x.p.bowlControl;
      const deathQ=R.bowlPhaseScore ? R.bowlPhaseScore(x.p,'death') : x.p.death;
      const factor=q=>Math.max(.62,Math.min(1.42,1+(80-q)*.018));
      // A death over is intrinsically more expensive than a middle over. Scorecard economy
      // therefore reflects both phase difficulty and how well the bowler fits that phase.
      const expectedRuns=(pb.new/6)*7.60*factor(newQ) + (pb.middle/6)*7.50*factor(midQ) + (pb.death/6)*9.96*factor(deathQ);
      return { ...x, weight: Math.max(1,expectedRuns*(.88+r()*.24)) };
    });
    const conceded = apportioned(totalConceded, entries);
    return entries.map((x,i) => ({
      player:x.p, balls:x.balls, runs:conceded[i], wickets:wicketsMap[x.p.id] || 0,
      economy:x.balls ? conceded[i]/(x.balls/6) : 0
    }));
  }

  function buildMatchScorecard(home, away, hi, ai, homeRuns, awayRuns, homeExtras, awayExtras, seed, firstBattingClub = home) {
    if(hi.deliveryVersion===1&&ai.deliveryVersion===1)return window.GCC8_DELIVERY.scorecard(home,away,hi,ai,firstBattingClub);
    const homeExtraDetail = typeof homeExtras === 'number' ? {total:homeExtras,wides:homeExtras,noBalls:0,byes:0,legByes:0,bowlerCharged:homeExtras} : homeExtras;
    const awayExtraDetail = typeof awayExtras === 'number' ? {total:awayExtras,wides:awayExtras,noBalls:0,byes:0,legByes:0,bowlerCharged:awayExtras} : awayExtras;
    const awayAllocation=bowlingBallAllocation(away,hi,seed+':awaybowling');
    const homeAllocation=bowlingBallAllocation(home,ai,seed+':homebowling');
    const awayWickets=allocateWicketsFromBowling(away,awayAllocation,hi.wickets,seed+':awaybowling');
    const homeWickets=allocateWicketsFromBowling(home,homeAllocation,ai.wickets,seed+':homebowling');
    const homeBat = buildBattingCard(home, hi, homeRuns, awayWickets, away, seed + ':home');
    const awayBat = buildBattingCard(away, ai, awayRuns, homeWickets, home, seed + ':away');
    const homeUnchargedExtras = (homeExtraDetail.byes||0) + (homeExtraDetail.legByes||0);
    const awayUnchargedExtras = (awayExtraDetail.byes||0) + (awayExtraDetail.legByes||0);
    const awayBowl = buildBowlingCard(away,hi,Math.max(0,hi.total-homeUnchargedExtras),awayWickets,awayAllocation,seed+':awaybowling');
    const homeBowl = buildBowlingCard(home,ai,Math.max(0,ai.total-awayUnchargedExtras),homeWickets,homeAllocation,seed+':homebowling');
    const homeCard={ club:home, total:hi.total, wickets:hi.wickets, balls:hi.balls, overs:ballsToOvers(hi.balls), extras:homeExtraDetail.total, extrasBreakdown:homeExtraDetail, phases:{pp:hi.pp,mid:hi.mid,death:hi.death}, batting:homeBat, bowling:awayBowl };
    const awayCard={ club:away, total:ai.total, wickets:ai.wickets, balls:ai.balls, overs:ballsToOvers(ai.balls), extras:awayExtraDetail.total, extrasBreakdown:awayExtraDetail, phases:{pp:ai.pp,mid:ai.mid,death:ai.death}, batting:awayBat, bowling:homeBowl };
    return {
      innings: firstBattingClub.abbr === away.abbr ? [awayCard,homeCard] : [homeCard,awayCard],
      wickets:{home:homeWickets,away:awayWickets}
    };
  }
  function scorecardInningsFor(scorecard,club){ return scorecard.innings.find(x=>x.club.abbr===club.abbr); }

  function recordMatchStats(club, battingRows, bowlingRows) {
    const batById = Object.fromEntries(battingRows.map(x => [x.player.id,x]));
    const bowlById = Object.fromEntries(bowlingRows.map(x => [x.player.id,x]));
    clubXI(club).forEach(p => {
      const st = ensurePlayerStat(p);
      const bat = batById[p.id];
      const bowl = bowlById[p.id];
      st.matches += 1;
      if (bat && !bat.dnb) {
        st.innings += 1;
        st.runs += bat.runs;
        st.balls += bat.balls;
        st.fours += bat.fours;
        st.sixes += bat.sixes;
        if (bat.dismissal !== 'not out') st.outs += 1;
        st.bestRuns = Math.max(st.bestRuns, bat.runs);
      }
      if (bowl) {
        st.wickets += bowl.wickets;
        st.bowlBalls += bowl.balls;
        st.runsConceded += bowl.runs;
        if (bowl.wickets > st.bestWickets || (bowl.wickets === st.bestWickets && (st.bestBowlingRuns === null || bowl.runs < st.bestBowlingRuns))) {
          st.bestWickets = bowl.wickets;
          st.bestBowlingRuns = bowl.runs;
        }
      }
    });
  }

  function playerImpact(p) {
    const st = state.playerSeasonStats[p.id] || emptyPlayerStat();
    return st.runs + st.wickets * 24 + (p.form || 0) * 9 + Math.min(50, st.matches * 2);
  }

  function nrrBalls(inn){ return inn.wickets === 10 ? 120 : Math.max(1,inn.balls||120); }
  function recalcNRR(row){
    if(!row.ballsFor || !row.ballsAgainst){ row.nrr=0; return; }
    row.nrr=(row.runsFor/(row.ballsFor/6))-(row.runsAgainst/(row.ballsAgainst/6));
  }
  function updateTableNumbers(home,away,hi,ai,winner){
    [home,away].forEach(c=>{ state.table[c.abbr].p+=1; state.teamGames[c.abbr]+=1; });
    const loser=winner.abbr===home.abbr?away:home;
    state.table[winner.abbr].w+=1; state.table[winner.abbr].pts+=2; state.table[loser.abbr].l+=1;
    const hr=state.table[home.abbr], ar=state.table[away.abbr];
    hr.runsFor+=hi.total; hr.runsAgainst+=ai.total; hr.ballsFor+=nrrBalls(hi); hr.ballsAgainst+=nrrBalls(ai);
    ar.runsFor+=ai.total; ar.runsAgainst+=hi.total; ar.ballsFor+=nrrBalls(ai); ar.ballsAgainst+=nrrBalls(hi);
    recalcNRR(hr); recalcNRR(ar);
  }
  function resultMarginText(home,away,hi,ai,winner,tieBreak=false,pair=null){
    if(tieBreak) return pair?.superOver ? `in a Super Over${pair.superOver.rounds.length>1?' (tie-break '+pair.superOver.rounds.length+')':''}` : 'after a tied match';
    const secondClub=pair?.secondClub || away;
    const secondInnings=pair?.secondInnings || ai;
    const firstInnings=pair?.firstInnings || hi;
    if(winner.abbr===secondClub.abbr){
      const wickets=Math.max(1,10-secondInnings.wickets), balls=Math.max(0,120-(secondInnings.balls||120));
      return `by ${wickets} wicket${wickets===1?'':'s'}${balls?` with ${balls} ball${balls===1?'':'s'} remaining`:''}`;
    }
    const runs=Math.max(1,firstInnings.total-secondInnings.total);
    return `by ${runs} run${runs===1?'':'s'}`;
  }

  function simulateMatch(home, away, round=Math.max(1,(state.round||0)+1)) {
    const pair=simulateInningsPair(home,away,round);
    const hi=pair.hi, ai=pair.ai, winner=pair.winner;
    updateTableNumbers(home,away,hi,ai,winner);
    const detailSeed = `${home.abbr}-${away.abbr}-${state.round + 1}-${pair.firstClub.abbr}-${hi.total}-${ai.total}`;
    const homeExtras = hi.extrasBreakdown || scorecardExtrasBreakdown(hi.total, detailSeed + ':he');
    const awayExtras = ai.extrasBreakdown || scorecardExtrasBreakdown(ai.total, detailSeed + ':ae');
    const homeRuns = hi.batterRuns || allocateRuns(home, Math.max(0,hi.total-homeExtras.total), hi.wickets, detailSeed + ':home');
    const awayRuns = ai.batterRuns || allocateRuns(away, Math.max(0,ai.total-awayExtras.total), ai.wickets, detailSeed + ':away');
    const scorecard = buildMatchScorecard(home, away, hi, ai, homeRuns, awayRuns, homeExtras, awayExtras, detailSeed, pair.firstClub);
    const homeWickets=scorecard.wickets.home, awayWickets=scorecard.wickets.away;
    const homeCard=scorecardInningsFor(scorecard,home), awayCard=scorecardInningsFor(scorecard,away);
    recordMatchStats(home, homeCard.batting, awayCard.bowling);
    recordMatchStats(away, awayCard.batting, homeCard.bowling);
    updateFormForMatch(home, away, scorecard);
    const marginText=resultMarginText(home,away,hi,ai,winner,pair.tieBreak,pair);
    return { home, away, homeInnings: hi, awayInnings: ai, battingFirst:pair.firstClub, battingSecond:pair.secondClub, winner, tieBreak:pair.tieBreak, superOver:pair.superOver, margin:Math.abs(hi.total-ai.total), marginText, weather:pair.weather, scorecard, performance:{ homeRuns, awayRuns, homeWickets, awayWickets } };
  }

  function formNegRoll(playerId) {
    let h=2166136261;
    const s=`${state.weatherSeed||1}:${state.year}:${state.round}:${playerId}:form-neg`;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0)/4294967296;
  }
  function updateFormForMatch(home, away, scorecard) {
    const homeInn=scorecardInningsFor(scorecard,home), awayInn=scorecardInningsFor(scorecard,away);
    [[home,homeInn,awayInn.bowling],[away,awayInn,homeInn.bowling]].forEach(([club,inn,bowlingRows])=>{
      const batById=Object.fromEntries(inn.batting.map(x=>[x.player.id,x]));
      const bowlById=Object.fromEntries(bowlingRows.map(x=>[x.player.id,x]));
      clubXI(club).forEach(p=>{
        const bat=batById[p.id], bowl=bowlById[p.id];
        let signal=0;
        if(bat && !bat.dnb){
          if(bat.runs>=50) signal+=1;
          else if(bat.runs>=30 && bat.sr>=130) signal+=.55;
          else if(bat.runs<=5 && bat.balls>=5) signal-=.45;
        }
        if(bowl && bowl.balls>=12){
          if(bowl.wickets>=3) signal+=1;
          else if(bowl.wickets>=2) signal+=.45;
          if(bowl.economy<=6.5) signal+=.35;
          else if(bowl.economy>=10.5) signal-=.45;
        }
        let move=signal>=.75?1:(signal<=-.45&&formNegRoll(p.id)<.50)?-1:0;
        if(!move && (p.form||0)!==0 && rng()<.10) move=(p.form||0)>0?-1:1;
        p.form=Math.max(-3,Math.min(3,(p.form||0)+move));
      });
    });
  }


  function matchdayEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function matchdayFormWord(p){
    const f=Number(p?.form||0);
    return f>=2?'Hot':f<=-2?'Cold':f>=1?'In form':f<=-1?'Quiet':'Steady';
  }

  function matchdayWatchPlayer(ids){
    const ps=(ids||[]).map(byId).filter(Boolean);
    return ps.slice().sort((a,b)=>(Number(b.form||0)-Number(a.form||0))||(Number(b.overall||0)-Number(a.overall||0)))[0]||null;
  }

  function matchdayTableRead(club){
    const row=state.table?.[club.abbr];
    if(!state.round||!row)return 'Season yet to start';
    const st=standings(),pos=st.findIndex(x=>x.club.abbr===club.abbr)+1;
    return `${ordinal(pos)} · ${row.w}-${row.l}`;
  }

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

  function playNextRound(fromAuto = false, scheduleNext = true) {
    if (state.round >= 14 || (fromAuto && !state.seasonRunning)) return;
    if (state.seasonRunning && !fromAuto) return toast('Season simulation is already running');
    const r = state.round + 1;
    const beforePos = standings().findIndex(x => x.club.abbr === state.userClub.abbr) + 1;
    const roundFixtures = state.fullSchedule[r - 1] || [];
    const fx = roundFixtures.find(f => f.home.abbr === state.userClub.abbr || f.away.abbr === state.userClub.abbr);
    if (!fx) return toast('Round schedule is invalid');
    const userRes = simulateMatch(fx.home, fx.away, fx.round);
    userRes.round = r;
    state.results.push(userRes);
    roundFixtures
      .filter(f => f !== fx)
      .forEach(f => simulateMatch(f.home, f.away, f.round));
    userRes.ladderBefore = beforePos;
    userRes.ladderAfter = standings().findIndex(x => x.club.abbr === state.userClub.abbr) + 1;
    state.round = r;
    renderSeason(fromAuto && r < 14);
    renderMatchStory(userRes);
    updateSeasonTicker(userRes);
    if (r === 14) {
      finishRegularSeason();
      return;
    }
    if (state.seasonRunning && scheduleNext) scheduleSeasonTick();
  }

  function simulateSeason() {
    if (state.round >= 14) return proceedPostSeason();
    if (state.seasonRunning) {
      state.seasonRunning = false;
      clearTimeout(seasonTimer);
      renderSeason();
      updateSeasonTicker();
      return;
    }
    state.seasonRunning = true;
    renderSeason();
    updateSeasonTicker();
    scheduleSeasonTick(180);
  }

  function scheduleSeasonTick(delay = seasonSpeeds[state.seasonSpeedIndex]) {
    clearTimeout(seasonTimer);
    if (!state.seasonRunning || state.round >= 14) return;
    seasonTimer = setTimeout(() => playNextRound(true), delay);
  }

  function cycleSeasonPace() {
    state.seasonSpeedIndex = (state.seasonSpeedIndex + 1) % seasonPaceLabels.length;
    renderSeason();
    if (state.seasonRunning) scheduleSeasonTick(80);
  }

  function updateSeasonTicker(res = null) {
    const ticker = $('seasonTicker');
    if (!ticker) return;
    // The stage read already explains a paused/completed season. Keep this strip for
    // the one state where it adds genuinely new information: continuous simulation.
    ticker.hidden = !state.seasonRunning || state.round >= 14;
    ticker.classList.toggle('running', state.seasonRunning && state.round < 14);
    if (ticker.hidden) return;
    ticker.innerHTML = `<span class="live-dot"></span><b>Season running</b><span>${state.round ? `Round ${state.round} complete.` : 'Round 1 is loading.'} Next result in sequence.</span>`;
  }

  function finishRegularSeason() {
    state.seasonRunning = false;
    clearTimeout(seasonTimer);
    state.regularSeasonPosition = standings().findIndex(x => x.club.abbr === state.userClub.abbr) + 1;
    $('playRound').disabled = true;
    $('simulateSeason').disabled = false;
    $('seasonPace').disabled = true;
    renderSeason();
    updateSeasonTicker();
    if (state.regularSeasonPosition <= 4) showFinalsQualification();
  }

  function showFinalsQualification() {
    const pos=state.regularSeasonPosition;
    const me=state.table[state.userClub.abbr];
    const y=state.year || 2008;
    openModal(`<div class="qualification-moment"><span class="kicker">FINALS QUALIFIED</span><div class="qualification-seed">${pos}</div><h2>${y===2008?'You are into the first GCC finals.':`You are into the ${y} GCC finals.`}</h2><p>${state.userClub.name} finish ${ordinal(pos)} at ${me.w}-${me.l}. The ladder is locked. From here, one loss ends the season.</p><div class="qualification-actions"><button class="button" onclick="GCC.closeModal()">VIEW SEASON</button><button class="button primary" onclick="GCC.enterFinalsFromModal()">GO TO FINALS</button></div></div>`);
  }

  function enterFinalsFromModal() {
    closeModal();
    prepareFinals();
  }

  function standings() {
    return Object.values(state.table).sort((a, b) => b.pts - a.pts || b.w - a.w || b.nrr - a.nrr);
  }

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

  function renderSeasonFixtures() {
    $('fixtures').innerHTML = state.schedule.map(f => seasonFixtureRow(f)).join('');
  }

  function fullLadderHtml(st = standings()) {
    return `<table><thead><tr><th>#</th><th>Club</th><th>P</th><th>W</th><th>L</th><th>NRR</th><th>PTS</th></tr></thead><tbody>${st.map((x, i) => `<tr class="${x.club.abbr === state.userClub.abbr ? 'user-row' : ''}"><td>${state.round ? i + 1 : '—'}</td><td><div class="ladder-club"><div class="club-mark" style="--club:${x.club.c};--club-accent:${x.club.a || 'transparent'};--club-text:${x.club.t || '#112018'}">${x.club.abbr}</div><span>${x.club.name}</span></div></td><td>${x.p}</td><td>${x.w}</td><td>${x.l}</td><td>${state.round ? `${x.nrr >= 0 ? '+' : ''}${x.nrr.toFixed(2)}` : '—'}</td><td><b>${x.pts}</b></td></tr>`).join('')}</tbody></table>`;
  }

  function renderSeasonLadder() {
    $('ladder').innerHTML = fullLadderHtml();
  }

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

  function setSeasonView(view = 'overview') {
    const allowed = ['overview','fixtures','ladder','analysis','players'];
    seasonView = allowed.includes(view) ? view : 'overview';
    $('season').dataset.view=seasonView;
    document.querySelectorAll('[data-season-panel]').forEach(panel => {
      const active = panel.dataset.seasonPanel === seasonView;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    document.querySelectorAll('[data-season-view]').forEach(button => {
      const active = button.dataset.seasonView === seasonView;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (seasonView === 'fixtures') renderSeasonFixtures();
    else if (seasonView === 'ladder') renderSeasonLadder();
    else if (seasonView === 'analysis' || seasonView === 'players') renderSeasonInsights();
    else renderSeasonOverview();
  }

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

  function ordinal(n) {
    if (!n) return '—';
    const v = n % 100;
    return `${n}${['th','st','nd','rd'][(v - 20) % 10] || ['th','st','nd','rd'][v] || 'th'}`;
  }

  function userSeasonPlayers() {
    return (state.teams[state.userClub.abbr] || []).map(byId).map(p => ({ p, st: state.playerSeasonStats[p.id] || emptyPlayerStat(), impact: playerImpact(p) }));
  }

  function completedUserMatches(includeFinals = false) {
    const matches = state.results.filter(res => [res.home.abbr, res.away.abbr].includes(state.userClub.abbr));
    if (!includeFinals || !state.finals) return matches;
    const finalsMatches = [...(state.finals.semis || []), state.finals.gf].filter(Boolean).filter(res => [res.home.abbr, res.away.abbr].includes(state.userClub.abbr));
    return [...matches, ...finalsMatches];
  }

  function userTeamAverages(includeFinals = false) {
    const matches = completedUserMatches(includeFinals);
    if (!matches.length) return null;
    let scored = 0, conceded = 0, lost = 0, taken = 0, batBalls=0, bowlBalls=0;
    matches.forEach(res => {
      const home = res.home.abbr === state.userClub.abbr;
      const mine = home ? res.homeInnings : res.awayInnings;
      const theirs = home ? res.awayInnings : res.homeInnings;
      scored += mine.total;
      conceded += theirs.total;
      lost += mine.wickets;
      taken += theirs.wickets;
      batBalls += mine.balls || 120;
      bowlBalls += theirs.balls || 120;
    });
    const n = matches.length;
    return {
      matches:n,
      avgScore:scored/n,
      runRate:batBalls ? scored/(batBalls/6) : 0,
      avgConceded:conceded/n,
      economy:bowlBalls ? conceded/(bowlBalls/6) : 0,
      avgWicketsLost:lost/n,
      avgWicketsTaken:taken/n
    };
  }

  function leagueInningsAverages() {
    if (!state.results.length) return null;
    let runs = 0, wickets = 0, innings = 0, balls=0;
    state.results.forEach(res => {
      [res.homeInnings, res.awayInnings].forEach(inn => {
        if (!inn) return;
        runs += inn.total;
        wickets += inn.wickets;
        balls += inn.balls || 120;
        innings += 1;
      });
    });
    if (!innings) return null;
    return {
      innings,
      avgScore:runs/innings,
      runRate:balls ? runs/(balls/6) : 0,
      avgWicketsLost:wickets/innings
    };
  }

  function seasonEvidenceStage(matches) {
    if (!matches) return { key:'waiting', label:'BEFORE ROUND 1', title:'What this XI needs to show' };
    if (matches <= 2) return { key:'early', label:`${matches} MATCH${matches===1?'':'ES'}`, title:'The first signs from the innings' };
    if (matches <= 5) return { key:'forming', label:`AFTER ${matches} MATCHES`, title:'What is starting to repeat' };
    return { key:'season', label:`AFTER ${matches} MATCHES`, title:'Where the matches are turning' };
  }

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

  function matchStandout(res) {
    if (!res || !res.scorecard) return null;
    const rows = new Map();
    const get = p => {
      if (!rows.has(p.id)) rows.set(p.id,{ player:p, score:0, bat:null, bowl:null });
      return rows.get(p.id);
    };
    res.scorecard.innings.forEach(inn => {
      inn.batting.filter(x=>!x.dnb).forEach(x => {
        const r=get(x.player); r.bat=x;
        r.score += x.runs + Math.max(0,(x.sr||0)-120)*.12 + (x.runs>=50?8:0);
      });
      inn.bowling.forEach(x => {
        const r=get(x.player); r.bowl=x;
        r.score += x.wickets*24 + Math.max(0,8.5-x.economy)*4 + (x.wickets>=3?8:0);
      });
    });
    const best=[...rows.values()].sort((a,b)=>b.score-a.score)[0];
    if (!best) return null;
    const pieces=[];
    if (best.bat && best.bat.runs >= 20) pieces.push(`${best.bat.runs} off ${best.bat.balls}`);
    if (best.bowl && best.bowl.wickets) pieces.push(`${best.bowl.wickets}/${best.bowl.runs} from ${ballsToOvers(best.bowl.balls)}`);
    if (!pieces.length && best.bat) pieces.push(`${best.bat.runs} off ${best.bat.balls}`);
    return { ...best, line:pieces.join(' · ') };
  }

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

  function battingAverage(st) { return st.outs ? st.runs / st.outs : null; }
  function strikeRate(st) { return st.balls ? st.runs * 100 / st.balls : null; }
  function bowlingAverage(st) { return st.wickets ? st.runsConceded / st.wickets : null; }
  function economyRate(st) { return st.bowlBalls ? st.runsConceded / (st.bowlBalls / 6) : null; }
  function stat1(v) { return v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(1); }
  function stat2(v) { return v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(2); }
  function ballsToOvers(balls) { const b = Math.max(0, Math.round(balls || 0)); return `${Math.floor(b / 6)}.${b % 6}`; }

  function scorecardInningsMarkup(inn) {
    const appeared = inn.batting.filter(x=>!x.dnb);
    const dnb = inn.batting.filter(x=>x.dnb);
    const batting = appeared.map(x => `<tr><td><b>${x.player.name}</b></td><td>${x.dismissal}</td><td>${x.runs}</td><td>${x.balls}</td><td>${x.fours || '—'}</td><td>${x.sixes || '—'}</td><td>${x.sr === null ? '—' : x.sr.toFixed(1)}</td></tr>`).join('');
    const bowling = inn.bowling.map(x => `<tr><td><b>${x.player.name}</b></td><td>${ballsToOvers(x.balls)}</td><td>${x.runs}</td><td><b>${x.wickets}</b></td><td>${x.economy.toFixed(2)}</td></tr>`).join('');
    const phases = inn.phases ? `<div class="scorecard-phase-strip"><div><span>POWERPLAY</span><b>${inn.phases.pp}</b></div><div><span>OVERS 7-15</span><b>${inn.phases.mid}</b></div><div><span>OVERS 16-20</span><b>${inn.phases.death}</b></div></div>` : '';
    const dnbLine = dnb.length ? `<div class="scorecard-dnb"><span>Did not bat</span><b>${dnb.map(x=>x.player.name).join(', ')}</b></div>` : '';
    return `<section class="scorecard-innings"><div class="scorecard-innings-head"><h3>${inn.club.name}</h3><div class="scorecard-total">${inn.total}/${inn.wickets} <span style="font-family:Arial,sans-serif;font-size:11px;color:var(--muted);font-weight:700">(${inn.overs})</span></div></div>${phases}<div class="scorecard-section"><span class="scorecard-section-title">Batting</span><table class="scorecard-table batting"><thead><tr><th>Batter</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead><tbody>${batting}</tbody></table>${dnbLine}<div class="scorecard-extras"><span>Extras${inn.extrasBreakdown?` <small>(w ${inn.extrasBreakdown.wides}, nb ${inn.extrasBreakdown.noBalls}, b ${inn.extrasBreakdown.byes}, lb ${inn.extrasBreakdown.legByes})</small>`:''}</span><b>${inn.extras}</b></div></div><div class="scorecard-section"><span class="scorecard-section-title">Bowling</span><table class="scorecard-table bowling"><thead><tr><th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr></thead><tbody>${bowling}</tbody></table></div></section>`;
  }

  function openResultScorecard(res, label) {
    if (!res || !res.scorecard) return toast('Scorecard unavailable');
    const winner = res.winner;
    const loser = winner.abbr === res.home.abbr ? res.away : res.home;
    const winInn = winner.abbr === res.home.abbr ? res.homeInnings : res.awayInnings;
    const loseInn = winner.abbr === res.home.abbr ? res.awayInnings : res.homeInnings;
    const standout=matchStandout(res);
    openModal(`<div class="scorecard-shell"><span class="kicker">${label}</span><h2>${res.home.name} v ${res.away.name}</h2><div class="scorecard-meta">${res.home.ground} · ${(res.weather||matchWeather(res.home,res.round||15,state.year||2008)).label}</div><div class="scorecard-match-summary"><div class="scorecard-result-line"><span>RESULT</span><b>${winner.name} won ${res.marginText || `· ${winInn.total}/${winInn.wickets} to ${loseInn.total}/${loseInn.wickets}`}</b></div>${standout?`<div class="scorecard-summary-standout"><span>STANDOUT</span><b>${standout.player.name}</b><small>${standout.line}</small></div>`:''}</div>${res.scorecard.innings.map(scorecardInningsMarkup).join('')}<div class="close-row"><button class="button primary" onclick="GCC.closeModal()">CLOSE SCORECARD</button></div></div>`);
  }

  function openScorecard(round) {
    const res = state.results.find(x => x.round === round);
    if (res) openResultScorecard(res, `ROUND ${round} SCORECARD`);
  }

  function openFinalsScorecard(stage, index = 0) {
    if (!state.finals) return;
    const res = stage === 'gf' ? state.finals.gf : state.finals.semis[index];
    if (res) openResultScorecard(res, stage === 'gf' ? 'GRAND FINAL SCORECARD' : `SEMI-FINAL ${index + 1} SCORECARD`);
  }

  function proceedPostSeason() {
    if (state.round < 14) return;
    if ((state.regularSeasonPosition || 99) <= 4) prepareFinals();
    else { renderSeasonReview(); go('review'); }
  }

  function prepareFinals() {
    const top = standings().slice(0, 4).map(x => x.club);
    state.finals = { top, semis: [], gf: null, gfPair: null, stage:'ready', running:false };
    renderFinals();
    go('finals');
  }

  function finalsMatchMarkup(label, home, away, result = null) {
    const userMatch = [home.abbr, away.abbr].includes(state.userClub.abbr);
    const userWon = !!(userMatch && result && result.winner.abbr === state.userClub.abbr);
    const resultClass = userMatch && result ? (userWon ? ' user-win' : ' user-loss') : '';
    const row = (club, inningsData) => `<div class="final-team"><div class="club-mark" style="--club:${club.c};--club-accent:${club.a || 'transparent'};--club-text:${club.t || '#112018'}">${club.abbr}</div><div><b>${club.name}</b><span>${club.ground}</span></div><span class="final-score ${result && result.winner.abbr === club.abbr ? 'final-winner' : ''}">${inningsData ? `${inningsData.total}/${inningsData.wickets}` : '—'}</span></div>`;
    const link = result ? `<button class="scorecard-link final-scorecard-link" onclick="GCC.openFinalsScorecard('${result === state.finals?.gf ? 'gf' : 'semi'}',${result === state.finals?.gf ? 0 : Math.max(0,state.finals?.semis?.indexOf(result) || 0)})">OPEN SCORECARD</button>` : '';
    const resultLine = result ? `<div class="final-result-strip ${userMatch ? (userWon?'win':'loss') : ''}"><span>RESULT</span><b>${result.winner.name} won ${result.marginText || ''}</b></div>` : '';
    return `<div class="final-match ${userMatch ? 'user-match' : ''}${resultClass}"><span class="match-label">${label}</span>${row(home, result && result.homeInnings)}${row(away, result && result.awayInnings)}${resultLine}${link}</div>`;
  }

  function finalsExperienceCard(label, home, away, result = null, context = '') {
    const clean=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const mark=c=>`<div class="club-mark" style="--club:${c.c};--club-accent:${c.a||'transparent'};--club-text:${c.t||'#112018'}">${c.abbr}</div>`;
    const resultReady=!!result;
    const won=resultReady&&result.winner.abbr===state.userClub.abbr;
    const userIn=[home.abbr,away.abbr].includes(state.userClub.abbr);
    const homeScore=resultReady?`${result.homeInnings.total}/${result.homeInnings.wickets}`:'—';
    const awayScore=resultReady?`${result.awayInnings.total}/${result.awayInnings.wickets}`:'—';
    const standout=resultReady?matchStandout(result):null;
    const status=resultReady?(userIn?(won?'WIN':'LOSS'):`${result.winner.abbr} WIN`):'MATCHDAY';
    return `<div class="finals-event-card ${resultReady?(userIn?(won?'event-win':'event-loss'):'event-result'):'event-ready'}"><div class="finals-event-top"><span>${label}</span><b>${status}</b></div><div class="finals-event-score"><div>${mark(home)}<span>${clean(home.name)}</span><strong>${homeScore}</strong></div><em>v</em><div>${mark(away)}<span>${clean(away.name)}</span><strong>${awayScore}</strong></div></div>${context?`<p>${context}</p>`:''}${standout?`<div class="finals-event-standout"><span>STANDOUT</span><b>${clean(standout.player.name)}</b><small>${clean(standout.line)}</small></div>`:''}${resultReady?`<button class="scorecard-link" onclick="GCC.openFinalsScorecard('${result===state.finals?.gf?'gf':'semi'}',${result===state.finals?.gf?0:Math.max(0,state.finals?.semis?.indexOf(result)||0)})">OPEN SCORECARD</button>`:''}</div>`;
  }

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

  function finalsSeasonContext(a, b) {
    const top=state.finals?.top || [];
    const aSeed=top.findIndex(c=>c.abbr===a.abbr)+1;
    const bSeed=top.findIndex(c=>c.abbr===b.abbr)+1;
    const seedLine=aSeed&&bSeed ? `${a.name} finished ${ordinal(aSeed)}; ${b.name} finished ${ordinal(bSeed)}.` : '';
    const meetings=state.results.filter(res=>{
      const pair=[res.home.abbr,res.away.abbr];
      return pair.includes(a.abbr)&&pair.includes(b.abbr);
    });
    if(!meetings.length) return seedLine;
    const aWins=meetings.filter(x=>x.winner.abbr===a.abbr).length;
    const bWins=meetings.filter(x=>x.winner.abbr===b.abbr).length;
    let meetingLine='';
    if(meetings.length===1){
      const m=meetings[0];
      meetingLine=`Earlier this season, ${m.winner.name} won ${m.marginText || ''}.`;
    } else if(aWins===meetings.length) meetingLine=`${a.name} won both regular-season meetings.`;
    else if(bWins===meetings.length) meetingLine=`${b.name} won both regular-season meetings.`;
    else meetingLine='The regular-season meetings were split 1–1.';
    return `${seedLine} ${meetingLine}`.trim();
  }

  function finalsMatchupRead(a, b) {
    const ap = effectiveProfile(a), bp = effectiveProfile(b);
    const metrics = [['powerplay batting','powerplayBat'],['finishing','finishing'],['new ball','newBall'],['middle-overs bowling','middleBowl'],['death bowling','death'],['fielding','fielding']];
    const diffs = metrics.map(([label,key]) => [label, ap[key]-bp[key]]).sort((x,y)=>Math.abs(y[1])-Math.abs(x[1]));
    const edge = diffs[0];
    if (edge[1] > 0) return `Your best matchup is ${edge[0]}. ${a.ground === b.ground ? '' : `The venue still matters, but `}if your XI gets that phase right, it can decide the game.`;
    return `${b.name} have the better matchup in ${edge[0]}. That is the phase you need to get right.`;
  }

  function finalsResultRead(res, grandFinal = false) {
    const userIn = [res.home.abbr,res.away.abbr].includes(state.userClub.abbr);
    if (!userIn) return grandFinal ? `${res.winner.name} win the first GCC Grand Final after ${res.home.name} made ${res.homeInnings.total}/${res.homeInnings.wickets} and ${res.away.name} made ${res.awayInnings.total}/${res.awayInnings.wickets}.` : `${res.winner.name} advance after ${res.home.name} made ${res.homeInnings.total}/${res.homeInnings.wickets} and ${res.away.name} made ${res.awayInnings.total}/${res.awayInnings.wickets}.`;
    const mine = res.home.abbr === state.userClub.abbr ? res.homeInnings : res.awayInnings;
    const theirs = res.home.abbr === state.userClub.abbr ? res.awayInnings : res.homeInnings;
    const opp = res.home.abbr === state.userClub.abbr ? res.away : res.home;
    const won = res.winner.abbr === state.userClub.abbr;
    const phases = [['powerplay',mine.pp-theirs.pp],['middle overs',mine.mid-theirs.mid],['death',mine.death-theirs.death]].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
    const resultLead = grandFinal ? (won ? 'You won the first GCC Grand Final' : `${opp.name} won the first GCC Grand Final`) : (won ? 'You won' : `${opp.name} won`);
    const standout=matchStandout(res);
    const standoutLine=standout?` ${standout.player.name} was the standout with ${standout.line}.`:'';
    return `${resultLead} ${res.marginText || ''}. ${mine.total}/${mine.wickets} to ${theirs.total}/${theirs.wickets}. The biggest swing came in the ${phases[0][0]} (${phases[0][1] >= 0 ? '+' : ''}${phases[0][1]} to you).${standoutLine}`;
  }

  function advanceFinals() {
    if(!state.finals || state.finals.stage!=='semis') return;
    const top=state.finals.top, semi1=state.finals.semis[0], semi2=state.finals.semis[1];
    const seed=c=>top.findIndex(x=>x.abbr===c.abbr);
    const host=seed(semi1.winner)<seed(semi2.winner)?semi1.winner:semi2.winner;
    const away=host.abbr===semi1.winner.abbr?semi2.winner:semi1.winner;
    state.finals.gfPair={home:host,away};
    state.finals.stage='gf-ready';
    renderFinals();
  }

  function simulateFinals() {
    if (!state.finals || state.finals.running) return;
    const f=state.finals;
    if(f.stage==='ready') {
      f.running=true;
      const top=f.top;
      f.semis=[simulateKnockout(top[0],top[3],15),simulateKnockout(top[1],top[2],15)];
      f.stage='semis'; f.running=false; renderFinals(); return;
    }
    if(f.stage==='gf-ready') {
      f.running=true;
      f.gf=simulateKnockout(f.gfPair.home,f.gfPair.away,16);
      state.champion=f.gf.winner;
      f.stage='done'; f.running=false; renderFinals();
    }
  }

  function resolveCpuFinalsOffscreen() {
    if (state.round < 14) return null;
    if (state.champion) return state.champion;
    const top = standings().slice(0, 4).map(x => x.club);
    if (top.length !== 4) return null;
    const semis = [simulateKnockout(top[0], top[3], 15), simulateKnockout(top[1], top[2], 15)];
    const seed = c => top.findIndex(x => x.abbr === c.abbr);
    const host = seed(semis[0].winner) < seed(semis[1].winner) ? semis[0].winner : semis[1].winner;
    const away = host.abbr === semis[0].winner.abbr ? semis[1].winner : semis[0].winner;
    const gf = simulateKnockout(host, away, 16);
    state.finals = { top, semis, gf, gfPair:{home:host,away}, stage:'done', running:false };
    state.champion = gf.winner;
    return state.champion;
  }

  function simulateKnockout(home, away, weatherRound=15) {
    const pair=simulateInningsPair(home,away,weatherRound);
    const hi=pair.hi, ai=pair.ai, winner=pair.winner;
    const detailSeed = `final-${home.abbr}-${away.abbr}-${pair.firstClub.abbr}-${hi.total}-${ai.total}-${state.teamGames[home.abbr] || 0}`;
    const homeExtras = hi.extrasBreakdown || scorecardExtrasBreakdown(hi.total, detailSeed + ':he');
    const awayExtras = ai.extrasBreakdown || scorecardExtrasBreakdown(ai.total, detailSeed + ':ae');
    const homeRuns = hi.batterRuns || allocateRuns(home, Math.max(0,hi.total-homeExtras.total), hi.wickets, detailSeed + ':home');
    const awayRuns = ai.batterRuns || allocateRuns(away, Math.max(0,ai.total-awayExtras.total), ai.wickets, detailSeed + ':away');
    const scorecard = buildMatchScorecard(home, away, hi, ai, homeRuns, awayRuns, homeExtras, awayExtras, detailSeed, pair.firstClub);
    const homeWickets=scorecard.wickets.home, awayWickets=scorecard.wickets.away;
    const homeCard=scorecardInningsFor(scorecard,home), awayCard=scorecardInningsFor(scorecard,away);
    recordMatchStats(home, homeCard.batting, awayCard.bowling);
    recordMatchStats(away, awayCard.batting, homeCard.bowling);
    updateFormForMatch(home, away, scorecard);
    const marginText=resultMarginText(home,away,hi,ai,winner,pair.tieBreak,pair);
    return { home, away, homeInnings: hi, awayInnings: ai, battingFirst:pair.firstClub, battingSecond:pair.secondClub, winner, tieBreak:pair.tieBreak, superOver:pair.superOver, marginText, weather:pair.weather, scorecard, performance:{homeRuns,awayRuns,homeWickets,awayWickets} };
  }

  function openSeasonReview() {
    renderSeasonReview();
    go('review');
  }

  function reviewSeasonValue(st) {
    if(!st) return 0;
    // Performance-only season value. Runs and wickets remain the anchors; efficiency only
    // nudges the comparison so a high-volume but costly role does not win automatically.
    const batEfficiency = st.balls ? (st.runs - st.balls*1.30)*.35 : 0;
    const overs = st.bowlBalls ? st.bowlBalls/6 : 0;
    const econ = economyRate(st);
    const bowlEfficiency = overs && econ !== null ? (8.2-econ)*overs*.50 : 0;
    const milestones = (st.bestRuns >= 50 ? 8 : 0) + (st.bestWickets >= 3 ? 8 : 0);
    return st.runs + batEfficiency + st.wickets*22 + bowlEfficiency + milestones;
  }

  function seasonDefiningMatch() {
    const matches=completedUserMatches(true);
    if(!matches.length) return null;
    if(state.finals?.gf && [state.finals.gf.home.abbr,state.finals.gf.away.abbr].includes(state.userClub.abbr)) return state.finals.gf;
    const userSemi=(state.finals?.semis||[]).find(x=>[x.home.abbr,x.away.abbr].includes(state.userClub.abbr));
    if(userSemi) return userSemi;
    const regular=[...matches].filter(x=>x.round);
    if(!regular.length) return matches[matches.length-1];
    const meaningful=regular.filter(x=>(x.round||0)>=3);
    const pool=meaningful.length?meaningful:regular;
    return pool.sort((a,b)=>{
      const aSwing=Math.abs((a.ladderAfter||0)-(a.ladderBefore||0));
      const bSwing=Math.abs((b.ladderAfter||0)-(b.ladderBefore||0));
      const aClose=Math.max(0,12-Math.abs((a.homeInnings?.total||0)-(a.awayInnings?.total||0)))/12;
      const bClose=Math.max(0,12-Math.abs((b.homeInnings?.total||0)-(b.awayInnings?.total||0)))/12;
      const aScore=aSwing*5 + (a.round||0)/14 + aClose;
      const bScore=bSwing*5 + (b.round||0)/14 + bClose;
      return bScore-aScore;
    })[0];
  }

  function reviewMatchRow(res) {
    if(!res) return null;
    const home=res.home.abbr===state.userClub.abbr;
    const mine=home?res.homeInnings:res.awayInnings;
    const theirs=home?res.awayInnings:res.homeInnings;
    const opp=home?res.away:res.home;
    const won=res.winner.abbr===state.userClub.abbr;
    const stage=res.round?`Round ${res.round}`:(state.finals?.gf===res?'Grand Final':'Semi-final');
    return {res,mine,theirs,opp,won,stage,gap:Math.abs(mine.total-theirs.total)};
  }

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

  function reviewWeaknessExplanation(key, profile, value) {
    const fine=value>=80;
    const reads={
      powerplayBat:fine?'The starts are already strong. The next gain is turning more good powerplays into dominant ones.':'Too many innings begin without enough pressure on the bowling side. The middle order is being asked to repair the start.',
      middleBat:fine?'The middle overs are stable. The next gain is finding a little more strike rotation without losing control.':'Overs 7–15 are stalling too often. The side needs a batter who can keep the innings moving against spin and change-ups.',
      finishing:fine?'The back end is productive. The next gain is one more reliable closer for nights when the first option misses.':'The final five overs are not producing enough clean acceleration. The side needs more power and composure at the finish.',
      battingResources:fine?'The batting has depth. The next gain is making the seventh and eighth options more matchup-proof.':'The batting runs out of trusted options too quickly. One early collapse leaves too much for the lower order.',
      newBall:fine?'The new-ball pair is working. The next gain is a third option who can protect the matchup.':'The first six overs are not creating enough control or wickets. The attack needs a more reliable new-ball option.',
      middleBowl:fine?'The middle overs are sound. The next gain is another wicket-taking option when the main matchup is wrong.':'Overs 7–15 are too easy to line up. The attack needs more control, variation or spin through the middle.',
      death:fine?'The death plan is holding. The next gain is a second closer so one bad matchup does not decide the last five.':'The last five overs are costing too much. The side needs another bowler with control and variation under pressure.',
      bowlingResources:fine?'The attack has enough overs. The next gain is making the sixth option genuinely trustworthy.':'There are not enough dependable overs in the XI. Too much workload is falling on the same few bowlers.',
      fielding:fine?'The fielding is already a strength. The next gain is turning more half-chances into wickets.':'Too many small runs and chances are being given back in the field.',
      chemistry:fine?'The XI is settled. The next gain is continuity through selection rather than another reshuffle.':'The side is still learning its jobs. Role fit and continuity are costing small moments across matches.'
    };
    return reads[key]||'This is the clearest area where a small structural change can improve the side.';
  }

  function seasonReviewMoments() {
    const matches=completedUserMatches(true);
    if(!matches.length) return '<div class="review-item"><b>No completed matches</b><span>The scorecards will build this section once the season starts.</span></div>';
    const rows=matches.map(reviewMatchRow).filter(Boolean);
    const defining=reviewMatchRow(seasonDefiningMatch());
    const highest=[...rows].sort((a,b)=>b.mine.total-a.mine.total)[0];
    const squeeze=[...rows].sort((a,b)=>a.theirs.total-b.theirs.total)[0];
    const close=[...rows].sort((a,b)=>a.gap-b.gap)[0];
    const item=(title,x,text,cls='')=>`<div class="review-item ${cls}"><b>${title} · ${x.stage}</b><span>${text}</span></div>`;
    const out=[];
    const seen=new Set();
    if(defining){
      out.push(item('Defining match',defining,`${defining.won?'Beat':'Lost to'} ${defining.opp.name} ${defining.res.marginText || ''}. ${defining.mine.total}/${defining.mine.wickets} to ${defining.theirs.total}/${defining.theirs.wickets}.`,'defining'));
      seen.add(defining.res);
    }
    const candidates=[
      highest && ['Highest total',highest,`${state.userClub.name} made ${highest.mine.total}/${highest.mine.wickets} against ${highest.opp.name}${highest.won?' in a win':' in a loss'}.`],
      squeeze && ['Best bowling day',squeeze,`${squeeze.opp.name} were held to ${squeeze.theirs.total}/${squeeze.theirs.wickets}. ${squeeze.won?'You finished the job.':'The chase still got away.'}`],
      close && ['Tightest finish',close,`${close.won?'Won':'Lost'} ${close.res.marginText || `after ${close.mine.total}/${close.mine.wickets} and ${close.theirs.total}/${close.theirs.wickets}`} against ${close.opp.name}.`]
    ].filter(Boolean);
    for(const [title,row,text] of candidates){
      if(out.length>=3) break;
      if(seen.has(row.res)) continue;
      out.push(item(title,row,text));
      seen.add(row.res);
    }
    return out.join('');
  }

  function seasonReviewNarrative(pos, champion, reachedFinal) {
    const profile = R.profile(userProfileXI(), { matchesTogether: state.teamGames[state.userClub.abbr] || 0 });
    const players = userSeasonPlayers().filter(x=>x.st.matches>0);
    const topBat = [...players].filter(x=>x.st.balls>0).sort((a,b)=>b.st.runs-a.st.runs || (battingAverage(b.st)||0)-(battingAverage(a.st)||0))[0];
    const topBowl = [...players].filter(x=>x.st.bowlBalls>0).sort((a,b)=>b.st.wickets-a.st.wickets || (bowlingAverage(a.st) ?? 999)-(bowlingAverage(b.st) ?? 999))[0];
    const leaders = [];
    if (topBat) leaders.push(`${topBat.p.name} led the batting with ${topBat.st.runs} runs at ${stat1(battingAverage(topBat.st))}`);
    if (topBowl) leaders.push(`${topBowl.p.name} led the attack with ${topBowl.st.wickets} wickets at ${stat1(bowlingAverage(topBowl.st))}`);
    const player = leaders.length ? `${leaders.join('; ')}.` : 'The scorecards are in.';
    const structural = profile.roleFit < 84 ? ' Too many players were doing jobs that did not suit them.' : profile.xiShape < 76 ? ' The XI had enough talent. The batting order and bowling attack did not fit together.' : profile.death < 70 ? ' The death overs were the weak point.' : profile.keeping < 65 ? ' You played without a recognised keeper and paid for it behind the stumps.' : profile.bowlingResources < 70 ? ' The attack ran short of trustworthy overs.' : profile.finishing < 72 ? ' The batting did not have enough at the back end.' : ' The XI was balanced. From there, it came down to execution, matchups and form.';
    return player + structural;
  }

  function statsHtml(rows) {
    return rows.map(([l, v]) => `<div class="stat"><span>${l}</span><b>${v}</b></div>`).join('');
  }

  function byId(id) {
    return state.pool.find(p => p.id === id);
  }

  const groundStories = {
    CSK:'The surface asks batters to manufacture pace. Spin stays in the game for long stretches, and the bigger pockets reward placement and running as much as clean hitting.',
    MI:'The ball comes onto the bat and the shorter dimensions bring power into play. Seamers still have something early, but a missed length can disappear quickly.',
    RR:'This is a ground for control rather than free hitting. The ball can grip through the middle overs and the larger pockets give bowlers room to defend.',
    KKR:'Spin stays involved, but batters who settle can still score by using the pace available and working the field. Momentum can shift quickly once someone gets in.',
    RCB:'There is very little protection for a missed length. The short boundaries keep the game alive deep into an innings and put a premium on execution at the death.',
    DC:'Conditions can change within an innings. There is enough grip to reward variation, but not enough in the surface for either batting or bowling plans to become automatic.',
    SIX:'No phase gets a free ride here. There is enough assistance to reward good bowling, while batters who manage the dimensions and rotate well can still control an innings.',
    THU:'The surface is relatively honest, but the square pockets bring boundary-hitting into the contest. Bowlers need clear plans once batters begin targeting width.',
    STA:'The square boundaries change the value of every shot. Pace carries reasonably well, but placement, running and protecting the big side matter as much as raw power.',
    REN:'The ball skids on and the fast outfield keeps pressure on fielding sides. Batters get value for timing; bowlers cannot rely on the surface to slow the game down.',
    SCO:'The new ball gets through quickly and carries hard. Batters who handle pace can score, but tentative footwork is exposed and quick bowlers stay dangerous for longer.',
    STR:'A true surface gives both sides a fair contest. Batters get value when set, while bowlers need changes of pace and boundary protection rather than waiting for the pitch to help.',
    HEA:'Extra bounce keeps the new ball alive. Batters who get on top of it can use the pace, but loose horizontal-bat shots bring the fielders into play.',
    HUR:'The new ball can move and carry, especially when the breeze gets involved. Batters may need time before expanding, with the larger pockets offering some protection to bowlers.',
    SUR:'The surface generally lets batters play through the line and the shorter dimensions reward clean striking. Bowlers need to win with variation and execution rather than wait for help.',
    LAN:'There is something here for more than one kind of bowler. Seam can matter early and spin can stay relevant later, making changes of pace and match-ups especially useful.',
    YOR:'The new ball is a genuine factor. Movement and carry can punish loose technique early, while batters who survive that spell can find the game settling into a more even contest.',
    NOT:'The ground invites aggression in the powerplay. The shorter boundaries punish missed lengths quickly, so new-ball wickets can matter more than simply containing the scoring.',
    SOM:'Boundary pressure is constant here. A small mistake can become six, so defending totals demands clear plans and batters with range can change a game very quickly.',
    HAM:'There is enough seam to reward a disciplined attack without making batting impossible. With slightly larger pockets, control and good field placement can keep pressure building.'
  };

  function groundStory(c) {
    if (groundStories[c.abbr]) return groundStories[c.abbr];
    const pace = c.conditions.pace || 0;
    const spin = c.conditions.spin || 0;
    const boundary = c.conditions.boundary || 0;
    const parts = [];
    if (pace >= 4) parts.push('There is genuine pace and carry with the new ball');
    else if (pace >= 2) parts.push('Seamers get some assistance early');
    else if (pace <= -1) parts.push('The new ball offers limited help off the surface');
    if (spin >= 3) parts.push('Spin can grip and stay in the game through the middle overs');
    else if (spin >= 1) parts.push('There is enough grip to keep spin relevant');
    if (boundary >= 4) parts.push('The rope comes quickly, so missed lengths can disappear');
    else if (boundary <= -3) parts.push('The larger pockets keep twos, fielding and placement in the game');
    if (!parts.length) return 'A balanced T20 surface with no single condition dominating selection.';
    return `${parts.join('. ')}.`;
  }

  function compactGroundReportHtml(c, context = 'club') {
    const pace = groundBand(c.conditions.pace || 0, 'pace');
    const spin = groundBand(c.conditions.spin || 0, 'spin');
    const boundary = groundBand(c.conditions.boundary || 0, 'boundary');
    const line = (label, band, isBoundary = false) => `<div class="ground-snapshot-line"><span>${label}</span>${groundScaleHtml(band.level, isBoundary)}<strong>${band.label}</strong></div>`;
    const body = context === 'reveal' ? `<div class="ground-snapshot-body"><div class="ground-snapshot-pitch" aria-hidden="true"><i class="crease top"></i><i class="crease bottom"></i><i class="stumps top"></i><i class="stumps bottom"></i></div><p>${groundStory(c)}</p></div>` : '';
    return `<div class="ground-snapshot ${context === 'reveal' ? 'ground-snapshot-reveal' : 'ground-snapshot-club'}">
      <div class="ground-snapshot-head">
        <div><span class="ground-snapshot-kicker">HOME GROUND</span><b>${c.ground}</b></div>
        <span class="ground-snapshot-trait">${c.trait}</span>
      </div>
      ${body}
      <div class="ground-snapshot-lines">
        ${line('Pace & Bounce', pace)}
        ${line('Spin', spin)}
        ${line('Boundary', boundary, true)}
      </div>
    </div>`;
  }


  function groundBand(value, type) {
    if (type === 'boundary') {
      if (value >= 4) return { label: 'Short', level: 5 };
      if (value >= 2) return { label: 'Good value', level: 4 };
      if (value <= -3) return { label: 'Large', level: 1 };
      if (value <= -1) return { label: 'Harder to clear', level: 2 };
      return { label: 'Balanced', level: 3 };
    }
    if (type === 'spin') {
      if (value >= 4) return { label: 'Strong grip', level: 5 };
      if (value >= 2) return { label: 'Some grip', level: 4 };
      if (value >= 1) return { label: 'Slight grip', level: 3 };
      if (value <= -1) return { label: 'Skids on', level: 1 };
      return { label: 'Neutral', level: 2 };
    }
    if (value >= 4) return { label: 'Extra carry', level: 5 };
    if (value >= 2) return { label: 'Some help', level: 4 };
    if (value >= 1) return { label: 'Slight help', level: 3 };
    if (value <= -1) return { label: 'Little help', level: 1 };
    return { label: 'Neutral', level: 2 };
  }

  function groundScaleHtml(level, boundary = false) {
    return `<span class="ground-scale ${boundary ? 'boundary' : ''}">${[1,2,3,4,5].map(i => `<i class="${i <= level ? 'on' : ''}"></i>`).join('')}</span>`;
  }

  function groundXIRead(c, profile, xiCount) {
    if (!xiCount) return 'Name your XI and this report will tell you how the side is likely to suit the ground.';
    const pace = c.conditions.pace || 0;
    const spin = c.conditions.spin || 0;
    const boundary = c.conditions.boundary || 0;
    const reads = [];
    if (pace >= 4) {
      if (profile.newBall >= 82) reads.push('Your new-ball attack is well suited to the extra pace and carry');
      else if (profile.newBall < 70) reads.push('The surface offers the new ball more than your current XI is set up to exploit');
    }
    if (spin >= 3) {
      if (profile.middleBowl >= 82) reads.push('Your middle-overs attack has the control to use the grip on offer');
      else if (profile.middleBowl < 70) reads.push('There is grip available, but this XI may struggle to turn it into middle-overs pressure');
    }
    if (boundary >= 4) {
      if (profile.finishing >= 82 || profile.powerplayBat >= 84) reads.push('The batting has enough power to make the shorter boundaries count');
      else if (profile.finishing < 70) reads.push('Short boundaries raise the premium on boundary-hitting late in the innings');
      if (profile.death < 70) reads.push('The same dimensions leave a thin death attack exposed');
    } else if (boundary <= -3) {
      if (profile.fielding >= 82) reads.push('Your fielding gives this XI a genuine edge across the bigger pockets');
      else if (profile.fielding < 70) reads.push('The bigger pockets put more pressure on your current fielding');
    }
    if (!reads.length) {
      if (profile.overall >= 82) return 'This is a fairly even ground, and your XI looks balanced enough to adapt rather than chase one condition.';
      return 'This ground is fairly even. The bigger question is whether the XI has enough quality across all six phases.';
    }
    return `${reads.slice(0,2).join('. ')}.`;
  }

  function groundReportHtml(c, profile, xiCount, context={}) {
    const weather=context.weather||c.weather||WEATHER_TYPES.SETTLED;
    const pace = groundBand(c.conditions.pace || 0, 'pace');
    const spin = groundBand(c.conditions.spin || 0, 'spin');
    const boundary = groundBand(c.conditions.boundary || 0, 'boundary');
    const kicker=context.round?`ROUND ${context.round} · ${context.home?'HOME':'AWAY'} · ${weather.label.toUpperCase()}`:'HOME GROUND';
    return `<div class="ground-report ground-report-selection">
      <div class="ground-report-top">
        <div class="ground-report-copy">
          <span class="ground-report-kicker">${kicker}</span>
          <div class="ground-report-name"><b class="ground-report-title">${c.ground}</b><span class="ground-report-trait">${c.trait}</span></div>
          <span class="ground-report-story">${weather.read}</span>
        </div>
      </div>
      <div class="ground-read-grid">
        <div class="ground-read"><span class="ground-read-label">Pace</span><span class="ground-read-value">${pace.label}</span>${groundScaleHtml(pace.level)}</div>
        <div class="ground-read"><span class="ground-read-label">Spin</span><span class="ground-read-value">${spin.label}</span>${groundScaleHtml(spin.level)}</div>
        <div class="ground-read"><span class="ground-read-label">Boundary</span><span class="ground-read-value">${boundary.label}</span>${groundScaleHtml(boundary.level, true)}</div>
      </div>
      <div class="ground-xi-read"><b>SELECTION READ</b><span>${groundXIRead(c, profile, xiCount)}</span></div>
    </div>`;
  }

  function sentenceCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function fitClubMarks(root=document) {
    root.querySelectorAll('.club-mark').forEach(el => {
      const len=(el.textContent||'').trim().length;
      el.dataset.abbrLength=String(len);
      el.style.removeProperty('font-size');
      const width=el.clientWidth;
      if(!width) return;
      const safe=Math.max(8,width-Math.max(4,width*.18));
      let size=parseFloat(getComputedStyle(el).fontSize)||11;
      const floor=Math.max(5,Math.min(8,width*.24));
      let guard=0;
      while(el.scrollWidth>safe && size>floor && guard<20){
        size-=.5; el.style.fontSize=`${size}px`; guard++;
      }
    });
  }
  const clubMarkObserver=new MutationObserver(mutations=>{
    let needed=false;
    for(const m of mutations){ if(m.addedNodes.length){needed=true;break;} }
    if(needed) requestAnimationFrame(()=>fitClubMarks());
  });
  clubMarkObserver.observe(document.body,{childList:true,subtree:true});
  fitClubMarks();

  renderNav('world');
  window.GCC8_FOUNDATION_READ={roleTags:playerRoleTags,playerNote,groundStory,groundBand,projectedDraftProfile,draftSnapshot,effectiveProfile,simulateSuperOver,winningChaseTotal,reconcileChasePhases,teamAverages:userTeamAverages,leagueAverages:leagueInningsAverages,standout:matchStandout,pauseDraft:()=>{clearTimeout(draftAutoTimer);draftAutoTimer=null}};
  return {
    state,
    go,
    newWorld,
    finishLeagueReveal,
    cycleRevealPace,
    skipLeagueReveal,
    skipDraftReveal,
    selectClub,
    confirmClub,
    openHow,
    openWorldDossier,
    closeModal,
    backdropClose,
    runRecruitment,
    cycleRecruitSpeed,
    skipRecruitment,
    toggleRecruitWire,
    setupDraft,
    beginDraft,
    cycleDraftPace,
    skipToMyPick,
    setFilter,
    showMoreDraftPlayers,
    toggleDraftBoard,
    renderPlayers,
    userDraft,
    enterTeamRoom,
    toggleXI,
    removeXI,
    beginSwap,
    cancelSwap,
    replaceXI,
    moveBattingPlayer,
    showManualXI,
    selectRecommendedXI,
    clearXI,
    autoOrderXI,
    allowedBattingSlots,
    assignBattingSlots,
    openRating,
    startSeason,
    playNextRound,
    openMatchdayPreview,
    simulateSeason,
    cycleSeasonPace,
    updateSeasonTicker,
    openScorecard,
    openFinalsScorecard,
    proceedPostSeason,
    enterFinalsFromModal,
    advanceFinals,
    simulateFinals,
    resolveCpuFinalsOffscreen,
    openSeasonReview,
    reviewSeasonValue,
    renderTeam,
    renderSeason,
    setSeasonView,
    renderFinals,
    renderSeasonReview,
    bestXI,
    byId,
    nextUserFixture,
    matchWeather,
    matchGroundForFixture,
    toast
  };
})();

