function renderDraftFlow(t) {
    const flow = $('draftFlow');
    if (!flow) return;
    flow.classList.toggle('user-turn', !!t && t.abbr === state.userClub.abbr);
    $('draftPace').textContent = draftPaceLabels[state.draftSpeedIndex];
    const skip = $('skipToPick');
    if (!t) {
      $('draftFlowLead').textContent = 'The board is full.';
      $('draftFlowDetail').textContent = 'All 120 names are off the board.';
      skip.textContent = 'DRAFT COMPLETE';
      skip.disabled = true;
      $('draftPace').disabled = true;
      return;
    }
    $('draftPace').disabled = false;
    if (t.abbr === state.userClub.abbr) {
      $('draftFlowLead').textContent = "You're on the clock.";
      $('draftFlowDetail').textContent = `Pick ${state.pickIndex + 1}. Name the player.`;
      skip.textContent = 'YOUR PICK';
      skip.disabled = true;
      return;
    }
    if (state.lastDraftPick) {
      const lp = state.lastDraftPick;
      $('draftFlowLead').textContent = `${lp.team.name} take ${lp.player.name}.`;
      $('draftFlowDetail').textContent = `Pick ${lp.overall}. ${t.name} are next.`;
    } else {
      $('draftFlowLead').textContent = `${t.name} are on the clock at Pick 1.`;
      $('draftFlowDetail').textContent = 'The board is moving.';
    }
    skip.textContent = 'SKIP TO MY PICK';
    skip.disabled = false;
  }