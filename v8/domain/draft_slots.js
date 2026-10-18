  function draftSlots(){
    const o=state.dynasty.offseason,slots=[],needs=o.draftNeeds||Object.fromEntries((o.lottery||[]).map(a=>[a,Math.max(0,15-rosterIds(a).length)]));
    // Existing drafts have already exposed their slots. Adopt the corrected rule
    // when a new annual draft starts, without reindexing an older saved draft.
    const split=o.releasePickPolicy===1;
    const ordinary=Object.fromEntries((o.lottery||[]).map(a=>{
      const cuts=a===state.userClub.abbr?(o.voluntaryCuts||[]).length+(o.finalCuts||[]).length:(o.cpuReleases?.[a]||[]).length;
      return [a,Math.min(4,Math.max(0,(needs[a]||0)-(split?cuts:0)))];
    }));
    const maxRounds=Math.max(0,...Object.values(ordinary));
    for(let round=1;round<=maxRounds;round++){
      const order=round%2?o.lottery:[...o.lottery].reverse();
      for(const original of order){if(ordinary[original]<round)continue;const key=`R${round}:${original}`;slots.push({round,original,owner:o.pickOwners[key]||original,key});}
    }
    return slots;
  }
  function slotsWithSupplement(){
    const o=state.dynasty.offseason,slots=draftSlots(),needs=o.draftNeeds||Object.fromEntries((o.lottery||[]).map(a=>[a,Math.max(0,15-rosterIds(a).length)]));
    const owned=Object.fromEntries((o.lottery||[]).map(a=>[a,0]));
    for(const slot of slots)owned[slot.owner]=(owned[slot.owner]||0)+1;
    const maxRound=Math.max(0,...slots.map(x=>x.round));
    // Releases, excess retirements and traded-away vacancy picks are all filled
    // after the ordinary snake, in the unchanged annual lottery order.
    for(const a of o.lottery||[]){const missing=Math.max(0,(needs[a]||0)-(owned[a]||0));for(let i=0;i<missing;i++)slots.push({round:maxRound+i+1,original:a,owner:a,key:`SUP${i+1}:${a}`,supplementary:true});}
    return slots;
  }
  function userOwnsPick(round){
    const o=state.dynasty.offseason;
    if(!o?.lottery?.length||!['market','lottery'].includes(o.phase)||!['R1','R2'].includes(round))return false;
    const original=state.userClub.abbr;
    return draftSlots().some(slot=>slot.key===`${round}:${original}`&&slot.owner===original);
  }
