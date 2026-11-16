# Arcade flow and cricket-data pass

The user approved the arcade direction, requested longer and more detailed sequences, reported vertical movement while content loaded, asked for speedable automatic order reveals and removed save import from the desired flow.

## Flow and live layout

Club reveal, foundation draft order and annual draft order now reveal automatically at 1×, 2× or 4×, with pause/resume and reveal-all controls. Normal pacing is one envelope every 1.5 seconds. Draw order is generated once; speed controls do not reroll it. Reveal progress, pace and pause state survive saving and Continue. CPU drafting cannot begin behind an unfinished foundation order reveal.

Live updates patch existing DOM nodes by key rather than replacing the stage. Player cards and reveal slots reserve equal geometry. Signing names, feedback, wire and controls have reserved regions; the growing roster uses an internal scroll container. Buttons and search controls retain their nodes. A scrolled signing wire retains its content anchor as new entries arrive. Hidden engine renderers no longer issue visible window scrolling. Reduced motion suppresses presentation animation without changing reveal pace.

A passive browser PerformanceObserver records layout-shift entries when supported. `qa/v8_capture.js` includes those entries and bounds in a user-operated download. No native layout shifts or screenshots have been measured here. CSS reservations and DOM tests are not a visual sign-off.

The visible import button, controller command and public Dynasty import entry point are removed. Play/Continue use the browser's existing save. The export controls, public entry point, download function and hidden export/import buttons have also been removed. Autosave and Continue are the save flow.

## Cricket data translated

| Existing model data | Visible use |
| --- | --- |
| Player role, archetype and preferred batting job | Scouting explanation, role tags and batting-position fit |
| Powerplay, middle and death batting/bowling | Player scouting, projected squad and selected-XI reads |
| Batting and bowling resources, trusted overs, keeping and role fit | Team/squad summary and explanations |
| Fielding, chemistry, continuity and leadership | Clickable reads and player detail |
| Pace/spin batting, control, power, running and finishing | Detailed player scouting |
| New ball, variation, bowling control/style/workload | Detailed scouting, leading phase options and scorebooks |
| Performance-driven form and availability | Cards, selection, scouting and injury cover |
| Scouting confidence, development outlook, contract status and recent GCC record | Player and trade scouting |
| Ground character, pace/spin/boundary effects and stable match weather | Club context, matchday and match preparation |
| Actual opponent XI profile | Six phase matchup reads; no invented win probability |
| Real draft-pick feedback line | Reserved draft feedback area |
| Scorecard runs, balls, boundaries, dismissals, bowling figures and extras | Full innings scorebook |
| Actual over-by-over bowling allocation | Expandable bowling-changes view, limited to the innings played |
| Innings phase totals, weather and standout performance | Result explanation, with early-chase comparison caveat |
| Season scoring/conceding, rates and wickets | Side-in-practice read |
| Player averages, strike rate, economy, high score, boundaries, bowling average and best figures | Season player records |
| League player totals | Runs/wickets leaderboards |
| New arrivals, own retirements and vacancies | Offseason context and scouting |
| Career and season records, club honours and attributed legends | Archive record book |
| Manager legacy score | 2026 ending |

The CPU's exact hidden future peak and retirement truth remains hidden. Development outlook is a scouting judgement, not a guaranteed future rating. No new synthetic cricket evidence or historical data was added. Archive legends use club-attributed performances; league records use the existing archived league statistics. The season comparison explicitly identifies its available scorebooks instead of calling them the entire league.

One mechanics mismatch was corrected: the old adapter allowed up to four optional cuts when nobody retired. The user rule is now enforced as at most two optional releases, further limited by four total controllable departures. Six forced retirements still allow no optional release. Existing supplementary-pick rules remain.

## Validation

See `qa/v8_flow_scope.json` for exact candidate digests and limits. Full-career testing completed 2008–2026 on the earlier flow candidate. Later targeted tests cover richer data views, draw resume and the final controller changes. DOM-tree tests exercise keyed replacement, order changes, focused typing and open details; they are not native browser tests. No rendered visual review or smoothness certification was performed.

To reproduce the latest checks:

```sh
python v8/build.py --freeze --output game/global_champions_cricket_v8_arcade_flow.html
GCC8_TEST_BUILD=game/global_champions_cricket_v8_arcade_flow.html GCC8_TEST_LAST_YEAR=2009 node qa/v8_game_test.mjs
node qa/v8_reveal_test.mjs
node qa/v8_dom_patch_test.mjs
node qa/v8_clock_test.mjs
python qa/v8_markup_check.py
GCC8_TEST_BUILD=game/global_champions_cricket_v8_arcade_flow.html node qa/v8_interaction_test.mjs
GCC8_TEST_BUILD=game/global_champions_cricket_v8_arcade_flow.html node qa/v8_game_test.mjs
```

The two-season command creates the local fixture save used by the reveal/trade tests. Its fixture file and markup snapshots are generated scratch outputs, not repository deliverables.

## Cricket polish checkpoint

The latest build uses simulation-adjusted fitness and team cohesion for XI/matchup profiles. Match phase comparisons expose legal balls/rates and early chase completion. Draft cards include individual phase strengths and workload, with explicit capability sorting. Season review includes both batting/bowling contributors and a contextual phase-rate planning read. New tied games expose a separate Super Over ledger without contaminating regulation or season statistics. See `GCC_V8_CRICKET_POLISH.md` and `../qa/v8_cricket_polish_scope.json` for rules, exact artifact and QA limits.
