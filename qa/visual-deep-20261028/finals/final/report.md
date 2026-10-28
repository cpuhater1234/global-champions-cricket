# Final finals/archive/closure verification

Final audited SHA256: `9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca`.

All evidence in this `final/` directory was refreshed against the exact frozen candidate. Baseline and earlier e3 candidate outputs are preserved outside this directory. No product edits.

## Result

All five findings in this audit are fixed:

| Finding | Final evidence |
|---|---|
| Nottinghamshire orphan letter at390 | Complete15-character line; `regression-finals-390.png` |
| Legacy stadium tablet empty panel | Trailing gap14px; `regression-legacy-768.png` |
|2026 review next-season copy | “Reflect on your final season”, final-season phase analysis; `2026-analysis-small.png` |
| Real super-over names/figures unreadable | All tested names and scores9.823:1 contrast on paper panel; `superover-320.png` |
|320 analysis “Conceded” orphan | All10 rate labels single-line; `extra-final-analysis-320.png` |

Both native regression scripts exit0. Changed nodes were inspected in rendered screenshots; the result labels, end-of-career stadium card, super-over team names/figures and expanded320 analysis are visibly clean.

## Coverage

Refreshed finals,2008/2026 reviews,2026 expanded analysis,legacy,archive/expanded records,archive scorebook,final scorebook at1440×900,768×1024,390×844,320×640,844×390. Refreshed controlled ready/semis/GF-ready stage presentations across the same five sizes. Both matrix metrics files report no document horizontal overflow.

Real saved super-over was found in `qa/club-expansion-20261027/fixtures/GLO-review.gcc.json`: Mumbai145/3 vs Melbourne Stars145/8,Stars won the super-over. Result screenshots at1440,390,320 and844 plus320 scorebook were refreshed. Match data is real; result view is controlled fixture presentation and no simulation was run.

Same setup caveats apply as baseline: importing saved fixtures and setting UI views is presentation coverage, not replaying a nineteen-season career. Controlled pre-final stages retain the completed fixture's Grand Final and therefore include an artificial Final scorebook action; this is not a product defect. Reused dialog matrix captures are not used as standalone proof of header positioning. No important remaining defect identified within this bounded scope.

## Reproduction

From repository root, run these with `NODE_PATH=$CODEX_PRIMARY_RUNTIME_NODE_MODULES GCC_FILE=$PWD/qa/visual-deep-20261028/candidate.html`:

- `node qa/visual-deep-20261028/finals/final/reproduce.cjs`
- `node qa/visual-deep-20261028/finals/final/stages.cjs`
- `node qa/visual-deep-20261028/finals/final/regression.cjs`
- `node qa/visual-deep-20261028/finals/final/extra-regression.cjs`
- `node qa/visual-deep-20261028/finals/final/find-superover.cjs`

Recorded metrics include audited SHA256. Rerunning scripts recreates their raw metrics; reattach the hash if packaging another snapshot.
