# GCC v101 — living squad management

Current playable: `game/gcc_v8_product_candidate.html`, identical to `game/gcc_v8_quiet_arcade.html` and `deliver/GCC_v8_Career_Clarity.html`. Active branch: `work/v8-game-first-rebuild`. Frozen v7.0.14 is historical only.

## What changes

The v100 fixed three-fixture selection recap is replaced by a persistent management layer. Regular players can question healthy omissions; batters can question repeated unsuitable positions; regular bowlers can question repeated full innings with little bowling. Managers can commit to a run, preferred batting role or meaningful bowling use, explain rotation, rest injured players and respond to a transfer request through the existing trade system.

A run means three fully fit matches selected. Batting means the next two fully fit selections in a position with existing role-fit score at least88. Bowling means at least12 balls in each of the next two fully fit selections where the opponent faces90 or more balls. Medical absences pause these obligations. The commitment is kept only if every qualifying opportunity meets it. Trust changes are visible as descriptive states. There is no hidden morale bonus/penalty to the cricket simulation and no forced transfer.

Regular expectation starts from the eleven highest current overall ratings, then recognises players with three selections this season. A regular omission concern appears after three healthy omissions; depth after five. Transfer requests require six/ten respectively, five unsuitable-role/full-innings underuse occurrences, or repeated broken commitments with low trust. Rotation grants two omissions without extra selection pressure and cannot be repeated until three available fixtures pass. Settled role use and kept commitments rebuild trust; sustained appropriate use can withdraw a request.

Profiles show actual current-season innings and spells, fitness, expectations, trust and obligations. Compact form/concern indicators are added to XI/bench rows. Team selection uses the actual next ground; finals use round15/16 weather-adjusted conditions. Only relevant state changes appear in the result panel. No player quotes are invented.

## Validation

- `node qa/team-management-20261029/unit.cjs`: pure expectation, injury and managed-injury pauses, short innings, run/batting/bowling promises, broken/kept outcomes, transfer/recovery, rotation cooldown/grace, duplicate fixtures, new-career identity, year transition, departed-player pruning and malformed state checks.
- `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node qa/team-management-20261029/browser.cjs`: real XI swap, six regular matches, broken commitment, transfer request, agreed move, closed2008 trade route and exact management-state reload.
- `... node qa/team-management-20261029/edges.cjs`: controlled medical rest/replacement and commitment pause, replay immutability, real semi-final controller processing, weather-matched finals advice and spectator exclusion. Medical/finals setup is controlled rather than a claim of naturally reaching these states.
- `... node qa/team-management-20261029/layout.cjs`: 36 layouts, four widths320/390/768/1440 and font sizes16/24/32, across team/profile/matchday. No document overflow or new component overflow. Mobile action scrolling/clicking also checked in contrast test.
- `... node qa/team-management-20261029/contrast.cjs`: enabled new management text meets4.5:1 contrast; 320px action can be scrolled to and clicked.
- Existing `qa/visual-20261028/scan.cjs`, with `GCC_FILE=qa/team-management-20261029/candidate.html GCC_PHASE=living-squad`:84 screen/viewport cases, no page errors or page-width overflow. The initial scan detected a3px legacy badge fit issue on matchday/preview; fixed and covered by layout regression. One transient save-status internal-width warning in the initial scan is recorded, not claimed fixed.
- All20 inline scripts syntax-checked. Only16(career),17(screens),19(controller) differ from published v100. Rating, simulation, injury, squad legality, save codec and other17 inline scripts remain byte-identical.

Initial RED observed: engine absent in unit test; adapter absent on published v100. Additional RED→GREEN: nested conditions, finals round/weather, rotation trust grace and cramped mobile badges.

Independent review found no critical defect. Important conditions/finals findings and rotation fairness issue were reproduced and fixed. Enlarged-text row squeeze was caught by layout test and fixed. Screens inspected manually at mobile/desktop widths.

## Reproduce

`python qa/team-management-20261029/build.py` uses the exact v100 Git commit `fde370cb767ae88406f9667292a1061e3f1309c2` (or the verified materialised v100 in the task workspace), verifies its SHA, applies these focused additions and writes `candidate.html` plus `build.json`. Historical general builders must not promote over the current release. Copy candidate to both game aliases and delivery only after validation.

No single current all-release test runner exists. Historical `qa/check_candidate.py` targets the protected9-script snapshot, and an older visual regression expects a career-backup menu deliberately removed by later releases; neither is misreported as a v101 passing check.

## Limits

This is a first playable relationship layer. It does not implement personalities, private conversations, training allocation, captaincy demands or autonomous player exits. Form/fitness/conditions already affect cricket; this release makes them more visible and adds persistent role expectations and decisions. Browser evidence is Chromium, not a new Safari/Firefox/device certification. No claim of exhaustive or bulletproof testing.
