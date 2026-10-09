function renderDraftStatus(t) {
    if (!t) {
      $('onClock').textContent = 'Foundation draft complete';
      $('draftHint').textContent = 'Your 15 are set.';
      $('pickNo').textContent = '120 / 120';
      return;
    }
    $('onClock').textContent = t.abbr === state.userClub.abbr ? `${state.userClub.name} on the clock` : `${t.name} on the clock`;
    $('draftHint').textContent = `Round ${Math.floor(state.pickIndex / 8) + 1} · board runs ${Math.floor(state.pickIndex / 8) % 2 === 0 ? '1 → 8' : '8 → 1'}`;
    $('pickNo').textContent = `${state.pickIndex + 1} / 120`;
  }