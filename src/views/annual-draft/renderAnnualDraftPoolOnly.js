function renderAnnualDraftPoolOnly(){
    const players=$('annualDraftPlayers'),controls=$('annualDraftPoolControls');if(!players||!controls)return;
    const o=state.dynasty.offseason,slots=slotsWithSupplement(),current=slots[o?.pickCursor],mine=!!(current&&current.owner===state.userClub.abbr),list=annualDraftFilteredPool(),shown=list.slice(0,annualDraftPoolLimit);
    players.innerHTML=shown.map(p=>annualPlayerCard(p,mine)).join('')||'<div class="empty">No players match this search.</div>';
    const count=Math.min(shown.length,list.length),context=annualDraftSearch.trim()||annualDraftFilter!=='ALL'?`${count} of ${list.length} matching players`:`${count} of ${list.length} available players`;
    controls.innerHTML=`<span>${context}</span>${count<list.length?'<button class="button" onclick="Dynasty.showMoreAnnualDraftPlayers()">SHOW MORE</button>':''}`
  }