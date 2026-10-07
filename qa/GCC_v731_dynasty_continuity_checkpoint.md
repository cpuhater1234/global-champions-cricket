# GCC v7.3.1 Dynasty Continuity Checkpoint

## Status

Accepted second v7.3 game-experience build on top of authoritative v7.3.0.

v7.3.1 removes the degraded annual-Draft experience from later dynasty seasons and brings it onto the same player-evaluation interaction family established by the 2008 foundation Draft, while preserving the annual Draft's existing rules, pick ownership, supplementary picks and CPU logic.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3-game-experience`
- Source: v7.3.0 Core Game Experience
- v7.3.0 SHA-256: `88e1c5cde4200de3d3a352f85b7bd701476e2c73f3465df4172b7e9e96dcb743`
- v7.3.1 SHA-256: `59385c4244f9ebdd5fb1250ba7f9330828c5c6c084f582b41aecc1bf8c1fb116`
- Passing v7.3.1 engineering/product run: `37565496795`
- Passing v7.3.0 regression run on the same branch head: `37565496802`
- Tested branch head: `4c002dc182aba9a7c311c67a02ec9aa2bd103c55`

Rebuild and verify:

```bash
python qa/rebuild_v731.py
python qa/check_v731.py
node --experimental-websocket qa/browser_v731_dynasty_continuity.mjs
```

## Product objective

A new dynasty season should represent a new cricket state, not a cheaper version of the game.

The annual Draft now uses the same core decision language as the foundation Draft:

- focused player pool
- search
- BAT / WK-BAT / AR / BOWL filters
- progressive deeper access
- cricket list-needs context
- premium player-card language
- deliberate secondary Draft Board

The annual Draft remains shorter and structurally appropriate to the offseason. It does not pretend to be another 120-pick foundation Draft.

## Annual Draft changes

### Focused player pool

The old fixed presentation:

`freeAgentPool().slice(0,36)`

is no longer the annual-Draft decision surface.

The default state now shows 24 candidates.

`SHOW MORE` reveals the next bounded batch, allowing the user to deliberately widen the pool rather than receiving an arbitrary 36-player wall.

Passing browser evidence in the accepted run:

- opening available pool: 46 players
- initial visible pool: 24
- Show More: 46 visible
- old 36-player ceiling: removed

### Search

The annual Draft includes player/country search.

The browser journey entered a real player name through the visible input and verified:

- the search term remained visible
- the player pool filtered correctly
- the active screen remained the annual Draft

### Role filters

Canonical role filters:

- ALL
- BAT
- WK-BAT
- AR
- BOWL

The accepted run verified each role filter returned only players of that role.

### List needs

The decision view now includes a restrained four-part cricket read:

- keeper
- bowling
- openers
- finishers

This is advisory context, not a quota system.

It helps the user understand the shape of the current fifteen without automating the Draft decision.

### Player cards

The annual player pool now uses the established premium player-card interaction language rather than the old offseason admin-card presentation.

The annual renderer no longer uses `.dynasty-player-card` for the Draft pool.

### Secondary Draft Board

The two-round annual board remains available deliberately through:

`VIEW DRAFT BOARD`

The player pool hides while the board is open.

The board displays:

- eight club columns
- Round 1
- Round 2 snake return
- current/on-the-clock state

The player returns through:

`BACK TO PLAYER POOL`

The Draft Board is not rendered as competing default information.

## Preserved annual Draft rules

v7.3.1 deliberately does not change the existing annual Draft mechanics.

The static guardrail verifies these functions remain byte-identical from v7.3.0:

- `draftSlots`
- `freeAgentPool`
- `slotsWithSupplement`
- `draftOwner`
- `cpuDraftPick`
- `runCpuDraftUntilUser`
- `userAnnualDraft`
- `annualDraftBoard`
- `finishAnnualDraft`

This preserves:

- two-round annual Draft structure
- snake order
- traded-pick ownership
- supplementary picks
- CPU selection logic
- user pick ownership
- Final 15 handoff rules

The foundation Draft, core data and simulation script blocks also remain protected.

## Full browser acceptance

The accepted Chrome journey begins from a fresh 2008 dynasty rather than injecting an isolated annual-Draft state.

### Foundation regression

Verified before entering 2009:

- foundation Draft remains active
- 24-player focused pool remains intact
- Draft Board remains secondary
- full 120-pick foundation Draft completes
- user finishes with 15 players

The harness waits for the actual foundation Draft completion transition to settle before entering the controlled offseason so annual-Draft screenshots do not contain stale 2008 UI.

### 2009 Draft Draw

Verified:

- year: 2009
- eight-club order
- eight unique clubs
- valid user position

### Annual Draft opening

Accepted run:

- phase: Draft
- user on a genuine actionable pick
- 24 player cards
- 24 actionable user-draft cards
- zero legacy admin cards
- visible search
- five canonical role filters
- four list-needs reads
- Draft Board hidden by default
- page-level overflow: 0

### Progressive pool

Accepted run:

- 24 initially visible
- 46 available in that seed
- Show More expands through the complete available pool

### Search and filters

Accepted run verified:

- visible search term persists while filtering
- exact player-name filtering works
- BAT only returns BAT
- WK-BAT only returns WK-BAT
- AR only returns AR
- BOWL only returns BOWL

### Draft Board

Accepted run verified:

- eight board columns
- player pool hidden while viewing board
- Back to Player Pool available
- page-level overflow: 0
- returning to the pool restores the focused 24-player state

### First user pick

The first user annual pick:

- advanced the Draft correctly
- preserved the active BOWL filter
- preserved a valid player pool
- retained annual-Draft phase until the next user decision

### Save/resume

A hard reload occurred during the live annual Draft.

Verified after Continue Dynasty:

- Dynasty screen restored
- Draft phase restored
- pick cursor identical
- all completed picks identical
- user roster identical
- focused 24-player pool restored
- zero legacy admin cards
- secondary Draft Board closed by default

### Mobile, 390 x 844

Manual screenshot evidence was captured on the actual annual-Draft workspace rather than only the dynasty shell.

Accepted mobile state:

- Round 2 user pick visible
- List Check visible
- search visible
- all five filters usable
- player cards reflow to one column
- four list-needs reads remain legible
- 24-player focused pool remains active
- page-level horizontal overflow: 0

### Completion / Final 15

The browser journey completed the actual annual Draft.

Accepted run:

- Draft complete: true
- 16 total Draft picks in that offseason
- two user selections
- user roster: 16
- all rostered player IDs unique
- phase transitioned to Final 15 / cuts
- Final 15 correctly asked the user to release one player
- page-level overflow: 0

Runtime quality:

- page errors: 0
- runtime exceptions: 0
- console errors: 0

## Product review

v7.3.1 was not accepted solely because the browser journey passed.

Manual desktop review confirms the annual Draft now reads as a cricket decision screen:

- current pick is dominant
- list needs are concise
- player evaluation owns the main workspace
- current squad remains useful secondary context
- full board is deliberately secondary
- offseason timeline provides continuity without replacing the Draft decision

Manual mobile review confirms the same interaction survives the narrow layout without becoming an admin table or information wall.

The surrounding offseason shell is deliberately retained. It provides season-to-season continuity and makes the annual Draft feel like part of the dynasty rather than a disconnected recreation of the 2008 foundation ceremony.

## QA corrections made during acceptance

Several browser-harness failures were rejected as test defects rather than used to modify correct game logic:

1. The harness initially reconstructed current Draft ownership from lottery order and ignored traded-pick ownership. It was replaced with the real actionable player-pool state.
2. The pool-count assertion was accidentally case-sensitive against the rendered uppercase label.
3. Search was initially called through the internal setter rather than through the visible input. The final harness dispatches a real input event.
4. Early screenshots captured the delayed 2008 Draft-completion modal because the test skipped ahead too quickly. The final journey lets the foundation handoff settle and closes it before entering the offseason.
5. The first mobile screenshot only showed the top of the dynasty shell. The final evidence scrolls to and captures the actual annual-Draft workspace.

No game logic was changed to satisfy those false negatives.

## Scope protection

v7.3.1 does not intentionally modify:

- player database
- player ratings
- foundation Draft mechanics
- annual Draft rules
- traded pick ownership
- supplementary Draft logic
- CPU Draft evaluation
- CPU pick logic
- simulation engine
- innings model
- schedules
- injuries
- trades
- Team Room / XI ownership
- Finals
- Season Review
- dynasty save architecture

## Acceptance decision

v7.3.1 Dynasty Continuity is accepted at SHA-256:

`59385c4244f9ebdd5fb1250ba7f9330828c5c6c084f582b41aecc1bf8c1fb116`

Passing v7.3.1 run:

`37565496795`

Passing v7.3.0 regression run on the same tested head:

`37565496802`

Tested branch head:

`4c002dc182aba9a7c311c67a02ec9aa2bd103c55`

The next coherent v7.3 workstream is the game-wide **Cricket Language & Comprehension** pass. It should work through the journey in order and simplify/rewrite only where the player cannot immediately understand what is happening, what decision is theirs and why it matters.
