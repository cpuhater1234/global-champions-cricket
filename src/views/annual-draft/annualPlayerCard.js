function annualPlayerCard(p,mine){
    const tags=annualPlayerTags(p),age=Math.max(16,state.year-Number(p.birthYear||state.year-25));
    return `<article class="player-card score-${R.grade(p.overall)}${mine?'':' waiting'}" role="button" tabindex="${mine?'0':'-1'}" ${mine?`onclick="Dynasty.userAnnualDraft(${p.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Dynasty.userAnnualDraft(${p.id})}"`:''}>
      <div class="player-top"><div><h4>${esc(p.name)}</h4><div class="player-meta">${p.country} · ${age} · ${annualRoleName(p)}</div></div><div class="ovr">${p.overall}</div></div>
      <div class="player-role">${annualPlayerNote(p)}</div>
      <div class="player-tags">${tags.map(tag=>`<span class="player-chip">${tag}</span>`).join('')}</div>
      <div class="player-stats"><span>BAT ${p.bat}</span><span>BOWL ${p.bowl}</span><span>FIELD ${p.fielding}</span>${Number(p.keeping||0)>60?`<span>KEEP ${p.keeping}</span>`:''}</div>
    </article>`
  }