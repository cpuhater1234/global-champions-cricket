  let annualDraftTimer=null;
  function runCpuDraftUntilUser(immediate=true){
    clearTimeout(annualDraftTimer);annualDraftTimer=null;
    const o=state.dynasty?.offseason;if(!o||o.phase!=='draft')return;
    const slots=slotsWithSupplement();
    const step=()=>{const slot=slots[o.pickCursor],p=rosterIds(draftOwner(slot)).length<15?cpuDraftPick(draftOwner(slot)):null;o.picks.push({slot:o.pickCursor+1,round:slot.round,owner:draftOwner(slot),playerId:p?.id||null});o.pickCursor++;};
    while(o.pickCursor<slots.length&&(rosterIds(draftOwner(slots[o.pickCursor])).length>=15||(immediate&&draftOwner(slots[o.pickCursor])!==state.userClub.abbr)))step();
    if(o.pickCursor>=slots.length){finishAnnualDraft();return;}
    if(draftOwner(slots[o.pickCursor])===state.userClub.abbr)return;
    annualDraftTimer=setTimeout(()=>{
      annualDraftTimer=null;if(state.dynasty?.offseason!==o||o.phase!=='draft')return;
      step();runCpuDraftUntilUser(false);renderOffseason();autoSave();
    },[520,260,130][state.draftSpeedIndex||0]);
  }

