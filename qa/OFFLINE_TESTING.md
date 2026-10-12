# Functional testing without a browser

The commands and recorded failures below describe the protected v7.8.7 checkpoint.
For the implemented v7.9.0 candidate, use the commands and results in
`docs/GCC_V790_RECOVERY_CANDIDATE.md`. Its full-career suite passes all 1,702 checks,
and its updated stress suite passes 45. The three reproduced checkpoint defects
are repaired in that candidate; the baseline evidence remains unchanged.

The recovery checkpoint can be exercised with Node 24 and Python 3, without
installing packages, downloading Chromium, or running GitHub Actions.

From the repository root:

```sh
python3 tools/source_workspace.py build game/gcc_recovery_architecture_checkpoint.html
python3 tools/source_workspace.py check
python3 -m unittest qa/test_source_workspace.py
node qa/offline_game_stress.mjs
node qa/offline_game_regression.mjs
```

Both Node runners optionally accept a game HTML path as their first argument.
They execute all ten unchanged inline script blocks in a fresh Node VM. They do
not copy or reimplement the simulation, CPU selection or dynasty lifecycle.

## What runs

- A foundation draft through the public game API, followed by a complete
  2008–2026 career for deterministic seed 101 and club index 0.
- Fourteen rounds per year, the actual CPU matches, championship resolution,
  season review, retirement processing, CPU market, lottery, annual draft and
  Team Room entry. The harness chooses the recommended healthy XI each round.
- Independent schedule, league-table, innings, scorecard, bowling-plan,
  retirement, roster uniqueness and annual-draft ownership assertions.
- New VM instances sharing saved storage to test Continue at lifecycle stages.
- Separate manipulated-state scenarios for 0, 1, 2, 3, 4, 5 and 7 retirements,
  controlled release caps, invalid and accepted trades, a traded pick's reuse,
  unavailable/duplicate XI guards and duplicate injury replacement signing.

`offline_game_results.json` and `offline_game_stress_results.json` contain the
results. `OFFLINE_FINDINGS.md` explains the reproduced defects. The runners exit
nonzero for failed assertions. Known baseline defects
remain failures, not exceptions that make the build appear green.

## Limits

`offline_game_host.mjs` supplies a small render-only DOM stub and queues timers.
It intentionally creates requested elements and returns empty results for most
DOM collection queries. It cannot validate markup, missing elements, click
handlers, focus, geometry, CSS, animation timing, responsiveness, accessibility
or actual browser storage behaviour. Timers are not drained in these runners.
Actions are invoked through the exported game API. Finals use the existing
CPU/offscreen resolution path, not the timed interactive Finals sequence.

The save JSON and simulation are real. The DOM host is not a headless browser.
A completed deterministic career is a regression sample, not proof across all
clubs, seeds, choices and emergent situations.

For a playable visual check, download
`game/gcc_recovery_architecture_checkpoint.html` and open it in a normal desktop
browser. For stable same-origin save testing, serve the repository locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/game/gcc_recovery_architecture_checkpoint.html`.
Review the viewport and lifecycle acceptance gate in
`docs/GCC_RECOVERY_IMPLEMENTATION.md`. This is a local instruction for a browser
that permits the game, not a bypass of the blocked managed cloud browser.

## Recorded checkpoint result

The final corrected run completed all 19 seasons (2008–2026),
checking 266 user scorecards plus league, draft, roster and save
invariants. The complete-career suite passed 1699
of 1702 assertions. The stress suite passed 42 assertions
and failed 2. Both runners exit 1 because defects remain.

The remaining five failed assertions describe three issues: saved Finals, Review
and Legacy routing; acceptance of a nonexistent draft pick; and an unresolved
human roster vacancy after trading a genuine pick. No game console errors were
recorded. The source integrity check and five source-workspace unit tests passed.

Protected build SHA-256: `8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2`.

## v7.9.2 hard audit

The strict-ID host avoids fabricating missing controls. Two complete careers use seeds 101 and 202 and clubs 0 and 3. Targeted control and signing tests execute selected queued callbacks and real exported APIs. Generated markup is parsed separately across 18 states. These tests do not simulate native DOM selection, focus, browser layout, click delivery, animation or frame timing. See `docs/GCC_V792_HARD_AUDIT.md` for findings and evidence.
