  // Natural retirements are never deferred. Only voluntary departures are capped.
  function offseasonTradeCounts(){
    const o=state.dynasty?.offseason;if(!o)return {};
    if(o.tradeDepartures)return o.tradeDepartures;
    // Older saves logged accepted deals but did not store a departure ledger.
    const counts={};
    for(const t of state.dynasty.transactions||[]){
      if(t.year!==state.year||t.type!=='TRADE')continue;
      const pair=/^(\S+) and (\S+) make a deal$/.exec(t.title||'');
      const user=/^(\S+) acquire /.exec(t.title||'');
      const recipient=/ → ([^ ·]+)(?: ·|$)/.exec(t.detail||'');
      const clubs=pair?[pair[1],pair[2]]:user&&recipient?[user[1],recipient[1]]:[];
      for(const a of clubs)if(state.teams[a])counts[a]=(counts[a]||0)+1;
    }
    return counts;
  }
  function clubDepartureBudget(abbr){
    const o=state.dynasty?.offseason;
    if(!o){const b=state.dynasty?.departureBudgetsByYear?.[state.year]?.[abbr]||{retired:0,cuts:0,traded:0};const total=b.retired+b.cuts+b.traded;return {...b,total,remaining:Math.max(0,4-total)};}
    const retired=(o?.retirements||[]).filter(r=>r.owner===abbr).length;
    const cuts=abbr===state.userClub?.abbr?(o?.voluntaryCuts||[]).length+(o?.finalCuts||[]).length:(o?.cpuReleases?.[abbr]||[]).length;
    const traded=offseasonTradeCounts()[abbr]||0,total=retired+cuts+traded;
    return {retired,cuts,traded,total,remaining:Math.max(0,4-total)};
  }
  function recordOffseasonTrade(a,b,outA=1,outB=1){
    const d=ensureDynasty(),o=d.offseason;
    const counts=seasonTradeCounts();d.tradeDealsByYear??={};d.tradeDealsByYear[state.year]={...counts};
    for(const club of [a,b])d.tradeDealsByYear[state.year][club]=(counts[club]||0)+1;
    if(o){o.tradeDepartures={...offseasonTradeCounts()};o.netTradeDepartures??={};for(const [club,n,received]of [[a,outA,outB],[b,outB,outA]]){o.tradeDepartures[club]=(o.tradeDepartures[club]||0)+n;o.netTradeDepartures[club]=(o.netTradeDepartures[club]||0)+n-received;}}
    else {d.departureBudgetsByYear??={};d.departureBudgetsByYear[state.year]??={};for(const [club,n]of [[a,outA],[b,outB]]){const prior=clubDepartureBudget(club);d.departureBudgetsByYear[state.year][club]={retired:prior.retired,cuts:prior.cuts,traded:prior.traded+n};}}
    d.midseasonDone[state.year]=(d.tradeDealsByYear[state.year][state.userClub.abbr]||0)>=2;
  }
  function offseasonTradeBlock(a,b){
    for(const club of [a,b])if(seasonTradeAllowance(club)===0)return `${club===state.userClub.abbr?'Your club':clubByAbbr(club)?.name||club} has already completed two trades this season.`;
    for(const club of [a,b])if(clubDepartureBudget(club).remaining===0)return `${club===state.userClub.abbr?'Your club':clubByAbbr(club)?.name||club} has no voluntary departures left. Retirements, releases and outgoing trades use the four-departure allowance.`;
    return '';
  }
  function voluntaryCutLimit(){const b=clubDepartureBudget(state.userClub.abbr);return Math.min(2,Math.max(0,4-b.retired-b.traded))}

  function seasonTradeCounts(){
    const d=state.dynasty||{},saved=d.tradeDealsByYear?.[state.year];if(saved)return saved;
    const counts={};for(const t of d.transactions||[]){if(t.year!==state.year||t.type!=='TRADE')continue;const pair=/^(\S+) and (\S+) make a deal$/.exec(t.title||''),one=/^(\S+) acquire /.exec(t.title||''),other=/ → ([^ ·]+)(?: ·|$)/.exec(t.detail||'');for(const a of pair?[pair[1],pair[2]]:one&&other?[one[1],other[1]]:[])if(state.teams[a])counts[a]=(counts[a]||0)+1;}
    if(d.midseasonDone?.[state.year])counts[state.userClub.abbr]=Math.max(1,counts[state.userClub.abbr]||0);return counts;
  }
  function seasonTradeAllowance(abbr){return Math.max(0,2-(seasonTradeCounts()[abbr]||0))}
  function snapshotDepartureBudgets(){const d=ensureDynasty();d.departureBudgetsByYear??={};d.departureBudgetsByYear[state.year]=Object.fromEntries(state.league.map(c=>{const b=clubDepartureBudget(c.abbr);return [c.abbr,{retired:b.retired,cuts:b.cuts,traded:b.traded}]}));}

  function lockDraftEntitlements(){const o=state.dynasty.offseason;if(!o||o.ordinaryPickCounts)return;const slots=draftSlots();o.ordinaryPickCounts=Object.fromEntries(o.lottery.map(a=>[a,slots.filter(p=>p.original===a).length]));}
