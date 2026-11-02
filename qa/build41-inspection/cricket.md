# Build41 cricket-management inspection

Inspected maintained UI and compiled `deliver/GCC_v8_Playtest_41.html`. This is a source and offline-contract inspection, not a completed played career or native browser review. No production files changed.

## Findings

No new blocking management-flow defect was established within this bounded inspection.

1. **Low: individual rating labels lose context in the new XI presentation.** `v8/ui/decision-ui.js:12` emits a bare strong number; rows at lines 83–84 reuse it without an OVR label or accessible name. The draft card adds OVR (line 22), the dossier adds Overall (line 66), and the legacy player card uses “Current ability, out of 99” (`components.js:38`). In a bench/XI row the visible number is therefore less self-explanatory than elsewhere. Consider a common tooltip/accessible label for overall ability without changing numbers. Native gate: inspect XI rows and screen-reader reading order before deciding severity.

2. **Low: career wins terminology varies despite the same regular-season total.** Archive metrics say “League wins” (`screens.js:99`), legacy says “Wins” (`screens.js:100`), and archive season body says “wins” (`decision-ui.js:123`). The engine archive increments manager wins from the regular-season table (`engine/dynasty.js:126`). This is not a counting bug; consistent “League wins” would clarify that finals are not added to this total.

## Management clarity already present

- Draft role cards consistently distinguish batting jobs, bowling type, all-rounder jobs and keeper status (`decision-ui.js:9–10,21–24`). Coverage explicitly says overlapping roles are options, not targets (line 34), avoiding a false mandatory XI recipe.
- XI is manual. Selected count, XI rating, batting-order numbers, reorder arrows and explicit swap controls are present. Natural order changes ordering, not selection (`controller.js:222`). Selection essentials explain ratings are ability rather than predicted scores (`career.js:38`).
- XI lodging and watching use `read.xiProblem()` and dispatch guards. The engine message covers incomplete XI, duplicate/stale selection, OUT player and missing recognised keeper (`engine/dynasty.js:490`). There is no mandatory bowling-count gate; UI presents bowling balance as advice.
- OUT bench players cannot be selected/swapped in (`decision-ui.js:84`, `controller.js:218`); injured selected players show status through management tags. MANAGING remains selectable by design; medical wording and promise pauses are explained (`career.js:138–140`).
- Matchday presents Review XI / Watch match or Choose XI according to the blocker (`decision-ui.js:92`). Results provide Next match / League wrap-up / Back to finals (line 79).
- Offseason states that players remain automatically, releases/trades are optional, departures have an allowance, and vacancies go to draft. A missing keeper gets explicit recruitment advice (`career.js:23`). Draft completion routes to list review or team room (`decision-ui.js:38`).
- 2026 review uses Finish your tenure and no offseason; archive returns to legacy. Player records distinguish latest-season and GCC-career totals and explain averages/economy denominators (`decision-ui.js:96–112`). Historical club records use saved club-tenure stats rather than current roster totals (lines 118–125).

## Verification

Passed against Build41:

- `GCC_FILE=deliver/GCC_v8_Playtest_41.html node qa/build39-review/career-probes.mjs`: 3 bounded synthetic cases—2026 closure and archive return, 19-season archive ordering/legacy empty detail without mutation, vacant/no-keeper offseason draft route.
- `GCC_FILE=deliver/GCC_v8_Playtest_41.html node qa/whole-game-20261102/swap-guards.mjs`: 7/7 controls/dispatch/pending-state and OUT-cover checks.

Result-navigation requires a positional path, not GCC_FILE. An initial environment-only run exercised candidate.html and is excluded from Build41 evidence; corrected `node qa/whole-game-20261102/result-navigation.mjs deliver/GCC_v8_Playtest_41.html` passed all six render/route/immutability checks.

## Native browser gates for root

- Complete the remaining legal draft selections, then choose XI manually on phone and desktop. Check tab counts, scroll/focus after select/swap, name inspection, out-of-role text, rating interpretation and lodge action.
- Eleven without keeper: blocker visible near disabled Lodge; choose keeper and verify resolution. OUT selected player: replacement guidance and disabled bench action. MANAGING: status legible and distinct from OUT. Test both swap entry routes and cancel.
- Play one regular match and follow result → scorebook → close → Next match; confirm no hidden continuation action. Check finals-specific Return to finals and spectator wording in separate fixtures.
- Inspect dense offseason with retirements, release allowance exhausted, missing keeper, zero vacancies and supplementary picks. Ensure current step and irreversible-close copy remain visible on phone.
- Inspect long archive, one old season without player detail, and 2026 tenure close at phone width. Verify return destination and table overflow. Synthetic contracts do not establish physical geometry, keyboard focus, announcements or a fully played 2008–2026 career.
