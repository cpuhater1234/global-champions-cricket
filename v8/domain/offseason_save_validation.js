  // Validate draft administration before it can replace the live career or save.
  if(o){
    if(!record(o.pickOwners)||![0,clubs.length].includes(o.lottery.length)||!unique(o.lottery)||o.lottery.some(a=>!clubs.includes(a))||o.pickCursor>256)return false;
    if(Object.entries(o.pickOwners).some(([key,owner])=>{const parts=key.split(':');return parts.length!==2||!/^R[1-4]$/.test(parts[0])||!clubs.includes(parts[1])||!clubs.includes(owner);} ))return false;
    if(o.retirements.some(r=>!record(r)||!Number.isInteger(r.id)||!ids.has(r.id)||!clubs.includes(r.owner)))return false;
    if([...o.arrivals,...o.voluntaryCuts,...o.finalCuts].some(id=>!Number.isInteger(id)||!ids.has(id)))return false;
    for(const key of ['draftNeeds','preDraftCounts','ordinaryPickCounts'])if(o[key]!=null){
      const values=o[key],max=key==='ordinaryPickCounts'?4:15;
      if(!record(values)||Object.keys(values).length!==clubs.length||clubs.some(a=>!Number.isInteger(values[a])||values[a]<0||values[a]>max))return false;
    }
    if(o.picks.some(p=>!record(p)||!Number.isInteger(p.slot)||p.slot<1||p.slot>256||!Number.isInteger(p.round)||p.round<1||p.round>32||!clubs.includes(p.owner)||p.playerId!==null&&(!Number.isInteger(p.playerId)||!ids.has(p.playerId))))return false;
  }
