> Follow-up: the supplementary ordering defect and requested trade/departure rules were addressed in the subsequent build. Read `docs/GCC_V8_TRADE_RULES_20261023.md`. The evidence and build hash below describe the original audited build.

# GCC v8 deep audit · 23 October 2026

**Outcome: mechanically stable in the completed tests, with one confirmed supplementary draft-order defect and balance/performance watches.** No new reproducible crash, save-loss or blocked-career defect was found. This is an audit of the current game, not a release-readiness or enjoyment certification.

The playable game was preserved throughout. SHA256: `32f9396b38627c2c4112905abaf1bad43567bf56e20c3914d288af0da3b4c040`. Both canonical HTML files and the delivered version 54 remain identical. Only QA scripts, QA metadata and documentation changed.

## What was tested

| Facet | Evidence and result |
| --- | --- |
| Complete career | Two fresh worlds, seeds 101 and 307, managing Nottinghamshire and Yorkshire. Both completed all 19 seasons, 2008–2026. |
| Matches and finals | 532 managed-club league matches. The complete leagues simulated 2,128 regular-season fixtures and 114 finals. Detailed scorebooks and delivery ledgers were checked for managed-club games and saved finals; the additional checkpoint audit validated 612 saved match ledgers. This does not mean every CPU regular-season scorecard was independently retained. |
| Cricket arithmetic | Runs, extras, batting totals, legal deliveries, batter balls faced, bowler runs, wickets, four-over limits, phase totals, bowling sequence, economy and NRR checked. Three naturally occurring Super Overs exercised winner and tie-break consistency. |
| Scheduling and tables | All ordered home/away pairings once per year; seven home and seven away per club; 14 complete rounds, one appearance per club per round; wins/losses and league points conserved. |
| Drafts and CPU squads | Foundation and annual drafts, 120 initial unique picks, 15 permanent players per club, ownership uniqueness, CPU keeper coverage, annual draw and supplementary refill. |
| Manual XI and injuries | 63 injury-driven XI recoveries across full careers. Native selection, swap, clear, order and lodge guards. Full-squad retention tested at four viewport/text configurations. Natural full careers did not require user emergency-cover signings, so a separate 26-check fixture tested cover cancellation, signing, duplicate guards, replacing an injured cover, cold restore, manual XI choice, original-player return to the current cover slot and season-end cleanup. |
| Offseason decisions | Confirmed and cancelled releases; optional retention; accepted and refused trades; review/edit before execution; stale/double confirmation guards; keeper warnings; traded picks and rejection of the known lopsided package. Pick valuation did not inspect private realised career outcomes. |
| Development and arrivals | 12 independently generated career universes, all 19 model years. At least 150 eligible active players in every sampled universe/year. Skill bounds and player ownership audited in actual saved seasons. Old 2020 save retained its players, XI, teams and stored futures. |
| Saves and recovery | 104 cold-reload checkpoints in full careers; 14 damaged-save cases rejected atomically without overwriting stored bytes or changing current state. Storage-blocked play and persistent save-failure/recovery warnings tested. Actual final saves accepted in Chromium; largest observed save budget was 2,646,586 UTF-16 bytes. |
| Playback | Native play, pause, speed, skip and cold resume. A real newly generated 2015 save progressed through the 2016 annual flow; paused delivery count, speed, XI, batting order, round and results survived reload. |
| Ending and archive | Both newly completed 2026 careers cold-loaded in Chromium. Terminal view, all 19 actual archive entries, final-year history book, home/continue and normal saves passed. No next-season or next-match action after the ending. |
| Presentation and controls | 852 viewport/text-size layout and contrast cases, plus solid-surface/result variants, artwork, draw motion, reduced motion, keyboard/pointer actions, dialog/menu dismissal, focus and native mobile journeys. Chromium widths 320/390/760/1280; root text 16/24/32px where specified by each suite. |

Final effective regression results: 14 VM suites, 19 main browser suites and 5 additional model/rule suites passed. Supplementary browser tests covered signing, four retention configurations, real late-career flow and both actual endings. The saved-season audit ran 286,488 assertions, predominantly repeated skill bounds and structural invariants; these are not that many independent player scenarios.

## Confirmed defect: supplementary picks do not continue snake order

Tom clarified that natural retirements are uncapped. The four-departure budget constrains voluntary releases only; natural exits above four receive supplementary picks. Nottinghamshire's five retirements entering 2023 were therefore valid, and recruitment correctly restored its squad to 15. The earlier cap finding is withdrawn.

The actual remaining defect is supplementary ordering when multiple clubs need extra picks. A deterministic probe of the unchanged production `draftSlots` and `slotsWithSupplement` functions gives **A, A, B** when club A needs two supplementary picks and B needs one after ordinary round four. Continuing the snake should give **A, B, A**. The current loop groups all missing picks by club in lottery order. This also fails to alternate direction across supplementary rounds.

Evidence: `qa/audit-20261023/supplement-order.cjs` and `.json`. This is a reproducible ordering defect, not a blocked-career or squad-refill failure. No production code was changed during the audit. Historical strict retirement-cap failures are retained as superseded test assumptions, not product defects.

## Balance and replay-variety watches

Across 12 generated universes, eligible-player mean overall rose from **76.79 in 2008 to 83.81 in 2026**. The share rated 90+ rose from **2.7% to 18.2%**. This describes the eligible pool, not the mean of drafted XIs. It suggests a more crowded top end later in the career; it does not establish that later matches are unbalanced.

CPU clubs shared roughly 8.8–9.3 of their top ten early targets when deliberately evaluated against the same empty roster and player pool in three worlds. That is a controlled starting-preference result, not proof that completed CPU squads are identical. Nevertheless, early draft variety deserves human assessment.

Four controlled 19-season recruitment policies were compared in **one** world with the same fixture RNG:

| Policy | Managed-club wins | Win rate |
| --- | --- | --- |
| balanced-current | 132/266 | 49.6% |
| balanced-youth | 139/266 | 52.3% |
| overall-only | 120/266 | 45.1% |
| allrounder-heavy | 126/266 | 47.4% |

These cohorts use actual evaluation, career and match functions but simplify replacement drafting, omit optional trades/releases/injuries/form updates, and do not run full annual UI administration. There is no dominant-policy finding from this single world. Do not count these cohorts as four more fully tested UI careers.

## Timeout and test maintenance

One full-squad retention browser run timed out during the offseason click under concurrent testing. An instrumented repeat completed the click in 3.696 seconds, including 2.518 seconds in the season-update function. The original timeout was not increased for the final four-configuration retention test, which passed. **The initial timeout's cause was not established**, so intermittent transition latency remains a watch rather than a claimed fix.

Two existing tests needed maintenance after the presentation changes:

- The player-journey test expected the old literal card markup and old order-help wording. It now verifies the selected phase label and exact score as one visible group, with the current instruction. All 20 checks pass.
- The retention geometry test counted the deliberately decorative `aria-hidden` watermark as meaningful overflow. It now excludes that decoration while continuing to check real content bounds and actual document horizontal scrolling. All four native journeys pass.

QA runners now propagate failed-suite exit codes. Policy reports expose actual cohort/world counts instead of hard-coding twelve. Raw failures and successful rechecks are retained.

## Limits

- These are automated, informed commands and browser journeys. They cannot establish first-time-player comprehension, enjoyment or long-term replay value.
- Browser coverage is headless Chromium 153 in this environment, not physical phones, Safari, Firefox or a screen-reader/accessibility certification. CSS contrast scanning uses the nearest opaque background and is not certification for image backdrops.
- A live stadium-photo request was attempted without blocking and failed with `ERR_EMPTY_RESPONSE` in this sandbox network. The original URL/random venue selection, named fallback, containment and inline cricket artwork remain present. Reliable photo delivery on a normal player network remains unverified here.
- Passing two full worlds does not exhaust all seeds, transfer combinations, simultaneous events or corrupted data forms.

## Evidence and reproduction

Primary evidence is in `qa/audit-20261023/summary.json`, `career-101/v8_game_results.json`, `career-307/v8_game_results.json`, `career-invariants-2026.json`, `ending-native.json`, `late-native.json`, `save-adversarial.json`, `injury-cover.json`, `policies.json`, the suite-result manifests and immutable `evidence-*.json` snapshots.

The large per-year saves, raw scorebooks and internal screenshots are reproducible local audit material, not extra downloadable game versions. Re-run full careers with `qa/v8_game_test.mjs`, setting `GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html`, seeds 101/307 with GCC8_TEST_CLUB=0/7 respectively, last year 2026, separate report directories, and `GCC8_TEST_KEEP_FINAL_SAVE=1`. Browser scripts use `NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES` and `/tmp/gcc-chromium`. `summarise.py` checks the final artifact hash and correlates all effective pass/recheck results.


## Latest user clarification: departure accounting

Three natural retirements permit one voluntary cut; four or more permit none. Natural retirees remain uncapped. Tom also requested that trades be considered in departure accounting. Current voluntaryCutLimit counts retirements and releases; trade impact on the intended shared allowance has not yet been verified. Follow-up must cover outgoing/incoming players, traded picks, final roster size and supplementary snake order. Do not claim trade-budget compliance from the earlier trade transaction tests alone.
