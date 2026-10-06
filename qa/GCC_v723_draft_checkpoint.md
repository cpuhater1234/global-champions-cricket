# GCC v7.2.3 Draft Structural Checkpoint

## Status

Fourth structural v7.2 checkpoint, reconstructed from the authoritative v7.2.2 XI Selection build and passed through GitHub-backed static and browser QA.

The previous local-only v7.2.3 candidate did not survive as an artifact, so this checkpoint deliberately records the newly reconstructed and independently tested candidate rather than reusing the vanished candidate SHA.

## Source of truth

- Repository: `cpuhater1234/global-champions-cricket`
- Branch: `work/v7.2-structural-rebuild`
- Input: `game/global_champions_cricket_v7_2_2_xi_structure.html`
- Output: `game/global_champions_cricket_v7_2_3_draft_structure.html`
- v7.2.2 SHA-256: `6b9ee248228a677e48ef644aa30aa4d8d7ed520404f9e0b32941d6961b13623f`
- v7.2.3 SHA-256: `ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32`
- Passing GitHub Actions run: `37398022162`
- Passing branch head before this checkpoint: `a6d21f909d997be75df592b42a65b5eb092f1c31`

Rebuild and verify with:

```bash
python qa/rebuild_v723.py
python qa/check_v723_draft.py
node --experimental-websocket qa/browser_v723_draft.mjs
```

The candidate is reconstructed from v7.2.2 plus:

`qa/patches/v722_to_v723_draft.patch.gz.b64`

The permanent GitHub gate is:

`.github/workflows/v723-draft-qa.yml`

## Provenance hardening

During recovery, GitHub's stored v7.1.2 source was found to differ from the originally tested local file only by transfer-time newline bytes.

- original v7.1.2 SHA-256: `6c07526259b85723eedd216fca513f6e57b59ce98de23b2e7575af849a73c74b`
- GitHub v7.1.2 raw SHA-256 observed in CI: `c06f7224412b77b4dfe7eaec3506da593ee2834a03b123aea3df17f41cf2d5aa`
- shared newline-normalised SHA-256: `7776f3fb8422ec75281004b7019de0faf6762351a6a0a69a797dc7c2174f2e72`

`qa/rebuild_v720.py` now explicitly recognises that normalised source fingerprint and verifies the exact committed v7.2.0 handoff before later structural rebuilds proceed.

GitHub reconstruction then reproduced the exact tested structural hashes:

- v7.2.0: `365245b618ffa09a799c32006faa09acc896598c5aecfa60501fe7cdd080d4ef`
- v7.2.1: `e1b1566abbf6c1f11a366f6b9f54e67ef9747a9871ebcf87309fdd7ca4049db3`
- v7.2.2: `6b9ee248228a677e48ef644aa30aa4d8d7ed520404f9e0b32941d6961b13623f`
- v7.2.3: `ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32`

## Product objective

Fix the Draft as a decision screen rather than reduce the same information wall cosmetically.

The default draft state should answer three questions quickly:

1. Who are the strongest realistic options for this pick?
2. What does my squad need next?
3. Where can I go for deeper pool or full-board context when I deliberately want it?

## Structural changes

### Focused first-pick pool

The default player pool now renders 24 candidates rather than approximately 90 cards.

The pool remains rating-led and uses the existing draft/player data. No player database, rating model or AI draft evaluation was rewritten.

### Progressive deeper access

`SHOW MORE` reveals the next bounded batch of 24 players.

Browser QA verified:

- initial cards: 24
- first Show More: 48 cards
- no unbounded first-pick wall

### Search and role filters

The existing player search and role filters remain first-class controls:

- BAT
- WK-BAT
- AR
- BOWL

A role-filter change returns the working pool to the focused 24-card window.

Browser QA verified a BAT-filtered pool of 24 and a player-name search returning two matching candidates.

### Draft Board becomes secondary

The full 120-slot Draft Board is no longer built and displayed in the default decision state.

Default first pick:

- Draft Board hidden
- Draft workspace visible
- Draft Board rendered columns: 0
- Draft Board rendered picks: 0

Selecting `VIEW DRAFT BOARD` deliberately switches views and renders:

- 8 club columns
- 120 pick slots
- `BACK TO PLAYER POOL` return action

### Cricket-first right rail

The right rail now leads with a concise squad-needs read rather than a projected-XI information wall.

At pick one the tested copy correctly prioritised top-end quality while warning against forcing a role before the squad has shape.

As the squad develops, the priority logic can surface role needs such as bowling cover using existing player roles and squad composition.

### Compact drafted squad read

The draft rail keeps the user's actual selections visible without rebuilding a speculative batting-order wall during every pick.

## Static guardrail results

`qa/check_v723_draft.py` passed against the exact GitHub reconstruction.

It verifies:

- exact v7.2.2 source SHA
- exact v7.2.3 target SHA
- 24-player default pool architecture
- Show More
- player search and role filters
- secondary Draft Board architecture
- cricket-needs right rail
- removal of the old 90-card first-pick slice
- nine JavaScript blocks parse
- no duplicate DOM IDs
- protected non-draft script blocks unchanged
- protected named functions unchanged outside the explicit draft/UI allowlist

The passing CI output recorded:

- target SHA-256 `ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32`
- default player pool: 24
- protected non-draft functions unchanged: yes

## Full browser acceptance results

Passing GitHub Actions run: `37398022162`

Environment:

- Google Chrome 154.0.8037.57
- Node 22.23.3

### Desktop, 1440 x 900

First-pick state:

- player cards: 24
- Show More available
- available-player read: 24 of 155
- Draft Board hidden
- Draft workspace visible
- Draft Board picks rendered before request: 0
- Draft Board columns rendered before request: 0
- cricket-priority read present
- page-level horizontal overflow: 0

Progressive pool:

- Show More expanded to 48 cards

Role filter:

- BAT filter active
- cards shown: 24

Search:

- test query: Kevin
- matching cards: 2

Full Draft Board:

- club columns: 8
- pick slots: 120
- return action: `BACK TO PLAYER POOL`

### Full 120-pick draft

The browser harness completed the actual snake draft through the user's real turns.

Final squad sizes:

- SUR: 15
- HUR: 15
- NOT: 15
- HEA: 15
- MI: 15
- CSK: 15
- SCO: 15
- KKR: 15

Integrity:

- final pick index: 120
- user squad: 15
- total drafted player IDs: 120
- unique drafted player IDs: 120
- duplicate drafted players: 0
- draft finished flag: true

Completion flow:

- `DRAFT COMPLETE` modal opened
- `ENTER TEAM ROOM` available
- Team Room transition passed
- user squad in Team Room: 15
- XI starts at 0, preserving the separate XI Selection workstream

### Mobile, 390 x 844

Fresh-dynasty mobile regression passed after deliberately clearing the desktop autosave from the QA origin.

First-pick state:

- player cards: 24
- Draft Board hidden
- cricket-priority read present
- page-level horizontal overflow: 0

Full Draft Board:

- club columns: 8
- pick slots: 120
- page-level horizontal overflow: 0

### Runtime quality

Final browser result:

- page errors: 0
- protocol/runtime exceptions: 0
- console errors: 0

## QA evidence

Run `37398022162` uploaded the reconstructed candidate and browser evidence under the `gcc-v723-draft-qa` workflow artifact.

The browser harness records:

- desktop first-pick screenshot
- desktop full-board screenshot
- desktop draft-complete screenshot
- mobile first-pick screenshot
- mobile full-board screenshot
- machine-readable browser report

## Scope protection

This pass did not intentionally modify:

- player database
- player ratings
- draft AI evaluation logic
- CPU pick logic
- simulation engine
- innings model
- season engine
- dynasty save model
- trades
- injuries
- XI selection logic

The static guardrail confirms protected non-draft code remained unchanged.

## Not claimed by this checkpoint

This pass does not yet solve:

- Signing Week / recruitment ceremony and decision hierarchy
- off-season / trade-screen density
- deeper multi-year CPU roster, trade and draft quality
- physical decomposition of the approximately 2 MB single-file application

Signing Week is the next structural v7.2 workstream and should begin only after this checkpointed branch head re-passes the permanent GitHub QA gate.
