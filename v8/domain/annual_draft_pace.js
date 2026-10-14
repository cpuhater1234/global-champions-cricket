  let annualDraftTimer=null;
  function runCpuDraftUntilUser(immediate=true){
    clearTimeout(annualDraftTimer);annualDraftTimer=null;
    const o=state.dynasty?.offseason;if(!o||o.phase!=='draft')return;
    const slots=slotsWithSupplement();
    const step=()=>{const slot=slots[o.pickCursor],p=cpuDraftPick(draftOwner(slot));o.picks.push({slot:o.pickCursor+1,round:slot.round,owner:draftOwner(slot),playerId:p?.id||null});o.pickCursor++;};
    if(immediate){while(o.pickCursor<slots.length&&draftOwner(slots[o.pickCursor])!==state.userClub.abbr)step();}
    if(o.pickCursor>=slots.length){finishAnnualDraft();return;}
    if(draftOwner(slots[o.pickCursor])===state.userClub.abbr)return;
    annualDraftTimer=setTimeout(()=>{
      annualDraftTimer=null;if(state.dynasty?.offseason!==o||o.phase!=='draft')return;
      step();runCpuDraftUntilUser(false);renderOffseason();autoSave();
    },[520,260,130][state.draftSpeedIndex||0]);
  }
