  // Saved roster ownership is authoritative; selection caches may predate a trade.
  function repairCpuOwnership(){
    if(!state.fullSchedule?.length||!state.userClub||!state.cpuXIs)return;
    const stale=state.league.some(c=>{if(c.abbr===state.userClub.abbr)return false;const ids=state.cpuXIs[c.abbr];return ids!=null&&(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!rosterIds(c.abbr).includes(id)));});
    if(stale){state.cpuXIs={};refreshCpuXIs();}
  }
