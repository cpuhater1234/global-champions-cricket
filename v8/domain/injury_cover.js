  function coverRoot(id){
    const d=state.dynasty,seen=new Set();id=Number(id);
    while(d?.replacementOf?.[id]!=null){if(seen.has(id))return null;seen.add(id);id=Number(d.replacementOf[id]);}
    return id;
  }
  function coverStatus(id){
    const originalId=coverRoot(id),d=state.dynasty,original=pById(originalId),currentCoverId=d?.replacementFor?.[originalId],current=pById(currentCoverId);
    const owner=state.league.find(c=>rosterIds(c.abbr).includes(originalId))?.abbr;
    return {originalId,currentCoverId,originalName:original?.name,coverName:current?.name,owner,canSign:!!(original&&owner&&d.injuries[originalId]?.status==='OUT'&&(!currentCoverId||current&&d.injuries[currentCoverId]?.status==='OUT'))};
  }
  function cpuReplacement(abbr,injured){
    const status=coverStatus(injured?.id);if(!status.canSign||status.owner!==abbr)return;
    injured=pById(status.originalId);const p=replacementPoolFor(injured).sort((a,b)=>tradeValue(b,abbr)-tradeValue(a,abbr))[0];if(!p)return;
    if(status.currentCoverId)resolveReplacementReturn(injured.id,'cover-change');
    p.dynastyReplacement=true;state.teams[abbr].push(p.id);state.dynasty.replacementFor[injured.id]=p.id;state.dynasty.replacementOf[p.id]=injured.id;
    log('REPLACEMENT',`${clubByAbbr(abbr).name} sign ${p.name}`,`Temporary cover for ${injured.name}.`);
  }
  function signReplacement(injuredId,pid){
    const status=coverStatus(injuredId),p=pById(pid),inj=pById(status.originalId),d=ensureDynasty();
    if(!status.canSign||status.owner!==state.userClub.abbr||!p||!replacementPoolFor(inj).some(x=>x.id===p.id))return;
    if(status.currentCoverId)resolveReplacementReturn(inj.id,'cover-change');
    p.dynastyReplacement=true;state.teams[state.userClub.abbr].push(p.id);beginUserTenure(p.id);d.replacementFor[inj.id]=p.id;d.replacementOf[p.id]=inj.id;
    log('REPLACEMENT',`${state.userClub.name} sign ${p.name}`,`Temporary cover for ${inj.name}.`,'good');G.closeModal();base.renderTeam();renderSeasonLayer();autoSave();
  }
  function resolveReplacementReturn(injuredId,reason='return',seen=new Set()){
    injuredId=Number(injuredId);const d=state.dynasty,rid=d.replacementFor[injuredId];if(!rid||seen.has(injuredId))return;seen.add(injuredId);
    const p=pById(rid),inj=pById(injuredId);let leaf=rid;const visited=new Set([injuredId]);
    while(d.replacementFor[leaf]&&!visited.has(leaf)){visited.add(leaf);leaf=d.replacementFor[leaf];}
    const xiIndex=state.xi.indexOf(leaf),orderIndex=state.battingOrder.indexOf(leaf);
    // Older saves may contain cover chains. End descendants before the parent,
    // retaining the terminal player's slot when the original player returns.
    if(d.replacementFor[rid])resolveReplacementReturn(rid,'cover-chain-end',seen);
    const owner=state.league.find(c=>rosterIds(c.abbr).includes(rid));
    if(owner){
      const user=owner.abbr===state.userClub.abbr;if(user)settleUserTenure(rid);
      state.teams[owner.abbr]=rosterIds(owner.abbr).filter(id=>id!==rid);
      if(user){state.xi=state.xi.filter(id=>id!==rid);state.battingOrder=state.battingOrder.filter(id=>id!==rid);
        if(reason==='return'&&xiIndex>=0&&inj&&rosterIds(owner.abbr).includes(injuredId)&&healthyForSelection(inj)&&!state.xi.includes(injuredId)){state.xi.splice(xiIndex,0,injuredId);state.battingOrder.splice(orderIndex<0?xiIndex:orderIndex,0,injuredId);}
        if(state.pendingSwapIn===rid)state.pendingSwapIn=null;
      }
      const detail=reason==='trade'?`${inj?.name||'The covered player'} has left the club.`:reason==='return'?`${inj?.name||'The injured player'} is fit again.`:reason==='cover-change'?'The temporary replacement is unavailable.':'The original cover spell has ended.';
      log('REPLACEMENT',`${p?.name||'Temporary cover'} returns to the player pool`,detail);
    }
    if(p){p.dynastyReplacement=false;p.draftedBy=null;}delete d.replacementFor[injuredId];delete d.replacementOf[rid];
  }
