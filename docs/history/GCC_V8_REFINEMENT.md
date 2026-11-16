# V8 pacing and responsive refinement

Candidate: `game/global_champions_cricket_v8_refined.html`.

## Changes

- Club and draft reveal controls precede the eight cards and remain sticky during scrolling. Mobile controls reserve a consistent region and touchable button sizes. Small phones use one club column.
- Player cards retain a minimum height and stable header/control regions while allowing content to grow. Draft feedback no longer reserves twelve mobile text lines. Heading blocks size to their content rather than a universal tall minimum.
- The ladder rank column is compact; player-name minimum width no longer applies to every table. Long club names and stat values can wrap. The smallest score displays stack vertically.
- Trades first show the two players, core ratings, age, form and availability. Full scouting/contract information remains in expandable native details. Disclosure markers remain native on mobile.
- Match highlights reveal the actual powerplay, middle and death runs for each innings, in batting order. Each completed innings shows its real final total, wickets and overs. Intermediate stages show phase runs without invented wicket counts or ball events. The target appears after the first innings. Outcome/scorebook screens follow completion.
- Highlights share the single scheduler, with 1×/2×/4×, pause/resume and instant result controls. They apply to regular matches and finals. Archived regular results can be replayed through highlights. Watching/skipping never re-simulates a match.
- Progress, pace, return destination and match reference persist in the existing browser save. Title/help/background pauses and archive/Continue transitions preserve the presentation. Existing saves without this metadata still load normally.
- Updated the invitation copy to match automatic reveals.

## Validation and limits

Read `qa/v8_refinement_scope.json` for exact digests and evidence. Dedicated VM checks cover actual phase values, unchanged score/career truth, pacing and modal/title/archive pauses, instant/stale skip, regular cold resume and semi-final/Grand Final archive return. Career tests explicitly choose instant highlights, preserving the existing fourteen-round and finals progression checks. Full-career regressions use the final scripts; a final mobile-disclosure CSS correction is recorded separately and all scripts were verified byte-identical. These tests never use a browser or inspect native pixels.

There is no rendered alignment, keyboard/focus, browser scrolling/persistence or smoothness certification. The original handoff's native-browser restriction remains; no alternate renderer or hosting bypass was attempted. Stadium/icons, arcade colours and cricket rules remain. No deployment, Actions, release, subagent or external message.

## Reproduce

```sh
python v8/build.py --freeze --output game/global_champions_cricket_v8_refined.html
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html GCC8_TEST_LAST_YEAR=2009 GCC8_TEST_REPORT_DIR=qa/refined/smoke node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_match_reveal_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_transition_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_reveal_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_audit_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_interaction_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_save_integrity_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html node qa/v8_migration_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html GCC8_TEST_REPORT_DIR=qa/refined/full101 node qa/v8_game_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_refined.html GCC8_TEST_SEED=202 GCC8_TEST_CLUB=3 GCC8_TEST_REPORT_DIR=qa/refined/full202 node qa/v8_game_test.mjs
python qa/v8_markup_check.py qa/refined/full101/v8_markup_snapshot.json qa/refined/full101/v8_markup_results.json
node qa/v8_clock_test.mjs
node qa/v8_dom_patch_test.mjs
```

Generate the finals fixture with `python qa/v8_club_matrix.py --build game/global_champions_cricket_v8_refined.html`. The highlight/finals test uses the scratch `qa/v8_smoke_save.json` and `qa/extensive/clubs/0/v8_smoke_save.json` fixture paths. Generate them using a two-season `qa/v8_game_test.mjs` run with the default report directory and the club-matrix runner respectively. They are test fixtures, not product import/export features. The complete generated snapshots and fixture saves are scratch outputs, excluded from source commits.
