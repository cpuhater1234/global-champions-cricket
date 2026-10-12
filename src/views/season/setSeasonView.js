function setSeasonView(view = 'overview') {
    const allowed = ['overview','fixtures','ladder','analysis','players'];
    seasonView = allowed.includes(view) ? view : 'overview';
    $('season').dataset.view=seasonView;
    document.querySelectorAll('[data-season-panel]').forEach(panel => {
      const active = panel.dataset.seasonPanel === seasonView;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    document.querySelectorAll('[data-season-view]').forEach(button => {
      const active = button.dataset.seasonView === seasonView;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (seasonView === 'fixtures') renderSeasonFixtures();
    else if (seasonView === 'ladder') renderSeasonLadder();
    else if (seasonView === 'analysis' || seasonView === 'players') renderSeasonInsights();
    else renderSeasonOverview();
  }