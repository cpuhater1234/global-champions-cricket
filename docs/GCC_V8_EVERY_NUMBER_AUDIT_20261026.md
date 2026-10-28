# GCC numerical audit — 26 October 2026

Build: `e28ccd173f92069cb690d27f6b64224c072f4b56bb061d00428edadc5a5e7af0` (playable version 75). No game-engine or player-rating change in this audit.

## Conclusion

No new engine arithmetic defect was confirmed. Broad calculation, boundary, ledger and full-career checks passed. This does **not** certify every rating or probability coefficient empirically. The existing evidence ledger classifies all 7,828 player attributes as authored estimates or derived composites, sometimes informed by substantial observations. Technique, mental, leadership and opportunity-adjusted fielding/keeping skills remain particularly uncertain. The replacement batting/bowling model failed both frozen promotion gates and remains unpromoted.

## Coverage and results

| System | Current-build evidence | Status |
|---|---|---|
| Numeric inventory | 19,952 literal/numeric-string occurrences across 20 executable scripts; 561 function declarations located. CSS dimensions, prose digits and image data are excluded. Inventory is navigation, not semantic certification. | Inventoried |
| Player careers | 412 players; 5,149 active player-seasons in one recorded world; 41,192 player-season passes across eight worlds. Values finite/in bounds; workload/usage bounds checked. | Calculation checks passed |
| Overall/role formulas | 10,001 AR specialist-floor and skill-monotonicity checks. Current overall derivation and intentional legacy policies preserved. | Passed |
| Deliveries | 6,000 stress innings; 4,388,607 assertions covering cumulative runs/wickets/balls, extras, free hits, credited wickets, four-over ceilings, no consecutive overs and chase endpoints. Additional focused engine/chase/boundary suites passed. | Passed |
| Full career | 2008–2026, 266 managed league matches, 15,272 assertions, 39 cold reloads, 31 injury-selection interruptions, 3 Super Overs. No runtime/save errors. | Passed |
| Independent scorebooks | 306 captured match scorebooks cross-checked in Python, 15,929 checks, zero errors. | Passed |
| Full-league player statistics |Fresh separate 2008 season: 118 league/finals innings, 88 players, 880 field-by-field aggregate checks. 12,949 balls faced = 12,873 legal bowling balls + 76 no-ball deliveries. | Exact reconciliation |
| Displayed statistics | 15 scorebooks and 15 club-average rows; 369 checks; zero findings/errors. | Passed |
| Standings/NRR |Points, played/won/lost, reciprocity, all-out denominator and chase fixtures; zero-legal-ball policy explicitly recorded. | Passed with declared convention |
| Draft/departures/trades |Uncapped retirements, shared voluntary allowance, supplementary snake, package limits, actual accepted packages, cutoff and atomic rejection checks. 63 package and 127 controlled transaction checks plus original rule suite. | Passed |
| Injuries/career score | 25,945 reachable-age injury-probability and ordinal score bounds/monotonicity checks. Injury probabilities remain uncalibrated design values. | Bounds passed |
| Corrupt saves | 77 checks reject malformed counters, tables, statistics, schedules and selection state before destructive replacement. | Passed |
| Match sensitivity | 2,000 paired full-match comparisons. Stronger batting increases aggregate scoring; stronger bowling, fielding and keeping reduce it in these interventions. | Directional diagnostic passed |
| Real-player skill accuracy | 7,828 authored/derived values in frozen per-attribute ledger; 95 high peripheral values already flagged for review. Identity links and core confidence do not independently certify each skill. | **Open** |
| Real-world effect sizes/probabilities |Synthetic plausibility and directional sensitivity do not validate individual constants or recreate historical cricket distributions. Career-score weights are game-design choices. | **Open** |

## Findings and corrections

1. **Outdated statistical test corrected.** The frontend test equated balls faced and legal bowling balls. Current delivery semantics include delivered no-balls as faced balls. The obsolete invariant was reproduced as a failing test on the fresh season. The corrected test reconciles non-wide deliveries per scorebook, and the separate fully captured league proves the exact global difference.
2. **Zero-ball NRR is a declared convention.** GCC counts a minimum one-ball denominator when an innings ends with zero legal balls. All-out innings count 120 balls. The finite denominator was tested explicitly; it is not presented as a verified official tournament rule.
3. **Old test assumptions resolved transparently.** Missing pinned source files were recovered. The in-season trade fixture now explicitly uses 2009 because 2008 trading is forbidden. Controlled shared-allowance trade tests restore CPU counterparts to known starting lists/budgets rather than assuming naturally exhausted clubs can trade. Initial logs and final resolutions are retained.
4. **Invalid sensitivity experiment excluded.** Holding aggregate innings estimates fixed while changing downstream batter skills isolates the wrong layer and gave misleading results. It is not an engine-defect finding. The accepted experiment changes the actual player attributes upstream of `simulateInningsPair`, recomputing profiles/estimates with common RNG seeds.
5. Independent review identified the obsolete balls-faced invariant and missing zero-ball NRR test. Both audit gaps are addressed. No unsupported rerating or failed-model promotion was applied.

## What still needs evidence

Every numerical family has an audit record, but individual player skill accuracy and empirical match calibration remain unfinished. Revisit each skill family using suitable evidence, uncertainty and season/competition context; fielding/keeping need opportunities, not raw dismissal counts alone. Any candidate model needs a fresh preregistered validation design because the prior held-out data has already been observed. Preserve saved career facts and compare a candidate through the same numerical suite before promotion.

## Reproduction and raw evidence

Sources and reports: `qa/numbers-20261026/`. Main commands: `node qa/numbers-20261026/inventory.mjs`, `GCC8_TEST_BUILD=game/gcc_v8_product_candidate.html node qa/finish-pass/numeric-audit.mjs`, the full-career runner, isolated numerical suites, full-ledger season and sensitivity-pair script. Acorn is a temporary audit dependency; its package/version is recorded in dependency metadata. Source-only unit tests use an unchanged extracted ratings assignment; no product script is modified by extraction.

Fresh saves, all recorded player-years, numeric inventory, scorebooks and fully captured league-delivery traces are preserved in the [raw evidence archive](https://chatgpt.com/library?file_id=libfile_7131dd905ab081919f9eaabc72b060f7&account_id=d8576568-bce6-4c2f-af1f-9a9f85a7bae7). See `raw-evidence-manifest.json` for individual hashes. These are synthetic game simulations, not observed real-world cricket. No new physical-device, browser-layout or human-playtest claims are made in this audit.
