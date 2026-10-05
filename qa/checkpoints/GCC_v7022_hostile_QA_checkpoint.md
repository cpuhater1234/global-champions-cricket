# GCC v7.0.22 Hostile QA Checkpoint

## Active candidate

`global_champions_cricket_v7_0_22_finals_xi_hardened.html`

SHA-256:
`8040b3b0c76eb8001af7d857181de92aeeeeecd5ff495d397aadd03985b95f3d`

Protected promoted baseline remains v7.0.14 on `main`.

## New defect found after v7.0.21

### Invalid XI could enter and play Finals

A top-four club could finish Round 14, have a selected player become `OUT`, and still enter the Finals with an illegal XI. The same invalid selection could then be used to play a semi-final or Grand Final.

v7.0.22 adds a narrow Finals selection gate:

- invalid user XI blocks entry into a user Finals campaign;
- invalid user XI blocks a user semi-final;
- invalid user XI blocks a user Grand Final;
- an eliminated user club is not blocked from watching/deciding the neutral Grand Final;
- missed-Finals clubs still proceed directly to Season Review regardless of XI state.

Targeted Finals scope suite: **7/7 passed**.

## Other hostile batches carried forward / revalidated

### Endgame and save integrity

v7.0.21 endgame batch: **22/22 passed**.

Covered completed-career routing, action locks, Archive return, save/restore, export-equivalent round trip, Start Again, and clean fresh-career restart.

### Injury-cover trade integrity

Round 7 transaction tests passed in both directions:
- trading away the injured user player immediately releases temporary cover;
- temporary cover leaves the roster and XI cleanly;
- replacement mappings are removed;
- acquiring a CPU injured player immediately releases the CPU club's temporary cover;
- both clubs return to 15 contracted players;
- player ownership remains unique.

### First-time player flow

v7.0.22 novice path: **15/15 passed**.

### Static guardrail

- 9 script blocks, syntax pass;
- 0 duplicate DOM IDs;
- 12/12 protected cricket/simulation functions unchanged from v7.0.14;
- static candidate guardrail: PASS.

### Responsive / visual QA

Fresh v7.0.22 screenshots checked at 1440x900 and 390x844 across World, Clubs, Foundation Draft, Team Room, Season start, Round result, Season Review, Offseason market and Annual Draft.

Automated viewport matrix across 320, 360, 390, 430, 768, 1024, 1440 and 1920 widths:
- **80 cases**
- **0 bad cases**
- 0 horizontal overflow
- 0 off-screen controls
- 0 mobile touch-target flags
- 0 browser errors

The temporary one-second Season-start signature banner still overlays part of the season heading by design. It is visually assertive but transient and non-interactive; no change made because it is not a persistent usability defect.

### Save-phase persistence

General offseason / season save matrix: **7/7 passed**.

Finals persistence passed at every stage:
- ready
- semis
- gf-ready
- done

Each stage restored the correct screen, year and Finals stage.

## Final 2008-2026 career regression

Checkpointed run completed on v7.0.22:

- 19/19 seasons completed and archived exactly once;
- final year: 2026;
- Legacy reached cleanly;
- no CPU roster-shape failures;
- no duplicate player ownership;
- no temporary replacement residue;
- no browser errors.

## Current assessment

v7.0.22 is the strongest QA candidate so far. No broad redesign or protected match-simulation change has been made. All changes since v7.0.14 remain targeted at reproducible dynasty, transaction, save-state, navigation, mobile interaction or live-XI integrity defects.
