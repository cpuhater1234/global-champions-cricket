function renderDraft() {
    renderDraftWorkspace();
    renderPlayers();
    renderSquadMini();
    if (draftBoardVisible) renderDraftBoard();
    const t = currentTeam();
    renderDraftFlow(t);
    renderDraftStatus(t);
  }