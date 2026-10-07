# GCC v7.3.1 Dynasty Continuity Checkpoint

## Status

Accepted second v7.3 game-experience build on top of the frozen v7.3.0 Core Game Experience checkpoint.

v7.3.1 removes the quality drop between the 2008 foundation Draft and later annual Drafts. The annual Draft now belongs to the same GCC recruitment interaction family while retaining its existing dynasty rules and CPU logic.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.3.1-dynasty-continuity`
- Frozen parent checkpoint: `1bfbf29544cdf60a684cb0de441b297b078097f8`
- v7.3.0 SHA-256: `a9ecb8e4596fc7d751e6abcd840d74529e6b49b0c5ed78b8770badd3db4e191c`
- Accepted v7.3.1 tested head: `8bedf3800fa7e377030c18f28f623892ea11be58`
- v7.3.1 SHA-256: `ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f`
- Final accepted product/engineering run: `37565275806`

Rebuild and verify:

```bash
python qa/rebuild_v731.py
python qa/check_v731.py
node --experimental-websocket qa/browser_v731_dynasty_continuity.mjs
```

## Product objective

The annual Draft must feel like the same recruitment game the player learned in 2008, adapted to a smaller yearly intake rather than reduced to an admin menu.

The player should be able to:

- understand the current pick immediately
- see the cricket state of the existing list
- search the complete annual player pool
- filter by role
- browse progressively beyond the first screen
- inspect full GCC player cards
- open the Draft Board only when they want the league-wide picture
- make both guaranteed selections through the same interaction
- resume a saved Draft without losing the dynasty state

## Annual Draft changes

### Canonical player pool

The annual Draft now opens on a player-decision surface rather than an eight-column board.

It uses:

- full `.player-card` presentation
- 24 players in the initial view
- SHOW MORE in 24-player increments
- search by player or country
- ALL / BAT / WK-BAT / AR / BOWL filters
- the complete eligible annual free-agent pool rather than a hard top-36 slice

The old compact `.dynasty-player-card` annual selection interface is no longer used.

### Current-list context

The existing Dynasty `Your List` rail remains the authoritative roster view rather than introducing a duplicate squad panel.

The Draft room adds a concise LIST CHECK with advisory cricket reads:

- contracted count
- players drafted this year
- recognised keeper coverage
- bowling depth
- opening options
- finishing options

These are reads, not arbitrary quotas or hard selection rules.

### Draft Board hierarchy

The annual Draft Board remains available, but it is deliberately secondary.

The default action is evaluating players.

The player can choose:

`VIEW DRAFT BOARD -> BACK TO PLAYER POOL`

The board preserves the existing two-round ownership and order state without dominating the selection screen.

## Protected draft logic

The v7.3.1 static guardrail compares the following annual-Draft functions byte-for-byte against v7.3.0:

- `draftSlots`
- `freeAgentPool`
- `slotsWithSupplement`
- `draftOwner`
- `cpuDraftPick`
- `runCpuDraftUntilUser`
- `userAnnualDraft`
- `annualDraftBoard`
- `finishAnnualDraft`

Verified unchanged:

- two guaranteed annual rounds
- random annual Draft Order
- Round 2 snake reversal
- traded-pick ownership
- supplementary selections for short lists
- CPU Draft evaluation and role-need logic
- player availability / career-window logic
- Final 15 handoff
- roster ownership integrity

v7.3.1 is an interaction and continuity rebuild, not a Draft-engine recalibration.

## Browser acceptance

The final Chrome journey completed from a fresh foundation career through the real 2009 offseason and annual Draft.

### Annual Draft opening

Verified:

- year: 2009
- phase: Draft
- current user-owned pick resolved correctly
- 24 full player cards visible
- 0 legacy annual `.dynasty-player-card` controls
- search control visible
- ALL / BAT / WK-BAT / AR / BOWL filters visible
- four list-check reads visible
- Draft Board absent from the default view
- page-level horizontal overflow: 0

### Progressive browsing

Verified:

- first view: 24 players
- SHOW MORE: 48 players
- old 36-player ceiling removed

### Search

Verified:

- search narrows the annual pool correctly
- the search state is reflected in the visible input
- the annual Draft remains on the Dynasty screen throughout

### Role filters

Verified independently for:

- BAT
- WK-BAT
- AR
- BOWL

Each filtered view contains only the selected natural role.

### Draft Board

Verified:

- eight club columns
- user club/pick ownership preserved
- player pool hidden while board is open
- BACK TO PLAYER POOL returns to the recruitment surface
- page-level horizontal overflow: 0

### First and second user selections

Verified:

- first user selection advances the Draft cursor
- player joins the user's list
- CPU selections advance to the next user-owned pick
- active role-filter state survives the handoff
- the second guaranteed selection uses the same recruitment architecture rather than a reduced screen

### Save / resume

A hard reload during the annual Draft preserved:

- Dynasty screen
- Draft phase
- Draft cursor
- completed picks
- user roster ownership
- 24-card canonical pool view
- no legacy annual cards
- secondary board closed by default

### Mobile

At 390 x 844, the annual Draft interaction itself was captured and manually reviewed.

Verified:

- current round and pick readable first
- list check remains legible
- search is full-width and clear
- role filters remain usable
- player cards collapse to one readable column
- 24-card pool remains available
- four list-check reads remain available
- page-level horizontal overflow: 0

The mobile state was judged product-acceptable, not merely technically responsive.

### Final 15 handoff

Verified:

- annual Draft completes
- at least the two guaranteed user picks are recorded
- all roster IDs remain unique
- user list enters the existing Final 15 stage
- existing Final 15 interaction remains intact
- page-level horizontal overflow: 0

Runtime quality:

- page errors: 0
- runtime exceptions: 0
- console errors: 0

## Evidence correction during QA

An earlier green browser run produced misleading screenshots because the accelerated test journey moved from the 2008 foundation Draft into the 2009 offseason before the delayed foundation `Draft Complete` ceremony had settled.

Those screenshots were rejected as product evidence.

The harness was corrected to allow the foundation ceremony to settle and close before entering the offseason.

Fresh desktop evidence then showed the annual Draft without modal contamination.

A second evidence pass explicitly scrolled the mobile viewport to the annual Draft interaction before capture so the mobile acceptance decision was based on the real recruitment screen rather than the top of the offseason page.

This continues the v7.3 standard that a green automated result alone is not sufficient for product acceptance.

## Manual product review

The final clean screenshots were accepted for:

- annual Draft default player pool
- secondary Draft Board
- second user-owned pick
- mobile annual Draft
- Final 15 handoff

Product judgment:

The annual Draft now reads as the same GCC recruitment game established in 2008. The player pool owns the primary decision, the existing roster rail owns the list, cricket needs are advisory, and the board is secondary.

It no longer feels like a cheaper yearly admin version of the Draft.

## Known non-blocking language items

The following are deliberately deferred to v7.3.2 Cricket Language & Comprehension rather than reopening the accepted interaction architecture:

- some offseason shell copy remains functional rather than fully in-world
- status wording such as `FULL BEFORE THE DRAFT` can be made more context-sensitive
- some list-check labels can be made more natural cricket language

These are copy/comprehension issues, not structural annual-Draft defects.

## Acceptance decision

v7.3.1 Dynasty Continuity is accepted at SHA-256:

`ef7c04895020da2922af5e12ad830c602f453233b72ec942f92aa03e677ab19f`

The next coherent workstream is **v7.3.2 Cricket Language & Comprehension**.

That phase should audit the journey in order and improve decision framing, instructions, labels and feedback without adding tutorial chrome or undoing the interaction architecture now established in v7.3.0 and v7.3.1.
