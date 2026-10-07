# GCC v7.3.1 Dynasty Continuity Plan

## Objective

Bring the annual Draft onto the same recruitment interaction family as the 2008 foundation Draft without changing annual Draft rules, CPU evaluation, player progression, roster limits or offseason sequencing.

The annual Draft should feel like the same game one season later, not a cheaper admin screen.

## Protected logic

Do not change:
- two guaranteed annual rounds
- random annual draft order
- snake reversal in Round 2
- traded pick ownership
- supplementary selections for short rosters
- CPU draft evaluation and role-need weighting
- player availability and career windows
- final-cuts stage after the Draft
- save/resume architecture

## Canonical annual Draft interaction

### Player pool
Reuse the foundation Draft interaction language:
- full player cards rather than compact admin buttons
- search across the full available annual pool
- ALL / BAT / WK-BAT / AR / BOWL filters
- bounded first view
- SHOW MORE for deeper browsing
- no arbitrary top-36 ceiling

### Squad rail
Keep the user list visible while choosing:
- current list count
- keeper count
- bowling depth
- opening options
- finishing options
- players drafted this year

The rail should explain actual cricket gaps, not impose hard quotas.

### Draft board
The two-round board remains available, but becomes a secondary view.

Default view is the player decision.
The board is opened deliberately with VIEW DRAFT BOARD and returns with BACK TO PLAYER POOL.

### Flow
When the user is on the clock:
1. See the current pick and round.
2. See a concise cricket instruction.
3. Search/filter/evaluate the pool.
4. Compare against current list needs.
5. Select a player.
6. CPU selections advance automatically until the next user-owned pick.
7. Repeat using the same interface.
8. When the Draft closes, continue to Final 15 cuts.

## Scale

Annual Draft is smaller than the foundation Draft, so the interface is adapted rather than copied literally:
- initial pool view: 24 players
- SHOW MORE in 24-player increments
- two-round annual board instead of 15-round foundation board
- current list rather than empty foundation squad
- no Draft pace control because CPU picks already resolve to the next user pick

## Product acceptance

Reject if:
- the annual Draft returns to compact `dynasty-player-card` buttons
- the pool is hard-capped at 36
- search or role filters are absent
- the user cannot inspect current list needs while choosing
- the annual board dominates the decision screen
- the new UI changes CPU draft logic
- the second user pick loses search/filter continuity unexpectedly
- mobile introduces page-level horizontal overflow

## Browser journey

Minimum v7.3.1 browser evidence:
- 2009 offseason reaches annual Draft
- default annual Draft shows player-pool view
- at least 24 player cards visible when the pool allows
- search narrows the pool correctly
- each role filter works
- SHOW MORE increases visible pool depth
- list-needs rail is visible
- board toggles to secondary view and back
- first user pick joins roster and annual-pick rail
- CPU advances to the next user-owned pick
- second user pick uses the same architecture
- Draft completes into Final 15 cuts
- save/resume during annual Draft restores the Draft phase
- desktop and mobile overflow remain clean
- runtime/page/console errors remain zero
