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