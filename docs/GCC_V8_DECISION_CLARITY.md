# Decision clarity and testing correction

21 October 2026. This is a bounded correction to the rendering-clarity checkpoint, not a claim that the whole player experience is finished.

## Actual failures repaired

Opening comparison previously chose the first ranked alternative automatically. With a lone keeper this could present a specialist bowler as a wicketkeeping alternative. Opening now asks for a second player, groups the same role first, and clears previous choices. Deliberate cross-role comparisons use a neutral heading and general skills. The existing availability, turn and selection guards remain in force.

On narrow screens, selecting the first player with no saved pane preference caused the default view to switch to the XI and hide all remaining candidates. Selection now stays on the squad until eleven are chosen. Clear XI also returns to the squad and focuses its role filter. Earlier fixture-based layout setup manually selected the squad pane, masking these transitions.

Selection instructions now describe the immediate remaining task. A completed XI without a recognised keeper says so explicitly. This is advice, not a new eligibility rule. Manual choice, batting order, injuries and existing simulation rules remain unchanged.

## Verification of this exact artifact

Playable: `game/gcc_v8_decision_clarity.html`.

SHA-256: `bc1a0a884e4666e16eb1e7039de246147d8aa1c103ef5b4a7c316bfbe292e41d`.

- Both new regression suites fail against the preceding published artifact and pass against this artifact.
- Five focused VM suites pass: comparison intent, selection recovery, existing decision tools, player journey and team workspace. VM DOM stubs do not establish layout or usability.
- Sixty browser states pass the specified overflow, text escape, ability-label collision and opaque-background text-contrast checks: five expanded states at widths 320/390/760/1280 and root sizes 16/24/32. These use a saved-career presentation fixture, not a novice journey. Gradients and image backgrounds still require visual review.
- Native comparison checks cover unselected opening, explicit choice, cross-role heading, focus retention, Escape, reopening and keyboard selection.
- A fresh 390px native-click journey completes signing, all fifteen manual draft picks, manual XI, clear/reselect, first match, scorebook and cold Continue with unchanged career facts. Eighty-six recorded action clicks, plus native filter selections. No dispatch calls or state writes advance that journey.
- The exact final artifact completes one 2008 season, fourteen managed league matches and two cold-restore checkpoints with 819 runtime assertions. This is one seed and club, not a renewed full-career or balance certification.
- Screenshots were inspected for the selection workspace, initial comparison chooser, cross-role comparison and native result journey. Result screenshots settle CSS animations before inspection.

Only three UI scripts change. The other seventeen scripts and all embedded CSS remain byte-identical to the hash-verified preceding artifact. `qa/rectification/build_candidate.py` reproduces this checkpoint without regenerating the frozen engine; the standard builder's corresponding UI source files are updated too.

## What the testing process must now do

Transition tests must use the prior screen's real default state. They must not set the expected pane, dialog or focus before testing that transition. Fixtures remain useful for exhaustive rendering, but their outcomes must be reported separately from native journeys.

Required evidence remains separate: engine correctness, rendered states, native journeys, source-blind comprehension and human enjoyment. A green technical batch cannot close a missing player-experience layer. The recorded native journey is informed by source knowledge, uses an explicit draft plan and skips match playback; it is not a first-time-player understanding test.

Still open: independent cold-player completion through the first match; returning-player comprehension; human observation; voluntary return; season-two navigation with real user decisions; later-career pacing; strategic balance over more clubs/seeds; Windows/Safari/touch comfort; screen-reader speech and background-tab behavior. Existing protocols remain the starting point. Zero human sessions have been established. Do not describe this checkpoint as perfected, release-ready or evidence of sustained enjoyment.

## Reproduce

Run from repository root. Browser helpers require Playwright and a Chromium executable at `/tmp/gcc-chromium`.

1. `python3 qa/rectification/build_candidate.py`
2. Set `GCC8_TEST_BUILD=game/gcc_v8_decision_clarity.html`, `GCC8_TEST_LAST_YEAR=2008`, `GCC8_TEST_REPORT_DIR=qa/rectification/final-season`, then run `node qa/v8_game_test.mjs`.
3. Set `GCC8_FOUNDATION_SAVE=qa/rectification/final-season/v8_smoke_save.json` and the same build, then run `node qa/v8_prepare_fixtures.mjs --foundation-only`.
4. Run the five focused suites with the same build variable, then `node qa/rectification/expanded.cjs`, `node qa/rectification/native-comparison.cjs` and `node qa/rectification/native-first-match.cjs`.

Reports and scripts are in `qa/rectification/`. Screenshots and generated career fixtures are internal test artifacts, not additional user deliverables.
