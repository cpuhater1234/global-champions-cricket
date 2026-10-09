function renderDraftTransit() {
    const t = currentTeam();
    renderDraftWorkspace();
    if (draftBoardVisible) renderDraftBoard();
    renderDraftFlow(t);
    renderDraftStatus(t);
  }