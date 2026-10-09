function renderSeasonFixtures() {
    $('fixtures').innerHTML = state.schedule.map(f => seasonFixtureRow(f)).join('');
  }