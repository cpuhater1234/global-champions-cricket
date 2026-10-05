# GCC v7.0.23 Release Candidate Checkpoint

## Candidate

`global_champions_cricket_v7_0_23_release_candidate.html`

SHA-256:
`47861e9c0328ae2f57c9f3cc0c05184c7c48e3ec7bd8b1c642f5f3e01e0f42ce`

## Why v7.0.23

v7.0.22 fixed the last reproduced Finals XI integrity defect. v7.0.23 changes only three metadata/provenance strings so fresh dynasties, UI QA metadata and exported saves identify the current build correctly.

No game state shape, rating, simulation, roster, transaction, UI layout or career logic changed from v7.0.22.

## QA carried into this release candidate

- protected simulation functions unchanged: 12/12
- script blocks: 9/9 syntax pass
- duplicate DOM IDs: 0
- novice first-run flow: 15/15
- endgame/save hostile batch: 22/22
- Finals XI scope suite: 7/7
- general save-phase matrix: 7/7
- Finals stage persistence: ready / semis / gf-ready / done all passed
- viewport matrix: 80/80 clean cases
- 0 horizontal-overflow cases
- 0 off-screen-control cases
- 0 mobile touch-target flags
- full 2008-2026 regression: 19/19 seasons and clean Legacy finish
- 0 CPU roster-shape failures
- 0 duplicate player ownership
- 0 temporary replacement residue
- 0 browser errors in full-career regression

## Reproduced defects fixed during hostile QA

- CPU keeper/roster integrity through trades, injuries and replacements
- stale Finals / Review save routing
- mobile Season Review overflow
- mid-season trade ghost player remaining in user XI
- 2008 ten-player match exploit after XI mutation
- temporary injury-cover trade creating a 16-player roster
- fresh install showing a dead Resume action
- Legacy -> Archive -> Back returning to stale 2026 Season
- starting another 2026 season after the career had ended
- invalid user XI entering / playing a semi-final or Grand Final

## v7.0.23 save-version verification

3/3 passed:
- new career identifies dynasty/export metadata as 7.0.23
- old v7.0.13 mid-career save loads and re-exports as v7.0.23
- old completed-career save loads to 2026 Legacy and re-exports as v7.0.23

## Exact v7.0.22 -> v7.0.23 delta

Only:
- `document.body.dataset.uiVersion`
- `freshDynasty().version`
- `serialisable().version`

## Status

v7.0.23 is the strongest release candidate produced in the hostile QA cycle. v7.0.14 remains the protected promoted baseline until v7.0.23 is deliberately promoted.
