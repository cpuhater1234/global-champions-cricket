# GCC v84 whole-game visual audit — 28 October 2026

Final SHA256 `9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca` (8,066,770 bytes). Frozen v83 baseline commit `572a3d7e49fbe57b6210323779303ca9af129b16`. Main/protected baseline is preserved.

## Confirmed corrections

1. Draft-card pseudo hit areas extended beyond the border and produced3px local board overflow. Hit areas now stop at the actual card; hover/focus and the independent Pick control remain available.
2. Enlarged dialog titles collided with the close button. The mobile title grid now reserves its44px close column.
3. Player-record Matches labels broke mid-word. Metric grids now fit the available width.
4. Tablet/landscape dialog padding left content visible above the sticky header. The header now covers the scrollport edge.
5. Narrow knockout results left a lone letter of Nottinghamshire on a new line. Two-column innings require enough container width; narrow results stack.
6. Legacy stadium panels stretched hundreds of pixels below their content. End-of-career artwork now fits its natural content without changing the welcome hero.
7. Final2026 review/phase analysis promised another season. Final-year copy is now retrospective; prior-year copy and all phase values are preserved.
8. Real saved super-over names and figures were nearly white on a pale panel. Paper surfaces now use dark paper ink, including the scorebook variant.
9. Narrow Scored/Conceded rows split Conceded with a lone letter. Labels have sufficient width, with a container fallback for enlarged/narrow layouts.
10. Annual-draft rule-note paragraphs were light grey on cream. Dialog-scoped paper ink now wins the CSS cascade.
11. Scrolled confirmation prompts left partial titles at the top. Compact sticky prompt headers retain the complete title and reachable close control.

## Final-byte coverage

- `after/metrics.json`:84 captures covering21 main screens at320/390/768/1440, no document overflow or page errors.
- `early/after/report.json`:60 early-game/interaction captures at320/390/768/1024/1440, including partial/full invitation and draft draws, live signings, own draft turn, hover, keyboard focus and empty search. Draft outside-border hit test and local board overflow are both corrected. Solid-surface text sampling found no flagged low contrast in this scope; gradients/photos require visual inspection rather than numeric background assumptions.
- `dialogs/final/`:207 captures across desktop, tablet,320/390, short landscape and130% root text.162 measured dialog states report no clipped controls/text. Includes expanded analysis/comparison, XI swaps, how-to guides, actual backup input review/error, injury cover, declined and accepted trades, actual release confirmation and annual draft14→15 automatic team transition. Footer actions remain reachable.
- `finals/final/`:69 refreshed captures across five sizes covering finals ready/semis/Grand Final/done, review, expanded final analysis,19-year legacy, full archive/scorebooks and a real saved super-over from GLO-review. Notts character lines change[14,1]→[15]; tablet image trailing gap428→14px; Chromium super-over text contrast9.82:1. Some finals stage views are explicitly controlled presentation fixtures using real saved teams/results, not a fresh season simulation.
- `browsers/`:actual WebKit26.5 lifecycle13/13 plus4 targeted visual cases, zero page errors. Enlarged backup title clears close by12px;10 narrow rate labels remain single-line; real super-over minimum sampled contrast6.27:1; landscape sticky header starts3px inside dialog border. Official runtime/dependency restoration used verified packages in a task-local prefix, with no system/security changes.
- Prior responsive guarantees rerun on these bytes:360 club/header/font cases,324 club-guide/font/width cases,36 decoded embedded venue photos,6 home/navigation checks,4 development layouts,3 committed-recovery integration checks and8 recovery UI/failure/layout cases.
- `state-parity.json`:restored2008 and2026 career state and phase comparison values exactly match v83. Earlier-year season-plan HTML is identical.
- `review.md`:independent patch reconstruction/code review and targeted Chromium checks found no blocking issue. A harmless existing prompt-close cascade redundancy is documented; actual overlap/scroll checks pass.

Capture counts include scrolled, expanded and alternate-state views; they are not counts of distinct screens or independent gameplay runs. Baseline and intermediate reports intentionally retain failures/provenance. Final/ directories and summary.json identify the release evidence. PNGs remain local review outputs; Git and the downloadable audit preserve scripts, measured reports and logs without browser profiles, binaries or duplicate HTML.

## Reproduce and release boundary

```sh
python qa/visual-deep-20261028/build.py --promote
GCC_PHASE=GREEN GCC_FILE=qa/visual-deep-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/early/regression.cjs
GCC_FILE=$PWD/qa/visual-deep-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/dialogs/regression.cjs
GCC_PHASE=GREEN GCC_FILE=qa/visual-deep-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/dialogs/readability.cjs
GCC_FILE=$PWD/qa/visual-deep-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/finals/final/regression.cjs
GCC_FILE=$PWD/qa/visual-deep-20261028/candidate.html NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES node qa/visual-deep-20261028/finals/final/extra-regression.cjs
python qa/visual-deep-20261028/check_release.py
```

Use an official Chromium runtime in place of the task-local executable when reproducing elsewhere. Builder recovers its exact baseline from the pinned Git commit if baseline.html is absent. Source parity,20-script syntax and194 unique static IDs are gated. Only presentation scripts12/17 and CSS changed; the other18 script bodies—including simulation, storage and controller—are byte-identical to v83. No new full-career/crash/power-loss or physical-device certification is claimed. Firefox remains environment-blocked; WebKit evidence is headless Linux, not installed iOS Safari or spoken screen-reader certification. Downloaded career backups remain available through Menu, with no restore-file action on the start panel.
