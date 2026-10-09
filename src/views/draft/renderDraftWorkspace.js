function renderDraftWorkspace() {
    const workspace = $('draftWorkspace');
    const board = $('draftBoardPanel');
    const toggle = $('draftBoardToggle');
    if (workspace) workspace.hidden = draftBoardVisible;
    if (board) board.hidden = !draftBoardVisible;
    if (toggle) toggle.textContent = draftBoardVisible ? 'BACK TO PLAYER POOL' : 'VIEW DRAFT BOARD';
  }