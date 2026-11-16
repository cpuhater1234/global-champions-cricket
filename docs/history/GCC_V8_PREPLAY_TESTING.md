# Pre-play feature testing, 16 October 2026

This pass tests the existing career-variation playable without changing product code. Exact digest: `ff3b637d3af692e361b0c96b452c4384dacd218c035ac38a1b6f50171843f485`. It reproduces byte-for-byte from the frozen source; all 19 executable inline script blocks parse.

The scope/result manifest is `qa/v8_preplay_scope.json`. Large raw saves and scorebooks are local QA fixtures, not a self-contained committed reproduction bundle.

## Completed results

- 29 existing focused suites plus the supplemental controls suite passed on the exact final playable.
- Fresh seed 9103 completed 2008–2026; an old completed 2008 save at seed 9301 continued 2009–2026. Both closed at 2026 and cold-reloaded to legacy.
- Eight newly seeded club-selection-index paths completed 2008, with both qualifying and non-qualifying outcomes. These are eight selection paths across different worlds, not every catalog club or eight complete careers.
- 45 newly played season runs and 630 regular user matches, excluding the old save's pre-existing 2008. Finals are additional.
- 654 captured scorebooks /1,308 innings passed 27,467 plausibility checks and 35,388 cross-row identity/wicket checks. The harness audits but does not capture its first foundation round-one scorebook; captured count is not total played matches.
- 2,678 frontend arithmetic checks cover 123 displayed scorebooks and 120 average rows from the eight new club saves, with zero findings.
- 224 parsed screen states and 4,985 action bindings, including the new control snapshots, passed markup checks. This is parsed string evidence only.
- No production changes were required by these runs. The delivered playable and Library version 25 remain unchanged.

## Feature coverage

| Feature | Evidence exercised |
|---|---|
| Home, story, takeover | New career/Continue/restart, eight user club paths, guarded navigation |
| Club and order reveals | Automatic timing, pause, speed, skip, cold resume, stale callbacks |
| Signing week | Progression, pause, three speed settings, skip, resume |
| Foundation and annual drafts | Real CPU choices, fifteen-player lists, snake/supplementary picks, paced/skip equivalence, repeated clicks |
| Draft board | Direct Pick/Scout, show more, search, role filters including AR, sorting, nested Scout return |
| Team room | Manual XI, remove/clear, swaps/cancel, natural batting order, rating reads, injured-player guards |
| Match and season | Preparation, fourteen fixtures, paced highlights, scorecards, all five season tabs, ladder/averages |
| Cricket arithmetic | Runs, extras, dismissals, fielding identity, legal-ball overs, bowler cap/sequencing, NRR, chase targets, Super Overs |
| Injuries | User/CPU workload, cover, injured-cover replacement, recovery into manual XI/order, legacy chains |
| Trades | Actual accepted deals, roster/pick transfer, club-only figures, market limits, late-window guards |
| Offseason | Named retirements/releases, automatic retention, zero vacancies, 0–6 retirement boundaries, optional-cut allowance |
| Compatibility list correction | Explicit overfull-list fixture, final cut to fifteen, reject another cut; not a naturally occurring normal draft stage |
| Finals and ending | Semi-finals, final, navigation/reload, archive, 2026 closure and rejection of 2027 |
| Careers and CPU fairness | Permanent variation, migration, observed development, public-only scouting, private-future invariance, distribution fixtures |
| Persistence | Cold loads at decision stages, corrupt saves, failed restore rollback, blocked/quota storage, existing-save continuation |
| Presentation source | Parsed strings, unique IDs, valid action bindings, finite displayed numbers, layout reservation/source checks |

The supplemental `qa/v8_preplay_controls_test.mjs` closes previously missing direct command tests and captures synthetic input/change/cancel callbacks. Its 90 assertions include filter correctness and selected-XI preservation. All 74 registered commands now have literal QA references, recorded separately as a static inventory. That inventory is not a claim of complete branch or native input coverage.

A first supplemental test incorrectly attempted to return to finals in a fresh season without finals. This was a test-fixture error, not an observed user path. The fixture was corrected to use a real completed final and rerun; no production change was made.

## Reproduction

Set `GCC8_TEST_BUILD=game/global_champions_cricket_v8_career_variation.html` for every Node test. The regression manifest lists the 29 scripts and their exit results; the supplemental control test is the thirtieth suite.

Full fresh career: `GCC8_TEST_SEED=9103 GCC8_TEST_REPORT_DIR=qa/preplay-20261016/career-9103 GCC8_TEST_SCOREBOOKS=1 node qa/v8_game_test.mjs` with the build variable above.

Existing completed-2008 save: same settings with seed 9301, report directory `qa/preplay-20261016/resumed-9301`, script `qa/v8_existing_career_test.mjs`. Its default source fixture is `qa/logic/final-clubs/0/v8_smoke_save.json`. This plays 2009–2026; the pre-existing 2008 season is not new work.

For each club index0–7, use seed9201+10×index, `GCC8_TEST_CLUB`, `GCC8_TEST_LAST_YEAR=2008`, its own report directory and the game test. Captured scorebooks are then consumed by plausibility and statistics-crosscheck scripts; markup snapshots by the markup parser. The frontend arithmetic review uses those eight newly generated club saves.

## Limits

No automated browser access was attempted under the established restriction. Native layout/overlap, pointer or keyboard input, focus/scroll, stadium-image delivery and animation smoothness are unverified. VM bounding rectangles are stubbed and cannot establish geometry. Synthetic event callbacks establish handler behavior only.

This pass does not independently certify all player biographies or empirically calibrate the match distribution against historical cricket. The existing 371 uncertified legacy identities, model-estimate ratings, badge/composite calibration and club-games chemistry limits remain. Automated policies cannot establish human enjoyment or ideal difficulty. No claim of perfection or every possible state is made.
